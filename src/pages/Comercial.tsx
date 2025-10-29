import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { KanbanColumn } from "@/components/comercial/KanbanColumn";
import { FilterPanel } from "@/components/comercial/FilterPanel";
import { LeadDetailsModal } from "@/components/comercial/LeadDetailsModal";
import { ListView } from "@/components/comercial/ListView";
import { FunnelView } from "@/components/comercial/FunnelView";
import { AddLeadModal } from "@/components/comercial/AddLeadModal";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLeads, useData, useFollowUps } from "@/contexts/DataContext";
import { Plus, Download, Search, TrendingUp, Target, DollarSign, Trophy, LayoutGrid, List, UserPlus, CheckCircle2, FileText, MessageCircle, PartyPopper, XCircle, Calendar, Bell } from "lucide-react";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import { PremiumAreaChart } from "@/components/charts/PremiumAreaChart";
import { toast } from "sonner";
import { FollowUp } from "@/types/followup";
import { FollowUpWidget } from "@/components/comercial/FollowUpWidget";
import { QuickAddFollowUpModal } from "@/components/comercial/QuickAddFollowUpModal";
import { createAutoFollowUp } from "@/utils/followUpHelpers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { webhookService } from "@/services/notificationWebhookService";
import { automationEngine } from "@/services/automationEngine";
import { Lead } from "@/data/mockLeads";

// Lead interface moved to @/data/mockLeads.ts

// mockLeads removido - usando dados do DataContext

type ViewMode = "kanban" | "list" | "funnel";

