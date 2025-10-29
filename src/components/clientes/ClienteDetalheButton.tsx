import { useCliente } from "@/context/ClienteContext";
import { Cliente as OldCliente } from "./ClienteCard";
import { Cliente as ClienteType } from "@/types/cliente";
import { Eye } from "lucide-react";

interface ClienteDetalheButtonProps {
  cliente: OldCliente;
}

/**
 * Botão para abrir os detalhes do cliente
 * Converte do formato antigo (ClienteCard) para o novo formato (ClienteType)
 */
export const ClienteDetalheButton = ({ cliente }: ClienteDetalheButtonProps) => {
  const { setClienteAtivo } = useCliente();

  const handleOpenDetalhes = () => {
    // Converte do formato antigo para o novo
    const clienteCompleto: ClienteType = {
      id: cliente.id,
      nome: cliente.name.split(" ")[0],
      sobrenome: cliente.name.split(" ").slice(1).join(" "),
      email: cliente.email,
      tipo: "PJ", // Assumindo PJ se tem company
      status: cliente.status === "ativo" ? "ativo" : cliente.status === "risco" ? "em_analise" : "inativo",
      avatar: cliente.avatar,
      healthScore: cliente.healthScore,
      telefone: undefined, // Não disponível no formato antigo
      cpfCnpj: undefined,
      
      // Financeiro
      saldoAtual: cliente.mrr,
      totalEntradas: cliente.mrr * 12, // Estimativa anual
      totalSaidas: 0,
      lucroAcumulado: cliente.mrr * 12,
      
      // Metadata
      totalProjetos: cliente.activeProjects,
      createdAt: new Date().toISOString(),
      updatedAt: cliente.ultimaInteracao,
    };

    setClienteAtivo(clienteCompleto);
  };

  return (
    <button
      onClick={handleOpenDetalhes}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-semibold"
    >
      <Eye className="w-4 h-4" />
      Ver Detalhes
    </button>
  );
};






