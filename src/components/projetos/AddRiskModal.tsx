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
import { AlertTriangle } from "lucide-react";
import { Risk } from "@/pages/Projetos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (risk: Omit<Risk, 'id' | 'createdAt' | 'createdBy'>) => void;
}

export const AddRiskModal = ({ isOpen, onClose, onAdd }: AddRiskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Risk['severity']>('medium');
  const [type, setType] = useState<Risk['type']>('technical');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setType('technical');
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    onAdd({
      title,
      description,
      severity,
      type,
      status: 'identified',
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
            <AlertTriangle className="w-5 h-5" /> Novo Risco
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-white">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Ex: Atraso na entrega de API"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Detalhe o risco..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="severity" className="text-white">Severidade</Label>
              <Select value={severity} onValueChange={(value: Risk['severity']) => setSeverity(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-white">Tipo</Label>
              <Select value={type} onValueChange={(value: Risk['type']) => setType(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="technical">Técnico</SelectItem>
                  <SelectItem value="business">Negócio</SelectItem>
                  <SelectItem value="resource">Recurso</SelectItem>
                  <SelectItem value="external">Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="glass-card border-slate-700">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white">
            <AlertTriangle className="w-4 h-4 mr-2" /> Adicionar Risco
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