const Comercial = () => {
  // ✅ CONTEXTO GLOBAL: Usar dados centralizados
  const { leads, createLead, updateLead, deleteLead } = useLeads();
  const { sync } = useData();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isQuickFollowUpModalOpen, setIsQuickFollowUpModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  
  // Usar DataContext para followUps
  const { followUps, createFollowUp, updateFollowUp, deleteFollowUp } = useFollowUps();

  // Cálculos dinâmicos das métricas
  const pipelineTotal = leads.reduce((sum, lead) => sum + lead.value, 0);
  const leadsWon = leads.filter(l => l.stage === "won");
  const leadsTotal = leads.length;
  const conversionRate = leadsTotal > 0 ? Math.round((leadsWon.length / leadsTotal) * 100) : 0;
  const ticketMedio = leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.value, 0) / leads.length) : 0;

  // Meta do mês (exemplo: soma dos leads em "won" vs meta fixa de 200K)
  const metaMes = 200000; // R$ 200K
  const valorFechado = leadsWon.reduce((sum, lead) => sum + lead.value, 0);
  const percentualMeta = Math.round((valorFechado / metaMes) * 100);

  // Formatar valores em R$
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const stages = [
    { id: "new", title: "Novas Oportunidades", icon: UserPlus, color: "blue" },
    { id: "qualified", title: "Qualificados", icon: CheckCircle2, color: "cyan" },
    { id: "meeting", title: "Reunião Agendada", icon: Calendar, color: "teal" },
    { id: "proposal", title: "Proposta Enviada", icon: FileText, color: "purple" },
    { id: "negotiation", title: "Negociação", icon: MessageCircle, color: "orange" },
    { id: "won", title: "Fechado ✓", icon: PartyPopper, color: "green" },
    { id: "lost", title: "Perdido", icon: XCircle, color: "red" }
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as string;

    // Encontra o lead sendo movido
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const oldStage = lead.stage;

    // Se não mudou de etapa, não faz nada
    if (oldStage === newStage) return;

    // ✅ CORRIGIDO: Usar updateLead do DataContext
    const newHistory = [
      ...(lead.stageHistory || []),
      {
        fromStage: oldStage,
        toStage: newStage,
        changedAt: new Date(),
        changedBy: "André"
      }
    ];

    updateLead(leadId, {
      stage: newStage,
      daysInStage: 0,
      stageHistory: newHistory
    });
    
    // Enviar evento de mudança de etapa para webhook n8n (se configurado)
    const stageNames: Record<string, string> = {
      'new': 'Novas Oportunidades',
      'meeting': 'Reunião Agendada',
      'proposal': 'Proposta Enviada',
      'negotiation': 'Negociação',
      'won': 'Fechado',
      'lost': 'Perdido'
    };
    
    webhookService.sendStageChangeEvent(
      lead.name,
      stageNames[oldStage] || oldStage,
      stageNames[newStage] || newStage
    );

    // 🤖 Disparar automações personalizadas
    automationEngine.trigger('lead_stage_changed', {
      lead_id: leadId,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      value: lead.value,
      origin: lead.origin,
      oldStage: oldStage,
      newStage: newStage,
      oldStageName: stageNames[oldStage] || oldStage,
      newStageName: stageNames[newStage] || newStage,
    });
    
      // Cria follow-up automático se aplicável
      if (oldStage !== newStage) {
        const autoFollowUp = createAutoFollowUp(leadId, oldStage, newStage, "André");
        
        if (autoFollowUp) {
          const newFollowUp: FollowUp = {
            ...autoFollowUp as FollowUp,
            id: Date.now().toString(),
            created_at: new Date(),
            updated_at: new Date()
          };
          
          createFollowUp(newFollowUp);
          
          // Calcula quantos dias até o follow-up
          const daysUntil = Math.ceil((new Date(autoFollowUp.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const leadName = leads.find(l => l.id === leadId)?.name || "Lead";
          
          toast.success("🤖 Follow-up Automático Criado!", {
            description: `${autoFollowUp.titulo} - ${leadName} (em ${daysUntil} dia${daysUntil > 1 ? 's' : ''})`,
            duration: 5000,
            style: {
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#8B5CF6',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(10px)'
            }
          });
        }
      }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleAddLead = (newLead: Lead) => {
    // ✅ CORRIGIDO: Usar createLead do DataContext
    createLead(newLead);

    // Enviar evento para webhook n8n (se configurado)
    webhookService.sendLeadEvent(
      newLead.name,
      newLead.origin,
      newLead.status,
      {
        company: newLead.company,
        email: newLead.email,
        phone: newLead.phone,
        value: newLead.value,
        stage: newLead.stage
      }
    );

    // 🤖 Disparar automações personalizadas
    automationEngine.trigger('lead_created', {
      name: newLead.name,
      company: newLead.company,
      email: newLead.email,
      phone: newLead.phone,
      value: newLead.value,
      origin: newLead.origin,
      status: newLead.status,
      stage: newLead.stage,
    });
  };

  const handleDeleteLead = (id: string) => {
    // ✅ CORRIGIDO: Usar deleteLead do DataContext
    deleteLead(id);
    // Toast já é chamado dentro do LeadDetailsModal
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    // ✅ CORRIGIDO: Usar updateLead do DataContext
    updateLead(updatedLead.id, updatedLead);
    setSelectedLead(updatedLead); // Atualiza o lead selecionado também
    toast.success("Lead atualizado com sucesso!", {
      style: {
        background: 'rgba(37, 211, 102, 0.15)',
        color: '#25D366',
        border: '1px solid rgba(37, 211, 102, 0.3)',
        backdropFilter: 'blur(10px)'
      }
    });
  };

  // Handlers de Follow-ups
  const handleAddFollowUp = (followUpData: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newFollowUp: FollowUp = {
        ...followUpData,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date()
      };
      createFollowUp(newFollowUp);
      
      toast.success("Follow-up criado com sucesso!", {
        style: {
          background: 'rgba(37, 211, 102, 0.15)',
          color: '#25D366',
          border: '1px solid rgba(37, 211, 102, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      });
    } catch (error) {
      console.error("Erro ao adicionar follow-up:", error);
      toast.error("Erro ao criar follow-up");
    }
  };

  const handleUpdateFollowUp = (id: string, updates: Partial<FollowUp>) => {
    updateFollowUp(id, { ...updates, updated_at: new Date() });
  };

  const handleDeleteFollowUp = (id: string) => {
    deleteFollowUp(id);
  };

  const handleOpenLeadFromFollowUp = (leadId: string) => {
    console.log("🔵 handleOpenLeadFromFollowUp chamado com leadId:", leadId);
    console.log("🔵 Leads disponíveis:", leads.map(l => ({ id: l.id, name: l.name })));
    
    try {
      const lead = leads.find(l => l.id === leadId);
      console.log("🔵 Lead encontrado:", lead);
      
      if (lead) {
        console.log("🔵 Setando selectedLead...");
        setSelectedLead(lead);
        console.log("🔵 Abrindo modal...");
        setIsModalOpen(true);
        console.log("🔵 Modal deve estar aberto agora");
      } else {
        console.warn("⚠️ Lead não encontrado com ID:", leadId);
        toast.error("Lead não encontrado", {
          description: "Este lead pode ter sido excluído ou movido."
        });
      }
    } catch (error) {
      console.error("🔴 Erro ao abrir lead:", error);
      toast.error("Erro ao abrir lead. Tente novamente.");
    }
  };

  const handleMarkFollowUpAsDone = (id: string) => {
    try {
      handleUpdateFollowUp(id, { status: 'feito' });
      toast.success("Follow-up concluído!", {
        style: {
          background: 'rgba(37, 211, 102, 0.15)',
          color: '#25D366',
          border: '1px solid rgba(37, 211, 102, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      });
    } catch (error) {
      console.error("Erro ao marcar follow-up como feito:", error);
      toast.error("Erro ao concluir follow-up. Tente novamente.");
    }
  };

  // Atualização automática de status dos follow-ups
  useEffect(() => {
    const checkFollowUpsStatus = () => {
      const now = new Date();
      
      followUps.forEach(followUp => {
        // Não atualiza se já foi concluído ou cancelado
        if (followUp.status === 'feito' || followUp.status === 'cancelado') {
          return;
        }
        
        const dueDate = new Date(followUp.due_date);
        
        // Se passou da data e não está marcado como atrasado, atualiza
        if (dueDate < now && followUp.status !== 'atrasado') {
          updateFollowUp(followUp.id, { 
            status: 'atrasado', 
            updated_at: new Date() 
          });
        }
      });
    };
    
    // Verifica a cada 1 minuto
    const interval = setInterval(checkFollowUpsStatus, 60000);
    
    // Verifica imediatamente ao carregar
    checkFollowUpsStatus();
    
    return () => clearInterval(interval);
  }, []);
  
  // Atalho de teclado Ctrl+N para abrir modal de novo lead
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsAddLeadModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Filtrar leads com base na busca
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      lead.company.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout showHeader={false}>
      {/* Header com Título e Métricas */}
      <div className="mb-8">
        {/* Título + Busca + Ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-['Poppins'] text-lg font-semibold text-white">CRM & Comercial</h1>
            <p className="text-sm text-slate-400">
              Gerencie leads, oportunidades e pipeline de vendas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Campo de Busca */}
            <div className="relative w-[280px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-primary/20 focus:border-primary/50"
              />
            </div>
            
            <Button 
              variant="outline"
              onClick={() => setIsQuickFollowUpModalOpen(true)}
              className="border-warning/50 text-warning hover:bg-warning/10"
            >
              <Bell className="w-4 h-4" />
              Novo Follow-up
            </Button>
            <Button 
              className="btn-primary-gradient glow-primary"
              onClick={() => setIsAddLeadModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pipeline Total */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Vendas
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(pipelineTotal)}</p>
            <p className="text-sm text-muted-foreground">Pipeline Total</p>
            <div className="mt-3 h-12">
              <PremiumAreaChart data={[45, 52, 48, 58, 65, 62, 70]} color="blue" />
            </div>
          </div>

          {/* Taxa de Conversão */}
          <div className={cn(
            "glass-card p-5 rounded-xl border border-white/10 transition-all group",
            conversionRate >= 40 ? "hover:border-green-500/30" : "hover:border-yellow-500/30"
          )}>
            <div className="flex items-center justify-between mb-3">
              <Target className={cn("w-5 h-5", conversionRate >= 40 ? "text-green-400" : "text-yellow-400")} />
              <Badge className={cn(
                "text-xs border",
                conversionRate >= 40 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              )}>
                {conversionRate >= 40 ? "Ótimo" : "Bom"}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{conversionRate}%</p>
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <div className="mt-3">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className={cn("h-full rounded-full", conversionRate >= 40 ? "bg-green-500" : "bg-yellow-500")}
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{leadsWon.length} de {leadsTotal} leads</p>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400">
                Média
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(ticketMedio)}</p>
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <div className="mt-3 h-12">
              <PremiumMiniBar data={[15, 18, 16, 19, 20, 18, 18]} />
            </div>
          </div>

          {/* Meta do Mês */}
          <div className={cn(
            "glass-card p-5 rounded-xl border border-white/10 transition-all group",
            percentualMeta >= 75 ? "hover:border-green-500/30" : "hover:border-red-500/30"
          )}>
            <div className="flex items-center justify-between mb-3">
              <Trophy className={cn("w-5 h-5", percentualMeta >= 75 ? "text-green-400" : "text-red-400")} />
              <Badge className={cn(
                "text-xs border",
                percentualMeta >= 75 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
              )}>
                {percentualMeta >= 75 ? "No alvo" : "Abaixo"}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{percentualMeta}%</p>
            <p className="text-sm text-muted-foreground">Meta do Mês</p>
            <div className="mt-3">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className={cn("h-full rounded-full", percentualMeta >= 75 ? "bg-green-500" : "bg-red-500")}
                  style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{formatCurrency(valorFechado)} de {formatCurrency(metaMes)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle de Visualização */}
      <div className="mb-6 flex items-center gap-2">
        <Button 
          variant={viewMode === "kanban" ? "default" : "ghost"} 
          size="sm" 
          className={viewMode === "kanban" ? "btn-primary-gradient glow-primary gap-2" : "text-muted-foreground gap-2"}
          onClick={() => setViewMode("kanban")}
        >
          <LayoutGrid className="w-4 h-4" />
          Kanban
        </Button>
        <Button 
          variant={viewMode === "list" ? "default" : "ghost"} 
          size="sm" 
          className={viewMode === "list" ? "btn-primary-gradient glow-primary gap-2" : "text-muted-foreground gap-2"}
          onClick={() => setViewMode("list")}
        >
          <List className="w-4 h-4" />
          Lista
        </Button>
        <Button 
          variant={viewMode === "funnel" ? "default" : "ghost"} 
          size="sm" 
          className={viewMode === "funnel" ? "btn-primary-gradient glow-primary gap-2" : "text-muted-foreground gap-2"}
          onClick={() => setViewMode("funnel")}
        >
          <TrendingUp className="w-4 h-4" />
          Funil Visual
        </Button>
      </div>

      {/* Visualizações Dinâmicas com Transições */}
      <div className="mb-8 w-full min-w-0">
        <div 
          className="transition-all duration-200 ease-in-out"
          style={{ 
            opacity: 1,
            animation: 'fadeIn 200ms ease-in-out'
          }}
        >
          {viewMode === "kanban" && (
            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className="w-full max-w-full overflow-x-auto overflow-y-hidden scrollbar-thin overscroll-x-contain">
                <div className="flex items-start gap-4 w-max pb-4 pr-2">
                  {stages.map(stage => (
                    <KanbanColumn
                      key={stage.id}
                      stage={stage}
                      leads={filteredLeads.filter(lead => lead.stage === stage.id)}
                      onLeadClick={handleLeadClick}
                      followUps={followUps}
                    />
                  ))}
                </div>
              </div>
            </DndContext>
          )}

          {viewMode === "list" && (
            <ListView 
              leads={filteredLeads}
              onLeadClick={handleLeadClick}
              onDeleteLead={handleDeleteLead}
            />
          )}

          {viewMode === "funnel" && (
            <FunnelView 
              leads={filteredLeads}
              onLeadClick={handleLeadClick}
            />
          )}
        </div>
      </div>

      {/* Widget de Follow-ups */}
      <div className="mb-8">
        <FollowUpWidget
          followUps={followUps}
          leads={leads}
          onOpenLead={handleOpenLeadFromFollowUp}
          onMarkAsDone={handleMarkFollowUpAsDone}
        />
      </div>

      {/* Modal de Detalhes */}
      {selectedLead && (
        <ErrorBoundary
          fallback={
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-card border-danger/30 p-6 max-w-md">
                <h2 className="text-lg font-bold text-danger mb-2">Erro ao Abrir Lead</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Ocorreu um erro ao tentar abrir os detalhes deste lead. 
                  Verifique o console (F12) para mais informações.
                </p>
                <Button onClick={() => {
                  setIsModalOpen(false);
                  setSelectedLead(null);
                }} className="w-full">
                  Fechar
                </Button>
              </div>
            </div>
          }
        >
          <LeadDetailsModal
            lead={selectedLead}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            followUps={followUps}
            onAddFollowUp={handleAddFollowUp}
            onUpdateFollowUp={handleUpdateFollowUp}
            onDeleteFollowUp={handleDeleteFollowUp}
          />
        </ErrorBoundary>
      )}

      {/* Modal de Novo Lead */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSave={handleAddLead}
      />

      {/* Modal de Follow-up Rápido */}
      <QuickAddFollowUpModal
        isOpen={isQuickFollowUpModalOpen}
        onClose={() => setIsQuickFollowUpModalOpen(false)}
        onSave={handleAddFollowUp}
        leads={leads}
        defaultResponsavel="André"
      />
    </DashboardLayout>
  );
};

export default Comercial;
