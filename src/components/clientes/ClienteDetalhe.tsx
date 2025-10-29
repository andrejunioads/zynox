import { useCliente } from "@/context/ClienteContext";
import { ClienteHeader } from "./ClienteHeader";
import { ClienteSaveButton } from "./ClienteSaveButton";
import { ClienteNavigation } from "./ClienteNavigation";
import { ClienteInfo } from "./ClienteInfo";
import { ClienteContrato } from "./ClienteContrato";
import { ClienteProjetos } from "./ClienteProjetos";
import { ClienteFinanceiro } from "./ClienteFinanceiro";
import { ClienteDocumentos } from "./ClienteDocumentos";
import { ClienteObservacoes } from "./ClienteObservacoes";
import { Loader2 } from "lucide-react";

export const ClienteDetalhe = () => {
  const { clienteAtivo, activeTab, isLoading } = useCliente();

  if (!clienteAtivo) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="text-center">
          <p className="text-lg text-white/60">Nenhum cliente selecionado</p>
          <p className="text-sm text-white/40 mt-2">
            Selecione um cliente para visualizar os detalhes
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "informacoes":
        return <ClienteInfo />;
      case "contrato":
        return <ClienteContrato />;
      case "projetos":
        return <ClienteProjetos />;
      case "financeiro":
        return <ClienteFinanceiro />;
      case "documentos":
        return <ClienteDocumentos />;
      case "observacoes":
        return <ClienteObservacoes />;
      default:
        return <ClienteInfo />;
    }
  };

  return (
    <div className="relative mx-auto max-w-[1400px] h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-full">
        {/* Coluna Esquerda - Header do Cliente + Botão Salvar */}
        <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin h-full">
          <ClienteHeader />
          <ClienteSaveButton />
        </div>

        {/* Coluna Direita - Navegação + Conteúdo */}
        <div className="flex flex-col h-full min-h-0">
          {/* Navegação Horizontal */}
          <ClienteNavigation />

          {/* Conteúdo Dinâmico */}
          <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

