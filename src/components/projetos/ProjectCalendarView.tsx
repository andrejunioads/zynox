import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Project } from "@/pages/Projetos";
import { cn } from "@/lib/utils";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isPast
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectCalendarViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export const ProjectCalendarView = ({ projects, onProjectClick }: ProjectCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Funções de navegação
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Gerar dias do calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Agrupar dias em semanas
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Obter projetos de um dia específico
  const getProjectsForDay = (date: Date): Project[] => {
    return projects.filter(project => {
      const deadline = new Date(project.deadline);
      return isSameDay(deadline, date);
    });
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: Project['priority']) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    };
    return colors[priority];
  };

  // Verificar se o dia tem projetos
  const hasProjects = (date: Date) => getProjectsForDay(date).length > 0;

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <Card className="glass-card border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-white">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={goToToday}
              variant="outline"
              size="sm"
              className="glass-card border-slate-700"
            >
              Hoje
            </Button>
            <Button
              onClick={prevMonth}
              variant="outline"
              size="sm"
              className="glass-card border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              size="sm"
              className="glass-card border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendário Grid */}
        <div className="space-y-2">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-slate-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Semanas */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                const dayProjects = getProjectsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);
                const isDayPast = isPast(day) && !isDayToday;
                const hasProjectsToday = hasProjects(day);

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "min-h-[120px] p-2 glass-card rounded-lg border transition-all",
                      isCurrentMonth ? "border-slate-700" : "border-slate-800 bg-slate-900/20",
                      isDayToday && "border-primary/50 bg-primary/5",
                      hasProjectsToday && "hover:border-primary/30 cursor-pointer",
                      !isCurrentMonth && "opacity-50"
                    )}
                  >
                    {/* Número do dia */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isDayToday
                            ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center"
                            : isDayPast
                            ? "text-slate-500"
                            : "text-white"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {dayProjects.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {dayProjects.length}
                        </Badge>
                      )}
                    </div>

                    {/* Lista de Projetos */}
                    <div className="space-y-1">
                      {dayProjects.slice(0, 3).map((project) => (
                        <button
                          key={project.id}
                          onClick={() => onProjectClick(project)}
                          className={cn(
                            "w-full text-left p-1.5 rounded text-xs font-medium transition-all",
                            "hover:scale-[1.02] hover:shadow-lg",
                            `bg-${getPriorityColor(project.priority)}-500/10`,
                            `border border-${getPriorityColor(project.priority)}-500/30`,
                            `text-${getPriorityColor(project.priority)}-400`,
                            `hover:bg-${getPriorityColor(project.priority)}-500/20`
                          )}
                        >
                          <div className="line-clamp-1">{project.name}</div>
                          <div className="text-[10px] opacity-70 mt-0.5">
                            {project.client}
                          </div>
                        </button>
                      ))}
                      
                      {/* Indicador de mais projetos */}
                      {dayProjects.length > 3 && (
                        <div className="text-[10px] text-slate-400 text-center mt-1">
                          +{dayProjects.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Legenda */}
      <Card className="glass-card border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
              <span className="text-sm text-slate-300">Alta Prioridade</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500/30 border border-orange-500/50" />
              <span className="text-sm text-slate-300">Média Prioridade</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50" />
              <span className="text-sm text-slate-300">Baixa Prioridade</span>
            </div>
          </div>
          
          <div className="text-sm text-slate-400">
            Total de projetos: <span className="text-white font-semibold">{projects.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};



