import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Plus, LayoutGrid, List, Users, Activity, Star, DollarSign, ArrowLeft } from "lucide-react";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import { PremiumAreaChart } from "@/components/charts/PremiumAreaChart";
import { ClienteCard, Cliente } from "@/components/clientes/ClienteCard";
import { ClienteListItem } from "@/components/clientes/ClienteListItem";
import { FilterDrawer } from "@/components/clientes/FilterDrawer";
import { AddClienteModal } from "@/components/clientes/AddClienteModal";
import { useCliente } from "@/context/ClienteContext";
import { ClienteDetalhe } from "@/components/clientes/ClienteDetalhe";
// import { ClienteProfileModal } from "@/components/clientes/ClienteProfileModal";
import { ClienteData, toClienteViewModel, Cliente as ClienteType } from "@/types/cliente";
import { mockClientes } from "@/data/mockClientes";
import { useClients, useData } from "@/contexts/DataContext";
import { toast } from "sonner";
// import { useClientSync } from "@/hooks/useSmartSync";

const oldMockClientes: Cliente[] = [
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
    ultimaInteracao: "2025-10-22T10:30:00Z"
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
    ultimaInteracao: "2025-10-21T14:20:00Z"
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
    ultimaInteracao: "2025-10-23T09:15:00Z"
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
    status: "inativo",
    mrrTendencia: -3,
    responsavel: { nome: "Roberto Dias", avatar: "RD" },
    ultimaInteracao: "2025-10-15T16:45:00Z"
  },
  {
    id: "5",
    name: "Carlos Eduardo",
    company: "E-commerce Plus",
    email: "carlos@ecommerceplus.com",
    avatar: "CE",
    healthScore: 45,
    mrr: 4200,
    activeProjects: 1,
    tags: [],
    status: "inativo",
    mrrTendencia: -12,
    responsavel: { nome: "Fernanda Lima", avatar: "FL" },
    ultimaInteracao: "2025-10-05T11:20:00Z"
  },
  {
    id: "6",
    name: "Juliana Oliveira",
    company: "Design Studio",
    email: "juliana@designstudio.com",
    avatar: "JO",
    healthScore: 91,
    mrr: 9500,
    activeProjects: 3,
    tags: ["VIP", "Recorrente"],
    status: "ativo",
    mrrTendencia: 10,
    responsavel: { nome: "Lucas Rocha", avatar: "LR" },
    ultimaInteracao: "2025-10-20T13:30:00Z"
  },
  {
    id: "7",
    name: "Roberto Dias",
    company: "Consultoria Business",
    email: "roberto@consultoriabusiness.com",
    avatar: "RD",
    healthScore: 68,
    mrr: 5400,
    activeProjects: 1,
    tags: [],
    status: "inativo",
    mrrTendencia: 0,
    responsavel: { nome: "Ana Paula", avatar: "AP" },
    ultimaInteracao: "2025-10-18T09:15:00Z"
  },
  {
    id: "8",
    name: "Fernanda Lima",
    company: "Inovação Tech",
    email: "fernanda@inovacaotech.com",
    avatar: "FL",
    healthScore: 89,
    mrr: 13800,
    activeProjects: 4,
    tags: ["VIP", "Recorrente"],
    status: "ativo",
    mrrTendencia: 18,
    responsavel: { nome: "Carlos Silva", avatar: "CS" },
    ultimaInteracao: "2025-10-23T08:00:00Z"
  },
  {
    id: "9",
    name: "Lucas Rocha",
    company: "App Development",
    email: "lucas@appdev.com",
    avatar: "LR",
    healthScore: 72,
    mrr: 6700,
    activeProjects: 2,
    tags: ["Recorrente"],
    status: "ativo",
    mrrTendencia: 5,
    responsavel: { nome: "Roberto Dias", avatar: "RD" },
    ultimaInteracao: "2025-10-16T14:00:00Z"
  },
  {
    id: "10",
    name: "Beatriz Alves",
    company: "Social Media Agency",
    email: "beatriz@socialmedia.com",
    avatar: "BA",
    healthScore: 85,
    mrr: 7200,
    activeProjects: 2,
    tags: ["Recorrente"],
    status: "ativo",
    mrrTendencia: 7,
    responsavel: { nome: "Fernanda Lima", avatar: "FL" },
    ultimaInteracao: "2025-10-19T10:30:00Z"
  },
  {
    id: "11",
    name: "Rafael Mendes",
    company: "Cloud Services",
    email: "rafael@cloudservices.com",
    avatar: "RM",
    healthScore: 38,
    mrr: 2100,
    activeProjects: 1,
    tags: [],
    status: "inativo",
    mrrTendencia: -25,
    responsavel: { nome: "Lucas Rocha", avatar: "LR" },
    ultimaInteracao: "2025-09-28T15:45:00Z"
  },
  {
    id: "12",
    name: "Camila Torres",
    company: "Fashion Brands",
    email: "camila@fashionbrands.com",
    avatar: "CT",
    healthScore: 94,
    mrr: 16500,
    activeProjects: 5,
    tags: ["VIP", "Recorrente", "Premium"],
    status: "ativo",
    mrrTendencia: 20,
    responsavel: { nome: "Ana Paula", avatar: "AP" },
    ultimaInteracao: "2025-10-23T11:00:00Z"
  },
  {
    id: "13",
    name: "Diego Ferreira",
    company: "Data Analytics",
    email: "diego@dataanalytics.com",
    avatar: "DF",
    healthScore: 81,
    mrr: 8300,
    activeProjects: 2,
    tags: ["Recorrente"],
    status: "ativo",
    mrrTendencia: 9,
    responsavel: { nome: "Carlos Silva", avatar: "CS" },
    ultimaInteracao: "2025-10-21T16:20:00Z"
  },
  {
    id: "14",
    name: "Patricia Souza",
    company: "Health Tech",
    email: "patricia@healthtech.com",
    avatar: "PS",
    healthScore: 56,
    mrr: 4800,
    activeProjects: 1,
    tags: [],
    status: "inativo",
    mrrTendencia: -5,
    responsavel: { nome: "Roberto Dias", avatar: "RD" },
    ultimaInteracao: "2025-10-16T12:00:00Z"
  },
  {
    id: "15",
    name: "Gustavo Reis",
    company: "FinTech Solutions",
    email: "gustavo@fintech.com",
    avatar: "GR",
    healthScore: 87,
    mrr: 14200,
    activeProjects: 3,
    tags: ["VIP", "Recorrente"],
    status: "ativo",
    mrrTendencia: 14,
    responsavel: { nome: "Fernanda Lima", avatar: "FL" },
    ultimaInteracao: "2025-10-22T09:30:00Z"
  },
  {
    id: "16",
    name: "Tatiana Gomes",
    company: "Edu Platform",
    email: "tatiana@eduplatform.com",
    avatar: "TG",
    healthScore: 79,
    mrr: 7900,
    activeProjects: 2,
    tags: ["Recorrente"],
    status: "ativo",
    mrrTendencia: 6,
    responsavel: { nome: "Lucas Rocha", avatar: "LR" },
    ultimaInteracao: "2025-10-18T14:15:00Z"
  },
  {
    id: "17",
    name: "Marcelo Cardoso",
    company: "Logistics Pro",
    email: "marcelo@logisticspro.com",
    avatar: "MC",
    healthScore: 42,
    mrr: 1800,
    activeProjects: 0,
    tags: [],
    status: "inativo",
    mrrTendencia: -100,
    responsavel: { nome: "Ana Paula", avatar: "AP" },
    ultimaInteracao: "2025-09-15T10:00:00Z"
  },
  {
    id: "18",
    name: "Isabela Martins",
    company: "Beauty & Style",
    email: "isabela@beautystyle.com",
    avatar: "IM",
    healthScore: 90,
    mrr: 11900,
    activeProjects: 3,
    tags: ["VIP", "Recorrente"],
    status: "ativo",
    mrrTendencia: 11,
    responsavel: { nome: "Carlos Silva", avatar: "CS" },
    ultimaInteracao: "2025-10-22T15:45:00Z"
  },
  {
    id: "19",
    name: "André Barbosa",
    company: "Sports Management",
    email: "andre@sportsmanagement.com",
    avatar: "AB",
    healthScore: 74,
    mrr: 5900,
    activeProjects: 2,
    tags: [],
    status: "inativo",
    mrrTendencia: 2,
    responsavel: { nome: "Roberto Dias", avatar: "RD" },
    ultimaInteracao: "2025-10-17T11:30:00Z"
  },
  {
    id: "20",
    name: "Larissa Santos",
    company: "Green Energy",
    email: "larissa@greenenergy.com",
    avatar: "LS",
    healthScore: 96,
    mrr: 18500,
    activeProjects: 5,
    tags: ["VIP", "Recorrente", "Premium"],
    status: "ativo",
    mrrTendencia: 22,
    responsavel: { nome: "Fernanda Lima", avatar: "FL" },
    ultimaInteracao: "2025-10-23T10:00:00Z"
  }
];

