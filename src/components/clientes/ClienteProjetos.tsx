import { useCliente } from "@/context/ClienteContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import {
  Folder,
  Calendar,
  Users,
  DollarSign,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock de projetos - será substituído por dados reais da API
const mockProjetos = [
  {
    id: "1",
    nome: "Website Institucional",
    descricao: "Desenvolvimento do novo site institucional",
    status: "em_andamento" as const,
    dataInicio: "2025-01-15",
    dataPrevisao: "2025-03-30",
    valor: 15000,
    progresso: 65,
    equipe: ["João Silva", "Maria Santos"],
  },
  {
    id: "2",
    nome: "Sistema de Gestão",
    descricao: "Implementação de ERP customizado",
    status: "planejamento" as const,
    dataInicio: "2025-02-01",
    dataPrevisao: "2025-06-30",
    valor: 45000,
    progresso: 15,
    equipe: ["Pedro Costa"],
  },
  {
    id: "3",
    nome: "App Mobile",
    descricao: "Aplicativo mobile iOS e Android",
    status: "concluido" as const,
    dataInicio: "2024-09-01",
    dataPrevisao: "2024-12-15",
    valor: 28000,
    progresso: 100,
    equipe: ["Ana Paula", "Carlos Silva"],
  },
];

const statusConfig = {
  planejamento: {
    label: "Planejamento",
    color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: Clock,
  },
  em_andamento: {
    label: "Em Andamento",
    color: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    icon: AlertCircle,
  },
  concluido: {
    label: "Concluído",
    color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
};

export const ClienteProjetos = () => {
  const { clienteAtivo } = useCliente();
  const [projetos] = useState(mockProjetos);
  const navigate = useNavigate();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("pt-BR").format(new Date(date));

  const handleOpenProject = (projetoId: string) => {
    // Redireciona para a página de projetos
    navigate('/projetos');
    toast.success("Redirecionando para projetos...");
  };

  const handleCreateProject = () => {
    navigate('/projetos');
    toast.info("Criar novo projeto");
  };

  const totalValor = projetos.reduce((acc, p) => acc + p.valor, 0);
  const projetosAtivos = projetos.filter(p => p.status !== "concluido").length;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Folder className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{projetos.length}</p>
              <p className="text-xs text-slate-400">Total de Projetos</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{projetosAtivos}</p>
              <p className="text-xs text-slate-400">Em Andamento</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalValor)}</p>
              <p className="text-xs text-slate-400">Valor Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="space-y-4">
        {projetos.map((projeto) => {
          const status = statusConfig[projeto.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={projeto.id}
              className="glass-card p-5 hover:border-primary/30 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition">
                      {projeto.nome}
                    </h3>
                    <Badge className={cn("border text-xs", status.color)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {projeto.descricao}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProject(projeto.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition"
                  title="Ir para página de projetos"
                >
                  <ExternalLink className="w-5 h-5 text-primary" />
                </button>
              </div>

              {/* Progresso */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Progresso</span>
                  <span className="font-semibold text-white">{projeto.progresso}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                    style={{ width: `${projeto.progresso}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(projeto.dataInicio)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{projeto.equipe.length} pessoas</span>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold">
                  {formatCurrency(projeto.valor)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {projetos.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhum projeto cadastrado
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Este cliente ainda não possui projetos vinculados
          </p>
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20 transition"
          >
            <Plus className="h-5 w-5" />
            Criar Primeiro Projeto
          </button>
        </div>
      )}
    </div>
  );
};

