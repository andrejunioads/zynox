import { useState } from "react";
import { FollowUp } from "@/types/followup";
import { Lead } from "@/pages/Comercial";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Calendar, AlertCircle, Eye, CheckCircle2, Clock } from "lucide-react";
import {
  filterFollowUpsByPeriod,
  sortFollowUpsByUrgency,
  formatFollowUpDate,
  isFollowUpOverdue,
} from "@/utils/followUpHelpers";

interface FollowUpWidgetProps {
  followUps: FollowUp[];
  leads: Lead[];
  onOpenLead: (leadId: string) => void;
  onMarkAsDone: (id: string) => void;
}

type FilterType = 'all' | 'today' | 'overdue' | 'upcoming' | 'completed';

export const FollowUpWidget = ({ followUps, leads, onOpenLead, onMarkAsDone }: FollowUpWidgetProps) => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filtra e ordena follow-ups
  const filteredFollowUps = filter === 'completed' 
    ? followUps.filter(f => f.status === 'feito').sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    : sortFollowUpsByUrgency(filterFollowUpsByPeriod(followUps, filter));

  // Agrupa por status
  const overdueFollowUps = followUps.filter(isFollowUpOverdue);
  const todayFollowUps = filterFollowUpsByPeriod(followUps, 'today');
  const upcomingFollowUps = filterFollowUpsByPeriod(followUps, 'upcoming');
  const completedFollowUps = followUps.filter(f => f.status === 'feito');

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Lead não encontrado';
  };

  const getFilterBadgeColor = (filterType: FilterType) => {
    if (filter === filterType) return "bg-primary/20 text-primary border-primary/30";
    return "bg-muted/10 text-muted-foreground border-muted/30 hover:bg-primary/10";
  };

  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'overdue':
        return overdueFollowUps.length;
      case 'today':
        return todayFollowUps.length;
      case 'upcoming':
        return upcomingFollowUps.length;
      case 'completed':
        return completedFollowUps.length;
      case 'all':
      default:
        return followUps.filter(f => f.status !== 'feito' && f.status !== 'cancelado').length;
    }
  };

  return (
    <Card className="glass-card border-primary/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Próximos Follow-ups</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe os lembretes agendados
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
          {getFilterCount('all')} pendente{getFilterCount('all') !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setFilter('all')}
          className={getFilterBadgeColor('all')}
        >
          Todos
          <Badge variant="outline" className="ml-2 text-[10px] px-1.5">
            {getFilterCount('all')}
          </Badge>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setFilter('overdue')}
          className={getFilterBadgeColor('overdue')}
        >
          <AlertCircle className="w-3.5 h-3.5 mr-1" />
          Atrasados
          {getFilterCount('overdue') > 0 && (
            <Badge variant="outline" className="ml-2 text-[10px] px-1.5 bg-danger/10 text-danger border-danger/30">
              {getFilterCount('overdue')}
            </Badge>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setFilter('today')}
          className={getFilterBadgeColor('today')}
        >
          <Clock className="w-3.5 h-3.5 mr-1" />
          Hoje
          {getFilterCount('today') > 0 && (
            <Badge variant="outline" className="ml-2 text-[10px] px-1.5 bg-warning/10 text-warning border-warning/30">
              {getFilterCount('today')}
            </Badge>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setFilter('upcoming')}
          className={getFilterBadgeColor('upcoming')}
        >
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Próximos 7 dias
          {getFilterCount('upcoming') > 0 && (
            <Badge variant="outline" className="ml-2 text-[10px] px-1.5">
              {getFilterCount('upcoming')}
            </Badge>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setFilter('completed')}
          className={getFilterBadgeColor('completed')}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Concluídos
          {getFilterCount('completed') > 0 && (
            <Badge variant="outline" className="ml-2 text-[10px] px-1.5 bg-success/10 text-success border-success/30">
              {getFilterCount('completed')}
            </Badge>
          )}
        </Button>
      </div>

      {/* Lista de Follow-ups */}
      <div className="space-y-3">
        {filteredFollowUps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {filter === 'all' ? 'Nenhum follow-up pendente' : `Nenhum follow-up ${filter === 'overdue' ? 'atrasado' : filter === 'today' ? 'para hoje' : 'nos próximos 7 dias'}`}
            </p>
            <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1.5">
              <span className="text-purple-400">🤖</span>
              Follow-ups serão criados automaticamente ao mover leads no Kanban
            </p>
          </div>
        ) : (
          <>
            {/* Atrasados */}
            {filter === 'all' && overdueFollowUps.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  ATRASADOS ({overdueFollowUps.length})
                </h3>
                <div className="space-y-2">
                  {overdueFollowUps.map(followUp => (
                    <FollowUpItem
                      key={followUp.id}
                      followUp={followUp}
                      leadName={getLeadName(followUp.lead_id)}
                      onOpenLead={() => onOpenLead(followUp.lead_id)}
                      onMarkAsDone={() => onMarkAsDone(followUp.id)}
                      variant="overdue"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hoje */}
            {(filter === 'all' || filter === 'today') && todayFollowUps.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  HOJE ({todayFollowUps.length})
                </h3>
                <div className="space-y-2">
                  {todayFollowUps.map(followUp => (
                    <FollowUpItem
                      key={followUp.id}
                      followUp={followUp}
                      leadName={getLeadName(followUp.lead_id)}
                      onOpenLead={() => onOpenLead(followUp.lead_id)}
                      onMarkAsDone={() => onMarkAsDone(followUp.id)}
                      variant="today"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Próximos 7 dias */}
            {(filter === 'all' || filter === 'upcoming') && upcomingFollowUps.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  PRÓXIMOS 7 DIAS ({upcomingFollowUps.length})
                </h3>
                <div className="space-y-2">
                  {upcomingFollowUps.map(followUp => (
                    <FollowUpItem
                      key={followUp.id}
                      followUp={followUp}
                      leadName={getLeadName(followUp.lead_id)}
                      onOpenLead={() => onOpenLead(followUp.lead_id)}
                      onMarkAsDone={() => onMarkAsDone(followUp.id)}
                      variant="upcoming"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Concluídos */}
            {filter === 'completed' && completedFollowUps.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  CONCLUÍDOS ({completedFollowUps.length})
                </h3>
                <div className="space-y-2">
                  {completedFollowUps.map(followUp => (
                    <FollowUpItem
                      key={followUp.id}
                      followUp={followUp}
                      leadName={getLeadName(followUp.lead_id)}
                      onOpenLead={() => onOpenLead(followUp.lead_id)}
                      onMarkAsDone={() => onMarkAsDone(followUp.id)}
                      variant="upcoming"
                      isCompleted={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Apenas os filtrados específicos */}
            {filter === 'overdue' && overdueFollowUps.map(followUp => (
              <FollowUpItem
                key={followUp.id}
                followUp={followUp}
                leadName={getLeadName(followUp.lead_id)}
                onOpenLead={() => onOpenLead(followUp.lead_id)}
                onMarkAsDone={() => onMarkAsDone(followUp.id)}
                variant="overdue"
              />
            ))}
          </>
        )}
      </div>
    </Card>
  );
};

// Componente para cada item de follow-up
interface FollowUpItemProps {
  followUp: FollowUp;
  leadName: string;
  onOpenLead: () => void;
  onMarkAsDone: () => void;
  variant: 'overdue' | 'today' | 'upcoming';
  isCompleted?: boolean;
}

const FollowUpItem = ({ followUp, leadName, onOpenLead, onMarkAsDone, variant, isCompleted = false }: FollowUpItemProps) => {
  const variantStyles = {
    overdue: 'bg-danger/5 border-danger/30',
    today: 'bg-warning/5 border-warning/30',
    upcoming: 'bg-success/5 border-success/30'
  };

  const iconStyles = {
    overdue: 'bg-danger/10 text-danger',
    today: 'bg-warning/10 text-warning',
    upcoming: 'bg-success/10 text-success'
  };

  return (
    <div className={`p-3 rounded-lg border ${isCompleted ? 'bg-success/5 border-success/30 opacity-70' : variantStyles[variant]} hover:shadow-md transition-all group`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${isCompleted ? 'bg-success/10 text-success' : iconStyles[variant]} flex items-center justify-center flex-shrink-0`}>
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : variant === 'overdue' ? (
            <AlertCircle className="w-4 h-4" />
          ) : variant === 'today' ? (
            <Clock className="w-4 h-4" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <h4 className={`font-semibold text-foreground text-sm mb-0.5 ${isCompleted ? 'line-through' : ''}`}>{leadName}</h4>
              <p className={`text-xs text-muted-foreground ${isCompleted ? 'line-through' : ''}`}>{followUp.titulo}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {isCompleted ? 'Concluído em: ' : variant === 'overdue' ? 'Deveria ter sido feito em: ' : 'Agendado para: '}
            {isCompleted ? formatFollowUpDate(followUp.updated_at) : formatFollowUpDate(followUp.due_date)}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenLead();
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Abrir Lead
            </Button>
            {!isCompleted && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs bg-success/10 text-success border-success/30 hover:bg-success/20 flex-shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkAsDone();
                }}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Marcar Feito
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

