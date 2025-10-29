import { Lead } from "@/pages/Comercial";
import { useState, useEffect } from "react";
import { FileUploader } from "@/components/common/FileUploader";
import { FileData } from "@/services/fileService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  MessageCircle,
  X,
  Building2,
  User,
  Target,
  DollarSign,
  Tag,
  Clock,
  Plus,
  ExternalLink,
  Copy,
  Save,
  Trash2,
  Send,
  CheckCircle2,
  Edit3,
  PhoneCall,
  Video,
  Package,
  Briefcase,
  RefreshCw,
  TrendingUp,
  XCircle,
  UserCheck,
  CreditCard,
  Rocket,
  FolderOpen,
  AlertCircle,
  Instagram,
  Linkedin,
  Globe,
  UserPlus,
  Search,
  Brain,
  Code,
  Palette,
  TrendingUp as ChartUp,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { FollowUp } from "@/types/followup";
import { AddFollowUpModal } from "./AddFollowUpModal";
import { FollowUpCard } from "./FollowUpCard";
import { getFollowUpCountsByLead, isFollowUpOverdue } from "@/utils/followUpHelpers";

interface LeadDetailsModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  followUps?: FollowUp[];
  onAddFollowUp?: (followUp: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateFollowUp?: (id: string, updates: Partial<FollowUp>) => void;
  onDeleteFollowUp?: (id: string) => void;
}

const SERVICOS_DISPONIVEIS = {
  "Inteligência e Automação": [
    "Agentes de IA Personalizados",
    "Automações para WhatsApp, Instagram e Notion",
    "Integrações via API / Webhooks",
    "Sistemas de Atendimento e Vendas 24h"
  ],
  "Web Design e Desenvolvimento": [
    "Website Profissional",
    "Landing Page de Conversão",
    "Sistema Web Personalizado (CRM, Dashboard, etc.)",
    "E-commerce Inteligente"
  ],
  "Design e Identidade": [
    "Branding e Direção Visual",
    "Design de Interfaces (UI/UX)",
    "Identidade Visual e Materiais Digitais",
    "Design de Experiência (Fluxos, Prototipagem, etc.)"
  ],
  "Estratégia e Crescimento": [
    "Consultoria Digital",
    "SEO e Performance",
    "Otimização de Conversão (CRO)",
    "Manutenção e Evolução de Projetos"
  ]
};

const CATEGORIA_ICONS: Record<string, any> = {
  "Inteligência e Automação": Brain,
  "Web Design e Desenvolvimento": Code,
  "Design e Identidade": Palette,
  "Estratégia e Crescimento": ChartUp
};

