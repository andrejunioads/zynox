import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Minus, Clock, Trash2, Eye } from "lucide-react";
import { Cliente } from "./ClienteCard";

interface ClienteListItemProps {
  cliente: Cliente;
  onClick: () => void;
  onDelete: (clienteId: string) => void;
}

export const ClienteListItem = ({ cliente, onClick, onDelete }: ClienteListItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: "Ativo", color: "bg-green-500/10 text-green-400 border-green-500/30" },
      inativo: { label: "Inativo", color: "bg-gray-500/10 text-gray-400 border-gray-500/30" }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
  };

  const getTrendIcon = (tendencia: number) => {
    if (tendencia > 0) return { icon: TrendingUp, color: "text-green-400", symbol: "+" };
    if (tendencia < 0) return { icon: TrendingDown, color: "text-red-400", symbol: "" };
    return { icon: Minus, color: "text-gray-400", symbol: "" };
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getInteractionColor = (dateString: string) => {
    const now = new Date();
    const interactionDate = new Date(dateString);
    const diffDays = Math.floor((now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return "text-green-400";
    if (diffDays <= 15) return "text-yellow-400";
    return "text-red-400";
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 14) return "há 1 semana";
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 60) return "há 1 mês";
    return `há ${Math.floor(diffDays / 30)} meses`;
  };

  const statusBadge = getStatusBadge(cliente.status);
  const trend = getTrendIcon(cliente.mrrTendencia);
  const TrendIconComponent = trend.icon;

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log('🗑️ ClienteListItem: Confirmando exclusão do cliente:', cliente.id);
    onDelete(cliente.id);
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="glass-card rounded-xl p-5 border border-white/10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 overflow-hidden">
      <div className="flex items-center gap-6">

        {/* SEÇÃO 1: Avatar + Info Básica */}
        <div className="flex items-center gap-4 min-w-[280px]">
          <div className="w-[50px] h-[50px] rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden">
            {cliente.avatar && cliente.avatar.startsWith('data:image') ? (
              <img 
                src={cliente.avatar} 
                alt={cliente.name} 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              cliente.avatar
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-bold text-white truncate">{cliente.name}</h4>
              <Badge className={`${statusBadge.color} border text-[10px] px-2 py-0.5 flex-shrink-0`}>
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-sm text-[#94A3B8] truncate">{cliente.company}</p>
          </div>
        </div>

        {/* Divisor Visual */}
        <div className="h-12 w-px bg-white/10"></div>

        {/* SEÇÃO 2: Métricas */}
        <div className="flex items-center gap-8">
          {/* Health Score */}
          <div className="min-w-[90px]">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wide mb-1">Health Score</div>
            <div className={`text-2xl font-bold ${getHealthScoreColor(cliente.healthScore)}`}>
              {cliente.healthScore}%
            </div>
          </div>

          {/* MRR */}
          <div className="min-w-[140px]">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wide mb-1">MRR</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{formatCurrency(cliente.mrr)}</span>
              <span className={`text-[11px] font-semibold ${trend.color} flex items-center gap-0.5`}>
                <TrendIconComponent className="w-3 h-3" />
                {trend.symbol}{Math.abs(cliente.mrrTendencia)}%
              </span>
            </div>
          </div>

          {/* Projetos */}
          <div className="min-w-[80px]">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wide mb-1">Projetos</div>
            <div className="text-lg font-bold text-white">{cliente.activeProjects}</div>
          </div>
        </div>

        {/* Divisor Visual */}
        <div className="h-12 w-px bg-white/10"></div>

        {/* SEÇÃO 3: Responsável + Última Interação */}
        <div className="flex items-center gap-6">
          {/* Responsável */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="min-w-[100px] cursor-pointer">
                  <div className="text-[10px] text-[#94A3B8] uppercase tracking-wide mb-1">Responsável</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {cliente.responsavel.avatar}
                    </div>
                    <div className="text-sm text-white truncate">
                      {cliente.responsavel.nome.split(' ')[0]} {cliente.responsavel.nome.split(' ').pop()?.charAt(0)}.
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{cliente.responsavel.nome}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Última Interação */}
          <div className="min-w-[120px]">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wide mb-1">Última Interação</div>
            <div className={`text-sm font-semibold flex items-center gap-1 ${getInteractionColor(cliente.ultimaInteracao)}`}>
              <Clock className="w-3 h-3" />
              {getRelativeTime(cliente.ultimaInteracao)}
            </div>
          </div>
        </div>

        {/* Divisor Visual */}
        <div className="h-12 w-px bg-white/10"></div>

        {/* SEÇÃO 4: Tags */}
        <div className="min-w-[120px]">
          <div className="flex flex-wrap gap-1.5">
            {cliente.tags.length > 0 ? (
              cliente.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-[#94A3B8]">Sem tags</span>
            )}
          </div>
        </div>

        {/* SEÇÃO 5: Ações */}
        <div className="flex items-center gap-2 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={onClick}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-9 px-4"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Perfil
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Ver Perfil Completo</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="h-9 w-9 p-0 hover:bg-red-500/20 hover:text-red-400 text-red-400/70"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-red-500/90">
                <p>Excluir Cliente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-card border border-red-500/30 bg-[rgba(26,29,41,0.4)] backdrop-blur-[30px] max-w-md">
          <AlertDialogHeader className="space-y-4">
            {/* Ícone de Alerta */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>

            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-white text-2xl font-bold">
                Excluir Cliente
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#94A3B8] text-base leading-relaxed px-4 text-balance">
                Tem certeza que deseja excluir <span className="font-bold text-white">{cliente.name}</span> da base de clientes?
                <br />
                <span className="text-red-400 text-sm mt-2 block">Esta ação não pode ser desfeita.</span>
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 sm:gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="flex-1 border-white/20 hover:bg-white/5 hover:border-white/30 text-white h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold h-11 shadow-lg shadow-red-500/20"
            >
              Sim, Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
