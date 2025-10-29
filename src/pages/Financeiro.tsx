import { useMemo, useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useFinancial, useData } from "@/contexts/DataContext";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCcw,
  Search,
  Calendar as CalendarIcon,
  MoreVertical,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import { PremiumAreaChart } from "@/components/charts/PremiumAreaChart";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AddMovimentacaoModal, type MovimentacaoData } from "@/components/financeiro/AddMovimentacaoModal";
import type { Cliente } from "@/components/clientes/ClienteCard";

type TransactionType = "Entrada" | "Saída";
type TransactionStatus = "Pago" | "Pendente";

type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  method: string;
  status: TransactionStatus;
  cliente?: string;
  observacoes?: string;
};

const initialTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-10-10",
    description: "Pagamento Cliente Zynox Cloud",
    category: "Serviço",
    type: "Entrada",
    amount: 499.9,
    method: "PIX",
    status: "Pago",
    cliente: "Zynox Cloud",
  },
  {
    id: "2",
    date: "2025-10-12",
    description: "Assinatura Hetzner",
    category: "Infraestrutura",
    type: "Saída",
    amount: 350,
    method: "Cartão",
    status: "Pago",
  },
  {
    id: "3",
    date: "2025-10-14",
    description: "Upwork - Projeto Aurora",
    category: "Consultoria",
    type: "Entrada",
    amount: 1850,
    method: "Transferência",
    status: "Pago",
    cliente: "Upwork Inc",
  },
  {
    id: "4",
    date: "2025-10-18",
    description: "Mensalidade Cliente StarTech",
    category: "Serviço",
    type: "Entrada",
    amount: 799.0,
    method: "PIX",
    status: "Pendente",
    cliente: "StarTech Solutions",
  },
  {
    id: "5",
    date: "2025-10-20",
    description: "Licença Software",
    category: "Ferramentas",
    type: "Saída",
    amount: 299.0,
    method: "Cartão",
    status: "Pendente",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

// Dados mockados para gráficos de evolução (últimos 6 meses)
const evolutionData = [
  { mes: "Mai", entradas: 2500, saidas: 1800 },
  { mes: "Jun", entradas: 3200, saidas: 2100 },
  { mes: "Jul", entradas: 2800, saidas: 1900 },
  { mes: "Ago", entradas: 3500, saidas: 2300 },
  { mes: "Set", entradas: 3800, saidas: 2500 },
  { mes: "Out", entradas: 4149, saidas: 2999 },
];

// Dados mock de clientes (para o modal)
const CLIENTES_MOCK: Cliente[] = [
  {
    id: "1",
    name: "João Silva",
    company: "Tech Innovations LTDA",
    email: "joao@techinnovations.com",
    avatar: "JS",
    healthScore: 92,
    mrr: 12500,
    activeProjects: 3,
    tags: ["VIP", "Recorrente"],
    status: "ativo",
    mrrTendencia: 12,
    responsavel: { nome: "Lucas Rocha", avatar: "LR" },
    ultimaInteracao: "2025-10-22T10:30:00Z",
  },
  {
    id: "2",
    name: "Maria Costa",
    company: "Digital Solutions",
    email: "maria@digitalsolutions.com",
    avatar: "MC",
    healthScore: 88,
    mrr: 8900,
    activeProjects: 2,
    tags: ["Recorrente"],
    status: "ativo",
    mrrTendencia: 8,
    responsavel: { nome: "Ana Paula", avatar: "AP" },
    ultimaInteracao: "2025-10-21T14:20:00Z",
  },
  {
    id: "3",
    name: "Pedro Santos",
    company: "Startup XYZ",
    email: "pedro@startupxyz.com",
    avatar: "PS",
    healthScore: 95,
    mrr: 15200,
    activeProjects: 4,
    tags: ["VIP", "Recorrente"],
    status: "ativo",
    mrrTendencia: 15,
    responsavel: { nome: "Carlos Silva", avatar: "CS" },
    ultimaInteracao: "2025-10-23T09:15:00Z",
  },
  {
    id: "4",
    name: "Ana Paula",
    company: "Marketing Pro",
    email: "ana@marketingpro.com",
    avatar: "AP",
    healthScore: 76,
    mrr: 7800,
    activeProjects: 2,
    tags: ["Recorrente"],
    status: "ativo",
    mrrTendencia: -3,
    responsavel: { nome: "Roberto Dias", avatar: "RD" },
    ultimaInteracao: "2025-10-15T16:45:00Z",
  },
];

const Financeiro = () => {
  // Usar DataContext para gerenciar transações financeiras
  const { financial: financialRecords, createFinancial: createFinancialRecord, updateFinancial: updateFinancialRecord, deleteFinancial: deleteFinancialRecord } = useFinancial();
  const { sync } = useData();
  
  // Sincronização inteligente - dados financeiros são gerenciados pelo DataContext
  
  const [addEntradaOpen, setAddEntradaOpen] = useState(false);
  const [addDespesaOpen, setAddDespesaOpen] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>();
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>();
  const [filterType, setFilterType] = useState<TransactionType | "">("");

  // Estados de ordenação e paginação
  const [sortColumn, setSortColumn] = useState<keyof Transaction | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados de menu de ações
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };

    if (openActionMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionMenu]);

  // Cálculo das transações filtradas
  const filteredTransactions = useMemo(() => {
    if (!financialRecords || !Array.isArray(financialRecords)) {
      return [];
    }
    
    return financialRecords.filter((transaction) => {
      if (!transaction) return false;
      
      const matchesSearch =
        searchTerm === "" ||
        (transaction.descricao && transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.cliente && transaction.cliente.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDateFrom =
        !filterDateFrom || (transaction.data && new Date(transaction.data) >= filterDateFrom);

      const matchesDateTo =
        !filterDateTo || (transaction.data && new Date(transaction.data) <= filterDateTo);

      const matchesType =
        filterType === "" || transaction.tipo === filterType;

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesType;
    });
  }, [financialRecords, searchTerm, filterDateFrom, filterDateTo, filterType]);

  // Ordenação
  const sortedTransactions = useMemo(() => {
    if (!sortColumn) return filteredTransactions;

    return [...filteredTransactions].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === undefined || bVal === undefined) return 0;

      if (sortColumn === "amount") {
        return sortDirection === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }

      if (sortColumn === "date") {
        const aDate = aVal ? new Date(aVal as string).getTime() : 0;
        const bDate = bVal ? new Date(bVal as string).getTime() : 0;
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredTransactions, sortColumn, sortDirection]);

  // Paginação
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const summary = useMemo(() => {
    if (!financialRecords || !Array.isArray(financialRecords)) {
      return {
        entradas: 0,
        saidas: 0,
        lucro: 0,
        saldo: 0,
        miniChartData: {
          entradas: 0,
          saidas: 0,
          lucro: 0,
          saldo: 0,
        }
      };
    }
    
    const entradas = financialRecords.filter((t) => t && t.tipo === "entrada").reduce((acc, t) => acc + (t.valor || 0), 0);
    const saidas = financialRecords.filter((t) => t && t.tipo === "despesa").reduce((acc, t) => acc + (t.valor || 0), 0);

    // Dados para mini gráficos (últimos 7 dias simulados)
    const miniChartData = {
      saldo: [85, 88, 82, 90, 87, 92, 95],
      entradas: [1200, 1500, 1300, 1850, 1400, 1650, 2349],
      saidas: [800, 950, 850, 1100, 900, 950, 999],
      lucro: [400, 550, 450, 750, 500, 700, 1350],
    };

    return {
      entradas,
      saidas,
      saldo: entradas - saidas + 8000,
      lucro: entradas - saidas,
      miniChartData,
      trends: {
        entradas: 12,
        saidas: -8,
        lucro: 35,
        saldo: 15,
      },
    };
  }, [financialRecords]);

  // Função para ordenar por coluna
  const handleSort = (column: keyof Transaction) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSaveMovimentacao = (data: MovimentacaoData) => {
    // Converter MovimentacaoData para Transaction
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: data.data.toISOString().split("T")[0],
      description: data.descricao,
      category: data.categoria,
      type: data.tipo === "entrada" ? "Entrada" : "Saída",
      amount: data.valor,
      method: data.metodoPagamento,
      status: data.status === "pago" ? "Pago" : "Pendente",
      cliente: data.clienteId
        ? CLIENTES_MOCK.find((c) => c.id === data.clienteId)?.name
        : data.fornecedor,
      observacoes: data.observacoes,
    };

    createFinancialRecord(newTransaction);

    toast.success("Movimentação registrada com sucesso!", {
      description: `${data.tipo === "entrada" ? "Entrada" : "Despesa"} de ${formatCurrency(
        data.valor
      )} adicionada`,
      position: "bottom-right",
    });
  };

  const handleDelete = (id: string) => {
    deleteFinancialRecord(id);
    setOpenActionMenu(null);
    toast.success("Movimentação excluída", {
      position: "bottom-right",
    });
  };

  const handleViewReceipt = (transaction: Transaction) => {
    setOpenActionMenu(null);
    toast.info(`Recibo de ${transaction.descricao} em desenvolvimento`, {
      position: "bottom-right",
    });
  };

  const cards = [
    {
      label: "Saldo Atual",
      value: summary.saldo,
      icon: Wallet,
      gradient: "from-primary to-primary-light",
      chartData: summary.miniChartData.saldo,
      chartType: "area" as const,
      trend: summary.trends.saldo,
      color: "blue" as const,
    },
    {
      label: "Entradas",
      value: summary.entradas,
      icon: TrendingUp,
      gradient: "from-emerald-400 to-teal-400",
      chartData: summary.miniChartData.entradas,
      chartType: "bar" as const,
      trend: summary.trends.entradas,
      color: "green" as const,
    },
    {
      label: "Saídas",
      value: summary.saidas,
      icon: TrendingDown,
      gradient: "from-rose-500 to-amber-500",
      chartData: summary.miniChartData.saidas,
      chartType: "bar" as const,
      trend: summary.trends.saidas,
      color: "blue" as const,
    },
    {
      label: "Lucro",
      value: summary.lucro,
      icon: summary.lucro >= 0 ? TrendingUp : TrendingDown,
      gradient: summary.lucro >= 0 ? "from-emerald-400 to-teal-400" : "from-rose-500 to-amber-500",
      chartData: summary.miniChartData.lucro,
      chartType: "area" as const,
      trend: summary.trends.lucro,
      color: "green" as const,
    },
  ];

  return (
    <DashboardLayout showHeader={false}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-lg font-semibold text-white">Painel Financeiro</h1>
            <p className="text-sm text-slate-400">
              Visão consolidada de caixa, entradas e despesas da Zynox.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={() => setAddEntradaOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-emerald-400/60 bg-gradient-to-br from-[#0f2f24] via-[#134333] to-[#0a2118] px-4 py-2.5 text-sm font-semibold text-emerald-100 shadow-[0_18px_46px_rgba(17,185,129,0.35)] transition hover:border-emerald-300/80 hover:shadow-[0_22px_56px_rgba(17,185,129,0.45)]"
            >
              <Plus className="h-4 w-4" />
              Nova entrada
            </button>
            <button
              onClick={() => setAddDespesaOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-[#181115]/80 px-4 py-2.5 text-sm font-semibold text-red-300 shadow-[0_12px_30px_rgba(255,82,82,0.25)] transition hover:border-red-500/60 hover:text-red-200"
            >
              <Minus className="h-4 w-4" />
              Nova despesa
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Saldo Atual */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Wallet className="w-5 h-5 text-primary" />
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Total
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.saldo)}</p>
            <p className="text-sm text-muted-foreground">Saldo Atual</p>
            <div className="mt-3">
              <div className="h-12 mb-2">
                <PremiumAreaChart data={summary.miniChartData.saldo} color="blue" />
              </div>
              <p className="text-xs text-muted-foreground">+{summary.trends.saldo}% vs mês anterior</p>
            </div>
          </div>

          {/* Receitas */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <ArrowUpRight className="w-5 h-5 text-green-400" />
              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                Este mês
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.entradas)}</p>
            <p className="text-sm text-muted-foreground">Receitas</p>
            <div className="mt-3">
              <div className="h-12 mb-2">
                <PremiumMiniBar data={summary.miniChartData.entradas} />
              </div>
              <p className="text-xs text-green-400">+{summary.trends.entradas}% vs mês anterior</p>
            </div>
          </div>

          {/* Despesas */}
          <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <ArrowDownRight className="w-5 h-5 text-red-400" />
              <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                Este mês
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.saidas)}</p>
            <p className="text-sm text-muted-foreground">Despesas</p>
            <div className="mt-3">
              <div className="h-12 mb-2">
                <PremiumMiniBar data={summary.miniChartData.saidas} />
              </div>
              <p className="text-xs text-red-400">{summary.trends.saidas}% vs mês anterior</p>
            </div>
          </div>

          {/* Margem (Lucro/Prejuízo) */}
          <div className={cn(
            "glass-card p-5 rounded-xl border border-white/10 transition-all group",
            summary.lucro >= 0 ? "hover:border-green-500/30" : "hover:border-red-500/30"
          )}>
            <div className="flex items-center justify-between mb-3">
              {summary.lucro >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <Badge className={cn(
                "text-xs border",
                summary.lucro >= 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
              )}>
                {summary.lucro >= 0 ? "Lucro" : "Prejuízo"}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.lucro)}</p>
            <p className="text-sm text-muted-foreground">Margem</p>
            <div className="mt-3">
              <div className="h-12 mb-2">
                <PremiumAreaChart data={summary.miniChartData.lucro} color="green" />
              </div>
              <p className={cn("text-xs", summary.lucro >= 0 ? "text-green-400" : "text-red-400")}>
                +{summary.trends.lucro}% vs mês anterior
              </p>
            </div>
          </div>
        </section>

        {/* Gráfico de Evolução Financeira */}
        <section className="rounded-3xl border border-white/10 bg-[#0D1018]/90 p-6 shadow-[0_30px_90px_rgba(8,13,22,0.6)] backdrop-blur-xl">
          <header className="flex flex-col gap-3 border-b border-white/5 pb-5">
            <h2 className="font-['Poppins'] text-xl font-semibold text-white">
              Evolução Financeira
            </h2>
            <p className="text-sm text-slate-400">
              Entradas e saídas dos últimos 6 meses
            </p>
          </header>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="mes"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                  fill="url(#colorEntradas)"
                />
                <Line
                  type="monotone"
                  dataKey="saidas"
                  name="Saídas"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", r: 5 }}
                  activeDot={{ r: 7 }}
                  fill="url(#colorSaidas)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0D1018]/90 p-6 shadow-[0_30px_90px_rgba(8,13,22,0.6)] backdrop-blur-xl">
          <header className="flex flex-col gap-3 border-b border-white/5 pb-5">
            <h2 className="font-['Poppins'] text-xl font-semibold text-white">
              Histórico de movimentações
            </h2>
            <p className="text-sm text-slate-400">
              Acompanhe entradas, saídas e mantenha o caixa sob controle.
            </p>
          </header>

          <div className="mt-6 space-y-4">
            {/* Barra de Filtros */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por descrição ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#121317]/95 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>

                {/* Data De */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121317]/95 px-4 py-2.5 text-sm text-white transition hover:border-primary/50">
                      <span className={!filterDateFrom ? "text-slate-500" : ""}>
                        {filterDateFrom ? format(filterDateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
                      </span>
                      <CalendarIcon className="ml-2 h-4 w-4 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                    <Calendar
                      mode="single"
                      selected={filterDateFrom}
                      onSelect={setFilterDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Data Até */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121317]/95 px-4 py-2.5 text-sm text-white transition hover:border-primary/50">
                      <span className={!filterDateTo ? "text-slate-500" : ""}>
                        {filterDateTo ? format(filterDateTo, "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
                      </span>
                      <CalendarIcon className="ml-2 h-4 w-4 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                    <Calendar
                      mode="single"
                      selected={filterDateTo}
                      onSelect={setFilterDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Tipo */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TransactionType | "")}
                  className="rounded-xl border border-white/10 bg-[#121317]/95 px-4 py-2.5 text-sm text-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                >
                  <option value="">Todos os tipos</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Saída">Saída</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th
                      className="cursor-pointer rounded-tl-2xl bg-white/5 px-5 py-4 transition hover:bg-white/10"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Data
                        {sortColumn === "date" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer bg-white/5 px-5 py-4 transition hover:bg-white/10"
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center gap-2">
                        Descrição
                        {sortColumn === "description" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="bg-white/5 px-5 py-4">Status</th>
                    <th
                      className="cursor-pointer bg-white/5 px-5 py-4 transition hover:bg-white/10"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center gap-2">
                        Categoria
                        {sortColumn === "category" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="bg-white/5 px-5 py-4">Cliente</th>
                    <th
                      className="cursor-pointer bg-white/5 px-5 py-4 transition hover:bg-white/10"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center gap-2">
                        Tipo
                        {sortColumn === "type" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer bg-white/5 px-5 py-4 text-right transition hover:bg-white/10"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Valor
                        {sortColumn === "amount" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="bg-white/5 px-5 py-4 text-right">Método</th>
                    <th className="rounded-tr-2xl bg-white/5 px-5 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-white/5 text-sm text-slate-200 transition hover:bg-white/4"
                    >
                      <td className="px-5 py-4">
                        {transaction.data ? new Intl.DateTimeFormat("pt-BR").format(new Date(transaction.data)) : '-'}
                      </td>
                      <td className="px-5 py-4 font-medium text-white">
                        <div className="max-w-[300px] truncate" title={transaction.descricao}>
                          {transaction.descricao}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={cn(
                            "border-0",
                            transaction.status === "pago"
                              ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                          )}
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{transaction.categoria}</td>
                      <td className="px-5 py-4">
                        {transaction.cliente ? (
                          <span className="text-primary hover:text-primary-light cursor-pointer transition">
                            {transaction.cliente}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={cn(
                            "border-0 text-xs",
                            transaction.tipo === "entrada"
                              ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          )}
                        >
                          {transaction.tipo === "entrada" ? "Entrada" : "Despesa"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-white">
                        {formatCurrency(transaction.valor)}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-300">
                        {transaction.metodoPagamento}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="relative inline-block" ref={openActionMenu === transaction.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(openActionMenu === transaction.id ? null : transaction.id);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openActionMenu === transaction.id && (
                            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-white/10 bg-[#0E1019]/95 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                              <button
                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewReceipt(transaction);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                Ver Recibo
                              </button>
                              <button
                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(transaction.id);
                                }}
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
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-5 py-6 text-center text-sm text-slate-500"
                      >
                        Nenhuma movimentação encontrada com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <p className="text-sm text-slate-400">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modais */}
      <AddMovimentacaoModal
        isOpen={addEntradaOpen}
        onClose={() => setAddEntradaOpen(false)}
        tipo="entrada"
        onSave={handleSaveMovimentacao}
        clientes={CLIENTES_MOCK}
      />

      <AddMovimentacaoModal
        isOpen={addDespesaOpen}
        onClose={() => setAddDespesaOpen(false)}
        tipo="despesa"
        onSave={handleSaveMovimentacao}
        clientes={CLIENTES_MOCK}
      />
    </DashboardLayout>
  );
};

export default Financeiro;
