import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Globe,
  Code,
  Rocket,
  Bug,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  Calendar,
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  History,
  Target,
  TrendingUp,
  Zap,
  Database,
  Shield
} from "lucide-react";
import { Project } from "@/pages/Projetos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getDaysRemaining } from "@/utils/projectHelpers";

interface WebsiteProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

export const WebsiteProjectModal = ({
  project,
  isOpen,
  onClose,
  onUpdate,
}: WebsiteProjectModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const daysRemaining = getDaysRemaining(project.deadline);
  
  // Métricas específicas de website
  const features = project.tasks.filter(t => t.name.toLowerCase().includes('feature') || t.name.toLowerCase().includes('funcionalidade'));
  const bugs = project.tasks.filter(t => t.name.toLowerCase().includes('bug') || t.name.toLowerCase().includes('correção') || t.name.toLowerCase().includes('corrigir'));
  const tests = project.tasks.filter(t => t.name.toLowerCase().includes('test') || t.name.toLowerCase().includes('teste'));
  
  const completedTasks = project.tasks.filter(t => t.status === 'done').length;
  const totalTasks = project.tasks.length;

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: Globe },
    { id: "development", label: "Desenvolvimento", icon: Code },
    { id: "team", label: "Equipe", icon: Users },
    { id: "payment", label: "Financeiro", icon: DollarSign },
  ];

  const handleToggleFavorite = () => {
    const updated = { ...project, isFavorite: !project.isFavorite };
    onUpdate(updated);
    toast.success(updated.isFavorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 glass-card border-slate-700 overflow-hidden">
        <div className="flex flex-col h-[95vh]">
          {/* HEADER */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
                    <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                      🌐 Website
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">{project.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={cn(
                    "glass-card",
                    project.isFavorite ? "text-yellow-400 border-yellow-400/50" : "border-slate-700"
                  )}
                >
                  <Star className={cn("w-4 h-4", project.isFavorite && "fill-yellow-400")} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onClose}
                  className="glass-card border-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-5 gap-3">
              <Card className="glass-card border-slate-700 p-3 text-center">
                <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{project.progress}%</div>
                <div className="text-[10px] text-slate-400">Progresso</div>
              </Card>
              
              <Card className={cn(
                "glass-card p-3 text-center",
                daysRemaining < 0 ? "border-red-500/50" : "border-slate-700"
              )}>
                <Calendar className={cn(
                  "w-5 h-5 mx-auto mb-1",
                  daysRemaining < 0 ? "text-red-400" : "text-slate-400"
                )} />
                <div className={cn(
                  "text-xl font-bold",
                  daysRemaining < 0 ? "text-red-400" : "text-white"
                )}>
                  {Math.abs(daysRemaining)}d
                </div>
                <div className="text-[10px] text-slate-400">
                  {daysRemaining < 0 ? 'Atrasado' : 'Restantes'}
                </div>
              </Card>

              <Card className="glass-card border-slate-700 p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{completedTasks}/{totalTasks}</div>
                <div className="text-[10px] text-slate-400">Tarefas</div>
              </Card>

              <Card className="glass-card border-slate-700 p-3 text-center">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{project.team.length}</div>
                <div className="text-[10px] text-slate-400">Equipe</div>
              </Card>

              <Card className="glass-card border-slate-700 p-3 text-center">
                <Bug className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{bugs.length}</div>
                <div className="text-[10px] text-slate-400">Bugs</div>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-slate-400 hover:bg-slate-800/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTEÚDO */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {activeTab === "overview" && (
                <OverviewTab project={project} daysRemaining={daysRemaining} />
              )}
              {activeTab === "development" && (
                <DevelopmentTab 
                  tasks={project.tasks} 
                  features={features}
                  bugs={bugs}
                  tests={tests}
                />
              )}
              {activeTab === "team" && (
                <TeamTab team={project.team} />
              )}
              {activeTab === "payment" && (
                <PaymentTab project={project} />
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// TABS

const OverviewTab = ({ project, daysRemaining }: { project: Project; daysRemaining: number }) => {
  const urgentTasks = project.tasks.filter(t => t.status !== 'done' && t.priority === 'high').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Alerta de urgências */}
      {urgentTasks.length > 0 && (
        <Card className="glass-card border-orange-500/50 bg-orange-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-white font-bold mb-2">⚠️ {urgentTasks.length} Tarefa(s) Urgente(s)</h4>
              <div className="space-y-2">
                {urgentTasks.map(task => (
                  <div key={task.id} className="text-sm text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    {task.name} - {task.assignedTo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline do Projeto */}
      <Card className="glass-card border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Cronograma de Desenvolvimento
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">🚀 Início</span>
            <span className="text-white font-medium">
              {format(parseISO(project.startDate), "dd 'de' MMM, yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className="relative">
            <Progress value={project.progress} className="h-3" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow">
              {project.progress}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">🏁 Entrega</span>
            <span className={cn(
              "font-medium",
              daysRemaining < 0 ? "text-red-400" : "text-white"
            )}>
              {format(parseISO(project.deadline), "dd 'de' MMM, yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </Card>

      {/* Cliente */}
      {project.linkedClient && (
        <Card className="glass-card border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">👤 Cliente</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {project.linkedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="text-white font-semibold">{project.linkedClient.name}</div>
              <div className="text-slate-400 text-sm">{project.linkedClient.company}</div>
              <div className="text-slate-500 text-xs mt-1">{project.linkedClient.email}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const DevelopmentTab = ({ tasks, features, bugs, tests }: { 
  tasks: Project['tasks'];
  features: Project['tasks'];
  bugs: Project['tasks'];
  tests: Project['tasks'];
}) => {
  return (
    <div className="space-y-6">
      {/* Métricas de Desenvolvimento */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card border-green-500/30 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Features</div>
              <div className="text-2xl font-bold text-white">
                {features.filter(f => f.status === 'done').length}/{features.length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-orange-500/30 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Bug className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Bugs</div>
              <div className="text-2xl font-bold text-white">
                {bugs.filter(b => b.status !== 'done').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-blue-500/30 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Testes</div>
              <div className="text-2xl font-bold text-white">
                {tests.filter(t => t.status === 'done').length}/{tests.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Tarefas */}
      <Card className="glass-card border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">📋 Todas as Tarefas</h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className={cn(
                "w-2 h-2 rounded-full",
                task.status === 'done' ? "bg-green-500" :
                task.status === 'in-progress' ? "bg-blue-500" :
                "bg-slate-500"
              )} />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{task.name}</div>
                <div className="text-xs text-slate-400">{task.assignedTo}</div>
              </div>
              <Badge className={cn(
                "text-xs",
                task.priority === 'high' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                task.priority === 'medium' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                "bg-slate-500/20 text-slate-400 border-slate-500/30"
              )}>
                {task.priority === 'high' ? 'ALTA' : task.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const TeamTab = ({ team }: { team: Project['team'] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">👥 Equipe de Desenvolvimento</h3>
      <div className="grid gap-4">
        {team.map((member) => (
          <Card key={member.id} className="glass-card border-slate-700 p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {member.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{member.name}</div>
                <div className="text-sm text-slate-400">{member.role}</div>
                {member.workload !== undefined && (
                  <div className="text-xs text-slate-500 mt-1">{member.workload} tarefas ativas</div>
                )}
              </div>
              {member.isOnline && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  Online
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PaymentTab = ({ project }: { project: Project }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalReceived = project.paymentPlan?.invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.value, 0) || 0;

  const totalPending = project.paymentPlan?.invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.value, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card border-slate-700 p-5">
          <div className="text-xs text-slate-400 mb-1">Valor Total</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(project.value)}</div>
        </Card>

        <Card className="glass-card border-green-500/30 p-5">
          <div className="text-xs text-slate-400 mb-1">Recebido</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalReceived)}</div>
        </Card>

        <Card className="glass-card border-blue-500/30 p-5">
          <div className="text-xs text-slate-400 mb-1">A Receber</div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalPending)}</div>
        </Card>
      </div>

      {project.paymentPlan && (
        <Card className="glass-card border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">💰 Faturas</h3>
          <div className="space-y-3">
            {project.paymentPlan.invoices.map((invoice) => (
              <div key={invoice.id} className={cn(
                "p-4 rounded-lg border",
                invoice.status === 'paid' ? "bg-green-500/5 border-green-500/30" :
                invoice.status === 'overdue' ? "bg-red-500/5 border-red-500/30" :
                "bg-slate-800/30 border-slate-700"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-semibold">{invoice.description}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Fatura {invoice.number} • Vencimento: {format(parseISO(invoice.dueDate), "dd/MM/yyyy")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{formatCurrency(invoice.value)}</div>
                    <Badge className={cn(
                      "text-xs mt-1",
                      invoice.status === 'paid' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      invoice.status === 'overdue' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    )}>
                      {invoice.status === 'paid' ? '✓ PAGO' :
                       invoice.status === 'overdue' ? '! ATRASADO' :
                       'PENDENTE'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};


