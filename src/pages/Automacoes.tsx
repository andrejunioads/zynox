import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAutomations, useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Plus, 
  Zap, 
  Trash2, 
  Edit, 
  Play, 
  Pause,
  ArrowRight,
  Filter,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Target,
  Sparkles,
  TestTube
} from "lucide-react";
import { cn } from "@/lib/utils";
import { automationEngine } from "@/services/automationEngine";
import { Automation, TriggerType, AutomationCondition, AutomationAction } from "@/types/automation";
import { automationTemplates, additionalTemplates, getTemplateById, categories } from "@/data/automationTemplates";

// Combinar templates principais e adicionais
const allTemplates = [...automationTemplates, ...additionalTemplates];
import { getFieldsForTrigger, getOperatorsForField, validateFieldValue } from "@/utils/automationFieldHelpers";

const Automacoes = () => {
  // Usar DataContext para gerenciar automações
  const { automations, createAutomation, updateAutomation, deleteAutomation, reinstallSystemAutomations, getStats } = useAutomations();
  const { sync } = useData();
  
  // Sincronização inteligente - automações são gerenciadas pelo DataContext
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [viewMode, setViewMode] = useState<'automations' | 'logs'>('automations');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [logs, setLogs] = useState(automationEngine.getExecutionLogs());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [automationToDelete, setAutomationToDelete] = useState<Automation | null>(null);
  const [testingAutomationId, setTestingAutomationId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDefaultTitle, setFormDefaultTitle] = useState('');
  const [formDefaultPriority, setFormDefaultPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [formTrigger, setFormTrigger] = useState<TriggerType>('lead_created');
  const [formConditions, setFormConditions] = useState<AutomationCondition[]>([]);
  const [formActions, setFormActions] = useState<AutomationAction[]>([]);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = () => {
    // Automações são gerenciadas pelo DataContext
    // Não precisa carregar manualmente
  };

  const handleCreateAutomation = () => {
    if (!formName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formActions.length === 0) {
      toast.error('Adicione pelo menos uma ação');
      return;
    }

    try {
      const automationData = {
        name: formName,
        description: formDescription,
        defaultTitle: formDefaultTitle || undefined,
        defaultPriority: formDefaultPriority,
        trigger: { type: formTrigger },
        conditions: formConditions,
        actions: formActions,
        enabled: true,
        createdBy: 'André',
      };

      if (editingAutomation) {
        updateAutomation(editingAutomation.id, automationData);
        toast.success('Automação atualizada!', {
          style: {
            background: 'rgba(37, 211, 102, 0.15)',
            color: '#25D366',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            backdropFilter: 'blur(10px)'
          }
        });
      } else {
        createAutomation(automationData);
        toast.success('Automação criada! 🤖', {
          style: {
            background: 'rgba(37, 211, 102, 0.15)',
            color: '#25D366',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            backdropFilter: 'blur(10px)'
          }
        });
      }

      resetForm();
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar automação');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormDefaultTitle('');
    setFormDefaultPriority('medium');
    setFormTrigger('lead_created');
    setFormConditions([]);
    setFormActions([]);
    setEditingAutomation(null);
    setShowTemplates(true);
  };

  const loadTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    setFormName(template.name);
    setFormDescription(template.description);
    setFormTrigger(template.trigger.type);
    setFormConditions(template.conditions);
    setFormActions(template.actions);
    setShowTemplates(false);

    toast.success(`Template "${template.name}" carregado!`, {
      description: 'Personalize e salve sua automação',
      duration: 3000,
    });
  };

  const handleEditAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormName(automation.name);
    setFormDescription(automation.description || '');
    setFormDefaultTitle(automation.defaultTitle || '');
    setFormDefaultPriority(automation.defaultPriority || 'medium');
    setFormTrigger(automation.trigger.type);
    setFormConditions(automation.conditions);
    setFormActions(automation.actions);
    setShowTemplates(false); // Não mostrar templates ao editar
    setIsCreateModalOpen(true);
  };

  const handleDeleteAutomation = (automation: Automation) => {
    setAutomationToDelete(automation);
    setDeleteDialogOpen(true);
  };

  const handleReinstallSystemAutomations = () => {
    toast.loading('🔄 Reinstalando automações do sistema...', {
      id: 'reinstall-automations',
    });

    setTimeout(() => {
      const result = reinstallSystemAutomations();
      
      if (result.success) {
        toast.success(`✅ ${result.count} automações reinstaladas!`, {
          id: 'reinstall-automations',
          description: 'As automações do sistema foram restauradas com sucesso.',
        });
      } else {
        toast.error('❌ Erro ao reinstalar automações', {
          id: 'reinstall-automations',
          description: result.error || 'Tente novamente',
        });
      }
    }, 1000);
  };

  const confirmDeleteAutomation = () => {
    if (automationToDelete) {
      deleteAutomation(automationToDelete.id);
      toast.success('Automação deletada com sucesso!', {
        style: {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      });
      setDeleteDialogOpen(false);
      setAutomationToDelete(null);
    }
  };

  const handleToggleAutomation = (id: string, enabled: boolean) => {
    automationEngine.toggleAutomation(id, enabled);
    loadAutomations();
    
    if (enabled) {
      toast.success('Automação ativada! ✅', {
        description: 'A automação está rodando e irá executar quando os critérios forem atendidos',
        style: {
          background: 'rgba(37, 211, 102, 0.15)',
          color: '#25D366',
          border: '1px solid rgba(37, 211, 102, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      });
    } else {
      toast('Automação pausada', {
        description: 'A automação não irá executar até ser reativada',
        style: {
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#94A3B8',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      });
    }
  };

  const handleTestAutomation = async (automation: Automation) => {
    setTestingAutomationId(automation.id);
    
    try {
      toast.loading('🧪 Preparando teste...', {
        id: 'test-automation',
        duration: 2000,
      });

      // Dados de teste baseados no tipo de automação
      const testData: Record<string, any> = {
        automationId: automation.id,
        clientName: 'João Silva (TESTE)',
        company: 'Tech Solutions (TESTE)',
        name: 'Maria Costa (TESTE)',
        email: 'teste@example.com',
        phone: '(11) 98765-4321',
        value: '25000',
        age: 35,
        daysUntil: 7,
        daysInactive: 30,
        count: 3,
        projectName: 'Novo Site E-commerce (TESTE)',
        progress: 65,
        origin: 'Instagram',
        temperature: 'Quente',
      };

      // Disparar a automação com dados de teste
      await automationEngine.trigger('scheduled' as any, testData);

      toast.success('Notificação enviada!', {
        id: 'test-automation',
        description: 'Verifique seu celular ou o painel de notificações.',
        duration: 4000,
        style: {
          background: 'rgba(139, 92, 246, 0.15)',
          color: '#A78BFA',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      });
    } catch (error) {
      console.error('Erro ao testar automação:', error);
      toast.error('Erro ao enviar teste', {
        id: 'test-automation',
        description: 'Verifique a conexão com o webhook.',
      });
    } finally {
      setTestingAutomationId(null);
    }
  };

  const addCondition = () => {
    setFormConditions([
      ...formConditions,
      { field: '', operator: 'equals', value: '' }
    ]);
  };

  const updateCondition = (index: number, updates: Partial<AutomationCondition>) => {
    const newConditions = [...formConditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setFormConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setFormConditions(formConditions.filter((_, i) => i !== index));
  };

  const addAction = () => {
    setFormActions([
      ...formActions,
      { type: 'send_notification', config: {} }
    ]);
  };

  const updateAction = (index: number, updates: Partial<AutomationAction>) => {
    const newActions = [...formActions];
    newActions[index] = { ...newActions[index], ...updates };
    setFormActions(newActions);
  };

  const removeAction = (index: number) => {
    setFormActions(formActions.filter((_, i) => i !== index));
  };

  const getTriggerLabel = (type: TriggerType): string => {
    const labels: Record<TriggerType, string> = {
      lead_created: '🚀 Novo Lead',
      lead_stage_changed: '📊 Lead Mudou de Etapa',
      lead_updated: '✏️ Lead Atualizado',
      project_created: '📁 Novo Projeto',
      project_progress_changed: '📈 Progresso de Projeto',
      project_status_changed: '🔄 Status de Projeto',
      payment_received: '💰 Pagamento Recebido',
      expense_added: '💸 Despesa Adicionada',
      task_created: '✅ Tarefa Criada',
      task_completed: '🎉 Tarefa Concluída',
      client_inactive: '😴 Cliente Inativo',
      contract_expiring: '⚠️ Contrato Vencendo',
      birthday: '🎂 Aniversário',
      followup_overdue: '⏰ Follow-up Atrasado',
      custom: '⚙️ Personalizado',
    };
    return labels[type] || type;
  };

  const getActionLabel = (type: string): string => {
    const labels: Record<string, string> = {
      send_notification: '📤 Enviar Notificação',
      create_task: '✅ Criar Tarefa',
      send_email: '📧 Enviar Email',
      create_followup: '📅 Criar Follow-up',
      update_field: '📝 Atualizar Campo',
      webhook: '🌐 Webhook',
      custom: '⚙️ Personalizado',
    };
    return labels[type] || type;
  };

  // Atualizar logs quando a view mudar ou periodicamente
  useEffect(() => {
    if (viewMode === 'logs') {
      // Atualizar logs imediatamente
      setLogs(automationEngine.getExecutionLogs());
      
      // Atualizar a cada 3 segundos quando estiver na view de logs
      const interval = setInterval(() => {
        setLogs(automationEngine.getExecutionLogs());
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  // Estatísticas
  const totalAutomations = automations.length;
  const activeAutomations = automations.filter(a => a.enabled).length;
  const pausedAutomations = automations.filter(a => !a.enabled).length;
  const totalExecutions = automations.reduce((sum, a) => sum + a.executionCount, 0);

  // Filtrar automações
  const filteredAutomations = automations.filter(automation => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      automation.name.toLowerCase().includes(searchLower) ||
      (automation.description && automation.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <DashboardLayout showHeader={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-lg font-semibold text-white">Automações Inteligentes</h1>
            <p className="text-sm text-slate-400">
              Crie regras personalizadas para automatizar notificações e ações
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Campo de Busca */}
            {viewMode === 'automations' && (
              <div className="relative w-[280px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar automação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-card border-primary/20 focus:border-primary/50"
                />
              </div>
            )}

            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
              setIsCreateModalOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="btn-primary-gradient glow-primary">
                  <Plus className="w-4 h-4" />
                  Nova Automação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAutomation ? 'Editar Automação' : 'Nova Automação'}
                  </DialogTitle>
                </DialogHeader>

                {/* Templates Section - Só aparece ao criar nova automação */}
                {showTemplates && !editingAutomation && (
                  <div className="space-y-4 mt-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">🎯 Começar com Template</h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Selecione um template pronto ou continue para criar do zero
                      </p>
                    </div>

                    {/* Filtros de Categoria */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('all')}
                        className="h-7 text-xs"
                      >
                        Todos
                      </Button>
                      {categories.map(cat => (
                        <Button
                          key={cat.value}
                          size="sm"
                          variant={selectedCategory === cat.value ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(cat.value)}
                          className="h-7 text-xs"
                        >
                          {cat.label}
                        </Button>
                      ))}
                    </div>

                    {/* Grid de Templates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {allTemplates
                        .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
                        .map(template => (
                          <button
                            key={template.id}
                            onClick={() => loadTemplate(template.id)}
                            className="text-left p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{template.icon}</div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white mb-1 group-hover:text-primary transition-colors">
                                  {template.name}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                                  {template.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      template.difficulty === 'fácil' && "border-green-500/30 text-green-400",
                                      template.difficulty === 'intermediário' && "border-yellow-500/30 text-yellow-400",
                                      template.difficulty === 'avançado' && "border-red-500/30 text-red-400"
                                    )}
                                  >
                                    {template.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTemplates(false)}
                      className="w-full text-slate-400 hover:text-white"
                    >
                      Ou criar do zero →
                    </Button>
                  </div>
                )}

                <div className="space-y-6 mt-4">
                  {/* Nome e Descrição */}
                  <div className="space-y-4">
                    <div>
                      <Label>Nome da Automação</Label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: Notificar vendas grandes"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Descreva o que esta automação faz..."
                        className="mt-1.5"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Título da Notificação (Opcional)</Label>
                      <Input
                        value={formDefaultTitle}
                        onChange={(e) => setFormDefaultTitle(e.target.value)}
                        placeholder="Ex: 🚀 Nova Oportunidade Detectada!"
                        className="mt-1.5"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Se não especificado, o título será gerado automaticamente
                      </p>
                    </div>

                    <div>
                      <Label>Prioridade Padrão</Label>
                      <Select 
                        value={formDefaultPriority} 
                        onValueChange={(value) => setFormDefaultPriority(value as 'low' | 'medium' | 'high' | 'urgent')}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🔵 Baixa - Silenciosa</SelectItem>
                          <SelectItem value="medium">🟢 Média - Normal</SelectItem>
                          <SelectItem value="high">🟡 Alta - Sonora</SelectItem>
                          <SelectItem value="urgent">🔴 Urgente - Requer confirmação</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">
                        Define a importância e o tipo de notificação enviada
                      </p>
                    </div>
                  </div>

                  {/* Gatilho */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      Quando isso acontecer...
                    </h3>
                    <Select value={formTrigger} onValueChange={(value) => setFormTrigger(value as TriggerType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead_created">🚀 Novo Lead</SelectItem>
                        <SelectItem value="lead_stage_changed">📊 Lead Mudou de Etapa</SelectItem>
                        <SelectItem value="lead_updated">✏️ Lead Atualizado</SelectItem>
                        <SelectItem value="project_created">📁 Novo Projeto</SelectItem>
                        <SelectItem value="project_progress_changed">📈 Progresso de Projeto</SelectItem>
                        <SelectItem value="payment_received">💰 Pagamento Recebido</SelectItem>
                        <SelectItem value="task_completed">🎉 Tarefa Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condições */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <Filter className="w-4 h-4 text-yellow-400" />
                        </div>
                        E se...
                      </h3>
                      <Button size="sm" variant="outline" onClick={addCondition}>
                        <Plus className="w-3 h-3 mr-1" />
                        Condição
                      </Button>
                    </div>

                    {formConditions.length === 0 ? (
                      <p className="text-sm text-slate-400">Nenhuma condição. Sempre executará.</p>
                    ) : (
                      <div className="space-y-3">
                        {formConditions.map((condition, index) => {
                          const availableFields = getFieldsForTrigger(formTrigger);
                          const selectedField = availableFields.find(f => f.value === condition.field);
                          const availableOperators = getOperatorsForField(selectedField);

                          return (
                            <div key={index} className="rounded-lg border border-white/5 bg-black/20 p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                {/* Campo */}
                                <Select 
                                  value={condition.field}
                                  onValueChange={(value) => {
                                    const field = availableFields.find(f => f.value === value);
                                    updateCondition(index, { 
                                      field: value,
                                      operator: field?.operators[0] || 'equals',
                                      value: ''
                                    });
                                  }}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Selecione um campo..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFields.map(field => (
                                      <SelectItem key={field.value} value={field.value}>
                                        {field.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Operador */}
                                {condition.field && (
                                  <Select 
                                    value={condition.operator}
                                    onValueChange={(value) => updateCondition(index, { operator: value as any })}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableOperators.map(op => (
                                        <SelectItem key={op.value} value={op.value}>
                                          {op.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {/* Valor */}
                                {condition.field && (
                                  selectedField?.type === 'select' ? (
                                    <Select 
                                      value={String(condition.value)}
                                      onValueChange={(value) => updateCondition(index, { value })}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Selecione..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {selectedField.options?.map(opt => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="relative flex-1">
                                      {selectedField?.prefix && (
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                          {selectedField.prefix}
                                        </span>
                                      )}
                                      <Input
                                        type={selectedField?.type === 'number' ? 'number' : 'text'}
                                        placeholder={selectedField?.placeholder}
                                        value={condition.value}
                                        onChange={(e) => updateCondition(index, { value: e.target.value })}
                                        className={selectedField?.prefix ? 'pl-12' : ''}
                                      />
                                    </div>
                                  )
                                )}

                                {/* Botão Remover */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeCondition(index)}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-green-400" />
                        </div>
                        Então faça...
                      </h3>
                      <Button size="sm" variant="outline" onClick={addAction}>
                        <Plus className="w-3 h-3 mr-1" />
                        Ação
                      </Button>
                    </div>

                    {formActions.length === 0 ? (
                      <p className="text-sm text-red-400">Adicione pelo menos uma ação</p>
                    ) : (
                      <div className="space-y-3">
                        {formActions.map((action, index) => (
                          <div key={index} className="rounded-lg border border-white/5 bg-black/20 p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Select 
                                value={action.type}
                                onValueChange={(value) => updateAction(index, { type: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="send_notification">📤 Enviar Notificação</SelectItem>
                                  <SelectItem value="create_task">✅ Criar Tarefa</SelectItem>
                                  <SelectItem value="create_followup">📅 Criar Follow-up</SelectItem>
                                  <SelectItem value="webhook">🌐 Webhook</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeAction(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>

                            {/* Campos específicos por tipo de ação */}
                            {action.type === 'send_notification' && (
                              <Textarea
                                placeholder="Mensagem"
                                value={action.config.message || ''}
                                onChange={(e) => updateAction(index, {
                                  config: { ...action.config, message: e.target.value }
                                })}
                                rows={3}
                              />
                            )}

                            {action.type === 'create_task' && (
                              <>
                                <Input
                                  placeholder="Nome da tarefa"
                                  value={action.config.taskName || ''}
                                  onChange={(e) => updateAction(index, {
                                    config: { ...action.config, taskName: e.target.value }
                                  })}
                                />
                                <Input
                                  placeholder="Atribuir para"
                                  value={action.config.assignedTo || ''}
                                  onChange={(e) => updateAction(index, {
                                    config: { ...action.config, assignedTo: e.target.value }
                                  })}
                                />
                              </>
                            )}

                            {action.type === 'webhook' && (
                              <Input
                                placeholder="URL do webhook"
                                value={action.config.webhookUrl || ''}
                                onChange={(e) => updateAction(index, {
                                  config: { ...action.config, webhookUrl: e.target.value }
                                })}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button variant="outline" onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateAutomation} className="btn-primary-gradient">
                      {editingAutomation ? 'Salvar Alterações' : 'Criar Automação'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Total
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalAutomations}</p>
            <p className="text-sm text-muted-foreground">Automações Criadas</p>
          </div>

          {/* Ativas */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                Rodando
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{activeAutomations}</p>
            <p className="text-sm text-muted-foreground">Automações Ativas</p>
            <div className="mt-3">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${totalAutomations > 0 ? (activeAutomations / totalAutomations) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pausadas */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-slate-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Pause className="w-5 h-5 text-slate-400" />
              <Badge variant="outline" className="text-xs border-slate-400/30 text-slate-400">
                Inativas
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{pausedAutomations}</p>
            <p className="text-sm text-muted-foreground">Automações Pausadas</p>
          </div>

          {/* Execuções */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400">
                Disparos
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalExecutions}</p>
            <p className="text-sm text-muted-foreground">Total de Execuções</p>
          </div>
        </div>

        {/* Toggle de Visualização */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 w-fit">
          <Button
            variant={viewMode === 'automations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('automations')}
            className="h-8"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Automações
          </Button>
          <Button
            variant={viewMode === 'logs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('logs')}
            className="h-8"
          >
            <Activity className="w-4 h-4 mr-1.5" />
            Logs ({logs.length})
          </Button>
        </div>

        {/* Content */}
        {viewMode === 'automations' ? (
          // Lista de Automações
          filteredAutomations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAutomations.map((automation) => (
                <div
                  key={automation.id}
                  className={cn(
                    "glass-card rounded-xl border p-5 transition-all flex flex-col",
                    automation.enabled 
                      ? "border-primary/30 hover:border-primary/50" 
                      : "border-white/10 hover:border-white/20 opacity-60"
                  )}
                >
                  {/* HEADER - Título + Status + Ações */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    {/* Título + Badge Status */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-base truncate">
                        {automation.name}
                      </h3>
                      <Badge 
                        variant={automation.enabled ? "default" : "secondary"}
                        className="text-[10px] h-5 px-2 flex-shrink-0"
                      >
                        {automation.enabled ? '✓' : '⏸'}
                      </Badge>
                    </div>

                    {/* Botões de Ação - Compactos */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={(checked) => handleToggleAutomation(automation.id, checked)}
                        className="scale-90"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleTestAutomation(automation)}
                        title="Testar Notificação"
                        disabled={testingAutomationId === automation.id}
                        className={cn(
                          "h-8 w-8 transition-all",
                          testingAutomationId === automation.id && "animate-pulse"
                        )}
                      >
                        <TestTube className={cn(
                          "w-3.5 h-3.5",
                          testingAutomationId === automation.id ? "text-purple-600" : "text-purple-400"
                        )} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditAutomation(automation)}
                        title="Editar"
                        className="h-8 w-8"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteAutomation(automation)}
                        title="Deletar"
                        className="h-8 w-8 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Descrição (se existir) */}
                  {automation.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                      {automation.description}
                    </p>
                  )}

                  {/* FLUXO VISUAL - Trigger → Condições → Ações */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="text-[11px] h-6 px-2">
                      {getTriggerLabel(automation.trigger.type)}
                    </Badge>

                    {automation.conditions.length > 0 && (
                      <>
                        <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <Badge variant="outline" className="text-[11px] h-6 px-2 text-yellow-400 border-yellow-400/30">
                          {automation.conditions.length} {automation.conditions.length === 1 ? 'condição' : 'condições'}
                        </Badge>
                      </>
                    )}

                    <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

                    {automation.actions.map((action, index) => (
                      <Badge key={index} variant="outline" className="text-[11px] h-6 px-2 text-green-400 border-green-400/30">
                        {getActionLabel(action.type)}
                      </Badge>
                    ))}
                  </div>

                  {/* FOOTER - Metadados */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-white/5 mt-auto">
                    {automation.executionCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {automation.executionCount} {automation.executionCount === 1 ? 'execução' : 'execuções'}
                      </span>
                    ) : (
                      <span className="text-slate-600">Nunca executada</span>
                    )}
                    
                    {automation.lastExecutedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(automation.lastExecutedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm ? 'Nenhuma automação encontrada' : 'Nenhuma automação criada ainda'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchTerm 
                  ? 'Tente ajustar sua busca'
                  : 'Crie sua primeira automação e deixe o sistema trabalhar por você!'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="btn-primary-gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Automação
                </Button>
              )}
            </div>
          )
        ) : (
          // Logs de Execução
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Histórico de Execuções
            </h2>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Nenhuma execução ainda</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Os logs aparecerão aqui quando suas automações forem executadas
                    </p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "rounded-lg border p-4",
                        log.success 
                          ? "border-green-500/20 bg-green-500/5" 
                          : "border-red-500/20 bg-red-500/5"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {log.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span className="font-medium text-white">{log.automationName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Gatilho: <span className="text-white">{getTriggerLabel(log.trigger as TriggerType)}</span>
                      </p>
                      {!log.success && log.error && (
                        <p className="text-xs text-red-400 mt-2">Erro: {log.error}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Alert Dialog para Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl text-white">
                Excluir Automação?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-400 mt-3">
              {automationToDelete && (
                <>
                  Você está prestes a excluir a automação <span className="font-semibold text-white">"{automationToDelete.name}"</span>.
                  <br /><br />
                  Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAutomation}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Automacoes;