export const LeadDetailsModal = ({ 
  lead, 
  isOpen, 
  onClose, 
  onUpdateLead, 
  onDeleteLead,
  followUps = [],
  onAddFollowUp,
  onUpdateFollowUp,
  onDeleteFollowUp
}: LeadDetailsModalProps) => {
  console.log("🟢 LeadDetailsModal renderizando com:", { lead, isOpen, followUps });
  
  // HOOKS DEVEM VIR ANTES DE QUALQUER RETURN CONDICIONAL
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    company: lead?.company || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    value: lead?.value || 0,
    origin: lead?.origin || "",
    status: lead?.status || "hot",
    stage: lead?.stage || "new",
  });

  const [servicosInteresse, setServicosInteresse] = useState<string[]>([]);
  const [outrosServicos, setOutrosServicos] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [novaInteracao, setNovaInteracao] = useState("");
  const [tipoInteracao, setTipoInteracao] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  
  // Follow-ups do lead (com validação)
  const safeFollowUps = Array.isArray(followUps) ? followUps : [];
  const leadFollowUps = lead?.id ? safeFollowUps.filter(f => f && f.lead_id === lead.id) : [];
  const activeFollowUps = leadFollowUps.filter(f => f && f.status !== 'feito' && f.status !== 'cancelado');
  
  // Histórico de interações (mock - virá do backend futuramente)
  // Ordem: Mais recente primeiro (topo) → Mais antiga por último (fim)
  const [interacoes, setInteracoes] = useState<Array<{
    id: string;
    tipo: string;
    titulo: string;
    descricao: string;
    data: Date;
    automatica: boolean;
    usuario?: string;
    etapa: string;
  }>>([]);

  // Atualiza formData e interações quando o lead muda
  useEffect(() => {
    if (lead && lead.id) {
      setFormData({
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        phone: lead.phone || "",
        value: lead.value || 0,
        origin: lead.origin || "",
        status: lead.status || "hot",
        stage: lead.stage || "new",
      });
      
      // Inicializa interações mock
      const baseInteracoes = [
        {
          id: "1",
          tipo: "email_primeiro",
          titulo: "Primeiro Contato via Email",
          descricao: "Apresentação de serviços e portfólio enviada",
          data: new Date(Date.now() - 4 * 60 * 60 * 1000),
          automatica: false,
          usuario: "André",
          etapa: "new"
        },
        {
          id: "2",
          tipo: "ligacao",
          titulo: "Ligação realizada",
          descricao: "Conversa inicial (15 min) - Cliente demonstrou interesse em Website e Automações",
          data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          automatica: false,
          usuario: "André",
          etapa: "new"
        },
        {
          id: "3",
          tipo: "lead_criado",
          titulo: "Lead criado automaticamente",
          descricao: `Origem: ${lead.origin || "Desconhecida"}`,
          data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          automatica: true,
          etapa: "new"
        },
      ];

      // Adiciona interações automáticas para follow-ups concluídos
      const completedFollowUps = leadFollowUps.filter(f => f.status === 'feito');
      const followUpInteracoes = completedFollowUps.map(fu => ({
        id: `followup-${fu.id}`,
        tipo: "followup_realizado",
        titulo: "Follow-up Realizado",
        descricao: fu.titulo,
        data: new Date(fu.updated_at),
        automatica: true,
        usuario: fu.responsavel,
        etapa: fu.stage_id
      }));

      // Adiciona interações automáticas para mudanças de etapa
      const stageChanges = lead.stageHistory || [];
      const stageInteracoes = stageChanges.map((change, index) => ({
        id: `stage-change-${index}`,
        tipo: "mudanca_etapa",
        titulo: "Mudança de Etapa",
        descricao: `Lead movido de "${getNomeEtapa(change.fromStage)}" para "${getNomeEtapa(change.toStage)}"`,
        data: new Date(change.changedAt),
        automatica: true,
        usuario: change.changedBy,
        etapa: change.toStage
      }));

      // Combina e ordena por data (mais recente primeiro)
      const todasInteracoes = [...baseInteracoes, ...followUpInteracoes, ...stageInteracoes].sort(
        (a, b) => b.data.getTime() - a.data.getTime()
      );

      setInteracoes(todasInteracoes);
    }
  }, [lead, leadFollowUps]);
  
  // Validação após todos os hooks
  if (!lead || !lead.id) {
    console.error("🔴 LeadDetailsModal: lead inválido", lead);
    return null;
  }

  // Define tipos de interação baseado na etapa atual
  // Nota: Apenas interações MANUAIS aqui. Automáticas (lead_criado, mudanca_etapa, etc) 
  // são criadas pelo sistema e não aparecem no dropdown
  const getInteracoesPorEtapa = (stage: string) => {
    const interacoesPorEtapa: Record<string, Array<{value: string; label: string; emoji: string}>> = {
      new: [
        { value: "whatsapp_primeiro", label: "Primeiro Contato via WhatsApp", emoji: "💬" },
        { value: "email_primeiro", label: "Primeiro Contato via Email", emoji: "📧" },
        { value: "ligacao_primeiro", label: "Primeira Ligação", emoji: "📞" },
        { value: "nota", label: "Nota Interna", emoji: "📓" },
      ],
      qualified: [
        { value: "diagnostico", label: "Conversa de Diagnóstico", emoji: "💬" },
        { value: "ligacao_triagem", label: "Ligação de Triagem", emoji: "📞" },
        { value: "reuniao_agendada", label: "Reunião Agendada", emoji: "📅" },
        { value: "email_enviado", label: "Email Enviado", emoji: "📧" },
        { value: "nota", label: "Nota Interna", emoji: "📝" },
      ],
      meeting: [
        { value: "reuniao_realizada", label: "Reunião Realizada", emoji: "🤝" },
        { value: "briefing", label: "Briefing Recebido", emoji: "📋" },
        { value: "proposta_enviada", label: "Proposta Comercial Enviada", emoji: "💼" },
        { value: "followup", label: "Follow-up Enviado", emoji: "💬" },
        { value: "nota", label: "Nota Interna", emoji: "📝" },
      ],
      proposal: [
        { value: "followup", label: "Follow-up Enviado", emoji: "💬" },
        { value: "ligacao_acompanhamento", label: "Ligação de Acompanhamento", emoji: "📞" },
        { value: "reuniao_negociacao", label: "Reunião de Negociação", emoji: "🤝" },
        { value: "proposta_ajustada", label: "Proposta Ajustada Enviada", emoji: "💼" },
        { value: "revisao_valores", label: "Revisão de Valores Solicitada", emoji: "📋" },
        { value: "nota", label: "Nota Interna", emoji: "📓" },
      ],
      negotiation: [
        { value: "followup", label: "Follow-up Enviado", emoji: "💬" },
        { value: "ligacao_fechamento", label: "Ligação de Fechamento", emoji: "📞" },
        { value: "reuniao_fechamento", label: "Reunião de Fechamento", emoji: "🤝" },
        { value: "proposta_final", label: "Proposta Final Enviada", emoji: "💼" },
        { value: "revisao", label: "Revisão de Escopo/Prazo", emoji: "📋" },
        { value: "contrato_enviado", label: "Contrato Enviado", emoji: "📄" },
        { value: "nota", label: "Nota Interna", emoji: "📓" },
      ],
      won: [
        { value: "contrato_assinado", label: "Contrato Assinado", emoji: "✅" },
        { value: "pagamento_confirmado", label: "Pagamento Confirmado", emoji: "💰" },
        { value: "onboarding_iniciado", label: "Onboarding Iniciado", emoji: "🧩" },
        { value: "briefing_recebido", label: "Briefing/Materiais Recebidos", emoji: "📦" },
        { value: "kickoff", label: "Kickoff Realizado", emoji: "🚀" },
        { value: "atividade_criada", label: "Atividade Criada no Projeto", emoji: "🗂️" },
        { value: "nota", label: "Nota Interna", emoji: "📓" },
      ],
      lost: [
        { value: "motivo_perda", label: "Motivo da Perda", emoji: "❌" },
        { value: "feedback", label: "Feedback Recebido", emoji: "💬" },
        { value: "followup_futuro", label: "Follow-up Futuro Agendado", emoji: "📅" },
        { value: "nota", label: "Nota Interna", emoji: "📓" },
      ],
    };
    
    return interacoesPorEtapa[stage] || interacoesPorEtapa.new;
  };

  const getTipoInteracaoIcon = (tipo: string) => {
    const iconMap: Record<string, any> = {
      lead_criado: Edit3,
      whatsapp_primeiro: MessageCircle,
      email_primeiro: Mail,
      ligacao_primeiro: PhoneCall,
      ia_resposta: Send,
      ia_qualificado: TrendingUp,
      ia_insight: TrendingUp,
      ia_interesse: TrendingUp,
      ia_objecao: AlertCircle,
      ia_engajado: TrendingUp,
      nota: FileText,
      diagnostico: MessageCircle,
      ligacao_triagem: PhoneCall,
      ligacao_fechamento: PhoneCall,
      ligacao_negociacao: PhoneCall,
      ligacao_acompanhamento: PhoneCall,
      reuniao_agendada: Calendar,
      reuniao_realizada: Video,
      reuniao_fechamento: Video,
      reuniao_negociacao: Video,
      proposta_inicial: FileText,
      proposta_enviada: Briefcase,
      proposta_ajustada: Briefcase,
      proposta_final: Briefcase,
      briefing: FileText,
      briefing_recebido: Package,
      revisao_valores: RefreshCw,
      revisao: RefreshCw,
      followup: MessageCircle,
      contrato_assinado: CheckCircle2,
      contrato_enviado: FileText,
      pagamento_confirmado: CreditCard,
      onboarding_iniciado: UserCheck,
      kickoff: Rocket,
      atividade_criada: FolderOpen,
      motivo_perda: XCircle,
      feedback: MessageCircle,
      followup_futuro: Calendar,
      email: Mail,
      email_enviado: Mail,
      ligacao: PhoneCall,
      reuniao: Video,
      whatsapp: MessageCircle,
      mudanca_etapa: RefreshCw,
      followup_realizado: CheckCircle2,
    };
    return iconMap[tipo] || FileText;
  };

  const getTipoInteracaoColor = (tipo: string): string => {
    if (tipo.startsWith("ia_")) return "bg-purple-500/30";
    if (tipo.includes("reuniao")) return "bg-cyan-500/30";
    if (tipo.includes("proposta")) return "bg-primary/30";
    if (tipo.includes("ligacao")) return "bg-success/30";
    if (tipo.includes("whatsapp") || tipo === "followup" || tipo === "diagnostico") return "bg-[#25D366]/30";
    if (tipo === "contrato_assinado" || tipo === "pagamento_confirmado") return "bg-success/30";
    if (tipo === "motivo_perda") return "bg-danger/30";
    if (tipo === "lead_criado" || tipo === "mudanca_etapa") return "bg-blue-500/30";
    return "bg-muted/30";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Ações rápidas
  const handleEnviarEmail = () => {
    window.location.href = `mailto:${formData.email}?subject=Proposta Comercial - ${formData.company}`;
    toast.success("Cliente de email aberto!", {
      description: formData.email
    });
  };

  const handleLigar = () => {
    const phoneNumber = formData.phone.replace(/\D/g, '');
    navigator.clipboard.writeText(formData.phone);
    toast.success("Telefone copiado!", {
      description: `${formData.phone} - Use seu telefone para ligar`,
      action: {
        label: "WhatsApp",
        onClick: () => window.open(`https://wa.me/55${phoneNumber}`, '_blank')
      }
    });
  };

  const handleAgendarReuniao = () => {
    // Criar evento no Google Calendar
    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 24); // Amanhã no mesmo horário
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 60); // 1 hora de duração

    const title = encodeURIComponent(`Reunião - ${formData.name} (${formData.company})`);
    const details = encodeURIComponent(`Reunião comercial com ${formData.name}\n\nEmpresa: ${formData.company}\nTelefone: ${formData.phone}\nEmail: ${formData.email}`);
    const dates = `${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
    
    window.open(googleCalendarUrl, '_blank');
    toast.success("Google Calendar aberto!", {
      description: "Preencha os detalhes e confirme o agendamento"
    });
  };

  const handleWhatsApp = () => {
    const phoneNumber = formData.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${formData.name}! Tudo bem?`);
    window.open(`https://wa.me/55${phoneNumber}?text=${message}`, '_blank');
  };

  const handleToggleServico = (servico: string) => {
    setServicosInteresse(prev => 
      prev.includes(servico) 
        ? prev.filter(s => s !== servico)
        : [...prev, servico]
    );
  };

  const getTituloInteracao = (tipo: string): string => {
    const opcoes = getInteracoesPorEtapa(formData.stage);
    const opcao = opcoes.find(o => o.value === tipo);
    return opcao?.label || tipo;
  };

  const handleAdicionarInteracao = () => {
    if (!tipoInteracao) {
      toast.error("Selecione um tipo de interação");
      return;
    }
    
    if (!novaInteracao.trim()) {
      toast.error("Digite uma descrição para a interação");
      return;
    }

    const novaInteracaoObj = {
      id: Date.now().toString(),
      tipo: tipoInteracao,
      titulo: getTituloInteracao(tipoInteracao),
      descricao: novaInteracao,
      data: new Date(),
      automatica: false,
      usuario: "André", // Futuramente virá do contexto de autenticação
      etapa: formData.stage
    };

    setInteracoes(prev => [novaInteracaoObj, ...prev]);

    toast.success("Interação adicionada!", {
      description: `${novaInteracao.substring(0, 60)}${novaInteracao.length > 60 ? '...' : ''}`
    });

    setNovaInteracao("");
    setTipoInteracao("");
  };

  // Função para formatar data relativa
  const formatarDataRelativa = (data: Date): string => {
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "Agora";
    if (minutos < 60) return `Há ${minutos} min`;
    if (horas < 24) return `Há ${horas}h`;
    if (dias === 1) return "Ontem";
    if (dias < 7) return `Há ${dias} dias`;
    
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSalvar = () => {
    const updatedLead: Lead = {
      ...lead,
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      value: formData.value,
      origin: formData.origin,
      status: formData.status,
      stage: formData.stage,
      daysInStage: formData.stage !== lead.stage ? 0 : lead.daysInStage,
    };
    
    // Se a etapa mudou, adiciona interação automática
    if (formData.stage !== lead.stage) {
      const stageNames: Record<string, string> = {
        new: "Novas Oportunidades",
        qualified: "Qualificados",
        meeting: "Reunião Agendada",
        proposal: "Proposta Enviada",
        negotiation: "Negociação",
        won: "Fechado",
        lost: "Perdido"
      };
      
      const interacaoAutomatica = {
        id: Date.now().toString(),
        tipo: "mudanca_etapa",
        titulo: "Mudança de Etapa",
        descricao: `Lead movido de "${stageNames[lead.stage]}" para "${stageNames[formData.stage]}"`,
        data: new Date(),
        automatica: true,
        usuario: "Sistema",
        etapa: formData.stage
      };
      
      setInteracoes(prev => [interacaoAutomatica, ...prev]);
    }
    
    onUpdateLead(updatedLead);
  };

  const handleExcluir = () => {
    onDeleteLead(lead.id);
    setShowDeleteDialog(false);
    onClose();
    
    toast.error("Lead excluído", {
      description: `${lead.name} foi removido do sistema`,
      style: {
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        backdropFilter: 'blur(10px)'
      }
    });
  };

  // Handlers para Follow-ups
  const handleAddFollowUp = (followUpData: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (onAddFollowUp) {
        onAddFollowUp(followUpData);
      }
      setShowFollowUpModal(false);
    } catch (error) {
      console.error("Erro ao adicionar follow-up no modal:", error);
      toast.error("Erro ao adicionar follow-up");
    }
  };

  const handleMarkFollowUpAsDone = (id: string) => {
    try {
      if (onUpdateFollowUp) {
        const followUp = leadFollowUps.find(f => f && f.id === id);
        if (followUp) {
          onUpdateFollowUp(id, { 
            status: 'feito',
            updated_at: new Date()
          });

        // Cria interação automática
        const interacaoFeito = {
          id: Date.now().toString(),
          tipo: "followup_realizado",
          titulo: "Follow-up Realizado",
          descricao: followUp.titulo,
          data: new Date(),
          automatica: true,
          etapa: formData.stage
        };
        setInteracoes(prev => [interacaoFeito, ...prev]);

        // Se tem repetição, cria novo follow-up
        if (followUp.repetir_em && onAddFollowUp) {
          const newDueDate = new Date(followUp.due_date);
          newDueDate.setDate(newDueDate.getDate() + followUp.repetir_em);
          
          onAddFollowUp({
            lead_id: followUp.lead_id,
            titulo: followUp.titulo,
            descricao: followUp.descricao,
            due_date: newDueDate,
            status: 'pendente',
            prioridade: followUp.prioridade,
            repetir_em: followUp.repetir_em,
            responsavel: followUp.responsavel,
            stage_id: followUp.stage_id,
            is_automatico: followUp.is_automatico
          });

          toast.success("Follow-up concluído e reagendado!", {
            description: `Próximo: ${newDueDate.toLocaleDateString('pt-BR')}`,
            style: {
              background: 'rgba(37, 211, 102, 0.15)',
              color: '#25D366',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              backdropFilter: 'blur(10px)'
            }
          });
        } else {
          toast.success("Follow-up concluído!", {
            style: {
              background: 'rgba(37, 211, 102, 0.15)',
              color: '#25D366',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              backdropFilter: 'blur(10px)'
            }
          });
        }
      }
    }
    } catch (error) {
      console.error("Erro ao marcar follow-up como feito no modal:", error);
      toast.error("Erro ao concluir follow-up");
    }
  };

  const handleDeleteFollowUp = (id: string) => {
    try {
      if (confirm("Deseja excluir este follow-up?") && onDeleteFollowUp) {
        onDeleteFollowUp(id);
        toast.success("Follow-up excluído");
      }
    } catch (error) {
      console.error("Erro ao excluir follow-up no modal:", error);
      toast.error("Erro ao excluir follow-up");
    }
  };

  const getTemperatureBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      hot: { bg: 'bg-danger/20', text: 'text-danger', label: '🔥 HOT' },
      warm: { bg: 'bg-warning/20', text: 'text-warning', label: '⚡ WARM' },
      cold: { bg: 'bg-primary/20', text: 'text-primary', label: '❄️ COLD' }
    };
    return badges[status] || badges.cold;
  };

  const getNomeEtapa = (stage: string): string => {
    const stageNames: Record<string, string> = {
      new: "Novas Oportunidades",
      qualified: "Qualificados",
      meeting: "Reunião Agendada",
      proposal: "Proposta Enviada",
      negotiation: "Negociação",
      won: "Fechado",
      lost: "Perdido"
    };
    return stageNames[stage] || stage;
  };

  const getCorEtapa = (stage: string): string => {
    const cores: Record<string, string> = {
      new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      qualified: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      meeting: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      proposal: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      negotiation: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      won: "bg-green-500/10 text-green-400 border-green-500/30",
      lost: "bg-red-500/10 text-red-400 border-red-500/30"
    };
    return cores[stage] || "bg-muted/10 text-muted-foreground border-muted/30";
  };

  const getOrigemIcon = (origem: string) => {
    const iconMap: Record<string, any> = {
      LinkedIn: Linkedin,
      Instagram: Instagram,
      Google: Search,
      WhatsApp: MessageCircle,
      Website: Globe,
      Indicação: UserPlus,
    };
    return iconMap[origem] || Globe;
  };

  const getOrigemColor = (origem: string): string => {
    const colorMap: Record<string, string> = {
      LinkedIn: "text-[#0A66C2]",
      Instagram: "text-[#C13584]",
      Google: "text-[#4285F4]",
      WhatsApp: "text-[#25D366]",
      Website: "text-primary",
      Indicação: "text-success",
    };
    return colorMap[origem] || "text-muted-foreground";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] glass-card border-primary/30 p-0 flex flex-col">
        {/* Header Fixo */}
        <DialogHeader className="px-6 py-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                {formData.name}
                <Badge className={`text-[10px] px-2 py-0.5 ${getTemperatureBadge(formData.status).bg} ${getTemperatureBadge(formData.status).text} border-0 font-semibold`}>
                  {getTemperatureBadge(formData.status).label}
                </Badge>
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{formData.company}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 max-h-[calc(95vh-180px)] overflow-y-auto">
          <div className="space-y-6 py-6">
            {/* Ações Rápidas */}
            <div className="grid grid-cols-4 gap-3">
              <Button 
                onClick={handleEnviarEmail}
                variant="outline" 
                className="border-primary/50 text-primary hover:bg-primary/10 gap-2"
              >
                <Mail className="w-4 h-4" />
                Enviar Email
              </Button>
              <Button 
                onClick={handleLigar}
                variant="outline" 
                className="border-primary/50 text-primary hover:bg-primary/10 gap-2"
              >
                <Phone className="w-4 h-4" />
                Ligar
              </Button>
              <Button 
                onClick={handleAgendarReuniao}
                variant="outline" 
                className="border-success/50 text-success hover:bg-success/10 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Agendar
              </Button>
              <Button 
                onClick={handleWhatsApp}
                variant="outline" 
                className="border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>

            {/* Informações do Lead */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informações do Lead
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-card/60 border-primary/30 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Empresa</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="bg-card/60 border-primary/30 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-card/60 border-primary/30 mt-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.email);
                        toast.success("Email copiado!");
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  <div className="relative">
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-card/60 border-primary/30 mt-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.phone);
                        toast.success("Telefone copiado!");
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Origem</Label>
                  <div className="relative mt-1">
                    {(() => {
                      const IconComponent = getOrigemIcon(formData.origin);
                      return (
                        <IconComponent 
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${getOrigemColor(formData.origin)}`} 
                        />
                      );
                    })()}
                    <Input
                      value={formData.origin}
                      readOnly
                      className="bg-card/60 border-primary/30 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Budget Estimado</Label>
                  <Input
                    type="text"
                    value={formatCurrency(formData.value)}
                    onChange={(e) => {
                      // Remove tudo exceto números
                      const apenasNumeros = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, value: Number(apenasNumeros)});
                    }}
                    placeholder="R$ 0"
                    className="bg-card/60 border-primary/30 mt-1 font-semibold text-success"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="bg-card/60 border-primary/30 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">🔥 Hot</SelectItem>
                      <SelectItem value="warm">⚡ Warm</SelectItem>
                      <SelectItem value="cold">❄️ Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Etapa</Label>
                  <Select value={formData.stage} onValueChange={(value) => setFormData({...formData, stage: value})}>
                    <SelectTrigger className="bg-card/60 border-primary/30 mt-1">
                      <SelectValue placeholder="Selecione a etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Novas Oportunidades</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="qualified">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Qualificados</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="meeting">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Reunião Agendada</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="proposal">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Proposta Enviada</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="negotiation">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>Negociação</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="won">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span>Fechado</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="lost">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-danger" />
                          <span>Perdido</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Serviços de Interesse */}
              <div className="pt-4 border-t border-white/10">
                <Label className="text-sm text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Serviços de Interesse
                </Label>
                
                <div className="space-y-6 mt-4">
                  {Object.entries(SERVICOS_DISPONIVEIS).map(([categoria, servicos], index) => {
                    const IconComponent = CATEGORIA_ICONS[categoria];
                    return (
                    <div key={categoria}>
                      <div className={index > 0 ? "pt-6 border-t border-white/10" : ""}>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          {IconComponent && <IconComponent className="w-4 h-4 text-primary" />}
                          {categoria}
                        </h4>
                        <div className="grid grid-cols-1 gap-2.5 pl-2">
                          {servicos.map((servico) => (
                            <div key={servico} className="flex items-start space-x-2">
                              <Checkbox
                                id={servico}
                                checked={servicosInteresse.includes(servico)}
                                onCheckedChange={() => handleToggleServico(servico)}
                                className="mt-0.5"
                              />
                              <label
                                htmlFor={servico}
                                className="text-sm text-foreground/90 cursor-pointer leading-tight hover:text-foreground transition-colors"
                              >
                                {servico}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Resumo dos Serviços Selecionados */}
                {servicosInteresse.length > 0 && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-2">
                      {servicosInteresse.length} {servicosInteresse.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {servicosInteresse.map((servico) => (
                        <Badge 
                          key={servico} 
                          variant="secondary" 
                          className="text-[10px] bg-primary/20 text-primary border-primary/30"
                        >
                          {servico}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campo de Observações Específicas */}
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground">Observações sobre os serviços</Label>
                  <Textarea
                    value={outrosServicos}
                    onChange={(e) => setOutrosServicos(e.target.value)}
                    placeholder="Ex: Precisa integração com sistema legado, prazo urgente, orçamento limitado..."
                    className="bg-card/60 border-primary/30 mt-1 min-h-[60px]"
                  />
                </div>
              </div>

            </div>

            {/* Timeline de Interações */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Histórico de Interações
                </h3>
                <Badge variant="outline" className="text-xs">
                  {interacoes.length} {interacoes.length === 1 ? 'registro' : 'registros'}
                </Badge>
              </div>

              {/* Adicionar Nova Interação */}
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Label className="text-sm text-foreground mb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Interação
                </Label>
                <div className="space-y-3 mt-3">
                  <Select value={tipoInteracao} onValueChange={setTipoInteracao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de interação..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {getInteracoesPorEtapa(formData.stage).map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.emoji} {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Textarea
                      value={novaInteracao}
                      onChange={(e) => setNovaInteracao(e.target.value)}
                      placeholder="Descreva a interação em detalhes..."
                      className="flex-1 min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleAdicionarInteracao();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Dica: Ctrl+Enter para salvar rapidamente
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowFollowUpModal(true)}
                        variant="outline"
                        className="border-warning/50 text-warning hover:bg-warning/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Follow-up
                      </Button>
                      <Button 
                        onClick={handleAdicionarInteracao} 
                        className="btn-primary-gradient"
                        disabled={!tipoInteracao || !novaInteracao.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Interação
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline de Interações */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4 pt-0">
                  {interacoes.map((interacao, index) => (
                    <div key={interacao.id} className="flex items-start gap-3 relative group">
                      {/* Linha conectora - Mais curta, para antes do próximo ícone */}
                      {index !== interacoes.length - 1 && (
                        <div className="absolute left-[18px] top-10 w-0.5 h-[calc(100%-12px)] bg-gradient-to-b from-primary/30 to-transparent z-0" />
                      )}
                      
                      {/* Ícone da interação - Sem borda */}
                      <div className={`w-9 h-9 rounded-full ${getTipoInteracaoColor(interacao.tipo)} flex items-center justify-center flex-shrink-0 z-10 relative bg-card`}>
                        {(() => {
                          const IconComponent = getTipoInteracaoIcon(interacao.tipo);
                          return <IconComponent className="w-4 h-4" />;
                        })()}
                        {interacao.automatica && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full border-2 border-card flex items-center justify-center">
                            <TrendingUp className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Conteúdo da interação */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {/* Título da interação */}
                            <p className="font-semibold text-foreground text-sm mb-1">
                              {interacao.titulo}
                            </p>
                            
                            {/* Descrição */}
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                              {interacao.descricao}
                            </p>
                            
                            {/* Meta informações */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <p className="text-xs text-muted-foreground">
                                {formatarDataRelativa(interacao.data)}
                              </p>
                              {interacao.usuario && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <p className="text-xs text-muted-foreground">
                                    {interacao.usuario}
                                  </p>
                                </>
                              )}
                              {/* Badge da etapa */}
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] h-5 px-2 ${getCorEtapa(interacao.etapa)}`}
                              >
                                {getNomeEtapa(interacao.etapa)}
                              </Badge>
                              {/* Badge Auto (se for automática) */}
                              {interacao.automatica && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-purple-500/10 text-purple-400 border-purple-500/30">
                                    Auto
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Botão de opções (visível no hover) */}
                          {!interacao.automatica && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={() => {
                                if (confirm("Deseja excluir esta interação?")) {
                                  setInteracoes(prev => prev.filter(i => i.id !== interacao.id));
                                  toast.success("Interação excluída");
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-danger" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {interacoes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Nenhuma interação registrada ainda</p>
                      <p className="text-xs mt-1">Adicione a primeira interação acima</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Follow-ups Ativos */}
            {activeFollowUps.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Bell className="w-5 h-5 text-warning" />
                    Follow-ups Ativos
                  </h3>
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                    {activeFollowUps.length} {activeFollowUps.length === 1 ? 'pendente' : 'pendentes'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {activeFollowUps.slice(0, 2).map(followUp => (
                    <FollowUpCard
                      key={followUp.id}
                      followUp={followUp}
                      onMarkAsDone={handleMarkFollowUpAsDone}
                      onDelete={handleDeleteFollowUp}
                    />
                  ))}
                  {activeFollowUps.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      + {activeFollowUps.length - 2} follow-up{activeFollowUps.length - 2 > 1 ? 's' : ''} adicional{activeFollowUps.length - 2 > 1 ? 'is' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Arquivos Anexados */}
            <div className="glass-card p-6">
              <FileUploader
                files={(lead as any).files || []}
                onFilesChange={(files) => {
                  if (onUpdate) {
                    const updatedLead = {
                      ...lead,
                      files
                    };
                    onUpdate(updatedLead as Lead);
                  }
                }}
                uploadedBy="André Silva"
                category="lead"
                relatedId={lead.id}
                maxFiles={10}
                maxSizeMB={5}
                showPreview={true}
                compact={true}
                title="Anexos"
              />
            </div>

            {/* Observações Gerais */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                Observações Gerais
              </h3>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre o lead, necessidades específicas, preferências, detalhes importantes..."
                className="bg-card/60 border-primary/30 min-h-[120px]"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer Fixo */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-6 border-t border-white/10 bg-card/50">
          <Button 
            variant="ghost" 
            className="text-danger hover:bg-danger/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Lead
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="btn-primary-gradient glow-primary" onClick={handleSalvar}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Modal de Follow-up */}
    <AddFollowUpModal
      isOpen={showFollowUpModal}
      onClose={() => setShowFollowUpModal(false)}
      onSave={handleAddFollowUp}
      leadId={lead.id}
      leadName={lead.name}
      currentStage={formData.stage}
      defaultResponsavel="André"
    />

    {/* Dialog de Confirmação de Exclusão */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="glass-card border-danger/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-danger">
            <AlertCircle className="w-5 h-5" />
            Excluir Lead?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80">
            Tem certeza que deseja excluir <span className="font-semibold text-foreground">{lead.name}</span> ({lead.company})?
            <br />
            <span className="text-danger/80">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleExcluir}
            className="bg-danger hover:bg-danger/90 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Lead
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
