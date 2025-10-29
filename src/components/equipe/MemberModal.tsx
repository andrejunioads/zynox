import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  Member, 
  Activity,
  DEPARTMENT_LABELS, 
  DEPARTMENT_COLORS, 
  STATUS_COLORS, 
  ROLE_LABELS 
} from "@/types/member";
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
  User,
  TrendingUp,
  Activity as ActivityIcon,
  Instagram,
  MessageCircle,
  Save,
  Edit,
  Image as ImageIcon,
  MapPin,
  Cake,
  IdCard,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PerformanceWidget } from "./PerformanceWidget";
import { ActivityTimeline } from "./ActivityTimeline";
import { toast } from "sonner";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import { Lead } from "@/data/mockLeads";

interface MemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  leads?: Lead[];
  onUpdate?: (member: Member) => void;  // ✅ Callback para atualizar membro
  onDelete?: (memberId: string) => void;  // ✅ Callback para deletar membro
}

export const MemberModal = ({ member, isOpen, onClose, activities, leads = [], onUpdate, onDelete }: MemberModalProps) => {
  if (!member) return null;

  const isAI = member.type === 'ai';
  const memberActivities = activities.filter(a => a.memberId === member.id);
  const memberLeads = leads.filter(l => l.owner === member.id);

  const [isEditing, setIsEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl || ''); // ✅ Inicializar com foto do membro
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedMember, setEditedMember] = useState({
    name: member.name,
    email: member.email,
    phone: member.phone || '',
    instagram: member.instagram || '',
    cpf: '',
    birthdate: '',
    address: '',
  });

  // ✅ Sincronizar foto quando o membro mudar
  useEffect(() => {
    if (member) {
      setPhotoUrl(member.photoUrl || '');
      setEditedMember({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        instagram: member.instagram || '',
        cpf: '',
        birthdate: '',
        address: '',
      });
    }
  }, [member]);

  const handleSave = () => {
    // ✅ Atualizar membro com nova foto
    if (onUpdate) {
      const updatedMember: Member = {
        ...member,
        photoUrl: photoUrl || undefined,
        name: editedMember.name,
        email: editedMember.email,
        phone: editedMember.phone || undefined,
        instagram: editedMember.instagram || undefined,
      };
      onUpdate(updatedMember);
      
      toast.success("✅ Alterações salvas com sucesso!", {
        description: photoUrl !== member.photoUrl 
          ? `Foto e informações de ${editedMember.name} foram atualizadas.`
          : `As informações de ${editedMember.name} foram atualizadas.`,
      });
    } else {
      toast.error("Erro ao salvar alterações");
    }
    
    setIsEditing(false);
  };

  const openWhatsApp = () => {
    if (member.phone) {
      const phoneNumber = member.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      toast.success('Foto carregada com sucesso!');
    };
    reader.readAsDataURL(file);
    setIsDraggingPhoto(false);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoUpload(file);
    }
  };

  const handlePhotoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handlePhotoUpload(file);
    };
    input.click();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(member.id);
      setShowDeleteDialog(false);
      onClose();
      toast.success("Membro excluído", {
        description: `${member.name} foi removido da equipe.`
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] h-[90vh] glass-card border-white/10 p-0 flex flex-col overflow-hidden">
        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Padrão do Sistema */}
          <div className="px-6 py-5 border-b border-white/10 flex-shrink-0 bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Avatar com upload */}
                <div 
                  className={cn(
                    "relative group",
                    isEditing ? "cursor-pointer" : "cursor-default"
                  )}
                  onClick={isEditing ? handlePhotoClick : undefined}
                  onDragOver={isEditing ? (e) => { e.preventDefault(); setIsDraggingPhoto(true); } : undefined}
                  onDragLeave={isEditing ? () => setIsDraggingPhoto(false) : undefined}
                  onDrop={isEditing ? handlePhotoDrop : undefined}
                >
                  <div className={cn(
                    "w-20 h-20 border-2 transition-all rounded-xl overflow-hidden",
                    isDraggingPhoto ? "border-primary scale-105 shadow-lg shadow-primary/50" : "border-white/20",
                    isEditing && "hover:border-primary"
                  )}>
                    {photoUrl ? (
                      <img src={photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold">
                        {member.avatar}
                      </div>
                    )}
                  </div>
                  
                  {/* Upload overlay - só aparece quando editando */}
                  {isEditing && (
                    <div className={cn(
                      "absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center transition-opacity",
                      isDraggingPhoto ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg",
                    member.status === 'online' ? "bg-green-500" :
                    member.status === 'busy' ? "bg-yellow-500" :
                    member.status === 'away' ? "bg-orange-500" :
                    "bg-gray-500"
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isEditing ? (
                      <Input
                        value={editedMember.name}
                        onChange={(e) => setEditedMember({ ...editedMember, name: e.target.value })}
                        placeholder="Nome completo"
                        className="text-2xl font-bold h-10 bg-white/5 border-white/10 text-white max-w-md"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-white">{member.name}</h2>
                    )}
                    {isAI && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Bot className="w-3 h-3 mr-1" />
                        AI Agent
                      </Badge>
                    )}
                    {member.isAdmin && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className={cn("text-xs", DEPARTMENT_COLORS[member.department])}>
                      {DEPARTMENT_LABELS[member.department]}
                    </Badge>
                    <span>•</span>
                    <span>{ROLE_LABELS[member.role]}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={() => {
                        setIsEditing(false);
                        // Resetar foto e dados se cancelar
                        setPhotoUrl(member.photoUrl || '');
                        setEditedMember({
                          name: member.name,
                          email: member.email,
                          phone: member.phone || '',
                          instagram: member.instagram || '',
                          cpf: '',
                          birthdate: '',
                          address: '',
                        });
                        toast.info("Edição cancelada", {
                          description: "Nenhuma alteração foi salva."
                        });
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(true)} size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Informações
                    </Button>
                    {onDelete && (
                      <Button 
                        onClick={() => setShowDeleteDialog(true)} 
                        variant="outline" 
                        size="sm"
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Banner de modo de edição */}
            {isEditing && (
              <div className="mt-3 p-2 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium">
                  Modo de edição ativo - Você pode alterar a foto e as informações
                </span>
              </div>
            )}

            {/* Tabs */}
            <TabsList className="w-full bg-white/5 p-1 rounded-lg mt-4">
              <TabsTrigger value="info" className="flex-1">
                <User className="w-4 h-4 mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex-1">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex-1">
                <Target className="w-4 h-4 mr-2" />
                Leads ({memberLeads.length})
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">
                <ActivityIcon className="w-4 h-4 mr-2" />
                Timeline ({memberActivities.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Aba: Informações */}
          <TabsContent value="info" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-6 space-y-6">
                {/* Métricas Compactas */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Leads */}
                  <div className="glass-card p-3 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary px-1.5 py-0">
                        Atribuídos
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5">{member.assignedLeads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <div className="mt-2">
                      <div className="h-8 mb-1">
                        <PremiumMiniBar data={[8, 10, 9, 11, 12, 10, 12]} />
                      </div>
                      <p className="text-[10px] text-green-400">+2 esta semana</p>
                    </div>
                  </div>

                  {/* Projetos */}
                  <div className="glass-card p-3 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <Badge variant="outline" className="text-[10px] border-purple-400/30 text-purple-400 px-1.5 py-0">
                        Ativos
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5">{member.activeProjects}</p>
                    <p className="text-xs text-muted-foreground">Projetos</p>
                    <div className="mt-2">
                      <div className="h-8 mb-1">
                        <PremiumMiniBar data={[5, 6, 7, 8, 8, 8, 8]} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">3 urgentes</p>
                    </div>
                  </div>

                  {/* Tarefas */}
                  <div className="glass-card p-3 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <CheckSquare className="w-4 h-4 text-green-400" />
                      <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30 px-1.5 py-0">
                        Ativas
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5">{member.activeTasks}</p>
                    <p className="text-xs text-muted-foreground">Tarefas</p>
                    <div className="mt-2">
                      <div className="h-8 mb-1">
                        <PremiumMiniBar data={[12, 14, 13, 15, 15, 14, 15]} />
                      </div>
                      <p className="text-[10px] text-green-400">5 vencendo hoje</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Membro desde (fixo) */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Informações de Ingresso</h3>
                  <div className="glass-card p-4 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-xs text-muted-foreground">Membro desde</p>
                        <p className="text-sm text-white font-medium">{format(member.joinedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Dados Pessoais */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Dados Pessoais</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {/* CPF */}
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <IdCard className="w-4 h-4 text-blue-400" />
                        <Label className="text-sm text-muted-foreground">CPF</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          value={editedMember.cpf}
                          onChange={(e) => setEditedMember({ ...editedMember, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                          className="h-8 bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-sm text-white">{editedMember.cpf || 'Não informado'}</p>
                      )}
                    </div>
                    
                    {/* Data de Nascimento */}
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Cake className="w-4 h-4 text-pink-400" />
                        <Label className="text-sm text-muted-foreground">Data de Nascimento</Label>
                      </div>
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-8 justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50",
                                !editedMember.birthdate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {editedMember.birthdate ? (
                                format(new Date(editedMember.birthdate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              ) : (
                                "Selecione uma data"
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={editedMember.birthdate ? new Date(editedMember.birthdate) : undefined}
                              onSelect={(date) => setEditedMember({ 
                                ...editedMember, 
                                birthdate: date ? format(date, 'yyyy-MM-dd') : '' 
                              })}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <p className="text-sm text-white">
                          {editedMember.birthdate 
                            ? format(new Date(editedMember.birthdate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : 'Não informado'}
                        </p>
                      )}
                    </div>

                    {/* Endereço */}
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <Label className="text-sm text-muted-foreground">Endereço</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          value={editedMember.address}
                          onChange={(e) => setEditedMember({ ...editedMember, address: e.target.value })}
                          placeholder="Rua, número, bairro, cidade"
                          className="h-8 bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-sm text-white">{editedMember.address || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Instagram */}
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Instagram className="w-4 h-4 text-purple-400" />
                        <Label className="text-sm text-muted-foreground">Instagram</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          value={editedMember.instagram}
                          onChange={(e) => setEditedMember({ ...editedMember, instagram: e.target.value })}
                          placeholder="@usuario"
                          className="h-8 bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-sm text-white">{editedMember.instagram || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <Label className="text-sm text-muted-foreground">Email</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedMember.email}
                          onChange={(e) => setEditedMember({ ...editedMember, email: e.target.value })}
                          placeholder="email@exemplo.com"
                          className="h-8 bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-sm text-white">{editedMember.email}</p>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageCircle className="w-4 h-4 text-green-400" />
                        <Label className="text-sm text-muted-foreground">WhatsApp</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={editedMember.phone}
                          onChange={(e) => setEditedMember({ ...editedMember, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                          className="h-8 bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-white">{editedMember.phone || 'Não informado'}</p>
                          {editedMember.phone && (
                            <Button
                              size="sm"
                              onClick={openWhatsApp}
                              className="h-7 px-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Info */}
                {isAI && member.aiCapabilities && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      Capacidades da IA
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {member.aiCapabilities.map((cap, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-primary/30 text-primary">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Histórico de Atividades Recentes */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Últimas Atividades</h3>
                  <div className="space-y-2">
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-white">Moveu lead "Empresa ABC" para "Proposta Enviada"</p>
                          <p className="text-xs text-muted-foreground mt-1">há 2 horas</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-white">Concluiu tarefa "Atualizar proposta"</p>
                          <p className="text-xs text-muted-foreground mt-1">há 5 horas</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-white">Adicionou comentário no projeto "Website Redesign"</p>
                          <p className="text-xs text-muted-foreground mt-1">ontem às 15:30</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-white">Criou novo lead "Tech Solutions Ltd"</p>
                          <p className="text-xs text-muted-foreground mt-1">ontem às 11:20</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estatísticas do Mês */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Estatísticas do Mês</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Leads Convertidos</p>
                      <p className="text-xl font-bold text-white">8</p>
                      <p className="text-[10px] text-green-400 mt-1">+33% vs mês anterior</p>
                    </div>
                    
                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Taxa de Conversão</p>
                      <p className="text-xl font-bold text-white">67%</p>
                      <p className="text-[10px] text-green-400 mt-1">+5% vs mês anterior</p>
                    </div>

                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Tempo Médio de Resposta</p>
                      <p className="text-xl font-bold text-white">5min</p>
                      <p className="text-[10px] text-green-400 mt-1">-2min vs mês anterior</p>
                    </div>

                    <div className="glass-card p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Tarefas Completadas</p>
                      <p className="text-xl font-bold text-white">42</p>
                      <p className="text-[10px] text-green-400 mt-1">+12% vs mês anterior</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Aba: Performance */}
          <TabsContent value="performance" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-6">
                <PerformanceWidget member={member} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Aba: Leads */}
          <TabsContent value="leads" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-6">
                {memberLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum lead atribuído</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memberLeads.map(lead => (
                      <div key={lead.id} className="glass-card p-4 rounded-lg border border-white/10 hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{lead.company}</p>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            {lead.stage}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Aba: Timeline */}
          <TabsContent value="timeline" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-6">
                <ActivityTimeline activities={memberActivities} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-card border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Excluir Membro da Equipe
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir <span className="font-semibold text-white">{member.name}</span>?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados deste membro serão removidos permanentemente.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
