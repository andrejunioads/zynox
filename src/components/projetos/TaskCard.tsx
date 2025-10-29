import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Task } from "@/pages/Projetos";
import { Flag, Calendar, AlertCircle } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      status: task.status
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      high: 'text-red-400 border-red-500/50',
      medium: 'text-orange-400 border-orange-500/50',
      low: 'text-green-400 border-green-500/50',
    };
    return colors[priority];
  };

  const isOverdue = task.deadline && isPast(parseISO(task.deadline)) && task.status !== 'done';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          "glass-card border-slate-700 p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all",
          isDragging && "opacity-50 cursor-grabbing",
          isOverdue && "border-red-500/50"
        )}
        onClick={() => onClick(task)}
      >
        {/* Header com Prioridade */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-white font-semibold text-sm mb-1">{task.name}</h4>
            {task.description && (
              <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
            )}
          </div>
          <Flag className={cn("w-4 h-4 ml-2 flex-shrink-0", getPriorityColor(task.priority).split(' ')[0])} />
        </div>

        {/* Footer com Info */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                {task.assignedTo.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[80px]">{task.assignedTo}</span>
          </div>

          {task.deadline && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue ? "text-red-400" : "text-slate-400"
            )}>
              {isOverdue && <AlertCircle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              <span>{format(parseISO(task.deadline), "dd/MM")}</span>
            </div>
          )}
        </div>

        {/* Bloqueios */}
        {task.blockedBy && task.blockedBy.length > 0 && (
          <Badge variant="outline" className="mt-2 text-xs border-red-500/50 text-red-400">
            Bloqueada
          </Badge>
        )}
      </Card>
    </div>
  );
};