// Componente de Estrelas para Satisfação
const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className="relative w-5 h-5">
          <Star className="w-5 h-5 text-gray-600 absolute" />
          <div className="overflow-hidden w-1/2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star key={i} className="w-5 h-5 text-gray-600" />
      );
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

const ClientesContent = () => {
  // Usar DataContext para gerenciar clientes
  const { clients, createClient, updateClient, deleteClient } = useClients();
  const { sync } = useData();
  
  // Sincronização inteligente
  // useClientSync(); // Temporariamente desabilitado para evitar loops
  
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Usar o Context para controlar detalhes
  const { clienteAtivo, setClienteAtivo } = useCliente();

  // Converter clientes do tipo novo (Cliente) para o tipo antigo esperado pelos componentes
  const clientes = clients.map(c => ({
    id: c.id,
    name: `${c.nome} ${c.sobrenome || ''}`.trim(),
    company: c.razaoSocial || c.nomeFantasia || '',
    email: c.email,
    avatar: c.avatar || c.nome?.substring(0, 2).toUpperCase() || '??',
    healthScore: c.healthScore || 0,
    mrr: c.contrato?.valorMensal || 0,
    activeProjects: c.totalProjetos || 0,
    tags: [], // TODO: adicionar tags quando disponível
    status: (c.status === "em_analise" ? "ativo" : c.status) as "ativo" | "inativo",
    mrrTendencia: 0, // TODO: calcular tendência quando disponível
    responsavel: { nome: 'Equipe', avatar: 'EQ' }, // TODO: vincular responsável real
    ultimaInteracao: c.updatedAt || c.createdAt || new Date().toISOString()
  }));

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular todas as métricas dinamicamente
  const activeClientes = clientes.filter(c => c.status === "ativo").length;
  const avgHealthScore = clientes.length > 0
    ? Math.round(clientes.reduce((sum, c) => sum + c.healthScore, 0) / clientes.length)
    : 0;
  const satisfactionScore = 4.7; // Mantido fixo pois não temos dados de satisfação nos clientes
  const totalMRR = clientes.reduce((sum, c) => sum + c.mrr, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const handleClienteClick = (cliente: Cliente) => {
    // Encontrar dados completos do cliente
    const clienteData = mockClientes.find(c => c.id === cliente.id);
    if (clienteData) {
      // Converter para o formato novo
      const clienteCompleto: ClienteType = {
        id: clienteData.id,
        nome: clienteData.nome.split(" ")[0],
        sobrenome: clienteData.nome.split(" ").slice(1).join(" ") || undefined,
        email: clienteData.email,
        telefone: clienteData.telefone,
        cpfCnpj: clienteData.cpfCnpj,
        tipo: clienteData.tipo,
        status: clienteData.status,
        avatar: clienteData.avatar,
        healthScore: clienteData.healthScore,
        
        // Empresa
        razaoSocial: clienteData.razaoSocial,
        nomeFantasia: clienteData.nomeFantasia,
        
        // Endereço
        endereco: clienteData.endereco,
        
        // Contrato
        contrato: clienteData.contrato,
        
        // Financeiro
        saldoAtual: clienteData.saldoAtual,
        totalEntradas: clienteData.totalEntradas,
        totalSaidas: clienteData.totalSaidas,
        lucroAcumulado: clienteData.lucroAcumulado,
        
        // Observações
        observacoes: clienteData.observacoes,
        
        // Metadata
        totalProjetos: clienteData.totalProjetos,
        createdAt: clienteData.createdAt,
        updatedAt: clienteData.updatedAt,
      };
      
      setClienteAtivo(clienteCompleto);
    }
  };

  const handleDeleteCliente = (clienteId: string) => {
    console.log('🗑️ Tentando deletar cliente:', clienteId);
    try {
      deleteClient(clienteId);
      console.log('✅ Cliente deletado com sucesso:', clienteId);
      toast.success('Cliente excluído com sucesso!', {
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      toast.error('Erro ao excluir cliente', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: 5000
      });
    }
  };

  const handleAddCliente = (data: any) => {
    const novoCliente: ClienteData = {
      id: `CLI-${Date.now()}`,
      foto: data.avatar,

      // Básicos
      nome: data.nome || "",
      email: data.email || "",
      telefone: data.telefone || "",
      whatsapp: data.whatsapp,
      tipo: data.tipo || "pj",
      cpfCnpj: data.cpfCnpj || "",
      dataNascimento: data.dataNascimento,
      linkedin: data.linkedin,

      // Empresa
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia,
      segmento: data.segmento,
      porte: data.porte,
      website: data.website,
      instagram: data.instagram,

      // Endereço
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,

      // Contrato
      dataInicio: data.dataInicio || new Date().toISOString().split('T')[0],
      tipoContrato: data.tipoContrato || "Mensal",
      valorMensal: typeof data.valorMensal === 'string'
        ? parseFloat(data.valorMensal.replace(/\./g, "").replace(",", ".")) || 0
        : data.valorMensal || 0,
      status: data.status || "ativo",
      diaVencimento: data.diaVencimento,
      formaPagamento: data.formaPagamento,

      // Classificação
      responsavel: data.responsavel || "Não definido",
      responsavelAvatar: data.responsavelAvatar,
      tags: data.tags || [],
      servicos: data.servicos || [],

      // Observações
      objetivos: data.objetivos,
      observacoes: data.observacoes,

      // Calculados
      healthScore: 85, // Default inicial
      mrrTendencia: 0,
      projetosAtivos: 0,
      ultimaInteracao: new Date().toISOString()
    };

    createClient(novoCliente);
    setIsAddModalOpen(false);
  };

  // Se tem cliente ativo, mostrar detalhes
  if (clienteAtivo) {
    return (
      <DashboardLayout showHeader={false}>
        <ClienteDetalhe />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showHeader={false}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-['Poppins'] text-lg font-semibold text-white">Gestão de Clientes</h1>
          <p className="text-sm text-slate-400">
            Acompanhe clientes, projetos ativos e health score
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-white/10 text-white placeholder:text-muted"
            />
          </div>

          <Button
            variant="outline"
            size="default"
            onClick={() => setIsFilterOpen(true)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Clientes Ativos */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Total
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{activeClientes}</p>
          <p className="text-sm text-muted-foreground">Clientes Ativos</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumMiniBar data={[38, 42, 40, 45, 43, 46, 47]} />
            </div>
            <p className="text-xs text-green-400">+3 novos este mês</p>
          </div>
        </div>

        {/* Health Score */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-5 h-5 text-green-400" />
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              Bom
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{avgHealthScore}%</p>
          <p className="text-sm text-muted-foreground">Health Score</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumAreaChart data={[65, 68, 70, 72, 71, 74, 77]} color="blue" />
            </div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </div>
        </div>

        {/* Satisfação Média */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Ótimo
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">4.7/5.0</p>
          <p className="text-sm text-muted-foreground">Satisfação Média</p>
          <div className="mt-3">
            <div className="mb-2">
              <StarRating rating={satisfactionScore} />
            </div>
            <p className="text-xs text-muted-foreground">47 avaliações</p>
          </div>
        </div>

        {/* Receita Mensal (MRR) */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              MRR
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatCurrency(totalMRR)}</p>
          <p className="text-sm text-muted-foreground">Receita Mensal</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumAreaChart data={[65, 72, 68, 75, 78, 82, 89]} color="green" />
            </div>
            <p className="text-xs text-green-400">+16% vs mês anterior</p>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          onClick={() => setViewMode("grid")}
          className="gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          Grid
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          className="gap-2"
        >
          <List className="w-4 h-4" />
          Lista
        </Button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onClick={() => handleClienteClick(cliente)}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredClientes.map((cliente) => (
            <ClienteListItem
              key={cliente.id}
              cliente={cliente}
              onClick={() => handleClienteClick(cliente)}
              onDelete={handleDeleteCliente}
            />
          ))}
        </div>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={(filters) => {
          console.log("Filters applied:", filters);
          setIsFilterOpen(false);
        }}
      />

      {/* Add Cliente Modal */}
      <AddClienteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCliente}
      />

      {/* Cliente Profile Modal */}
      {/* <ClienteProfileModal
        cliente={selectedClienteData}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedClienteData(null);
        }}
      /> */}
    </DashboardLayout>
  );
};

// Exportar diretamente (Provider agora está no App.tsx)
export default ClientesContent;
