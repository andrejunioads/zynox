import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Member, 
  MemberRole, 
  Department, 
  ROLE_LABELS, 
  DEPARTMENT_LABELS 
} from "@/types/member";
import { User, Mail, Phone, Shield, Briefcase, Bot, Instagram as InstagramIcon, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id' | 'stats' | 'joinedAt' | 'lastActivity'>) => void;
}

export const AddMemberModal = ({ isOpen, onClose, onSave }: AddMemberModalProps) => {
  // ✅ BLOQUEAR CRIAÇÃO DE HUMANOS: Forçar apenas IAs
  const [isAI, setIsAI] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    role: "operator" as MemberRole,
    department: "comercial" as Department,
    aiModel: "",
    aiCapabilities: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // ✅ REMOVIDO: Validação de telefone (apenas para humanos)
    // ✅ REMOVIDO: Validação de Instagram (apenas para humanos)

    // ✅ OBRIGATÓRIO: Modelo de IA (sempre true agora)
    if (!formData.aiModel.trim()) {
      newErrors.aiModel = "Modelo de IA é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const initials = formData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newMember: Omit<Member, 'id' | 'stats' | 'joinedAt' | 'lastActivity'> = {
      name: formData.name,
      email: formData.email,
      // ✅ REMOVIDO: phone, instagram (apenas para humanos)
      avatar: "🤖", // ✅ SEMPRE IA
      photoUrl: photoUrl || undefined,  // ✅ Salvar foto
      role: formData.role,
      department: formData.department,
      status: 'online',
      type: 'ai', // ✅ SEMPRE IA
      assignedLeads: 0,
      activeProjects: 0,
      activeTasks: 0,
      isActive: true,
      aiModel: formData.aiModel, // ✅ SEMPRE OBRIGATÓRIO
      aiCapabilities: formData.aiCapabilities 
        ? formData.aiCapabilities.split(',').map(s => s.trim())
        : undefined
    };

    onSave(newMember);
    handleClose();
    toast.success("🤖 Agente de IA adicionado com sucesso!");
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

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      instagram: "",
      role: "operator",
      department: "comercial",
      aiModel: "",
      aiCapabilities: ""
    });
    setErrors({});
    setIsAI(false);
    setPhotoUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] glass-card border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Adicionar Novo Membro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-6">
          {/* ✅ MENSAGEM EDUCATIVA: Apenas IAs */}
          <div className="glass-card p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <Label className="text-sm font-medium text-cyan-100">
                  🤖 Criar Agente de IA
                </Label>
                <p className="text-xs text-cyan-200/80 mt-1">
                  <strong>Para adicionar membros humanos:</strong> Use a aba <strong>"Perfil"</strong> em <strong>"Configurações"</strong>. 
                  Os dados são sincronizados automaticamente com a equipe!
                </p>
                <p className="text-xs text-cyan-300/60 mt-2">
                  💡 <strong>Dica:</strong> O sistema unificado garante que todos os dados fiquem sempre atualizados.
                </p>
              </div>
            </div>
          </div>

          {/* Upload de Foto */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Foto do Membro
            </Label>
            <div className="flex items-center gap-4">
              <div 
                className="relative group cursor-pointer"
                onClick={handlePhotoClick}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                onDragLeave={() => setIsDraggingPhoto(false)}
                onDrop={handlePhotoDrop}
              >
                <div className={cn(
                  "w-20 h-20 border-2 transition-all rounded-xl overflow-hidden",
                  isDraggingPhoto ? "border-primary scale-105 shadow-lg shadow-primary/50" : "border-white/20",
                  "hover:border-primary"
                )}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 text-slate-400 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                {/* Upload overlay */}
                <div className={cn(
                  "absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center transition-opacity",
                  isDraggingPhoto ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm text-white mb-1">Arraste uma foto ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground">
                  Formatos: JPG, PNG, GIF • Recomendado: 400x400px
                </p>
                {photoUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setPhotoUrl(""); }}
                    className="mt-2 text-xs h-7"
                  >
                    Remover foto
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium mb-2 block">
              Nome Completo <span className="text-danger">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-danger" : ""}
              placeholder="Ex: IA Atendimento"
            />
            {errors.name && (
              <p className="text-xs text-danger mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium mb-2 block">
              Email <span className="text-danger">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`pl-10 ${errors.email ? "border-danger" : ""}`}
                placeholder="ia.atendimento@zynox.ai"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-danger mt-1">{errors.email}</p>
            )}
          </div>

          {/* ✅ REMOVIDO: Telefone e Instagram (apenas para humanos) */}

          <div className="grid grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <Label htmlFor="role" className="text-sm font-medium mb-2 block">
                Função
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select
                  value={formData.role}
                  onValueChange={(value: MemberRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department" className="text-sm font-medium mb-2 block">
                Departamento
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select
                  value={formData.department}
                  onValueChange={(value: Department) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ✅ CAMPOS OBRIGATÓRIOS PARA IA */}
          <div>
            <Label htmlFor="aiModel" className="text-sm font-medium mb-2 block">
              Modelo de IA <span className="text-danger">*</span>
            </Label>
            <Input
              id="aiModel"
              value={formData.aiModel}
              onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
              className={errors.aiModel ? "border-danger" : ""}
              placeholder="Ex: GPT-4, Claude Sonnet 4"
            />
            {errors.aiModel && (
              <p className="text-xs text-danger mt-1">{errors.aiModel}</p>
            )}
          </div>

          <div>
            <Label htmlFor="aiCapabilities" className="text-sm font-medium mb-2 block">
              Capacidades (separadas por vírgula)
            </Label>
            <Input
              id="aiCapabilities"
              value={formData.aiCapabilities}
              onChange={(e) => setFormData({ ...formData, aiCapabilities: e.target.value })}
              placeholder="Ex: WhatsApp, Email, Qualificação de Leads"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="btn-primary-gradient glow-primary"
          >
            <User className="w-4 h-4 mr-2" />
            Adicionar Membro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

