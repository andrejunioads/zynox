import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Bell, AlertCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { FollowUp } from "@/types/followup";

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (followUp: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>) => void;
  leadId: string;
  leadName: string;
  currentStage: string;
  defaultResponsavel?: string;
}

export const AddFollowUpModal = ({
  isOpen,
  onClose,
  onSave,
  leadId,
  leadName,
  currentStage,
  defaultResponsavel = "André"
}: AddFollowUpModalProps) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.data) {
      newErrors.data = "Data é obrigatória";
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
      lead_id: leadId,
      titulo: formData.titulo,
      descricao: formData.descricao,
      due_date: dueDate,
      status: 'pendente',
      prioridade: formData.prioridade,
      repetir_em: formData.repetir_em > 0 ? formData.repetir_em : undefined,
      responsavel: formData.responsavel,
      stage_id: currentStage,
      is_automatico: false,
    };

      onSave(newFollowUp);
      onClose();

      // Limpa o formulário
      setTimeout(() => {
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
      }, 300);
    } catch (error) {
      console.error("Erro ao salvar follow-up:", error);
      toast.error("Erro ao agendar follow-up. Tente novamente.");
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Data mínima é hoje
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] glass-card border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary" />
            Novo Follow-up
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Agende um lembrete para retomar contato com <span className="font-semibold text-foreground">{leadName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-6">
          {/* Título do Follow-up */}
          <div>
            <Label htmlFor="titulo" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
              📝 Título do Follow-up <span className="text-danger">*</span>
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className={errors.titulo ? "border-danger" : ""}
              placeholder="Ex: Retornar sobre proposta do site"
              maxLength={100}
            />
            {errors.titulo && (
              <p className="text-xs text-danger mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4 items-start">
            <div>
              <Label htmlFor="data" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" /> Data <span className="text-danger">*</span>
              </Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className={errors.data ? "border-danger" : ""}
                min={today}
              />
              {errors.data && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.data}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="hora" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Hora
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.hora && "text-muted-foreground"
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
            </div>
          </div>

          {/* Repetição */}
          <div>
            <Label className="text-foreground text-sm font-medium mb-3 block flex items-center gap-1">
              <RefreshCw className="w-4 h-4" /> Repetir a cada (opcional)
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.repetir_em === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, repetir_em: formData.repetir_em === 1 ? 0 : 1 })}
                className="flex-1"
              >
                1 dia
              </Button>
              <Button
                type="button"
                variant={formData.repetir_em === 3 ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, repetir_em: formData.repetir_em === 3 ? 0 : 3 })}
                className="flex-1"
              >
                3 dias
              </Button>
              <Button
                type="button"
                variant={formData.repetir_em === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, repetir_em: formData.repetir_em === 7 ? 0 : 7 })}
                className="flex-1"
              >
                7 dias
              </Button>
            </div>
            {formData.repetir_em > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                O follow-up será recriado automaticamente a cada {formData.repetir_em} dia{formData.repetir_em > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Prioridade */}
          <div>
            <Label className="text-foreground text-sm font-medium mb-3 block flex items-center gap-1">
              🎯 Prioridade
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.prioridade === 'baixa' ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, prioridade: 'baixa' })}
                className="flex-1"
              >
                Baixa
              </Button>
              <Button
                type="button"
                variant={formData.prioridade === 'media' ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, prioridade: 'media' })}
                className="flex-1"
              >
                Média
              </Button>
              <Button
                type="button"
                variant={formData.prioridade === 'alta' ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, prioridade: 'alta' })}
                className="flex-1"
              >
                Alta
              </Button>
            </div>
          </div>

          {/* Responsável */}
          <div>
            <Label htmlFor="responsavel" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
              👤 Responsável
            </Label>
            <Select
              value={formData.responsavel}
              onValueChange={(value) => setFormData({ ...formData, responsavel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="André">André</SelectItem>
                <SelectItem value="Equipe Comercial">Equipe Comercial</SelectItem>
                <SelectItem value="Suporte">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas/Contexto */}
          <div>
            <Label htmlFor="descricao" className="text-foreground text-sm font-medium mb-2 block h-5 flex items-center gap-1">
              📓 Notas adicionais / Contexto
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="min-h-[100px]"
              placeholder="Adicione detalhes do último contato, próximos passos, ou informações importantes..."
            />
          </div>
        </div>

        {/* Footer */}
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
            <Bell className="w-4 h-4 mr-2" />
            Agendar Follow-up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

