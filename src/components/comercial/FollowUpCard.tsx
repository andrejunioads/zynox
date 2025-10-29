import { FollowUp } from "@/types/followup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateFollowUpStatus,
  getFollowUpStatusColor,
  getFollowUpStatusLabel,
  formatFollowUpDate,
  isFollowUpOverdue,
  isFollowUpUpcoming
} from "@/utils/followUpHelpers";
import { RefreshCw, User, CheckCircle2, Edit3, X, Bell, AlertCircle } from "lucide-react";

interface FollowUpCardProps {
  followUp: FollowUp;
  onMarkAsDone: (id: string) => void;
  onEdit?: (followUp: FollowUp) => void;
  onDelete?: (id: string) => void;
}

export const FollowUpCard = ({ followUp, onMarkAsDone, onEdit, onDelete }: FollowUpCardProps) => {
  const status = calculateFollowUpStatus(followUp);
  const statusColor = getFollowUpStatusColor(followUp);
  const statusLabel = getFollowUpStatusLabel(followUp);
  const isOverdue = isFollowUpOverdue(followUp);
  const isUpcoming = isFollowUpUpcoming(followUp);

  const getPrioridadeColor = () => {
    const prioridades = {
      baixa: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      alta: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return prioridades[followUp.prioridade];
  };

  const getPrioridadeLabel = () => {
    const labels = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta"
    };
    return labels[followUp.prioridade];
  };

  // Determina a cor do card baseado no status
  let cardBorderClass = "border-primary/20";
  let cardBgClass = "bg-card/60";
  
  if (isOverdue) {
    cardBorderClass = "border-danger/40";
    cardBgClass = "bg-danger/5";
  } else if (isUpcoming) {
    cardBorderClass = "border-warning/40";
    cardBgClass = "bg-warning/5";
  } else if (status === 'feito') {
    cardBorderClass = "border-success/30";
    cardBgClass = "bg-success/5";
  }

  return (
    <div className={`${cardBgClass} ${cardBorderClass} border rounded-lg p-4 group hover:shadow-lg transition-all`}>
      <div className="flex items-start gap-3">
        {/* Ícone do Follow-up */}
        <div className={`w-10 h-10 rounded-full ${statusColor} flex items-center justify-center flex-shrink-0`}>
          <RefreshCw className="w-5 h-5" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground text-base mb-1 flex items-center gap-2">
                {followUp.is_automatico && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-purple-500/10 text-purple-400 border-purple-500/30">
                    Auto
                  </Badge>
                )}
                {followUp.titulo}
              </h4>
              
              {/* Status e Data */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-xs ${statusColor}`}>
                  {statusLabel}
                </Badge>
                
                <Badge variant="outline" className={`text-xs ${getPrioridadeColor()}`}>
                  {getPrioridadeLabel()}
                </Badge>

                {isOverdue && (
                  <Badge variant="outline" className="text-xs bg-danger/10 text-danger border-danger/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Atrasado
                  </Badge>
                )}
              </div>
            </div>

            {/* Botões de ação (visíveis no hover se não estiver concluído) */}
            {status !== 'feito' && status !== 'cancelado' && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => onEdit(followUp)}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => onDelete(followUp.id)}
                  >
                    <X className="w-3.5 h-3.5 text-danger" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Data e hora */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>{formatFollowUpDate(followUp.due_date)}</span>
          </div>

          {/* Descrição */}
          {followUp.descricao && (
            <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
              {followUp.descricao}
            </p>
          )}

          {/* Meta informações */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{followUp.responsavel}</span>
            </div>

            {followUp.repetir_em && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>Repetir: {followUp.repetir_em} dia{followUp.repetir_em > 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>

          {/* Botão de marcar como feito */}
          {status === 'pendente' || status === 'atrasado' ? (
            <div className="mt-3 pt-3 border-t border-white/10">
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-success/10 hover:bg-success/20 text-success border-success/30"
                onClick={() => onMarkAsDone(followUp.id)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar como Feito
              </Button>
            </div>
          ) : status === 'feito' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluído em {new Date(followUp.updated_at).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




