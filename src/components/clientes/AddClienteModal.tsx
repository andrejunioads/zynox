import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Camera, X, Upload, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Schema de validação Zod
const clienteSchema = z.object({
  foto: z.any().optional(),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(11, "Telefone inválido"),
  whatsapp: z.string().optional(),
  tipo: z.enum(["pf", "pj"]),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido"),
  dataNascimento: z.string().optional(),
  instagram: z.string().optional(),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  segmento: z.string().optional(),
  porte: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  dataInicio: z.string(),
  tipoContrato: z.string().min(1, "Selecione o tipo de contrato"),
  valorMensal: z.string().min(1, "Valor obrigatório"),
  status: z.string().min(1, "Selecione o status"),
  diaVencimento: z.string().optional(),
  formaPagamento: z.string().optional(),
  tags: z.array(z.string()).optional(),
  servicos: z.array(z.string()).min(1, "Selecione pelo menos um serviço"),
  observacoes: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface AddClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const TAGS_OPTIONS = ["VIP", "Recorrente", "Prioritário", "Corporativo", "Startup"];
const SERVICOS_OPTIONS = ["API", "Marketing Digital", "IA", "Chatbot", "Landing Page", "Consultoria", "Sites"];

export const AddClienteModal = ({ isOpen, onClose, onSave }: AddClienteModalProps) => {
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedServicos, setSelectedServicos] = useState<string[]>([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipo: "pf",
      dataInicio: new Date().toISOString().split("T")[0],
      status: "ativo",
      tags: [],
      servicos: [],
    },
  });

  const tipo = watch("tipo");
  const cep = watch("cep");

  // Upload de foto
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A foto deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validação de tipo
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        title: "Erro",
        description: "Formato inválido. Use JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      setValue("foto", reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [setValue, toast]);

  // Drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as any;
      handlePhotoUpload(fakeEvent);
    }
  }, [handlePhotoUpload]);

  // Buscar CEP
  const handleCepChange = useCallback(async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setValue("logradouro", data.logradouro);
          setValue("bairro", data.bairro);
          setValue("cidade", data.localidade);
          setValue("estado", data.uf);
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Tente novamente",
          variant: "destructive",
        });
      } finally {
        setLoadingCep(false);
      }
    }
  }, [setValue, toast]);

  // Máscaras
  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2")
      .slice(0, 15);
  };

  const maskCep = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  const maskCurrency = (value: string) => {
    const number = value.replace(/\D/g, "");
    const formatted = (Number(number) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
    return formatted;
  };

  // Toggle tags
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setValue("tags", newTags);
  };

  // Toggle serviços
  const toggleServico = (servico: string) => {
    const newServicos = selectedServicos.includes(servico)
      ? selectedServicos.filter(s => s !== servico)
      : [...selectedServicos, servico];
    setSelectedServicos(newServicos);
    setValue("servicos", newServicos);
  };

  // Gerar iniciais
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Submit
  const onSubmit = (data: ClienteFormData) => {
    const avatar = photoPreview || getInitials(data.nome);
    onSave({ ...data, avatar });
    toast({
      title: "Cliente adicionado com sucesso!",
      description: `${data.nome} foi adicionado à base de clientes`,
    });
    reset();
    setPhotoPreview("");
    setSelectedTags([]);
    setSelectedServicos([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border border-white/10 bg-[rgba(26,29,41,0.6)] backdrop-blur-[30px] max-w-[800px] h-[85vh] p-0 gap-0">
        {/* Header Fixo */}
        <DialogHeader className="px-6 py-4 border-b border-white/10">
          <DialogTitle className="text-white text-2xl font-bold">Novo Cliente</DialogTitle>
        </DialogHeader>

        {/* Formulário com Scroll */}
        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
            {/* FOTO DO CLIENTE */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-[120px] h-[120px] rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview("");
                        setValue("foto", undefined);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-xs text-white/40 text-center px-2">
                      Clique ou arraste
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-[#94A3B8]">JPG, PNG ou WebP (máx. 5MB)</p>
            </div>

            <Separator className="bg-white/10" />

            {/* INFORMAÇÕES BÁSICAS */}
            <div>
              <h3 className="text-white font-semibold mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Coluna 1 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-xs text-[#94A3B8] mb-2 block">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      {...register("nome")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="João Silva"
                    />
                    {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs text-[#94A3B8] mb-2 block">
                      Email Principal *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="joao@exemplo.com"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-xs text-[#94A3B8] mb-2 block">
                      Telefone Principal *
                    </Label>
                    <Input
                      id="telefone"
                      {...register("telefone")}
                      onChange={(e) => {
                        e.target.value = maskPhone(e.target.value);
                        setValue("telefone", e.target.value);
                      }}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="(11) 98765-4321"
                    />
                    {errors.telefone && <p className="text-red-400 text-xs mt-1">{errors.telefone.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="text-xs text-[#94A3B8] mb-2 block">
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      {...register("whatsapp")}
                      onChange={(e) => {
                        e.target.value = maskPhone(e.target.value);
                        setValue("whatsapp", e.target.value);
                      }}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>

                {/* Coluna 2 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tipo" className="text-xs text-[#94A3B8] mb-2 block">
                      Tipo *
                    </Label>
                    <Select onValueChange={(value) => setValue("tipo", value as "pf" | "pj")} defaultValue="pf">
                      <SelectTrigger className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="pf">Pessoa Física</SelectItem>
                        <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cpfCnpj" className="text-xs text-[#94A3B8] mb-2 block">
                      {tipo === "pf" ? "CPF" : "CNPJ"} *
                    </Label>
                    <Input
                      id="cpfCnpj"
                      {...register("cpfCnpj")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder={tipo === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                    />
                    {errors.cpfCnpj && <p className="text-red-400 text-xs mt-1">{errors.cpfCnpj.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="dataNascimento" className="text-xs text-[#94A3B8] mb-2 block">
                      {tipo === "pf" ? "Data de Nascimento" : "Data de Fundação"}
                    </Label>
                    <Controller
                      name="dataNascimento"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-10 justify-start text-left font-normal bg-white/5 border-primary/20 text-white/90",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-primary/30">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram" className="text-xs text-[#94A3B8] mb-2 block">
                      Instagram {tipo === "pj" && "da Empresa"}
                    </Label>
                    <Input
                      id="instagram"
                      {...register("instagram")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder={tipo === "pj" ? "@empresa" : "@usuario"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DADOS DA EMPRESA (se PJ) */}
            {tipo === "pj" && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <h3 className="text-white font-semibold mb-4">Dados da Empresa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Coluna 1 */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="razaoSocial" className="text-xs text-[#94A3B8] mb-2 block">
                          Razão Social *
                        </Label>
                        <Input
                          id="razaoSocial"
                          {...register("razaoSocial")}
                          className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                          placeholder="Empresa LTDA"
                        />
                      </div>

                      <div>
                        <Label htmlFor="nomeFantasia" className="text-xs text-[#94A3B8] mb-2 block">
                          Nome Fantasia
                        </Label>
                        <Input
                          id="nomeFantasia"
                          {...register("nomeFantasia")}
                          className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                          placeholder="Empresa"
                        />
                      </div>

                      <div>
                        <Label htmlFor="segmento" className="text-xs text-[#94A3B8] mb-2 block">
                          Segmento/Nicho *
                        </Label>
                        <Select onValueChange={(value) => setValue("segmento", value)}>
                          <SelectTrigger className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="servicos">Serviços</SelectItem>
                            <SelectItem value="tecnologia">Tecnologia</SelectItem>
                            <SelectItem value="educacao">Educação</SelectItem>
                            <SelectItem value="saude">Saúde</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Coluna 2 */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="porte" className="text-xs text-[#94A3B8] mb-2 block">
                          Porte *
                        </Label>
                        <Select onValueChange={(value) => setValue("porte", value)}>
                          <SelectTrigger className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="mei">MEI</SelectItem>
                            <SelectItem value="pequena">Pequena</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="grande">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="website" className="text-xs text-[#94A3B8] mb-2 block">
                          Website
                        </Label>
                        <Input
                          id="website"
                          {...register("website")}
                          className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                          placeholder="https://exemplo.com"
                        />
                        {errors.website && <p className="text-red-400 text-xs mt-1">{errors.website.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="instagram" className="text-xs text-[#94A3B8] mb-2 block">
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          {...register("instagram")}
                          className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                          placeholder="@empresa"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ENDEREÇO */}
            <Separator className="bg-white/10" />
            <div>
              <h3 className="text-white font-semibold mb-4">Endereço</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cep" className="text-xs text-[#94A3B8] mb-2 block">
                    CEP
                  </Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      {...register("cep")}
                      onChange={(e) => {
                        const masked = maskCep(e.target.value);
                        e.target.value = masked;
                        setValue("cep", masked);
                        if (masked.length === 9) {
                          handleCepChange(masked);
                        }
                      }}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="00000-000"
                    />
                    {loadingCep && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3 top-3" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_150px] gap-4">
                  <div>
                    <Label htmlFor="logradouro" className="text-xs text-[#94A3B8] mb-2 block">
                      Logradouro *
                    </Label>
                    <Input
                      id="logradouro"
                      {...register("logradouro")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="Rua Exemplo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero" className="text-xs text-[#94A3B8] mb-2 block">
                      Número *
                    </Label>
                    <Input
                      id="numero"
                      {...register("numero")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="complemento" className="text-xs text-[#94A3B8] mb-2 block">
                      Complemento
                    </Label>
                    <Input
                      id="complemento"
                      {...register("complemento")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="Apto 101"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro" className="text-xs text-[#94A3B8] mb-2 block">
                      Bairro *
                    </Label>
                    <Input
                      id="bairro"
                      {...register("bairro")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_120px] gap-4">
                  <div>
                    <Label htmlFor="cidade" className="text-xs text-[#94A3B8] mb-2 block">
                      Cidade *
                    </Label>
                    <Input
                      id="cidade"
                      {...register("cidade")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="São Paulo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado" className="text-xs text-[#94A3B8] mb-2 block">
                      Estado *
                    </Label>
                    <Select onValueChange={(value) => setValue("estado", value)}>
                      <SelectTrigger className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        {ESTADOS.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTRATO */}
            <Separator className="bg-white/10" />
            <div>
              <h3 className="text-white font-semibold mb-4">Contrato</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Coluna 1 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dataInicio" className="text-xs text-[#94A3B8] mb-2 block">
                      Data de Início *
                    </Label>
                    <Controller
                      name="dataInicio"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-10 justify-start text-left font-normal bg-white/5 border-primary/20 text-white/90",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-primary/30">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipoContrato" className="text-xs text-[#94A3B8] mb-2 block">
                      Tipo de Contrato *
                    </Label>
                    <Select onValueChange={(value) => setValue("tipoContrato", value)}>
                      <SelectTrigger className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="projeto">Projeto Único</SelectItem>
                        <SelectItem value="freela">Freela</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipoContrato && <p className="text-red-400 text-xs mt-1">{errors.tipoContrato.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="valorMensal" className="text-xs text-[#94A3B8] mb-2 block">
                      Valor Mensal *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-white/90 text-base">R$</span>
                      <Input
                        id="valorMensal"
                        {...register("valorMensal")}
                        onChange={(e) => {
                          const masked = maskCurrency(e.target.value);
                          e.target.value = masked;
                          setValue("valorMensal", masked);
                        }}
                        className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40 pl-12"
                        placeholder="0,00"
                      />
                    </div>
                    {errors.valorMensal && <p className="text-red-400 text-xs mt-1">{errors.valorMensal.message}</p>}
                  </div>
                </div>

                {/* Coluna 2 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status" className="text-xs text-[#94A3B8] mb-2 block">
                      Status *
                    </Label>
                    <Select onValueChange={(value) => setValue("status", value)} defaultValue="ativo">
                      <SelectTrigger className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="negociacao">Em Negociação</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="diaVencimento" className="text-xs text-[#94A3B8] mb-2 block">
                      Dia de Vencimento
                    </Label>
                    <Input
                      id="diaVencimento"
                      type="number"
                      min="1"
                      max="31"
                      {...register("diaVencimento")}
                      className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formaPagamento" className="text-xs text-[#94A3B8] mb-2 block">
                      Forma de Pagamento
                    </Label>
                    <Select onValueChange={(value) => setValue("formaPagamento", value)}>
                      <SelectTrigger className="h-10 bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* CLASSIFICAÇÃO */}
            <Separator className="bg-white/10" />
            <div>
              <h3 className="text-white font-semibold mb-4">Classificação</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-[#94A3B8] mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_OPTIONS.map((tag) => (
                      <Badge
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`cursor-pointer transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-[#94A3B8] mb-2 block">
                    Serviços Contratados *
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICOS_OPTIONS.map((servico) => (
                      <Badge
                        key={servico}
                        onClick={() => toggleServico(servico)}
                        className={`cursor-pointer transition-colors ${
                          selectedServicos.includes(servico)
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {servico}
                      </Badge>
                    ))}
                  </div>
                  {errors.servicos && <p className="text-red-400 text-xs mt-1">{errors.servicos.message}</p>}
                </div>
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <Separator className="bg-white/10" />
            <div>
              <h3 className="text-white font-semibold mb-4">Observações</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="observacoes" className="text-xs text-[#94A3B8] mb-2 block">
                    Observações Gerais
                  </Label>
                  <Textarea
                    id="observacoes"
                    {...register("observacoes")}
                    rows={4}
                    className="bg-white/5 border-primary/20 text-white/90 placeholder:text-white/40 resize-none"
                    placeholder="Adicione observações, detalhes importantes ou notas sobre o cliente..."
                  />
                </div>
              </div>
            </div>

            <div className="h-6" /> {/* Espaço final */}
          </form>
        </ScrollArea>

        {/* Rodapé Fixo */}
        <div className="px-6 py-4 border-t border-white/10 bg-[rgba(26,29,41,0.8)] backdrop-blur-[20px] flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              setPhotoPreview("");
              setSelectedTags([]);
              setSelectedServicos([]);
              onClose();
            }}
            className="text-white/60 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
