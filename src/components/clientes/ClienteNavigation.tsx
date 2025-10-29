import { useCliente } from "@/context/ClienteContext";
import { ClienteTab } from "@/types/cliente";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import {
  FileText,
  FileSignature,
  DollarSign,
  FolderOpen,
  StickyNote,
  Trash2,
  ArrowLeft,
  Folder,
} from "lucide-react";

interface TabConfig {
  id: ClienteTab;
  label: string;
  icon: typeof FileText;
}

const tabs: TabConfig[] = [
  {
    id: "informacoes",
    label: "Informações",
    icon: FileText,
  },
  {
    id: "contrato",
    label: "Contrato",
    icon: FileSignature,
  },
  {
    id: "projetos",
    label: "Projetos",
    icon: Folder,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: DollarSign,
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FolderOpen,
  },
  {
    id: "observacoes",
    label: "Observações",
    icon: StickyNote,
  },
];

export const ClienteNavigation = () => {
  const { activeTab, setActiveTab, clienteAtivo, setClienteAtivo } = useCliente();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      toast.warning("Clique novamente para confirmar exclusão", {
        description: "Esta ação não pode ser desfeita",
      });
      return;
    }

    // TODO: Verificar se tem contrato ativo
    if (clienteAtivo?.contrato?.status === "ativo") {
      toast.error("Não é possível excluir cliente com contrato ativo");
      setShowDeleteConfirm(false);
      return;
    }

    toast.success("Cliente excluído com sucesso");
    setClienteAtivo(null);
  };

  const handleBack = () => {
    setClienteAtivo(null);
  };

  return (
    <div className="glass-card p-2 mb-4">
      <div className="flex items-center gap-1">
        {/* Botão Voltar */}
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
          title="Voltar para lista"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Separador pequeno */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Abas de Navegação */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold whitespace-nowrap",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && "glow-primary")} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Separador */}
        <div className="flex-1" />

        {/* Botão Excluir */}
        <button
          onClick={handleDelete}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold",
            showDeleteConfirm
              ? "border border-rose-500/50 bg-rose-500/20 text-rose-300 animate-pulse"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
          )}
        >
          <Trash2 className="w-4 h-4" />
          {showDeleteConfirm ? "Confirmar?" : "Excluir"}
        </button>
      </div>
    </div>
  );
};

