/**
 * 🧑 MODAL UNIFICADO DE USUÁRIO
 * 
 * Este é o modal central para visualização e edição de informações de usuário.
 * Substitui o antigo MemberModal e serve como base única para todos os dados.
 * 
 * Abas implementadas:
 * - Informações: Dados pessoais, métricas, contato
 * - Performance: Estatísticas de desempenho em tempo real
 * - Leads: Leads atribuídos ao usuário
 * - Timeline: Histórico de atividades
 */

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { 
  Usuario,
  USUARIO_CARGO_LABELS,
  USUARIO_DEPARTAMENTO_LABELS,
  USUARIO_DEPARTAMENTO_COLORS,
  USUARIO_STATUS_COLORS,
  USUARIO_PERFORMANCE_COLORS,
  calcularMetricasUsuario,
  calcularPerformanceUsuario,
} from "@/types/usuario";
import { Lead } from "@/data/mockLeads";
import { Project } from "@/pages/Projetos";
import { Task } from "@/pages/Projetos";
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Target, 
  Briefcase, 
  CheckSquare,
  Clock,
  Bot,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity as ActivityIcon,
  Instagram,
  MessageCircle,
  Save,
  Edit,
  MapPin,
  Cake,
  IdCard,
  Trash2,
  Shield,
  Zap,
  Users,
  FolderKanban,
  ListTodo,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Timer,
  Award,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface UsuarioModalProps {
  usuario: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (usuario: Usuario) => void;
  onDelete?: (usuarioId: string) => void;
  // Dados para cálculo de métricas
  leads?: Lead[];
  projects?: Project[];
  tasks?: Task[];
  activities?: any[];
}

