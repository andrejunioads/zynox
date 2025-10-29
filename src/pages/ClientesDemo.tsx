/**
 * EXEMPLO DE PÁGINA CLIENTES COM SISTEMA INTEGRADO
 * 
 * Esta é uma demonstração de como integrar o novo sistema de detalhes
 * de cliente com a lista existente.
 * 
 * Para usar:
 * 1. Wrap a aplicação com ClienteProvider
 * 2. Use useCliente() para controlar navegação
 * 3. Alterne entre lista e detalhes conforme clienteAtivo
 */

import { DashboardLayout } from "@/components/DashboardLayout";
import { ClienteProvider, useCliente } from "@/context/ClienteContext";
import { ClienteDetalhe } from "@/components/clientes/ClienteDetalhe";
import { ArrowLeft, Plus } from "lucide-react";
import { Cliente as ClienteType } from "@/types/cliente";

// Mock de clientes para demonstração
const mockClientes: ClienteType[] = [
  {
    id: "1",
    nome: "João",
    sobrenome: "Silva",
    email: "joao@empresa.com",
    tipo: "PJ",
    status: "ativo",
    healthScore: 92,
    telefone: "(11) 98765-4321",
    cpfCnpj: "12.345.678/0001-90",
    saldoAtual: 15000,
    totalEntradas: 50000,
    totalSaidas: 35000,
    endereco: {
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1578",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
    },
    contrato: {
      dataInicio: "2025-01-01",
      tipo: "recorrente",
      valorMensal: 5000,
      diaVencimento: 10,
      formaPagamento: "pix",
      status: "ativo",
    },
    observacoes: "Cliente preferencial, sempre pontual.",
  },
  {
    id: "2",
    nome: "Maria",
    sobrenome: "Santos",
    email: "maria@startup.com",
    tipo: "PJ",
    status: "ativo",
    healthScore: 88,
    telefone: "(21) 91234-5678",
    saldoAtual: 12000,
    totalEntradas: 36000,
    totalSaidas: 24000,
  },
];

function ClientesContent() {
  const { clienteAtivo, setClienteAtivo } = useCliente();

  // Se tem cliente ativo, mostra detalhes
  if (clienteAtivo) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <button
            onClick={() => setClienteAtivo(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Lista
          </button>
        </div>
        <ClienteDetalhe />
      </DashboardLayout>
    );
  }

  // Senão, mostra lista
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Clientes</h1>
            <p className="text-sm text-slate-400 mt-1">
              Gerencie seus clientes e contratos
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>

        {/* Lista de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockClientes.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => setClienteAtivo(cliente)}
              className="glass-card p-5 hover:border-primary/30 transition cursor-pointer group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-lg">
                  {cliente.nome[0]}{cliente.sobrenome?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary transition">
                    {cliente.nome} {cliente.sobrenome}
                  </h3>
                  <p className="text-sm text-slate-400">{cliente.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-16">
                    {cliente.healthScore && (
                      <svg viewBox="0 0 36 36" className="transform -rotate-90">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#00C6FF"
                          strokeWidth="3"
                          strokeDasharray={`${cliente.healthScore}, 100`}
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{cliente.healthScore}%</p>
                    <p className="text-xs text-slate-400">Health Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(cliente.saldoAtual || 0)}
                  </p>
                  <p className="text-xs text-slate-400">Saldo</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Página final com Provider
export default function ClientesDemo() {
  return (
    <ClienteProvider>
      <ClientesContent />
    </ClienteProvider>
  );
}






