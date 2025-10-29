import {
  useState,
  useEffect,
} from "react";
import {
  CheckSquare,
  Plus,
  X,
  Circle,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Priority = "urgent" | "high" | "medium" | "low";
type Category = "all" | "comercial" | "projetos" | "financeiro" | "clientes";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: string;
}

const STORAGE_KEY = "zynox_tasks";

const priorityConfig = {
  urgent: {
    label: "Urgente",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    icon: AlertCircle,
  },
  high: {
    label: "Alta",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: AlertCircle,
  },
  medium: {
    label: "Média",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: Clock,
  },
  low: {
    label: "Baixa",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    icon: Circle,
  },
};

const categoryConfig = {
  all: { label: "Todas", color: "text-primary" },
  comercial: { label: "Comercial", color: "text-blue-400" },
  projetos: { label: "Projetos", color: "text-purple-400" },
  financeiro: { label: "Financeiro", color: "text-emerald-400" },
  clientes: { label: "Clientes", color: "text-cyan-400" },
};

export const TaskWidget = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [newTaskCategory, setNewTaskCategory] = useState<Category>("comercial");
  const [filterCategory, setFilterCategory] = useState<Category>("all");

  // Carregar tarefas do localStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
      }
    }
  }, []);

  // Salvar tarefas no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setIsAddingTask(false);
    setNewTaskPriority("medium");
    setNewTaskCategory("comercial");
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const filteredTasks = tasks.filter(
    (task) => filterCategory === "all" || task.category === filterCategory
  );

  const pendingTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  const sortedPendingTasks = pendingTasks.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="glass-card p-5 flex flex-col h-[506px] w-[97%] ml-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-primary glow-primary" />
          <div>
            <h3 className="text-lg font-bold text-white">Tarefas</h3>
            <p className="text-xs text-white/60">
              {pendingTasks.length} pendente{pendingTasks.length !== 1 ? "s" : ""} • {completedTasks.length} concluída{completedTasks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-[0_8px_20px_rgba(59,130,246,0.35)] transition-all"
        >
          {isAddingTask ? (
            <X className="w-4 h-4" />
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Nova
            </>
          )}
        </Button>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <div className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-3 animate-fade-in">
          <Input
            placeholder="Digite o título da tarefa..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            className="bg-[#0B0C10] border-white/10 text-white"
            autoFocus
          />
          <div className="flex gap-2">
            <Select
              value={newTaskPriority}
              onValueChange={(value) => setNewTaskPriority(value as Priority)}
            >
              <SelectTrigger className="bg-[#0B0C10] border-white/10 text-white text-xs">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">🔴 Urgente</SelectItem>
                <SelectItem value="high">🟠 Alta</SelectItem>
                <SelectItem value="medium">🟡 Média</SelectItem>
                <SelectItem value="low">⚪ Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newTaskCategory}
              onValueChange={(value) => setNewTaskCategory(value as Category)}
            >
              <SelectTrigger className="bg-[#0B0C10] border-white/10 text-white text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comercial">💼 Comercial</SelectItem>
                <SelectItem value="projetos">📁 Projetos</SelectItem>
                <SelectItem value="financeiro">💰 Financeiro</SelectItem>
                <SelectItem value="clientes">👥 Clientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-[0_8px_20px_rgba(16,185,129,0.35)]"
            size="sm"
          >
            Adicionar Tarefa
          </Button>
        </div>
      )}

      {/* Filter */}
      <div className="mb-3">
        <Select
          value={filterCategory}
          onValueChange={(value) => setFilterCategory(value as Category)}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
            <SelectValue placeholder="Filtrar categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="comercial">💼 Comercial</SelectItem>
            <SelectItem value="projetos">📁 Projetos</SelectItem>
            <SelectItem value="financeiro">💰 Financeiro</SelectItem>
            <SelectItem value="clientes">👥 Clientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <CheckSquare className="w-12 h-12 text-white/20 mb-3" />
            <p className="text-sm text-white/40">
              {filterCategory === "all"
                ? "Nenhuma tarefa ainda"
                : `Nenhuma tarefa em ${categoryConfig[filterCategory].label}`}
            </p>
            <p className="text-xs text-white/30 mt-1">
              Clique em "Nova" para adicionar
            </p>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            {sortedPendingTasks.map((task) => {
              const PriorityIcon = priorityConfig[task.priority].icon;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-start gap-3 p-3 rounded-lg border backdrop-blur-xl transition-all hover:scale-[1.02]",
                    priorityConfig[task.priority].bgColor,
                    priorityConfig[task.priority].borderColor
                  )}
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                  >
                    <Circle className="w-4 h-4 text-white/40 hover:text-primary" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium leading-tight">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full",
                          priorityConfig[task.priority].bgColor,
                          priorityConfig[task.priority].color
                        )}
                      >
                        <PriorityIcon className="w-2.5 h-2.5 inline mr-1" />
                        {priorityConfig[task.priority].label}
                      </span>
                      <span
                        className={cn(
                          "text-[10px]",
                          categoryConfig[task.category].color
                        )}
                      >
                        {categoryConfig[task.category].label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <>
                {sortedPendingTasks.length > 0 && (
                  <div className="pt-3 pb-1">
                    <p className="text-xs text-white/40 uppercase tracking-wider">
                      Concluídas
                    </p>
                  </div>
                )}
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] backdrop-blur-xl opacity-60 hover:opacity-100 transition-all"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/60 line-through leading-tight">
                        {task.title}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] mt-1 inline-block",
                          categoryConfig[task.category].color
                        )}
                      >
                        {categoryConfig[task.category].label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

