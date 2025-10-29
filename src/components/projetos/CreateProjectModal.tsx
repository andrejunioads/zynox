import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Project } from "@/pages/Projetos";
import { ProjectType, getProjectTypeLabel, getProjectTypeIcon } from "@/types/teams";
import { getTeamByProjectType } from "@/data/mockTeams";
import { useMembers } from "@/contexts/DataContext";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export const CreateProjectModal = ({
  isOpen,
  onClose,
  onCreateProject,
}: CreateProjectModalProps) => {
  const { members } = useMembers();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    description: "",
    type: ProjectType.WEBSITE, // Tipo de projeto padrão
    startDate: "",
    deadline: "",
    priority: "medium" as "high" | "medium" | "low",
    value: 0,
  });

  // Formatar valor monetário
  const formatCurrencyInput = (value: number): string => {
    if (!value) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Parse do valor monetário
  const parseCurrencyInput = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, "");
    return parseFloat(numericValue) / 100 || 0;
  };

  const handleSubmit = () => {
    // Obter equipe baseada no tipo de projeto
    const team = getTeamByProjectType(formData.type);
    const teamMembers = members.map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar || 'U',
      role: m.role === 'admin' ? 'project_manager' : 'developer' as any,
      email: m.email,
      workload: 0,
      isOnline: m.status === 'online'
    }));

    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      teamId: team?.id || '',
      client: formData.client,
      status: "backlog",
      priority: formData.priority,
      progress: 0,
      healthScore: 100,
      deadline: formData.deadline,
      team: teamMembers,
      tags: [getProjectTypeLabel(formData.type)],
      tasks: [],
      files: [],
      comments: [],
      activities: [{
        id: 'act-1',
        type: 'project_created',
        author: 'André Silva',
        description: 'criou o projeto',
        timestamp: new Date().toISOString()
      }],
      milestones: [],
      risks: [],
      notes: [],
      value: formData.value,
      budget: {
        total: formData.value,
        spent: 0,
        breakdown: {
          labor: 0,
          infrastructure: 0,
          external: 0,
          other: 0
        }
      },
      description: formData.description,
      startDate: formData.startDate,
      createdBy: 'André Silva',
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      lastActivityAt: new Date().toISOString()
    };

    onCreateProject(newProject);
    
    // Reset form
    setStep(1);
    setFormData({
      name: "",
      client: "",
      description: "",
      type: ProjectType.WEBSITE,
      startDate: "",
      deadline: "",
      priority: "medium",
      value: 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Novo Projeto
          </DialogTitle>
          <p className="text-muted text-sm">Etapa {step} de 4</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Website Empresa X"
                  className="glass-card border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Nome do cliente"
                  className="glass-card border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o projeto..."
                  className="glass-card border-white/10 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Projeto *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: ProjectType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="glass-card border-white/10">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span>{getProjectTypeIcon(formData.type)}</span>
                        <span>{getProjectTypeLabel(formData.type)}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProjectType).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <span>{getProjectTypeIcon(type)}</span>
                          <span>{getProjectTypeLabel(type)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 mt-1">
                  A equipe especializada será automaticamente atribuída ao projeto
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Planejamento</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal glass-card border-white/10",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(new Date(formData.startDate), "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-primary/30">
                      <Calendar
                        mode="single"
                        selected={formData.startDate ? new Date(formData.startDate) : undefined}
                        onSelect={(date) => setFormData({ ...formData, startDate: date ? format(date, "yyyy-MM-dd") : "" })}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Data Entrega *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal glass-card border-white/10",
                          !formData.deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? format(new Date(formData.deadline), "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-primary/30">
                      <Calendar
                        mode="single"
                        selected={formData.deadline ? new Date(formData.deadline) : undefined}
                        onSelect={(date) => setFormData({ ...formData, deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "high" | "medium" | "low") =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="glass-card border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor do Projeto</Label>
                <Input
                  id="value"
                  type="text"
                  value={formatCurrencyInput(formData.value)}
                  onChange={(e) => {
                    const numericValue = parseCurrencyInput(e.target.value);
                    setFormData({ ...formData, value: numericValue });
                  }}
                  placeholder="R$ 0,00"
                  className="glass-card border-white/10"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Equipe</h3>
              <p className="text-muted">Adicione membros ao time do projeto</p>
              <div className="glass-card p-6 rounded-lg text-center">
                <p className="text-muted">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Tarefas Iniciais</h3>
              <p className="text-muted">Adicione tarefas iniciais (opcional)</p>
              <div className="glass-card p-6 rounded-lg text-center">
                <p className="text-muted">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>Próximo</Button>
            ) : (
              <Button onClick={handleSubmit}>Criar Projeto</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
