import { useEffect, useRef, useState, FormEvent, DragEvent, MouseEvent, ChangeEvent } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { useUser } from "@/context/UserContext";
import { useUsuarios } from "@/contexts/DataContext";
import { useProfileTeamSync } from "@/hooks/useProfileTeamSync";
import { UserRound, XCircle, Bell, Send, Check, AlertCircle, Loader2, ExternalLink, RefreshCw, Phone, MessageCircle, Instagram, IdCard, Briefcase, MapPin, Calendar } from "lucide-react";
import { webhookService } from "@/services/notificationWebhookService";
import { notificationScheduler } from "@/services/notificationScheduler";
import { automationEngine } from "@/services/automationEngine";

const sidebarTabs = [
  "Perfil",
  "Segurança",
  "Notificações",
  "Integrações",
  "Sessões",
  "Aparência",
];

const DEFAULT_AVATAR: string | null = null;

type FormState = {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  cpf: string;
  cargo: string;
  departamento: string;
  dataNascimento: string;
  endereco: string;
};

const inputBaseClasses =
  "w-full rounded-xl border border-white/10 bg-[#121317]/90 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

const sidebarButtonClasses =
  "w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium transition-colors";

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState("Perfil");
  const { user, updateUser } = useUser();
  const { usuarios, updateUsuario, getUsuario } = useUsuarios();
  
  // ✅ SINCRONIZAÇÃO AUTOMÁTICA: Hook de sincronização bidirecional
  const { syncProfileToTeam, usuarioAtual, isSynced } = useProfileTeamSync();
  
  const [formState, setFormState] = useState<FormState>(() => ({
    firstName: usuarioAtual?.nome || user.firstName,
    lastName: usuarioAtual?.sobrenome || user.lastName,
    nickname: user.nickname,
    email: usuarioAtual?.email || user.email,
    phone: usuarioAtual?.phone || '',
    whatsapp: usuarioAtual?.whatsapp || '',
    instagram: usuarioAtual?.instagram || '',
    cpf: usuarioAtual?.cpf || '',
    cargo: usuarioAtual?.cargo || '',
    departamento: usuarioAtual?.departamento || '',
    dataNascimento: usuarioAtual?.dataNascimento || '',
    endereco: usuarioAtual?.endereco?.rua || '',
  }));
  const [preview, setPreview] = useState<string | null>(() => usuarioAtual?.photoUrl || user.avatarUrl || DEFAULT_AVATAR);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Estados para Notificações
  const [webhookUrl, setWebhookUrl] = useState(() => webhookService.getWebhookUrl() || '');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isReinstallingAutomations, setIsReinstallingAutomations] = useState(false);
  const [isRunningManualCheck, setIsRunningManualCheck] = useState(false);

  const handleInputChange = (key: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleZoneClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;
    handleUploadClick();
  };

  const updatePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updatePreview(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      updatePreview(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = event.dataTransfer.files;
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleRemovePhoto = () => {
    setPreview(DEFAULT_AVATAR);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handlers para Notificações
  const handleSaveWebhook = () => {
    webhookService.setWebhookUrl(webhookUrl);
    webhookService.setEnabled(true);
    
    toast.success('Webhook configurado!', {
      description: 'URL do webhook salva com sucesso',
      style: {
        background: 'rgba(37, 211, 102, 0.15)',
        color: '#25D366',
        border: '1px solid rgba(37, 211, 102, 0.3)',
        backdropFilter: 'blur(10px)'
      }
    });
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Webhook não configurado', {
        description: 'Por favor, adicione uma URL válida antes de testar'
      });
      return;
    }

    setIsTestingWebhook(true);
    setWebhookStatus('idle');

    try {
      const result = await webhookService.sendTestNotification();
      
      if (result.success) {
        setWebhookStatus('success');
        toast.success('Teste enviado!', {
          description: result.message,
          style: {
            background: 'rgba(37, 211, 102, 0.15)',
            color: '#25D366',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            backdropFilter: 'blur(10px)'
          }
        });
      } else {
        setWebhookStatus('error');
        toast.error('Erro no teste', {
          description: result.message
        });
      }
    } catch (error) {
      setWebhookStatus('error');
      toast.error('Erro ao testar webhook', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsTestingWebhook(false);
      setTimeout(() => setWebhookStatus('idle'), 3000);
    }
  };

  const handleManualCheck = async () => {
    setIsRunningManualCheck(true);

    try {
      await notificationScheduler.runManualCheck();
      
      toast.success('Verificação completa!', {
        description: 'Sistema verificado. Notificações enviadas se necessário.',
        style: {
          background: 'rgba(37, 211, 102, 0.15)',
          color: '#25D366',
          border: '1px solid rgba(37, 211, 102, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      });
    } catch (error) {
      toast.error('Erro na verificação', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsRunningManualCheck(false);
    }
  };

  const handleReinstallAutomations = () => {
    setIsReinstallingAutomations(true);

    try {
      // Deletar automações do sistema antigas
      automationEngine.deleteSystemAutomations();
      
      // Remover flag de instalação
      localStorage.removeItem('zynox_system_automations_installed');
      
      toast.info('🔄 Reinstalando automações...', {
        description: 'As automações antigas foram removidas. Recarregando...',
        duration: 2000,
      });

      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error('Erro ao reinstalar', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      setIsReinstallingAutomations(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // ✅ Atualizar UserContext (antigo)
    updateUser({
      firstName: formState.firstName,
      lastName: formState.lastName,
      nickname: formState.nickname,
      email: formState.email,
      avatarUrl: preview,
    });
    
    // ✅ SINCRONIZAÇÃO AUTOMÁTICA: Perfil → Equipe
    syncProfileToTeam({
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      avatarUrl: preview || undefined,
      phone: formState.phone,
      whatsapp: formState.whatsapp,
      instagram: formState.instagram,
      cpf: formState.cpf,
      cargo: formState.cargo,
      departamento: formState.departamento,
      dataNascimento: formState.dataNascimento,
      endereco: formState.endereco,
    });
    
    toast.success("✅ Perfil atualizado!", {
      description: isSynced 
        ? "Todos os dados foram sincronizados automaticamente com a equipe" 
        : "Sincronização em andamento...",
      position: "bottom-right",
      style: {
        background: "#12261c",
        color: "#d9f7e5",
        border: "1px solid rgba(34,197,94,0.35)",
        boxShadow: "0 14px 32px rgba(22, 163, 74, 0.35)",
      },
    });
  };

  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  }, []);

  const tabMetadata: Record<string, { title: string; description: string }> = {
    Perfil: {
      title: "Editar perfil",
      description: "Atualize seus dados pessoais, forma de contato e imagem de exibição.",
    },
    Segurança: {
      title: "Segurança",
      description: "Gerencie autenticação em duas etapas, senhas e dispositivos confiáveis.",
    },
    Notificações: {
      title: "Notificações",
      description: "Escolha como deseja receber alertas e lembretes do painel Zynox.",
    },
    Integrações: {
      title: "Integrações",
      description: "Conecte ferramentas externas e sincronize dados automaticamente com o painel Zynox.",
    },
    Sessões: {
      title: "Sessões ativas",
      description: "Veja e encerre sessões abertas em outros dispositivos ou navegadores.",
    },
    Aparência: {
      title: "Aparência",
      description: "Personalize o tema, tipografia e comportamento visual do painel.",
    },
  };

  const currentTabMeta =
    tabMetadata[activeTab] ?? {
      title: activeTab,
      description: "Configure as opções disponíveis para esta seção.",
    };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "Perfil":
        return (
          <form onSubmit={handleSubmit} className="mt-6 space-y-8">
            <div
              className={cn(
                "rounded-2xl border border-dashed border-primary/30 bg-[#101218]/80 p-6 transition-all",
                "flex flex-col gap-6 md:flex-row md:items-center",
                isDragging && "border-primary/60 bg-primary/10"
              )}
              onClick={handleZoneClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              role="presentation"
            >
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-primary/35 bg-[#0B0C10] shadow-[0_0_25px_rgba(59,130,246,0.18)]">
                {preview ? (
                  <img
                    src={preview}
                    alt="Pré-visualização da foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/10 to-[#0d101a]">
                    <UserRound className="h-10 w-10 text-slate-500" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Atualize sua foto de perfil
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG ou WebP — até 5MB. Arraste e solte ou clique para selecionar.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-light transition hover:bg-primary/25"
                  >
                    Fazer upload
                  </button>
                  {preview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/10"
                    >
                      <XCircle className="h-4 w-4 text-rose-400" aria-hidden="true" />
                      Remover
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Nome
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Digite seu nome"
                  value={formState.firstName}
                  onChange={(event) => handleInputChange("firstName", event.target.value)}
                  className={inputBaseClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Sobrenome
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Digite seu sobrenome"
                  value={formState.lastName}
                  onChange={(event) => handleInputChange("lastName", event.target.value)}
                  className={inputBaseClasses}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="nickname" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Apelido
                </label>
                <input
                  id="nickname"
                  type="text"
                  placeholder="Como prefere ser chamado?"
                  value={formState.nickname}
                  onChange={(event) => handleInputChange("nickname", event.target.value)}
                  className={inputBaseClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="exemplo@zynox.com.br"
                  value={formState.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  className={inputBaseClasses}
                />
              </div>
            </div>

            {/* ✅ NOVOS CAMPOS: Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Informações de Contato
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="phone" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formState.phone}
                    onChange={(event) => handleInputChange("phone", event.target.value)}
                    className={inputBaseClasses}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 text-green-400" />
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formState.whatsapp}
                    onChange={(event) => handleInputChange("whatsapp", event.target.value)}
                    className={inputBaseClasses}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="instagram" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Instagram className="w-3 h-3 text-pink-400" />
                    Instagram
                  </label>
                  <input
                    id="instagram"
                    type="text"
                    placeholder="@seuperfil"
                    value={formState.instagram}
                    onChange={(event) => handleInputChange("instagram", event.target.value)}
                    className={inputBaseClasses}
                  />
                </div>
              </div>
            </div>

            {/* ✅ NOVOS CAMPOS: Dados Profissionais */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Dados Profissionais
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="cargo" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Cargo
                  </label>
                  <select
                    id="cargo"
                    value={formState.cargo}
                    onChange={(event) => handleInputChange("cargo", event.target.value)}
                    className={inputBaseClasses}
                  >
                    <option value="">Selecione um cargo</option>
                    <option value="comercial">Comercial</option>
                    <option value="desenvolvedor">Desenvolvedor</option>
                    <option value="designer">Designer</option>
                    <option value="gerente">Gerente de Projetos</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="departamento" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Departamento
                  </label>
                  <select
                    id="departamento"
                    value={formState.departamento}
                    onChange={(event) => handleInputChange("departamento", event.target.value)}
                    className={inputBaseClasses}
                  >
                    <option value="">Selecione um departamento</option>
                    <option value="comercial">Comercial</option>
                    <option value="dev">Desenvolvimento</option>
                    <option value="design">Design</option>
                    <option value="admin">Administração</option>
                    <option value="financeiro">Financeiro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ✅ NOVOS CAMPOS: Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <IdCard className="w-4 h-4 text-primary" />
                Dados Pessoais
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="cpf" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    CPF
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formState.cpf}
                    onChange={(event) => handleInputChange("cpf", event.target.value)}
                    className={inputBaseClasses}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dataNascimento" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    Data de Nascimento
                  </label>
                  <input
                    id="dataNascimento"
                    type="date"
                    value={formState.dataNascimento}
                    onChange={(event) => handleInputChange("dataNascimento", event.target.value)}
                    className={inputBaseClasses}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="endereco" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-red-400" />
                    Endereço
                  </label>
                  <input
                    id="endereco"
                    type="text"
                    placeholder="Rua, número, bairro, cidade, estado"
                    value={formState.endereco}
                    onChange={(event) => handleInputChange("endereco", event.target.value)}
                    className={inputBaseClasses}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* ✅ INDICADOR DE SINCRONIZAÇÃO */}
              <div className="flex items-center gap-2 text-xs">
                {isSynced ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span>Sincronizado com a equipe</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    <span>Sincronizando...</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-primary to-primary-light px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(59,130,246,0.35)] transition hover:shadow-[0_18px_48px_rgba(59,130,246,0.45)]"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        );
      case "Notificações":
        return (
          <div className="mt-6 space-y-6">
            {/* Card de configuração do Webhook */}
            <div className="rounded-2xl border border-white/10 bg-[#0E0F13]/90 p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/15 p-3">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Webhook n8n</h3>
                  <p className="text-sm text-slate-400">
                    Configure um webhook do n8n para receber todos os eventos de notificação do sistema automaticamente.
                  </p>
                </div>
              </div>

              {/* Input Webhook URL */}
              <div className="space-y-2">
                <label htmlFor="webhookUrl" className="font-['Poppins'] text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  URL do Webhook
                </label>
                <div className="relative">
                  <input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://seu-n8n.com/webhook/zynox-push"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className={cn(
                      inputBaseClasses,
                      webhookStatus === 'success' && 'border-green-500/50 ring-2 ring-green-500/25',
                      webhookStatus === 'error' && 'border-red-500/50 ring-2 ring-red-500/25'
                    )}
                  />
                  {webhookStatus === 'success' && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {webhookStatus === 'error' && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Cole aqui a URL do webhook criado no n8n. Exemplo: https://n8n.cloud/webhook/abc123
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveWebhook}
                  disabled={!webhookUrl}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                    "bg-primary/15 text-primary border border-primary/40",
                    "hover:bg-primary/25 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  Salvar Webhook
                </button>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={!webhookUrl || isTestingWebhook}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all inline-flex items-center gap-2",
                    "bg-white/5 text-white border border-white/10",
                    "hover:bg-white/10 hover:border-primary/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isTestingWebhook ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Testar Notificação
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card de Eventos Suportados */}
            <div className="rounded-2xl border border-white/10 bg-[#0E0F13]/90 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Eventos Enviados Automaticamente
                </h3>
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isRunningManualCheck}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all inline-flex items-center gap-1.5",
                    "bg-white/5 text-slate-300 border border-white/10",
                    "hover:bg-white/10 hover:border-primary/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isRunningManualCheck ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Verificar Agora
                    </>
                  )}
                </button>

                <button
                  onClick={handleReinstallAutomations}
                  disabled={isReinstallingAutomations}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all inline-flex items-center gap-1.5",
                    "bg-primary/10 text-primary border border-primary/30",
                    "hover:bg-primary/20 hover:border-primary/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isReinstallingAutomations ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Reinstalando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Reinstalar Automações
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: '🚀', label: 'Novo Lead', desc: 'Quando um lead é criado' },
                  { icon: '📊', label: 'Mudança de Etapa', desc: 'Quando um lead muda de status' },
                  { icon: '⏰', label: 'Follow-up Atrasado', desc: 'Verificado a cada 4 horas' },
                  { icon: '🎂', label: 'Aniversários', desc: 'Verificado diariamente (9h)' },
                  { icon: '⚠️', label: 'Contratos Vencendo', desc: '30, 15, 7 e 3 dias antes' },
                  { icon: '📁', label: 'Prazos de Projetos', desc: '7, 3, 1 dia e no dia' },
                  { icon: '😴', label: 'Clientes Inativos', desc: '30, 60 e 90 dias sem contato' },
                  { icon: '💰', label: 'Pagamentos', desc: 'Quando recebido' },
                  { icon: '💸', label: 'Despesas', desc: 'Quando registrada' },
                  { icon: '👥', label: 'Equipe', desc: 'Novos membros' },
                  { icon: '✅', label: 'Tarefas', desc: 'Criadas e concluídas' },
                  { icon: '📅', label: 'Reuniões', desc: 'Lembretes personalizados' },
                ].map((event) => (
                  <div
                    key={event.label}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 transition"
                  >
                    <span className="text-2xl">{event.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.label}</p>
                      <p className="text-xs text-slate-400">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-400">
                  ⏰ <strong>Sistema Automático:</strong> Verificações executadas automaticamente a cada hora. Use o botão "Verificar Agora" para testar manualmente.
                </p>
              </div>
            </div>

            {/* Card de Ajuda */}
            <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/20 p-2">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-2">Como configurar?</h4>
                  <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                    <li>Crie um workflow no n8n com um node <strong>Webhook</strong></li>
                    <li>Copie a URL do webhook (ex: https://n8n.cloud/webhook/abc123)</li>
                    <li>Cole a URL acima e clique em <strong>Salvar Webhook</strong></li>
                    <li>Clique em <strong>Testar Notificação</strong> para verificar</li>
                    <li>Pronto! Todos os eventos serão enviados automaticamente 🎉</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-4">
                    💡 <strong>Dica:</strong> Use o arquivo <code className="px-2 py-1 bg-white/10 rounded text-primary">pushover-n8n-workflow.json</code> para importar um workflow pronto!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "Integrações":
        return (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-dashed border-primary/15 bg-[#0B0C10]/60 p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Integrações em breve</h3>
                  <p className="text-sm text-slate-400 max-w-md">
                    Estamos trabalhando para trazer integrações com suas ferramentas favoritas: 
                    Slack, Google Workspace, Microsoft 365, Trello, Asana, HubSpot, Zapier e muito mais.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-[#121317]/90 p-4 opacity-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">Slack</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Slack</h4>
                    <p className="text-xs text-slate-400">Em breve</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-white/10 bg-[#121317]/90 p-4 opacity-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6900] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">Hub</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">HubSpot</h4>
                    <p className="text-xs text-slate-400">Em breve</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-white/10 bg-[#121317]/90 p-4 opacity-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#0052CC] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">Tr</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Trello</h4>
                    <p className="text-xs text-slate-400">Em breve</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-white/10 bg-[#121317]/90 p-4 opacity-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6900] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">Zap</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Zapier</h4>
                    <p className="text-xs text-slate-400">Em breve</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-[#0B0C10]/70 p-10 text-center text-sm text-slate-400">
            Estamos finalizando os recursos de <span className="text-primary">{activeTab}</span>. Novidades chegam em breve!
          </div>
        );
    }
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex min-h-[calc(100vh-5rem)] flex-col gap-6 rounded-3xl border border-white/10 bg-[#0B0C10]/90 p-6 text-white shadow-[0_25px_80px_rgba(14,20,34,0.65)] backdrop-blur-xl md:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-white/10 bg-[#0E0F13]/90 p-5 md:w-64">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Configurações
          </h3>
          <nav className="space-y-2">
            {sidebarTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={cn(
                  sidebarButtonClasses,
                  "text-slate-400 hover:text-primary hover:bg-primary/10",
                  activeTab === tab &&
                    "bg-primary/15 text-slate-100 ring-1 ring-inset ring-primary/35"
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 rounded-2xl border border-white/10 bg-[#0E0F13]/90 p-6">
          <header className="border-b border-white/5 pb-5">
            <h2 className="font-['Poppins'] text-xl font-semibold text-slate-100">
              {currentTabMeta.title}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{currentTabMeta.description}</p>
          </header>

          {renderActiveTabContent()}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