export const UsuarioModal = ({ 
  usuario, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  leads = [],
  projects = [],
  tasks = [],
  activities = [],
}: UsuarioModalProps) => {
  if (!usuario) return null;

  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedData, setEditedData] = useState({
    nome: usuario.nome,
    sobrenome: usuario.sobrenome || '',
    email: usuario.email,
    phone: usuario.phone || '',
    whatsapp: usuario.whatsapp || '',
    instagram: usuario.instagram || '',
    cpf: usuario.cpf || '',
    dataNascimento: usuario.dataNascimento || '',
    endereco: usuario.endereco?.rua || '',
    photoUrl: usuario.photoUrl || '',
  });

  // Calcular métricas em tempo real
  const metricas = useMemo(() => {
    return calcularMetricasUsuario(usuario, leads, projects, tasks, []);
  }, [usuario, leads, projects, tasks]);

  // Calcular performance
  const performance = useMemo(() => {
    return calcularPerformanceUsuario(metricas);
  }, [metricas]);

  // Filtrar dados do usuário
  const usuarioLeads = useMemo(() => {
    return leads.filter(l => l.owner === usuario.id || (l as any).userId === usuario.id);
  }, [leads, usuario.id]);

  const usuarioProjects = useMemo(() => {
    return projects.filter(p => 
      p.team?.some(t => t.id === usuario.id) || (p as any).ownerId === usuario.id
    );
  }, [projects, usuario.id]);

  const usuarioTasks = useMemo(() => {
    return tasks.filter(t => t.assignedTo === usuario.id);
  }, [tasks, usuario.id]);

  const usuarioActivities = useMemo(() => {
    return activities.filter(a => a.memberId === usuario.id || a.userId === usuario.id);
  }, [activities, usuario.id]);

  useEffect(() => {
    if (usuario) {
      setEditedData({
        nome: usuario.nome,
        sobrenome: usuario.sobrenome || '',
        email: usuario.email,
        phone: usuario.phone || '',
        whatsapp: usuario.whatsapp || '',
        instagram: usuario.instagram || '',
        cpf: usuario.cpf || '',
        dataNascimento: usuario.dataNascimento || '',
        endereco: usuario.endereco?.rua || '',
        photoUrl: usuario.photoUrl || '',
      });
    }
  }, [usuario]);

  const handleSave = () => {
    if (!onUpdate) return;

    const usuarioAtualizado: Usuario = {
      ...usuario,
      nome: editedData.nome,
      sobrenome: editedData.sobrenome,
      nomeCompleto: `${editedData.nome} ${editedData.sobrenome}`.trim(),
      email: editedData.email,
      phone: editedData.phone || undefined,
      whatsapp: editedData.whatsapp || undefined,
      instagram: editedData.instagram || undefined,
      cpf: editedData.cpf || undefined,
      dataNascimento: editedData.dataNascimento || undefined,
      photoUrl: editedData.photoUrl || undefined,
      endereco: editedData.endereco ? {
        rua: editedData.endereco,
      } : undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(usuarioAtualizado);
    setIsEditing(false);
    toast.success("Informações atualizadas com sucesso!");
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(usuario.id);
    setShowDeleteDialog(false);
    onClose();
    toast.success("Usuário removido com sucesso!");
  };

  const openWhatsApp = () => {
    if (usuario.whatsapp) {
      const phoneNumber = usuario.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  const openInstagram = () => {
    if (usuario.instagram) {
      const username = usuario.instagram.replace('@', '');
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 glass-card border-slate-700">
        <div className="flex flex-col h-[95vh]">
          {/* HEADER */}
          <div className="flex-shrink-0 p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <Avatar className="w-20 h-20 ring-4 ring-slate-700">
                  {editedData.photoUrl ? (
                    <AvatarImage src={editedData.photoUrl} className="object-cover" />
                  ) : null}
                  <AvatarFallback className={cn(
                    "text-2xl font-bold",
                    usuario.isAdmin 
                      ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary" 
                      : "bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200"
                  )}>
                    {usuario.avatar}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">
                      {usuario.nomeCompleto}
                    </h2>
                    
                    {/* Status Indicator */}
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      USUARIO_STATUS_COLORS[usuario.status]
                    )} />

                    {/* Badges */}
                    {usuario.isAdmin && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrador
                      </Badge>
                    )}
                    {usuario.isAI && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Bot className="w-3 h-3 mr-1" />
                        Agente IA
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{USUARIO_CARGO_LABELS[usuario.cargo]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className={cn("w-4 h-4", USUARIO_DEPARTAMENTO_COLORS[usuario.departamento])} />
                      <span className={USUARIO_DEPARTAMENTO_COLORS[usuario.departamento]}>
                        {USUARIO_DEPARTAMENTO_LABELS[usuario.departamento]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Membro desde {format(parseISO(usuario.dataIngresso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!isEditing && !usuario.isAI && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="glass-card border-slate-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
                {isEditing && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="glass-card border-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </>
                )}
                {!usuario.isAI && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="flex-shrink-0 w-full justify-start px-6 bg-transparent border-b border-slate-700">
              <TabsTrigger value="info" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <UserIcon className="w-4 h-4 mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="leads" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Target className="w-4 h-4 mr-2" />
                Leads
                {usuarioLeads.length > 0 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {usuarioLeads.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {/* ABA: INFORMAÇÕES */}
              <TabsContent value="info" className="p-6 space-y-6">
                {/* Métricas de Atividade */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Métricas de Atividade
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="glass-card border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Leads Atribuídos</span>
                        <Target className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{metricas.leadsAtribuidos}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {metricas.leadsConvertidos} convertidos
                      </div>
                    </Card>

                    <Card className="glass-card border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Projetos Ativos</span>
                        <FolderKanban className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{metricas.projetosAtivos}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {metricas.projetosUrgentes} urgentes
                      </div>
                    </Card>

                    <Card className="glass-card border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Tarefas</span>
                        <ListTodo className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{metricas.tarefasTotal}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {metricas.tarefasVencendoHoje} vencendo hoje
                      </div>
                    </Card>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Dados Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    Dados Pessoais
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Nome */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 block">Nome</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.nome}
                          onChange={(e) => setEditedData({ ...editedData, nome: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                        />
                      ) : (
                        <div className="text-white">{usuario.nome}</div>
                      )}
                    </div>

                    {/* Sobrenome */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 block">Sobrenome</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.sobrenome}
                          onChange={(e) => setEditedData({ ...editedData, sobrenome: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                        />
                      ) : (
                        <div className="text-white">{usuario.sobrenome || '-'}</div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedData.email}
                          onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                        />
                      ) : (
                        <div className="text-white">{usuario.email}</div>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefone
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editedData.phone}
                          onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                          placeholder="(00) 00000-0000"
                        />
                      ) : (
                        <div className="text-white">{usuario.phone || '-'}</div>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editedData.whatsapp}
                          onChange={(e) => setEditedData({ ...editedData, whatsapp: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                          placeholder="(00) 00000-0000"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-white">{usuario.whatsapp || '-'}</span>
                          {usuario.whatsapp && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={openWhatsApp}
                              className="h-6 px-2 text-green-400 hover:text-green-300"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Instagram */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editedData.instagram}
                          onChange={(e) => setEditedData({ ...editedData, instagram: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                          placeholder="@usuario"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-white">{usuario.instagram || '-'}</span>
                          {usuario.instagram && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={openInstagram}
                              className="h-6 px-2 text-pink-400 hover:text-pink-300"
                            >
                              <Instagram className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CPF */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <IdCard className="w-4 h-4" />
                        CPF
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editedData.cpf}
                          onChange={(e) => setEditedData({ ...editedData, cpf: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                          placeholder="000.000.000-00"
                        />
                      ) : (
                        <div className="text-white">{usuario.cpf || '-'}</div>
                      )}
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <Cake className="w-4 h-4" />
                        Data de Nascimento
                      </Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedData.dataNascimento}
                          onChange={(e) => setEditedData({ ...editedData, dataNascimento: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                        />
                      ) : (
                        <div className="text-white">
                          {usuario.dataNascimento 
                            ? format(parseISO(usuario.dataNascimento), "dd/MM/yyyy", { locale: ptBR })
                            : '-'
                          }
                        </div>
                      )}
                    </div>

                    {/* Endereço */}
                    <div className="col-span-2">
                      <Label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Endereço
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editedData.endereco}
                          onChange={(e) => setEditedData({ ...editedData, endereco: e.target.value })}
                          className="glass-card border-slate-700 text-white"
                          placeholder="Rua, número, bairro, cidade, estado"
                        />
                      ) : (
                        <div className="text-white">{usuario.endereco?.rua || '-'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ABA: PERFORMANCE */}
              <TabsContent value="performance" className="p-6 space-y-6">
                {/* Performance Geral */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Performance Geral
                  </h3>

                  <Card className={cn("glass-card p-6 border", USUARIO_PERFORMANCE_COLORS[performance.nivel])}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold capitalize">{performance.nivel}</div>
                        <div className="text-sm text-slate-400">Pontuação: {performance.pontuacao}/100</div>
                      </div>
                      <div className="text-4xl font-bold">{performance.pontuacao}</div>
                    </div>
                    <Progress value={performance.pontuacao} className="h-3" />
                  </Card>
                </div>

                {/* Estatísticas Detalhadas */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Taxa de Conversão */}
                  <Card className="glass-card border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-white">Taxa de Conversão</span>
                      </div>
                      {metricas.taxaConversao >= 50 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {metricas.taxaConversao.toFixed(1)}%
                    </div>
                    <Progress value={metricas.taxaConversao} className="h-2" />
                  </Card>

                  {/* Tempo Médio de Resposta */}
                  <Card className="glass-card border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium text-white">Tempo Médio de Resposta</span>
                      </div>
                      {metricas.tempoMedioResposta <= 30 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {metricas.tempoMedioResposta}min
                    </div>
                  </Card>

                  {/* Tarefas Concluídas */}
                  <Card className="glass-card border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium text-white">Tarefas Concluídas</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {metricas.tarefasConcluidas}
                    </div>
                    <div className="text-xs text-slate-500">
                      de {metricas.tarefasTotal} totais
                    </div>
                    <Progress 
                      value={metricas.tarefasTotal > 0 ? (metricas.tarefasConcluidas / metricas.tarefasTotal) * 100 : 0} 
                      className="h-2 mt-2" 
                    />
                  </Card>

                  {/* Total de Interações */}
                  <Card className="glass-card border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-orange-400" />
                        <span className="text-sm font-medium text-white">Total de Interações</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {metricas.totalInteracoes}
                    </div>
                    <div className="text-xs text-slate-500">
                      últimos 30 dias
                    </div>
                  </Card>

                  {/* Leads Convertidos */}
                  <Card className="glass-card border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-medium text-white">Leads Convertidos</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {metricas.leadsConvertidos}
                    </div>
                    <div className="text-xs text-slate-500">
                      de {metricas.leadsAtribuidos} atribuídos
                    </div>
                  </Card>

                  {/* Follow-ups Criados */}
                  <Card className="glass-card border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-medium text-white">Follow-ups Criados</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {metricas.followupsCriados}
                    </div>
                    <div className="text-xs text-slate-500">
                      últimos 30 dias
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* ABA: LEADS */}
              <TabsContent value="leads" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Leads Atribuídos ({usuarioLeads.length})
                  </h3>
                </div>

                {usuarioLeads.length === 0 ? (
                  <Card className="glass-card border-slate-700 p-12 text-center">
                    <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Nenhum lead atribuído</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {usuarioLeads.map((lead) => (
                      <Card key={lead.id} className="glass-card border-slate-700 p-4 hover:border-slate-600 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-1">{lead.name}</div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <Badge variant="outline" className="text-xs">
                                {lead.stage}
                              </Badge>
                              {(lead as any).estimatedValue && (
                                <span>R$ {((lead as any).estimatedValue as number).toLocaleString('pt-BR')}</span>
                              )}
                              <span>
                                {lead.lastInteraction 
                                  ? formatDistanceToNow(new Date(lead.lastInteraction), { addSuffix: true, locale: ptBR })
                                  : 'Sem interações'
                                }
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ABA: TIMELINE */}
              <TabsContent value="timeline" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Timeline de Atividades
                  </h3>
                </div>

                {usuarioActivities.length === 0 ? (
                  <Card className="glass-card border-slate-700 p-12 text-center">
                    <ActivityIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Nenhuma atividade registrada</p>
                  </Card>
                ) : (
                  <div className="relative space-y-6">
                    {/* Linha do tempo */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />

                    {usuarioActivities.map((activity, index) => (
                      <div key={activity.id || index} className="relative pl-14">
                        {/* Ícone */}
                        <div className={cn(
                          "absolute left-0 w-12 h-12 rounded-full flex items-center justify-center",
                          activity.type === 'lead' && "bg-green-500/20 text-green-400",
                          activity.type === 'task' && "bg-blue-500/20 text-blue-400",
                          activity.type === 'comment' && "bg-purple-500/20 text-purple-400",
                          activity.type === 'followup' && "bg-orange-500/20 text-orange-400",
                          !activity.type && "bg-slate-700 text-slate-400"
                        )}>
                          {activity.type === 'lead' && <Target className="w-5 h-5" />}
                          {activity.type === 'task' && <CheckSquare className="w-5 h-5" />}
                          {activity.type === 'comment' && <MessageSquare className="w-5 h-5" />}
                          {activity.type === 'followup' && <Clock className="w-5 h-5" />}
                          {!activity.type && <ActivityIcon className="w-5 h-5" />}
                        </div>

                        {/* Conteúdo */}
                        <Card className="glass-card border-slate-700 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-white">{activity.title || activity.action}</span>
                            <span className="text-xs text-slate-500">
                              {activity.timestamp 
                                ? formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: ptBR })
                                : ''
                              }
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-slate-400">{activity.description}</p>
                          )}
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-card border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir <strong>{usuario.nomeCompleto}</strong>? 
              Esta ação não pode ser desfeita e o usuário será removido de todos os projetos e leads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-card border-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

