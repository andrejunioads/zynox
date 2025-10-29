import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, Repeat, User, AlertCircle, Bell, Flame, Zap, Snowflake, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FollowUp } from "@/types/followup";
import { toast } from "sonner";
import { Lead } from "@/pages/Comercial";
import { Badge } from "@/components/ui/badge";

interface QuickAddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (followUp: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>) => void;
  leads: Lead[];
  defaultResponsavel?: string;
}

export const QuickAddFollowUpModal = ({
  isOpen,
  onClose,
  onSave,
  leads,
  defaultResponsavel = "André"
}: QuickAddFollowUpModalProps) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    hora: "10:00",
    repetir_em: 0,
    prioridade: "media" as "baixa" | "media" | "alta",
    responsavel: defaultResponsavel,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtra leads baseado na busca
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedLeadId) {
      newErrors.lead = "Selecione um lead";
    }

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.data) {
      newErrors.data = "Data é obrigatória";
    }

    if (!formData.hora) {
      newErrors.hora = "Hora é obrigatória";
    }

    if (!formData.responsavel.trim()) {
      newErrors.responsavel = "Responsável é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      // Combina data e hora
      const [year, month, day] = formData.data.split('-');
      const [hour, minute] = formData.hora.split(':');
      
      if (!year || !month || !day || !hour || !minute) {
        toast.error("Data ou hora inválida");
        return;
      }
      
      const dueDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
      
      if (isNaN(dueDate.getTime())) {
        toast.error("Data inválida");
        return;
      }

      const newFollowUp: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'> = {
        lead_id: selectedLeadId,
        titulo: formData.titulo,
        descricao: formData.descricao,
        due_date: dueDate,
        status: 'pendente',
        prioridade: formData.prioridade,
        repetir_em: formData.repetir_em > 0 ? formData.repetir_em : undefined,
        responsavel: formData.responsavel,
        stage_id: selectedLead?.stage || 'new',
        is_automatico: false,
      };

      onSave(newFollowUp);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar follow-up:", error);
      toast.error("Erro ao agendar follow-up. Tente novamente.");
    }
  };

  const resetForm = () => {
    setSelectedLeadId("");
    setSearchTerm("");
    setFormData({
      titulo: "",
      descricao: "",
      data: "",
      hora: "10:00",
      repetir_em: 0,
      prioridade: "media",
      responsavel: defaultResponsavel,
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Data mínima é hoje
  const minDate = new Date();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[700px] glass-card border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-warning" />
            Criar Follow-up Rápido
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecione um lead e agende um lembrete de acompanhamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-6">
          {/* Seleção de Lead */}
          <div>
            <Label htmlFor="lead" className="text-foreground text-sm font-medium mb-2 flex items-center gap-1">
              Lead <span className="text-danger">*</span>
            </Label>
            <div className="space-y-3">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  placeholder="Buscar por nome ou empresa..."
                />
              </div>

              {/* Lead selecionado */}
              {selectedLead && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{selectedLead.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedLead.company}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedLeadId("")}
                      className="text-danger hover:bg-danger/10"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de leads */}
              {!selectedLeadId && (
                <div className="max-h-[200px] overflow-y-auto border border-primary/30 rounded-lg">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="w-full p-3 hover:bg-primary/10 text-left border-b border-white/5 last:border-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.company}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {lead.stage}
                          </Badge>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Nenhum lead encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.lead && (
              <p className="text-xs text-danger mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.lead}
              </p>
            )}
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="titulo" className="text-foreground text-sm font-medium mb-2 flex items-center gap-1">
              Título do Follow-up <span className="text-danger">*</span>
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className={`${errors.titulo ? "border-danger" : ""}`}
              placeholder="Ex: Retornar com o cliente sobre a proposta"
            />
            {errors.titulo && (
              <p className="text-xs text-danger mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data" className="text-foreground text-sm font-medium mb-2 flex items-center gap-1">
                Data <span className="text-danger">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data && "text-muted-foreground",
                      errors.data && "border-danger"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data ? format(new Date(formData.data), "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-primary/30">
                  <Calendar
                    mode="single"
                    selected={formData.data ? new Date(formData.data) : undefined}
                    onSelect={(date) => date && setFormData({ ...formData, data: format(date, "yyyy-MM-dd") })}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {errors.data && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.data}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="hora" className="text-foreground text-sm font-medium mb-2 flex items-center gap-1">
                Hora <span className="text-danger">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.hora && "text-muted-foreground",
                      errors.hora && "border-danger"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formData.hora ? formData.hora : <span>Selecione</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-primary/30">
                  <TimePicker
                    value={formData.hora}
                    onChange={(time) => setFormData({ ...formData, hora: time })}
                  />
                </PopoverContent>
              </Popover>
              {errors.hora && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.hora}
                </p>
              )}
            </div>
          </div>

          {/* Repetição */}
          <div>
            <Label className="text-foreground text-sm font-medium mb-2 flex items-center gap-1">
              <Repeat className="w-4 h-4" />
              Repetição (opcional)
            </Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repeat1"
                  checked={formData.repetir_em === 1}
                  onCheckedChange={() => setFormData({ ...formData, repetir_em: formData.repetir_em === 1 ? 0 : 1 })}
                />
                <label htmlFor="repeat1" className="text-sm">1 dia</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repeat3"
                  checked={formData.repetir_em === 3}
                  onCheckedChange={() => setFormData({ ...formData, repetir_em: formData.repetir_em === 3 ? 0 : 3 })}
                />
                <label htmlFor="repeat3" className="text-sm">3 dias</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repeat7"
                  checked={formData.repetir_em === 7}
                  onCheckedChange={() => setFormData({ ...formData, repetir_em: formData.repetir_em === 7 ? 0 : 7 })}
                />
                <label htmlFor="repeat7" className="text-sm">7 dias</label>
              </div>
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <Label htmlFor="prioridade" className="text-foreground text-sm font-medium mb-2">Prioridade</Label>
            <Select
              value={formData.prioridade}
              onValueChange={(value: "baixa" | "media" | "alta") => setFormData({ ...formData, prioridade: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-danger" />
                    <span>Alta</span>
                  </div>
                </SelectItem>
                <SelectItem value="media">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-warning" />
                    <span>Média</span>
                  </div>
                </SelectItem>
                <SelectItem value="baixa">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-info" />
                    <span>Baixa</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Responsável */}
          <div>
            <Label htmlFor="responsavel" className="text-foreground text-sm font-medium mb-2 flex items-center gap-1">
              Responsável <span className="text-danger">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                className={`pl-10 ${errors.responsavel ? "border-danger" : ""}`}
                placeholder="Ex: André"
              />
            </div>
          </div>

          {/* Notas Adicionais */}
          <div>
            <Label htmlFor="descricao" className="text-foreground text-sm font-medium mb-2">
              Notas Adicionais
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="min-h-[80px]"
              placeholder="Contexto, detalhes importantes..."
            />
          </div>
        </div>

        {/* Footer com Botões */}
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
            <Bell className="w-4 h-4 mr-2" />
            Agendar Follow-up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

