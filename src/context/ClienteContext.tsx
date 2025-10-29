import { createContext, useContext, useState, ReactNode } from "react";
import { Cliente, ClienteTab } from "@/types/cliente";

interface ClienteContextType {
  clienteAtivo: Cliente | null;
  setClienteAtivo: (cliente: Cliente | null) => void;
  activeTab: ClienteTab;
  setActiveTab: (tab: ClienteTab) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  refreshCliente: () => Promise<void>;
}

const ClienteContext = createContext<ClienteContextType | undefined>(undefined);

export const ClienteProvider = ({ children }: { children: ReactNode }) => {
  const [clienteAtivo, setClienteAtivo] = useState<Cliente | null>(null);
  const [activeTab, setActiveTab] = useState<ClienteTab>("informacoes");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const refreshCliente = async () => {
    if (!clienteAtivo) return;
    
    setIsLoading(true);
    try {
      // TODO: Buscar dados atualizados do cliente
      // const response = await fetch(`/api/clientes/${clienteAtivo.id}`);
      // const data = await response.json();
      // setClienteAtivo(data);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClienteContext.Provider
      value={{
        clienteAtivo,
        setClienteAtivo,
        activeTab,
        setActiveTab,
        isLoading,
        setIsLoading,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        refreshCliente,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
};

export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error("useCliente deve ser usado dentro de ClienteProvider");
  }
  return context;
};

