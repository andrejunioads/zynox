import { useCliente } from "@/context/ClienteContext";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Save, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const ClienteSaveButton = () => {
  const { clienteAtivo, hasUnsavedChanges, setHasUnsavedChanges } = useCliente();
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    if (!clienteAtivo || !hasUnsavedChanges) return;

    setIsSaving(true);

    try {
      // TODO: Enviar dados para API
      // await fetch(`/api/clientes/${clienteAtivo.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(clienteAtivo)
      // });

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      setJustSaved(true);
      toast.success("Alterações salvas com sucesso!");

      // Resetar indicador de "salvo recentemente" após 2 segundos
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      toast.error("Erro ao salvar alterações");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Não mostrar se não há cliente ativo
  if (!clienteAtivo) return null;

  return (
    <button
      onClick={handleSave}
      disabled={!hasUnsavedChanges || isSaving}
      className={cn(
        "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm",
        hasUnsavedChanges && !isSaving
          ? "border border-primary/30 bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          : justSaved
          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border border-white/5 bg-white/5 text-slate-500 cursor-not-allowed"
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Salvando...</span>
        </>
      ) : justSaved ? (
        <>
          <Check className="w-4 h-4" />
          <span>Salvo!</span>
        </>
      ) : hasUnsavedChanges ? (
        <>
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </>
      ) : (
        <>
          <Check className="w-4 h-4" />
          <span>Sem Alterações</span>
        </>
      )}
    </button>
  );
};






