import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Task } from "@/pages/Projetos";
import { Plus, Calendar as CalendarIcon, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SelectTaskAssigneeModal } from "./SelectTaskAssigneeModal";
import { useMembers } from "@/contexts/DataContext";
import { TeamMember } from "@/pages/Projetos";
import { FileUploader } from "@/components/common/FileUploader";
import { FileData } from "@/services/fileService";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => void;
  teamMembers: Array<{ name: string; avatar: string }>;
}

export const AddTaskModal = ({
  isOpen,
  onClose,
  onAdd,
  teamMembers,
}: AddTaskModalProps) => {
  const { members } = useMembers();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    const newTask: Omit<Task, 'id' | 'createdAt' | 'completedAt'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      status: 'todo',
      assignedTo: assignedTo || 'Não Atribuído',
      priority,
      deadline: deadline ? deadline.toISOString() : undefined,
      files: files.length > 0 ? files.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt,
        uploadedBy: f.uploadedBy,
        url: f.url,
      })) : undefined,
    };

    onAdd(newTask);
    handleReset();
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setFiles([]);
    setAssignedTo('');
    setPriority('medium');
    setDeadline(undefined);
    onClose();
  };

  const handleAssigneeSelect = (member: TeamMember | null) => {
    if (member) {
      setAssignedTo(member.name);
    } else {
      setAssignedTo('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-[600px] glass-card border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da Tarefa */}
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-white">
              Nome da Tarefa *
            </Label>
            <Input
              id="task-name"
              placeholder="Ex: Desenvolver Homepage"
              value={name}
              onChange={(e) => setName(e.target.value)}
                className="glass-card border-slate-700 text-white focus:outline-none focus:ring-0 focus:border-slate-600"
              autoFocus
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-white">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="task-description"
              placeholder="Adicione mais detalhes sobre a tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-card border-slate-700 text-white min-h-[80px] focus:outline-none focus:ring-0 focus:border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="assigned-to" className="text-white text-sm font-medium">
                Responsável
              </Label>
              <Button
                variant="outline"
                onClick={() => setIsAssigneeModalOpen(true)}
                className="glass-card border-slate-700/50 text-white h-12 py-3 px-4 hover:border-slate-600 transition-all w-full justify-start focus:outline-none"
              >
                {(() => {
          if (!assignedTo) return "Selecionar responsável...";
          const member = members.find(m => m.name === assignedTo);
          if (!member) return assignedTo;
          return (
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {member.photoUrl ? (
                  <img 
                    src={member.photoUrl} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-200">
                    {member.avatar || member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium text-white truncate">{member.name}</span>
                <span className="text-xs text-slate-400 truncate">{member.role}</span>
              </div>
            </div>
          );
                })()}
              </Button>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white text-sm font-medium">
                Prioridade
              </Label>
              <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                <SelectTrigger className="glass-card border-slate-700/50 text-white h-12 py-3 px-4 hover:border-slate-600 transition-all focus:outline-none focus:ring-0 focus:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-slate-700/50 p-2 [&_[data-radix-select-item-indicator]]:hidden">
                  <SelectItem value="low" className="py-2 px-3 cursor-pointer rounded-lg hover:bg-slate-700/50 transition-all">
                    <span className="flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-blue-400" />
                      Baixa
                    </span>
                  </SelectItem>
                  <SelectItem value="medium" className="py-2 px-3 cursor-pointer rounded-lg hover:bg-slate-700/50 transition-all">
                    <span className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-yellow-400" />
                      Média
                    </span>
                  </SelectItem>
                  <SelectItem value="high" className="py-2 px-3 cursor-pointer rounded-lg hover:bg-slate-700/50 transition-all">
                    <span className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-red-400" />
                      Alta
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prazo */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">Prazo (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal glass-card border-slate-700/50 h-12 py-3 px-4 hover:border-slate-600 transition-all",
                    !deadline && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? (
                    format(deadline, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card border-slate-700/50">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  locale={ptBR}
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Arquivos */}
        <FileUploader
          files={files}
          onFilesChange={setFiles}
          uploadedBy="André Silva"
          category="task"
          maxFiles={10}
          maxSizeMB={10}
          showPreview={true}
          compact={true}
        />

        <DialogFooter>
          <Button variant="outline" onClick={handleReset} className="glass-card border-slate-700">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Modal de Seleção de Responsável */}
      <SelectTaskAssigneeModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        onSelect={handleAssigneeSelect}
        availableMembers={members}
        currentAssignee={assignedTo}
      />
    </Dialog>
  );
};



