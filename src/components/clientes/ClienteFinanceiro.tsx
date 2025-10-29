import { useCliente } from "@/context/ClienteContext";
import { useState, useMemo } from "react";
import { ClienteMovimentacao } from "@/types/cliente";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  Plus,
  Minus,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { PremiumAreaChart } from "@/components/charts/PremiumAreaChart";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";

// Mock de dados - será substituído por dados reais da API
const mockMovimentacoes: ClienteMovimentacao[] = [
  {
    id: "1",
    clienteId: "123",
    data: "2025-10-10",
    descricao: "Mensalidade Outubro",
    categoria: "Serviço",
    tipo: "entrada",
    valor: 5000,
    metodo: "PIX",
    status: "pago",
    recorrente: true,
  },
  {
    id: "2",
    clienteId: "123",
    data: "2025-09-10",
    descricao: "Mensalidade Setembro",
    categoria: "Serviço",
    tipo: "entrada",
    valor: 5000,
    metodo: "PIX",
    status: "pago",
    recorrente: true,
  },
  {
    id: "3",
    clienteId: "123",
    data: "2025-10-15",
    descricao: "Reembolso de despesas",
    categoria: "Reembolso",
    tipo: "saida",
    valor: 350,
    metodo: "Transferência",
    status: "pago",
    recorrente: false,
  },
];

export const ClienteFinanceiro = () => {
  const { clienteAtivo } = useCliente();
  const [movimentacoes] = useState<ClienteMovimentacao[]>(mockMovimentacoes);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const resumo = useMemo(() => {
    const entradas = movimentacoes
      .filter((m) => m.tipo === "entrada")
      .reduce((acc, m) => acc + m.valor, 0);

    const saidas = movimentacoes
      .filter((m) => m.tipo === "saida")
      .reduce((acc, m) => acc + m.valor, 0);

    return {
      saldo: entradas - saidas,
      entradas,
      saidas,
      lucro: entradas - saidas,
      miniChartData: {
        saldo: [85, 88, 90, 87, 92, 95, 100],
        entradas: [4800, 5000, 4900, 5000, 4950, 5000, 5000],
        saidas: [200, 300, 250, 350, 300, 280, 350],
      },
    };
  }, [movimentacoes]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleNovaEntrada = () => {
    toast.info("Abrindo modal de nova entrada");
    // TODO: Abrir modal integrado do financeiro
  };

  const handleNovaSaida = () => {
    toast.info("Abrindo modal de nova saída");
    // TODO: Abrir modal integrado do financeiro
  };

  const handleVerRecibo = (mov: ClienteMovimentacao) => {
    toast.info(`Visualizando recibo: ${mov.descricao}`);
    setOpenActionMenu(null);
  };

  const handleExcluir = (id: string) => {
    toast.success("Movimentação excluída");
    setOpenActionMenu(null);
    // TODO: Integrar com API e atualizar estado
  };

  const cards = [
    {
      label: "Saldo Atual",
      value: resumo.saldo,
      icon: Wallet,
      chartData: resumo.miniChartData.saldo,
      chartType: "area" as const,
      color: "blue" as const,
    },
    {
      label: "Total Entradas",
      value: resumo.entradas,
      icon: TrendingUp,
      chartData: resumo.miniChartData.entradas,
      chartType: "bar" as const,
      color: "green" as const,
    },
    {
      label: "Total Saídas",
      value: resumo.saidas,
      icon: TrendingDown,
      chartData: resumo.miniChartData.saidas,
      chartType: "bar" as const,
      color: "blue" as const,
    },
    {
      label: "Lucro",
      value: resumo.lucro,
      icon: DollarSign,
      chartData: resumo.miniChartData.saldo,
      chartType: "area" as const,
      color: "green" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0D1018]/90 p-5 shadow-[0_20px_60px_rgba(14,23,43,0.55)] backdrop-blur-lg transition-all duration-300 hover:border-white/20"
          >
            <div className="relative space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatCurrency(card.value)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-white shadow-[0_8px_16px_rgba(59,130,246,0.25)] flex items-center justify-center">
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="h-12">
                {card.chartType === "bar" ? (
                  <PremiumMiniBar data={card.chartData} />
                ) : (
                  <PremiumAreaChart data={card.chartData} color={card.color} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Movimentações */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Histórico de Movimentações</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="rounded-tl-xl bg-white/5 px-4 py-3">Data</th>
                <th className="bg-white/5 px-4 py-3">Descrição</th>
                <th className="bg-white/5 px-4 py-3">Categoria</th>
                <th className="bg-white/5 px-4 py-3">Tipo</th>
                <th className="bg-white/5 px-4 py-3 text-right">Valor</th>
                <th className="bg-white/5 px-4 py-3">Método</th>
                <th className="bg-white/5 px-4 py-3">Status</th>
                <th className="rounded-tr-xl bg-white/5 px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((mov) => (
                <tr
                  key={mov.id}
                  className="border-b border-white/5 text-sm text-slate-200 transition hover:bg-white/4"
                >
                  <td className="px-4 py-3">
                    {new Intl.DateTimeFormat("pt-BR").format(new Date(mov.data))}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    <div className="flex items-center gap-2">
                      {mov.descricao}
                      {mov.recorrente && (
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                          Recorrente
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{mov.categoria}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "border-0 text-xs",
                        mov.tipo === "entrada"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      )}
                    >
                      {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {formatCurrency(mov.valor)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{mov.metodo}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "border-0",
                        mov.status === "pago"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-amber-500/10 text-amber-300"
                      )}
                    >
                      {mov.status === "pago" ? "Pago" : "Pendente"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenActionMenu(openActionMenu === mov.id ? null : mov.id)
                        }
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openActionMenu === mov.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-white/10 bg-[#0E1019]/95 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                          <button
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                            onClick={() => handleVerRecibo(mov)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver Recibo
                          </button>
                          <button
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                            onClick={() => handleExcluir(mov.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {movimentacoes.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">Nenhuma movimentação registrada</p>
            <p className="text-xs text-white/30 mt-1">
              Adicione entradas ou saídas para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

