import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  X,
  Calendar as CalendarIcon,
  User,
  Flag,
  Clock,
  CheckSquare,
  Paperclip,
  MessageSquare,
  Trash2,
  Save,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Minus,
  Download,
} from "lucide-react";
import { FileUploader } from "@/components/common/FileUploader";
import { FileData } from "@/services/fileService";
import { cn } from "@/lib/utils";
import { Task, TeamMember } from "@/pages/Projetos";
import { ProjectType } from "@/types/teams";
import { adminUser } from "@/data/mockTeams";
import { useMembers } from "@/contexts/DataContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { SelectTaskAssigneeModal } from "./SelectTaskAssigneeModal";

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  projectType: ProjectType; // Tipo do projeto para filtrar membros disponíveis
  teamMembers?: TeamMember[]; // Deprecated - será calculado automaticamente baseado no projectType
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Usar FileData ao invés de AttachedFile custom
// interface removida - usando FileData do fileService

export const TaskDetailsModal = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  projectType,
  teamMembers: _deprecatedTeamMembers, // ignorado
}: TaskDetailsModalProps) => {
  const { members } = useMembers();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileData[]>([]);
  const [comments, setComments] = useState<Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }>>([]);
  const [newComment, setNewComment] = useState("");
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);

  // Membros disponíveis baseados no contexto global
  const availableMembers = useMemo(() => {
    return [adminUser, ...members.map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar || 'U',
      photoUrl: m.photoUrl,
      role: m.role as any,
      email: m.email,
      workload: 0,
      isOnline: m.status === 'online',
      isAdmin: m.role === 'admin'
    }))];
  }, [members]);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      // Carregar dados salvos da tarefa
      setChecklist(task.checklist || []);
      setAttachedFiles(task.files?.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt,
        uploadedBy: f.uploadedBy,
        url: f.url,
      })) || []);
      setComments(task.comments || []);
    }
  }, [task]);


  if (!editedTask || !task) return null;

  const handleSave = () => {
    // Salvar tarefa com arquivos, checklist e comentários
    const taskWithData = {
      ...editedTask,
      files: attachedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt,
        uploadedBy: f.uploadedBy,
        url: f.url || '',
      })),
      checklist: checklist,
      comments: comments,
    };
    onSave(taskWithData);
    toast.success("Tarefa atualizada com sucesso!");
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      onDelete(editedTask.id);
      toast.success("Tarefa excluída!");
      onClose();
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    setChecklist(prev => [
      ...prev,
      {
        id: `check-${Date.now()}`,
        text: newChecklistItem,
        completed: false,
      },
    ]);
    setNewChecklistItem("");
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleAssigneeSelect = (member: TeamMember | null) => {
    if (member) {
      setEditedTask({ ...editedTask, assignedTo: member.name });
    } else {
      setEditedTask({ ...editedTask, assignedTo: "" });
    }
  };

  // Funções de upload removidas - agora usando FileUploader component

  const addComment = () => {
    if (!newComment.trim()) return;

      setComments(prev => [
        ...prev,
        {
          id: `comment-${Date.now()}`,
          author: "André Silva",
          text: newComment,
          timestamp: new Date().toISOString(),
        },
      ]);
    setNewComment("");
    toast.success("Comentário adicionado!");
  };

  const checklistProgress = checklist.length > 0
    ? Math.round((checklist.filter(i => i.completed).length / checklist.length) * 100)
    : 0;

  const getPriorityColor = (priority: Task['priority']) => {
    return {
      high: 'red',
      medium: 'yellow',
      low: 'blue',
    }[priority];
  };

  const getStatusColor = (status: Task['status']) => {
    return {
      'todo': 'slate',
      'in-progress': 'blue',
      'done': 'green',
    }[status];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 glass-card border-slate-700 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Input
                  value={editedTask.name}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, name: e.target.value })
                  }
                  className="text-5xl font-bold text-white bg-transparent border-none p-0 focus-visible:ring-0 focus:outline-none placeholder:text-slate-600"
                  placeholder="Nome da tarefa"
                />
              </div>
              
              {/* Prioridade no canto superior direito */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-3 py-1",
                    `border-${getPriorityColor(editedTask.priority)}-500/50`,
                    `text-${getPriorityColor(editedTask.priority)}-400`
                  )}
                >
                  {editedTask.priority === 'high' && (
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-red-400" />
                      <span>Alta Prioridade</span>
                    </div>
                  )}
                  {editedTask.priority === 'medium' && (
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-yellow-400" />
                      <span>Média Prioridade</span>
                    </div>
                  )}
                  {editedTask.priority === 'low' && (
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-blue-400" />
                      <span>Baixa Prioridade</span>
                    </div>
                  )}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              {/* Descrição */}
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Descrição
                </Label>
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, description: e.target.value })
                  }
                  placeholder="Adicione uma descrição detalhada da tarefa..."
                  className="min-h-[100px] glass-card border-slate-700 text-white focus:outline-none focus:ring-0 focus:border-slate-600"
                />
              </div>

              {/* Grid: Responsável, Prioridade, Deadline */}
              <div className="grid grid-cols-3 gap-4">
                {/* Responsável */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4 text-slate-400" />
                    Responsável
                  </Label>
                  <Button
                    variant="outline"
                    onClick={() => setIsAssigneeModalOpen(true)}
                    className="glass-card border-slate-700/50 h-12 py-3 px-4 hover:border-slate-600 transition-all w-full justify-start focus:outline-none"
                  >
        {(() => {
          const selectedMember = availableMembers.find(m => m.name === editedTask.assignedTo);
          if (!selectedMember) return <span className="text-slate-400">Selecione um responsável...</span>;
          return (
            <div className="flex items-center gap-3 w-full">
              <Avatar className="w-8 h-8 ring-2 ring-slate-700 flex-shrink-0">
                <AvatarImage src={(selectedMember as any).photoUrl} className="object-cover" />
                <AvatarFallback className={cn(
                  "text-xs font-bold",
                  selectedMember.isAdmin 
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary" 
                    : "bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200"
                )}>
                  {selectedMember.avatar || selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium text-white truncate">{selectedMember.name}</span>
                <span className="text-xs text-slate-400 truncate">{selectedMember.role}</span>
              </div>
            </div>
          );
        })()}
                  </Button>
                </div>

                {/* Prioridade */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm font-medium">
                    <Flag className="w-4 h-4 text-slate-400" />
                    Prioridade
                  </Label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value: Task['priority']) =>
                      setEditedTask({ ...editedTask, priority: value })
                    }
                  >
                    <SelectTrigger className="glass-card border-slate-700/50 h-12 py-3 px-4 hover:border-slate-600 transition-all focus:outline-none focus:ring-0 focus:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-slate-700/50 p-2 [&_[data-radix-select-item-indicator]]:hidden">
                      <SelectItem value="low" className="py-2 px-3 cursor-pointer rounded-lg hover:bg-slate-700/50 transition-all focus:bg-slate-700/50">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">Baixa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium" className="py-2 px-3 cursor-pointer rounded-lg hover:bg-slate-700/50 transition-all focus:bg-slate-700/50">
                        <div className="flex items-center gap-2">
                          <Minus className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">Média</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high" className="py-2 px-3 cursor-pointer rounded-lg hover:bg-slate-700/50 transition-all focus:bg-slate-700/50">
                        <div className="flex items-center gap-2">
                          <ArrowUp className="w-4 h-4 text-red-400" />
                          <span className="text-sm">Alta</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Prazo
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal glass-card border-slate-700/50 h-12 py-3 px-4 hover:border-slate-600 transition-all",
                          !editedTask.deadline && "text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.deadline
                          ? format(parseISO(editedTask.deadline), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-card border-slate-700/50">
                      <Calendar
                        mode="single"
                        selected={editedTask.deadline ? parseISO(editedTask.deadline) : undefined}
                        onSelect={(date) =>
                          setEditedTask({
                            ...editedTask,
                            deadline: date ? date.toISOString() : undefined,
                          })
                        }
                        locale={ptBR}
                        className="rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Checklist
                    {checklist.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {checklist.filter(i => i.completed).length}/{checklist.length}
                      </Badge>
                    )}
                  </Label>
                  {checklist.length > 0 && (
                    <span className="text-xs text-slate-400">
                      {checklistProgress}% concluído
                    </span>
                  )}
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg glass-card border-slate-700"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleChecklistItem(item.id)}
                        />
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            item.completed
                              ? "line-through text-slate-500"
                              : "text-white"
                          )}
                        >
                          {item.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChecklistItem(item.id)}
                          className="h-6 w-6 text-slate-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    placeholder="Adicionar item..."
                    className="glass-card border-slate-700 focus:outline-none focus:ring-0 focus:border-slate-600"
                  />
                  <Button
                    onClick={addChecklistItem}
                    variant="outline"
                    className="border-slate-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Arquivos Anexados - Usando componente universal */}
              <FileUploader
                files={attachedFiles}
                onFilesChange={setAttachedFiles}
                uploadedBy="André Silva"
                category="task"
                relatedId={editedTask.id}
                maxFiles={20}
                maxSizeMB={10}
                showPreview={true}
              />

              <Separator className="bg-slate-700" />

              {/* Comentários */}
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comentários
                  {comments.length > 0 && (
                    <Badge variant="secondary">{comments.length}</Badge>
                  )}
                </Label>

                {comments.length > 0 && (
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      // Buscar o membro da equipe pelo nome
                      const teamMember = availableMembers.find(m => m.name === comment.author);
                      return (
                        <div
                          key={comment.id}
                          className="flex gap-3 p-4 rounded-lg bg-slate-800/30"
                        >
                          {/* Avatar do membro */}
                          <div className="flex-shrink-0">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200 text-xs font-bold">
                                {teamMember?.avatar || comment.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          {/* Conteúdo do comentário */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">
                                {comment.author}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-400">
                                {format(parseISO(comment.timestamp), "dd/MM/yyyy 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        addComment();
                      }
                    }}
                    placeholder="Escreva um comentário..."
                    className="glass-card border-slate-700 focus:outline-none focus:ring-0 focus:border-slate-600"
                  />
                  <Button
                    onClick={addComment}
                    variant="outline"
                    className="border-slate-700"
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Tarefa
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="border-slate-700">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Seleção de Responsável */}
      <SelectTaskAssigneeModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        onSelect={handleAssigneeSelect}
        availableMembers={members}
        currentAssignee={editedTask.assignedTo}
      />
    </Dialog>
  );
};

