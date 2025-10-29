import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Target } from "lucide-react";
import { Milestone } from "@/pages/Projetos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (milestone: Omit<Milestone, 'id'>) => void;
  teamMembers: Array<{ name: string }>;
}

export const AddMilestoneModal = ({ isOpen, onClose, onAdd, teamMembers }: AddMilestoneModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [responsible, setResponsible] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setDate(undefined);
    setResponsible('');
  };

  const handleSubmit = () => {
    if (!name.trim() || !date || !responsible) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    onAdd({
      name,
      description: description || undefined,
      date: date.toISOString(),
      status: 'pending',
      responsible,
    });
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onClose();
    }}>
      <DialogContent className="sm:max-w-[425px] glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" /> Novo Marco
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">Nome do Marco *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Ex: MVP Pronto"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Detalhes do marco..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date" className="text-white">Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700 text-white">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="responsible" className="text-white">Responsável *</Label>
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {teamMembers.map(member => (
                  <SelectItem key={member.name} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="glass-card border-slate-700">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white">
            <Target className="w-4 h-4 mr-2" /> Adicionar Marco
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



