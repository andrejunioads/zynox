import { useCliente } from "@/context/ClienteContext";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { Save, Edit3, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const ClienteObservacoes = () => {
  const { clienteAtivo, setClienteAtivo, setHasUnsavedChanges } = useCliente();
  const [observacoes, setObservacoes] = useState(clienteAtivo?.observacoes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (clienteAtivo) {
      setObservacoes(clienteAtivo.observacoes || "");
      setCharCount(clienteAtivo.observacoes?.length || 0);
    }
  }, [clienteAtivo]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [observacoes]);

  // Auto-save após 3 segundos
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [observacoes, hasChanges]);

  const handleChange = (value: string) => {
    setObservacoes(value);
    setCharCount(value.length);
    setHasChanges(true);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // TODO: Salvar na API
      // await fetch(`/api/clientes/${clienteAtivo?.id}/observacoes`, {
      //   method: 'PUT',
      //   body: JSON.stringify({ observacoes })
      // });

      if (clienteAtivo) {
        setClienteAtivo({
          ...clienteAtivo,
          observacoes,
          updatedAt: new Date().toISOString(),
        });
      }

      setHasChanges(false);
      toast.success("Observações salvas automaticamente");
    } catch (error) {
      toast.error("Erro ao salvar observações");
    } finally {
      setIsSaving(false);
    }
  };

  const lastUpdate = clienteAtivo?.updatedAt
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(clienteAtivo.updatedAt))
    : "Nunca";

  return (
    <div className="space-y-6">
      {/* Campo de Observações */}
      <div className="glass-card p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white">
              Anotações Internas
            </label>
            <span className="text-xs text-slate-400">
              {charCount} caracteres
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={observacoes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Adicione observações, detalhes ou insights sobre o cliente…

Exemplo:
• Cliente preferencial, sempre pontual nos pagamentos
• Interessado em expandir o contrato para outros serviços
• Contato preferencial: WhatsApp após 18h"
            className={cn(
              "w-full min-h-[300px] max-h-[600px] px-4 py-3 rounded-xl",
              "bg-[#0B0C10]/80 border border-white/10",
              "text-white text-sm leading-relaxed",
              "placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
              "resize-none transition-all",
              "shadow-inner"
            )}
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,0.02) 24px, rgba(255,255,255,0.02) 25px)",
            }}
          />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            <span>
              Última edição: <span className="text-white">Sistema</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{lastUpdate}</span>
          </div>
        </div>
      </div>

      {/* Botão Manual de Salvar */}
      {hasChanges && !isSaving && (
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
        >
          <span className="flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Salvar Observações Agora
          </span>
        </button>
      )}
    </div>
  );
};

