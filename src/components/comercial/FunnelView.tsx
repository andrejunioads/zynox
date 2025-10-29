import { useState, useMemo } from "react";
import { Lead } from "@/pages/Comercial";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  UserPlus, 
  CheckCircle2, 
  FileText, 
  MessageCircle, 
  PartyPopper, 
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ChevronRight,
  Calendar,
  Building2
} from "lucide-react";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FunnelViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

type PeriodFilter = 7 | 15 | 30;

export const FunnelView = ({ leads, onLeadClick }: FunnelViewProps) => {
  const [period, setPeriod] = useState<PeriodFilter>(30);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const stages = [
    { id: "new", title: "Leads Novos", icon: UserPlus, color: "#0EA5E9", gradient: "from-blue-500 to-cyan-500" },
    { id: "qualified", title: "Qualificados", icon: CheckCircle2, color: "#06B6D4", gradient: "from-cyan-500 to-teal-500" },
    { id: "proposal", title: "Proposta Enviada", icon: FileText, color: "#8B5CF6", gradient: "from-purple-500 to-pink-500" },
    { id: "negotiation", title: "Negociação", icon: MessageCircle, color: "#F59E0B", gradient: "from-orange-500 to-red-500" },
    { id: "won", title: "Fechado ✓", icon: PartyPopper, color: "#10B981", gradient: "from-green-500 to-emerald-500" },
    { id: "lost", title: "Perdido", icon: XCircle, color: "#EF4444", gradient: "from-red-500 to-rose-500" }
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const stageMetrics = useMemo(() => {
    return stages.map((stage, index) => {
      const stageLeads = leads.filter(lead => lead.stage === stage.id);
      const count = stageLeads.length;
      const totalValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0);
      
      // Calcular taxa de conversão (leads que avançaram para próxima etapa)
      let conversionRate = 0;
      if (index < stages.length - 2) { // Excluir won e lost
        const nextStage = stages[index + 1];
        const nextStageLeads = leads.filter(lead => lead.stage === nextStage.id);
        const totalInCurrentAndNext = count + nextStageLeads.length;
        if (totalInCurrentAndNext > 0) {
          conversionRate = Math.round((nextStageLeads.length / totalInCurrentAndNext) * 100);
        }
      } else if (stage.id === 'won') {
        // Para fechado, calcular taxa de conversão geral
        const totalNonLost = leads.filter(l => l.stage !== 'lost').length;
        if (totalNonLost > 0) {
          conversionRate = Math.round((count / totalNonLost) * 100);
        }
      }

      // Gerar dados de evolução semanal (mock)
      const weeklyData = Array.from({ length: 7 }, () => 
        Math.floor(Math.random() * (count + 5))
      );

      // Calcular crescimento (mock - baseado em dados semanais)
      const growth = Math.floor(Math.random() * 40) - 10; // -10% a +30%

      return {
        ...stage,
        count,
        totalValue,
        conversionRate,
        weeklyData,
        growth,
        leads: stageLeads
      };
    });
  }, [leads, stages]);

  const handleStageClick = (stageId: string) => {
    setSelectedStage(stageId);
    setIsSheetOpen(true);
  };

  const selectedStageData = stageMetrics.find(s => s.id === selectedStage);

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Análise de Funil</h3>
          <p className="text-sm text-muted-foreground">Visualize a evolução dos leads por etapa</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Período:</span>
          {[7, 15, 30].map((days) => (
            <Button
              key={days}
              size="sm"
              variant={period === days ? "default" : "ghost"}
              className={period === days ? "btn-primary-gradient glow-primary" : ""}
              onClick={() => setPeriod(days as PeriodFilter)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              {days} dias
            </Button>
          ))}
        </div>
      </div>

      {/* Etapas do Funil */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stageMetrics.map((stage, index) => (
          <div key={stage.id} className="relative">
            <Card 
              className={`
                glass-card p-4 border border-white/10 
                hover:border-primary/50 transition-all duration-300 
                cursor-pointer group
                hover:scale-105 hover:shadow-lg
              `}
              onClick={() => handleStageClick(stage.id)}
            >
              {/* Header com Ícone */}
              <div className="flex items-center justify-between mb-3">
                <div 
                  className={`
                    w-10 h-10 rounded-lg 
                    bg-gradient-to-br ${stage.gradient} 
                    flex items-center justify-center
                    shadow-lg
                  `}
                >
                  <stage.icon className="w-5 h-5 text-white" />
                </div>
                
                {/* Badge de Crescimento */}
                {stage.growth !== 0 && (
                  <Badge 
                    className={`
                      ${stage.growth > 0 ? 'bg-success/20 text-success border-success/30' : 'bg-danger/20 text-danger border-danger/30'}
                      border text-xs
                    `}
                  >
                    {stage.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(stage.growth)}%
                  </Badge>
                )}
              </div>

              {/* Título */}
              <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                {stage.title}
              </h4>

              {/* Contagem de Leads */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {stage.count}
                </span>
                <span className="text-xs text-muted-foreground">leads</span>
              </div>

              {/* Valor Total */}
              <div className="flex items-center gap-1 mb-3">
                <DollarSign className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-success">
                  {formatCurrency(stage.totalValue)}
                </span>
              </div>

              {/* Mini Gráfico */}
              <div className="mb-3 h-8">
                <PremiumMiniBar data={stage.weeklyData} />
              </div>

              {/* Taxa de Conversão */}
              {stage.conversionRate > 0 && stage.id !== 'lost' && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Conversão:</span>
                    <span className="font-semibold text-primary">{stage.conversionRate}%</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stage.gradient} transition-all duration-500`}
                      style={{ width: `${stage.conversionRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Indicador de Ver Detalhes */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            </Card>

            {/* Seta de Conexão */}
            {index < stageMetrics.length - 2 && (
              <div className="hidden xl:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                <ChevronRight className="w-4 h-4 text-primary/50" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card className="glass-card p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{leads.length}</p>
              <p className="text-xs text-muted-foreground">Total de Leads</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(leads.reduce((sum, lead) => sum + lead.value, 0))}
              </p>
              <p className="text-xs text-muted-foreground">Pipeline Total</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {leads.filter(l => l.stage === 'won').length}
              </p>
              <p className="text-xs text-muted-foreground">Leads Fechados</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {leads.length > 0 
                  ? Math.round((leads.filter(l => l.stage === 'won').length / leads.length) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sheet com Detalhes da Etapa */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="glass-card border-l border-white/10 w-[400px] sm:w-[540px]">
          {selectedStageData && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div 
                    className={`
                      w-10 h-10 rounded-lg 
                      bg-gradient-to-br ${selectedStageData.gradient} 
                      flex items-center justify-center
                    `}
                  >
                    <selectedStageData.icon className="w-5 h-5 text-white" />
                  </div>
                  {selectedStageData.title}
                </SheetTitle>
                <SheetDescription>
                  {selectedStageData.count} leads • {formatCurrency(selectedStageData.totalValue)} em oportunidades
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-3">
                {selectedStageData.leads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Nenhum lead nesta etapa</p>
                  </div>
                ) : (
                  selectedStageData.leads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="glass-card p-4 border border-white/10 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => {
                        setIsSheetOpen(false);
                        onLeadClick(lead);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-sm">{lead.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{lead.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-success">
                            {formatCurrency(lead.value)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

