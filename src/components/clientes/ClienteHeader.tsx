import { useCliente } from "@/context/ClienteContext";
import { ClienteStatus } from "@/types/cliente";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Building2,
  User,
  MessageCircle,
  Instagram,
  Copy,
  MapPin,
  X,
  Upload,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

const statusConfig: Record<ClienteStatus, { label: string; color: string; bgColor: string }> = {
  ativo: {
    label: "Ativo",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
  },
  em_analise: {
    label: "Em Análise",
    color: "text-amber-300",
    bgColor: "bg-amber-500/10 border-amber-500/30",
  },
  inativo: {
    label: "Inativo",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10 border-slate-500/30",
  },
};

export const ClienteHeader = () => {
  const { clienteAtivo } = useCliente();

  if (!clienteAtivo) return null;

  const statusInfo = statusConfig[clienteAtivo.status];
  const initials = `${clienteAtivo.nome[0]}${clienteAtivo.sobrenome?.[0] || ""}`.toUpperCase();

  // Ações rápidas
  const handleWhatsApp = () => {
    if (!clienteAtivo.telefone) {
      toast.error("Telefone não cadastrado");
      return;
    }
    const phone = clienteAtivo.telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}`, "_blank");
  };

  const handleEmail = () => {
    if (!clienteAtivo.email) {
      toast.error("E-mail não cadastrado");
      return;
    }
    window.location.href = `mailto:${clienteAtivo.email}`;
  };

  const handlePhone = () => {
    if (!clienteAtivo.telefone) {
      toast.error("Telefone não cadastrado");
      return;
    }
    window.location.href = `tel:${clienteAtivo.telefone}`;
  };

  const handleCopyInfo = () => {
    const info = `
${clienteAtivo.nome} ${clienteAtivo.sobrenome || ""}
${clienteAtivo.email}
${clienteAtivo.telefone || ""}
${clienteAtivo.cpfCnpj || ""}
    `.trim();
    navigator.clipboard.writeText(info);
    toast.success("Informações copiadas!");
  };

  const handleMaps = () => {
    if (!clienteAtivo.endereco?.cidade) {
      toast.error("Endereço não cadastrado");
      return;
    }
    const endereco = `${clienteAtivo.endereco.logradouro || ""} ${clienteAtivo.endereco.numero || ""}, ${clienteAtivo.endereco.cidade || ""}, ${clienteAtivo.endereco.estado || ""}`;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(endereco)}`, "_blank");
  };

  // Calcular cor do Health Score
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="glass-card p-4">
      {/* Avatar Centralizado */}
      <div className="flex flex-col items-center mb-4">
        <div
          className="relative mb-3 group cursor-pointer"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
              const file = files[0];
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setClienteAtivo({
                    ...clienteAtivo,
                    avatar: event.target?.result as string,
                  });
                  toast.success("Foto atualizada!");
                };
                reader.readAsDataURL(file);
              } else {
                toast.error("Por favor, arraste uma imagem");
              }
            }
          }}
        >
          <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center border-4 border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:border-primary/50 transition-all">
            {clienteAtivo.avatar ? (
              <img
                src={clienteAtivo.avatar}
                alt={clienteAtivo.nome}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">{initials}</span>
            )}
          </div>
          
          {/* Overlay com X para remover */}
          {clienteAtivo.avatar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setClienteAtivo({
                  ...clienteAtivo,
                  avatar: undefined,
                });
                toast.success("Foto removida");
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-8 h-8 text-white" />
            </button>
          )}
          
          {/* Indicador de drag */}
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Upload className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Nome */}
        <h1 className="text-lg font-bold text-white text-center mb-1">
          {clienteAtivo.nome} {clienteAtivo.sobrenome}
        </h1>
        
        {/* Nome da Empresa */}
        {clienteAtivo.tipo === "PJ" && (clienteAtivo.nomeFantasia || clienteAtivo.razaoSocial) && (
          <p className="text-xs text-slate-400 text-center mb-2">
            {clienteAtivo.nomeFantasia || clienteAtivo.razaoSocial}
          </p>
        )}
        
        {clienteAtivo.apelido && (
          <p className="text-xs text-slate-500 mb-2">"{clienteAtivo.apelido}"</p>
        )}

        {/* Status Badge */}
        <Badge
          className={cn(
            "border text-xs font-semibold mb-2",
            statusInfo.bgColor,
            statusInfo.color
          )}
        >
          {statusInfo.label}
        </Badge>

        {/* Health Score Pequeno */}
        {clienteAtivo.healthScore !== undefined && (
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
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
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${clienteAtivo.healthScore}, 100`}
                  className={getHealthScoreColor(clienteAtivo.healthScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-xs font-bold", getHealthScoreColor(clienteAtivo.healthScore))}>
                  {clienteAtivo.healthScore}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400">Health Score</span>
          </div>
        )}
      </div>

      {/* Informações de Contato */}
      <div className="space-y-1.5 pt-3 border-t border-white/10">
        {clienteAtivo.email && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Mail className="w-4 h-4 flex-shrink-0 text-slate-400" />
            <span className="truncate">{clienteAtivo.email}</span>
          </div>
        )}
        {clienteAtivo.telefone && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
            <span>{clienteAtivo.telefone}</span>
          </div>
        )}
        {/* Tipo */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {clienteAtivo.tipo === "PJ" ? (
            <>
              <Building2 className="w-3.5 h-3.5" />
              <span>Pessoa Jurídica</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5" />
              <span>Pessoa Física</span>
            </>
          )}
        </div>
        {clienteAtivo.cpfCnpj && (
          <p className="text-xs text-slate-400 truncate">{clienteAtivo.cpfCnpj}</p>
        )}
      </div>

      {/* Mini Botões de Ação Rápida */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Ações Rápidas
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all"
            title="Abrir WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-emerald-300">WhatsApp</span>
          </button>

          {/* Email */}
          <button
            onClick={handleEmail}
            className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all"
            title="Enviar e-mail"
          >
            <Mail className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-blue-300">E-mail</span>
          </button>

          {/* Telefone */}
          <button
            onClick={handlePhone}
            className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all"
            title="Ligar"
          >
            <Phone className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-purple-300">Ligar</span>
          </button>

          {/* Maps */}
          <button
            onClick={handleMaps}
            className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
            title="Ver no Maps"
          >
            <MapPin className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-red-300">Maps</span>
          </button>

          {/* Copiar Info */}
          <button
            onClick={handleCopyInfo}
            className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-slate-500/20 bg-slate-500/5 hover:bg-slate-500/10 hover:border-slate-500/40 transition-all"
            title="Copiar informações"
          >
            <Copy className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-slate-300">Copiar</span>
          </button>

          {/* Instagram (placeholder - adicionar campo no futuro) */}
          <button
            onClick={() => toast.info("Instagram não cadastrado")}
            className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 hover:border-pink-500/40 transition-all"
            title="Abrir Instagram"
          >
            <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-pink-300">Instagram</span>
          </button>
        </div>
      </div>
    </div>
  );
};

