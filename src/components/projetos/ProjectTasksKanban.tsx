import { useState } from "react";
import { 
  DndContext, 
  closestCorners, 
  DragEndEvent, 
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  useDraggable
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { 
  Plus, 
  Calendar, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/pages/Projetos";
import { getTaskMetrics } from "@/utils/projectHelpers";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectTasksKanbanProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task['status']) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

interface Column {
  id: Task['status'];
  title: string;
  icon: React.ElementType;
  color: string;
}

const columns: Column[] = [
  { id: 'todo', title: 'A Fazer', icon: Circle, color: 'slate' },
  { id: 'in-progress', title: 'Em Progresso', icon: PlayCircle, color: 'blue' },
  { id: 'done', title: 'Concluído', icon: CheckCircle2, color: 'green' },
];

// Componente Draggable Task Card
const DraggableTaskCard = ({ 
  task,
  onTaskClick,
}: { 
  task: Task; 
  onTaskClick: (task: Task) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    };
    return colors[priority];
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onTaskClick(task)}
      className={cn(
        "p-3 glass-card border rounded-lg cursor-grab active:cursor-grabbing",
        "hover:border-primary/50 transition-all hover:scale-[1.02]",
        isDragging && "opacity-50",
        isOverdue(task.deadline) && task.status !== 'done' && "border-red-500/50 bg-red-500/5"
      )}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-white line-clamp-2">
          {task.name}
        </h4>
        <Badge
          variant="outline"
          className={cn(
            "text-xs shrink-0",
            `border-${getPriorityColor(task.priority)}-500/50`,
            `text-${getPriorityColor(task.priority)}-400`
          )}
        >
          {task.priority === 'high' && 'Alta'}
          {task.priority === 'medium' && 'Média'}
          {task.priority === 'low' && 'Baixa'}
        </Badge>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between text-xs">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          <Avatar className="w-5 h-5">
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] text-white">
              {task.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </Avatar>
          <span className="text-slate-400">{task.assignedTo.split(' ')[0]}</span>
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div className={cn(
            "flex items-center gap-1",
            isOverdue(task.deadline) && task.status !== 'done' 
              ? "text-red-400" 
              : "text-slate-400"
          )}>
            {isOverdue(task.deadline) && task.status !== 'done' ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span>
              {formatDistanceToNow(new Date(task.deadline), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>
        )}
      </div>

      {/* Completed Badge */}
      {task.status === 'done' && task.completedAt && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>
              Concluída {formatDistanceToNow(new Date(task.completedAt), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Droppable Column
const DroppableColumn = ({ 
  column, 
  tasks, 
  onTaskClick, 
  activeId 
}: { 
  column: Column; 
  tasks: Task[]; 
  onTaskClick: (task: Task) => void;
  activeId: string | null;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const Icon = column.icon;

  return (
    <div className="space-y-3">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 glass-card border-slate-700 rounded-lg">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", `text-${column.color}-400`)} />
          <span className="font-medium text-white text-sm">{column.title}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>

      {/* Droppable Zone */}
      <div 
        ref={setNodeRef}
        className={cn(
          "space-y-2 min-h-[400px] p-2 rounded-lg transition-colors",
          isOver && "bg-primary/10 border-2 border-primary/50 border-dashed"
        )}
      >
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
          />
        ))}

        {tasks.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            Nenhuma tarefa
          </div>
        )}
      </div>
    </div>
  );
};

export const ProjectTasksKanban = ({
  tasks,
  onTaskMove,
  onAddTask,
  onTaskClick,
}: ProjectTasksKanbanProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const metrics = getTaskMetrics(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as Task['status'];
      
      // Verificar se é um status válido
      if (['todo', 'in-progress', 'done'].includes(newStatus)) {
        onTaskMove(taskId, newStatus);
      }
    }

    setActiveId(null);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <div className="space-y-6">
      {/* KPIs Header */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4 glass-card border-slate-700">
          <div className="text-2xl font-bold text-white">{metrics.total}</div>
          <div className="text-xs text-slate-400 mt-1">Total de Tarefas</div>
        </Card>
        <Card className="p-4 glass-card border-slate-700">
          <div className="text-2xl font-bold text-green-400">{metrics.completed}</div>
          <div className="text-xs text-slate-400 mt-1">Concluídas</div>
        </Card>
        <Card className="p-4 glass-card border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{metrics.inProgress}</div>
          <div className="text-xs text-slate-400 mt-1">Em Progresso</div>
        </Card>
        <Card className="p-4 glass-card border-slate-700">
          <div className="text-2xl font-bold text-slate-400">{metrics.todo}</div>
          <div className="text-xs text-slate-400 mt-1">A Fazer</div>
        </Card>
        <Card className={cn(
          "p-4 glass-card",
          metrics.overdue > 0 ? "border-red-500/50 bg-red-500/5" : "border-slate-700"
        )}>
          <div className={cn(
            "text-2xl font-bold",
            metrics.overdue > 0 ? "text-red-400" : "text-slate-400"
          )}>
            {metrics.overdue}
          </div>
          <div className="text-xs text-slate-400 mt-1">Atrasadas</div>
        </Card>
      </div>

      {/* Botão Adicionar Tarefa */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-400">
          Progresso: <span className="text-white font-semibold">{metrics.completionRate}%</span>
        </div>
        <Button onClick={onAddTask} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onTaskClick={onTaskClick}
              activeId={activeId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="p-3 glass-card border-primary rounded-lg opacity-90 shadow-xl">
              <div className="text-sm font-medium text-white">
                Movendo tarefa...
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

