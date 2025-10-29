import { useCliente } from "@/context/ClienteContext";
import { ClienteTab } from "@/types/cliente";
import { cn } from "@/lib/utils";
import {
  FileText,
  FileSignature,
  DollarSign,
  FolderOpen,
  StickyNote,
} from "lucide-react";

interface TabConfig {
  id: ClienteTab;
  label: string;
  icon: typeof FileText;
  description: string;
}

const tabs: TabConfig[] = [
  {
    id: "informacoes",
    label: "Informações Básicas",
    icon: FileText,
    description: "Dados gerais e contato",
  },
  {
    id: "contrato",
    label: "Contrato",
    icon: FileSignature,
    description: "Dados contratuais",
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: DollarSign,
    description: "Movimentações e saldo",
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FolderOpen,
    description: "Arquivos e uploads",
  },
  {
    id: "observacoes",
    label: "Observações",
    icon: StickyNote,
    description: "Anotações internas",
  },
];

export const ClienteSidebar = () => {
  const { activeTab, setActiveTab } = useCliente();

  return (
    <nav className="glass-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 px-3">
        Navegação
      </h3>
      <div className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 mt-0.5",
                  isActive ? "text-primary glow-primary" : "text-slate-400"
                )}
              />
              <div className="flex-1 text-left">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-white" : "text-slate-300"
                  )}
                >
                  {tab.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};






