import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Tag, AlertCircle, MessageSquare, Linkedin, Instagram, Globe, MessageCircleMore, Monitor, Users, Mail, Building2, DollarSign, Flame, Zap, Snowflake } from "lucide-react";
import { toast } from "sonner";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: any) => void;
}

export const AddLeadModal = ({ isOpen, onClose, onSave }: AddLeadModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    value: "",
    origin: "",
    status: "warm",
    observations: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mapeamento de origens para ícones
  const originIcons: Record<string, { icon: any; color: string }> = {
    LinkedIn: { icon: Linkedin, color: "#0A66C2" },
    Instagram: { icon: Instagram, color: "#E1306C" },
    Google: { icon: Globe, color: "#4285F4" },
    WhatsApp: { icon: MessageCircleMore, color: "#25D366" },
    Website: { icon: Monitor, color: "hsl(var(--primary))" },
    Indicação: { icon: Users, color: "hsl(var(--success))" },
  };

  const getOriginIcon = () => {
    if (!formData.origin) return null;
    const config = originIcons[formData.origin];
    if (!config) return null;
    const IconComponent = config.icon;
    return <IconComponent className="w-4 h-4" style={{ color: config.color }} />;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }

    if (!formData.origin) {
      newErrors.origin = "Origem do lead é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    const amount = parseInt(numbers) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setFormData({ ...formData, value: formatted });
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Converte o valor monetário para número
    const numericValue = formData.value 
      ? parseFloat(formData.value.replace(/[R$.\s]/g, "").replace(",", "."))
      : 0;

    const newLead = {
      id: Date.now().toString(),
      name: formData.name,
      company: formData.company || "-",
      email: formData.email || "-",
      phone: formData.phone,
      value: numericValue,
      origin: formData.origin,
      status: formData.status,
      stage: "new", // Sempre inicia como novo
      daysInStage: 0,
      score: Math.floor(Math.random() * 40) + 60, // Score entre 60-100
      observations: formData.observations,
    };

    onSave(newLead);
    
    toast.success("Lead criado com sucesso!", {
      description: `${newLead.name} foi adicionado ao pipeline`,
    });

    onClose();
    
    // Limpa o formulário após fechar
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        value: "",
        origin: "",
        status: "warm",
        observations: "",
      });
      setErrors({});
    }, 300);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const openWhatsApp = () => {
    if (formData.phone) {
      const numbers = formData.phone.replace(/\D/g, "");
      window.open(`https://wa.me/55${numbers}`, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] glass-card border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Novo Lead
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha as informações básicas do novo lead.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6 px-1">
          {/* Dados Principais */}
          <div className="glass-card p-6 border border-primary/10">
            <h3 className="text-sm font-semibold text-primary mb-5 flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados Principais
            </h3>

            <div className="space-y-5">
              {/* Nome e Email em 2 colunas */}
              <div className="grid grid-cols-2 gap-4 items-start">
                {/* Nome */}
                <div>
                  <Label htmlFor="name" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
                    Nome Completo <span className="text-danger">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`pl-10 ${errors.name ? "border-danger" : ""}`}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`pl-10 ${errors.email ? "border-danger" : ""}`}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Empresa e Telefone em 2 colunas */}
              <div className="grid grid-cols-2 gap-4 items-start">
                {/* Empresa */}
                <div>
                  <Label htmlFor="company" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center">
                    Empresa
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="pl-10"
                      placeholder="Ex: Tech Solutions Ltda"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <Label htmlFor="phone" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
                    Telefone <span className="text-danger">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className={`pl-10 ${errors.phone ? "border-danger" : ""}`}
                        placeholder="(11) 98765-4321"
                        maxLength={15}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={openWhatsApp}
                      disabled={!formData.phone}
                      className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                    >
                      WhatsApp
                    </Button>
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Budget Estimado e Origem em 2 colunas */}
              <div className="grid grid-cols-2 gap-4 items-start">
                {/* Budget Estimado */}
                <div>
                  <Label htmlFor="value" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center">
                    Budget Estimado
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="value"
                      value={formData.value}
                      onChange={handleValueChange}
                      className="pl-10"
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor estimado do projeto
                  </p>
                </div>

                {/* Origem */}
                <div>
                  <Label htmlFor="origin" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
                    Origem do Lead <span className="text-danger">*</span>
                  </Label>
                  <Select
                    value={formData.origin}
                    onValueChange={(value) => setFormData({ ...formData, origin: value })}
                  >
                    <SelectTrigger className={`${errors.origin ? "border-danger" : ""}`}>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent className="w-[460px]">
                      <div className="grid grid-cols-2 gap-2 p-2">
                        <SelectItem value="Instagram" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-[#E1306C]" />
                            <span>Instagram</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="WhatsApp" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <MessageCircleMore className="w-4 h-4 text-[#25D366]" />
                            <span>WhatsApp</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="LinkedIn" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                            <span>LinkedIn</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Google" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#4285F4]" />
                            <span>Google</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Website" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-primary" />
                            <span>Website</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Indicação" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-success" />
                            <span>Indicação</span>
                          </div>
                        </SelectItem>
                      </div>
                    </SelectContent>
                  </Select>
                  {errors.origin && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.origin}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center">Temperatura do Lead</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-danger" />
                        <span>Hot (Alta prioridade)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="warm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning" />
                        <span>Warm (Interessado)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cold">
                      <div className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-info" />
                        <span>Cold (Baixo interesse)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="glass-card p-6 border border-primary/10">
            <h3 className="text-sm font-semibold text-primary mb-5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Observações Iniciais
            </h3>

            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="min-h-[140px]"
              placeholder="Adicione detalhes, contexto ou interesse inicial do lead..."
            />
          </div>
        </div>

        {/* Footer com Botões */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="btn-primary-gradient glow-primary"
          >
            Salvar Lead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

