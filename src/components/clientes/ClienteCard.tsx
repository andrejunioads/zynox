import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, FolderKanban } from "lucide-react";

export interface Cliente {
  id: string;
  name: string;
  company: string;
  email: string;
  avatar: string;
  healthScore: number;
  mrr: number;
  activeProjects: number;
  tags: string[];
  status: "ativo" | "inativo";
  mrrTendencia: number;
  responsavel: { nome: string; avatar: string };
  ultimaInteracao: string;
}

interface ClienteCardProps {
  cliente: Cliente;
  onClick: () => void;
}

export const ClienteCard = ({ cliente, onClick }: ClienteCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500/10 text-green-400 border border-green-500/30";
    if (score >= 50) return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
    return "bg-red-500/10 text-red-400 border border-red-500/30";
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-primary/20 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 flex flex-col overflow-hidden">
      {/* Avatar com Health Score Badge */}
      <div className="flex flex-col items-center mb-4 relative">
        <div className="absolute top-0 right-0">
          <div className={`px-2 py-1 rounded-md ${getHealthScoreColor(cliente.healthScore)} text-xs font-bold`}>
            {cliente.healthScore}%
          </div>
        </div>
        <div className="w-[61px] h-[61px] rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold mb-3 overflow-hidden">
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
        <h3 className="text-base font-bold text-white text-center">{cliente.name}</h3>
        <p className="text-[13px] text-[#94A3B8]">{cliente.company}</p>
      </div>

      {/* Info - MRR e Projetos */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-white font-semibold">{formatCurrency(cliente.mrr)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FolderKanban className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-white font-semibold">{cliente.activeProjects} {cliente.activeProjects === 1 ? 'projeto ativo' : 'projetos ativos'}</span>
        </div>
      </div>

      {/* Espaçamento automático */}
      <div className="flex-grow"></div>

      {/* Tags */}
      {cliente.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {cliente.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Botão */}
      <Button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary text-sm"
        size="sm"
      >
        Ver Perfil Completo
      </Button>
    </div>
  );
};
