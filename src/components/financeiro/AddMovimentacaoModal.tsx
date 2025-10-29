import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Cliente } from "@/components/clientes/ClienteCard";
import { FileUploader } from "@/components/common/FileUploader";
import { FileData } from "@/services/fileService";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  X,
  Upload,
  FileText,
  Check,
  ChevronsUpDown,
  Repeat,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS E INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MovimentacaoData {
  id?: string;
  tipo: "entrada" | "despesa";
  data: Date;
  descricao: string;
  valor: number;
  categoria: string;
  metodoPagamento: string;
  clienteId?: string;
  fornecedor?: string;
  status: "pago" | "pendente" | "agendado";
  dataVencimento?: Date;
  numeroNF?: string;
  recorrente: boolean;
  recorrenciaConfig?: {
    frequencia: "mensal" | "trimestral" | "semestral" | "anual";
    dataFim?: Date;
    indefinido: boolean;
  };
  tags?: string[];
  observacoes?: string;
  anexos?: File[];
}

interface AddMovimentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: "entrada" | "despesa";
  onSave: (data: MovimentacaoData) => void;
  clientes: Cliente[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DADOS MOCK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORIAS_ENTRADA = [
  "Web Design",
  "Design",
  "Tráfego Pago",
  "API",
];

const CATEGORIAS_DESPESA = [
  "Infraestrutura",
  "Marketing",
  "Software & Licenças",
  "Salários & Freelancers",
  "Impostos & Taxas",
  "Fornecedores",
  "Outros",
];

const METODOS_PAGAMENTO = [
  "PIX",
  "Crédito/Débito",
  "Boleto",
  "Dinheiro",
  "Outro",
];


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEMA DE VALIDAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const createSchema = (tipo: "entrada" | "despesa") =>
  z
    .object({
      data: z.date({
        required_error: "Data é obrigatória",
      }),
      descricao: z
        .string()
        .min(3, "Mínimo 3 caracteres")
        .max(100, "Máximo 100 caracteres"),
      valor: z.number().positive("Valor deve ser maior que zero"),
      categoria: z.string().min(1, "Selecione uma categoria"),
      metodoPagamento: z.string().min(1, "Selecione um método"),
      clienteId: z.string().optional(),
      fornecedor: z.string().optional(),
      status: z.enum(["pago", "pendente", "agendado"]),
      dataVencimento: z.date().optional(),
      numeroNF: z.string().optional(),
      recorrente: z.boolean(),
      recorrenciaFrequencia: z
        .enum(["mensal", "trimestral", "semestral", "anual"])
        .optional(),
      recorrenciaDataFim: z.date().optional(),
      recorrenciaIndefinido: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      observacoes: z.string().max(500, "Máximo 500 caracteres").optional(),
    })
    .refine(
      (data) => {
        // Se status pendente/agendado, data vencimento é obrigatória
        if (data.status !== "pago") {
          return !!data.dataVencimento;
        }
        return true;
      },
      {
        message: "Data de vencimento é obrigatória",
        path: ["dataVencimento"],
      }
    )
    .refine(
      (data) => {
        // Se recorrente, frequência é obrigatória
        if (data.recorrente) {
          return !!data.recorrenciaFrequencia;
        }
        return true;
      },
      {
        message: "Selecione a frequência",
        path: ["recorrenciaFrequencia"],
      }
    );

type FormData = z.infer<ReturnType<typeof createSchema>>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function AddMovimentacaoModal({
  isOpen,
  onClose,
  tipo,
  onSave,
  clientes,
}: AddMovimentacaoModalProps) {
  const [clienteOpen, setClienteOpen] = useState(false);
  const [adicionarOutra, setAdicionarOutra] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);
  const [comprovantes, setComprovantes] = useState<FileData[]>([]);

  const schema = createSchema(tipo);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      data: new Date(),
      status: "pago",
      recorrente: false,
      recorrenciaIndefinido: false,
      tags: [],
    },
  });

  // Formatar valor monetário
  const formatCurrencyInput = (value: number | undefined): string => {
    if (!value) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Parse do valor monetário
  const parseCurrencyInput = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, "");
    return parseFloat(numericValue) / 100 || 0;
  };

  const watchRecorrente = watch("recorrente");
  const watchStatus = watch("status");
  const watchData = watch("data");
  const watchRecorrenciaFrequencia = watch("recorrenciaFrequencia");
  const watchRecorrenciaIndefinido = watch("recorrenciaIndefinido");

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen) {
      reset({
        data: new Date(),
        status: "pago",
        recorrente: false,
        recorrenciaIndefinido: false,
        tags: [],
      });
      setAnexos([]);
    }
  }, [isOpen, reset]);

  // Calcular próximas ocorrências de recorrência
  const calcularProximasOcorrencias = () => {
    if (!watchRecorrenciaFrequencia || !watchData) return [];

    const proximasOcorrencias: Date[] = [];
    const dataInicial = new Date(watchData);

    const incrementos = {
      mensal: 1,
      trimestral: 3,
      semestral: 6,
      anual: 12,
    };

    const meses = incrementos[watchRecorrenciaFrequencia];

    for (let i = 1; i <= 3; i++) {
      const novaData = new Date(dataInicial);
      novaData.setMonth(novaData.getMonth() + meses * i);
      proximasOcorrencias.push(novaData);
    }

    return proximasOcorrencias;
  };

  const proximasOcorrencias = watchRecorrente
    ? calcularProximasOcorrencias()
    : [];

  // Upload de arquivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} excede 5MB`);
        return false;
      }
      return true;
    });
    setAnexos((prev) => [...prev, ...validFiles]);
  };

  const removerAnexo = (index: number) => {
    setAnexos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const onSubmit = (data: FormData) => {
    const movimentacaoData: MovimentacaoData = {
      tipo,
      data: data.data,
      descricao: data.descricao,
      valor: data.valor,
      categoria: data.categoria,
      metodoPagamento: data.metodoPagamento,
      clienteId: data.clienteId,
      fornecedor: data.fornecedor,
      status: data.status,
      dataVencimento: data.dataVencimento,
      numeroNF: data.numeroNF,
      recorrente: data.recorrente,
      recorrenciaConfig: data.recorrente
        ? {
            frequencia: data.recorrenciaFrequencia!,
            dataFim: data.recorrenciaDataFim,
            indefinido: data.recorrenciaIndefinido || false,
          }
        : undefined,
      observacoes: data.observacoes,
      anexos,
    };

    onSave(movimentacaoData);

    if (adicionarOutra) {
      reset({
        data: new Date(),
        status: "pago",
        recorrente: false,
        recorrenciaIndefinido: false,
        tags: [],
      });
      setAnexos([]);
      toast.success(`${tipo === "entrada" ? "Entrada" : "Despesa"} salva!`, {
        description: "Adicione outra movimentação",
      });
    } else {
      onClose();
    }
  };

  const isEntrada = tipo === "entrada";
  const categorias = isEntrada ? CATEGORIAS_ENTRADA : CATEGORIAS_DESPESA;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] h-[90vh] p-0 gap-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="p-6 pb-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  isEntrada
                    ? "bg-emerald-500/10 border border-emerald-400/30"
                    : "bg-red-500/10 border border-red-500/30"
                )}
              >
                {isEntrada ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <DialogTitle
                className={cn(
                  "text-xl font-semibold",
                  isEntrada ? "text-emerald-100" : "text-red-300"
                )}
              >
                {isEntrada ? "Nova Entrada" : "Nova Despesa"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* ━━━━━ SEÇÃO: INFORMAÇÕES BÁSICAS ━━━━━ */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Informações Básicas
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Data */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Data<span className="text-rose-400">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 border-white/10 bg-[#121317]/95 hover:bg-[#121317] text-white",
                            !watchData && "text-slate-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                          {watchData ? (
                            format(watchData, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                        <Calendar
                          mode="single"
                          selected={watchData}
                          onSelect={(date) => date && setValue("data", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.data && (
                      <p className="text-xs text-rose-400">{errors.data.message}</p>
                    )}
                  </div>

                  {/* Valor */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Valor<span className="text-rose-400">*</span>
                    </Label>
                    <Controller
                      name="valor"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          className="h-10 border-white/10 bg-[#121317]/95 text-white"
                          value={formatCurrencyInput(field.value)}
                          onChange={(e) => {
                            const numericValue = parseCurrencyInput(e.target.value);
                            field.onChange(numericValue);
                          }}
                        />
                      )}
                    />
                    {errors.valor && (
                      <p className="text-xs text-rose-400">{errors.valor.message}</p>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2 mt-4">
                  <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Descrição<span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    placeholder={
                      isEntrada
                        ? "Ex: Pagamento projeto Website"
                        : "Ex: Assinatura AWS"
                    }
                    maxLength={100}
                    className="h-10 border-white/10 bg-[#121317]/95 text-white"
                    {...register("descricao")}
                  />
                  {errors.descricao && (
                    <p className="text-xs text-rose-400">
                      {errors.descricao.message}
                    </p>
                  )}
                </div>

                {/* Categoria */}
                <div className="space-y-2 mt-4">
                  <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Categoria<span className="text-rose-400">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("categoria", value)}
                  >
                    <SelectTrigger className="h-10 border-white/10 bg-[#121317]/95 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria && (
                    <p className="text-xs text-rose-400">
                      {errors.categoria.message}
                    </p>
                  )}
                </div>

                {/* Método de Pagamento */}
                <div className="space-y-2 mt-4">
                  <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Método de Pagamento<span className="text-rose-400">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("metodoPagamento", value)}
                  >
                    <SelectTrigger className="h-10 border-white/10 bg-[#121317]/95 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                      {METODOS_PAGAMENTO.map((metodo) => (
                        <SelectItem key={metodo} value={metodo}>
                          {metodo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.metodoPagamento && (
                    <p className="text-xs text-rose-400">
                      {errors.metodoPagamento.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* ━━━━━ SEÇÃO: VINCULAÇÃO ━━━━━ */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Vinculação
                </h3>

                <div className="space-y-4">
                  {/* Cliente (apenas entrada) */}
                  {isEntrada && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Cliente
                      </Label>
                      <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-10 border-white/10 bg-[#121317]/95 hover:bg-[#121317] text-white"
                          >
                            {watch("clienteId")
                              ? clientes.find((c) => c.id === watch("clienteId"))
                                  ?.name
                              : "Selecione o cliente"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                          <Command>
                            <CommandInput placeholder="Buscar cliente..." />
                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                            <CommandGroup>
                              {clientes.map((cliente) => (
                                <CommandItem
                                  key={cliente.id}
                                  value={cliente.name}
                                  onSelect={() => {
                                    setValue("clienteId", cliente.id);
                                    setClienteOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                                      {cliente.avatar}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-white">
                                        {cliente.name}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {cliente.company}
                                      </span>
                                    </div>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      watch("clienteId") === cliente.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {errors.clienteId && (
                        <p className="text-xs text-rose-400">
                          {errors.clienteId.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Fornecedor (apenas despesa) */}
                  {!isEntrada && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Fornecedor
                      </Label>
                      <Input
                        placeholder="Nome do fornecedor"
                        className="h-10 border-white/10 bg-[#121317]/95 text-white"
                        {...register("fornecedor")}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* ━━━━━ SEÇÃO: STATUS E PAGAMENTO ━━━━━ */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Status e Pagamento
                </h3>

                <div className="space-y-4">
                  {/* Status */}
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Status<span className="text-rose-400">*</span>
                    </Label>
                    <RadioGroup
                      defaultValue="pago"
                      onValueChange={(value) =>
                        setValue("status", value as "pago" | "pendente" | "agendado")
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pago" id="pago" />
                        <Label
                          htmlFor="pago"
                          className="text-sm text-white cursor-pointer"
                        >
                          Pago
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pendente" id="pendente" />
                        <Label
                          htmlFor="pendente"
                          className="text-sm text-white cursor-pointer"
                        >
                          Pendente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="agendado" id="agendado" />
                        <Label
                          htmlFor="agendado"
                          className="text-sm text-white cursor-pointer"
                        >
                          Agendado
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Data Vencimento (se pendente/agendado) */}
                  {watchStatus !== "pago" && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Data de Vencimento<span className="text-rose-400">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10 border-white/10 bg-[#121317]/95 hover:bg-[#121317] text-white",
                              !watch("dataVencimento") && "text-slate-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                            {watch("dataVencimento") ? (
                              format(watch("dataVencimento")!, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                          <Calendar
                            mode="single"
                            selected={watch("dataVencimento")}
                            onSelect={(date) =>
                              date && setValue("dataVencimento", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.dataVencimento && (
                        <p className="text-xs text-rose-400">
                          {errors.dataVencimento.message}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* ━━━━━ SEÇÃO: RECORRÊNCIA ━━━━━ */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Repeat className="h-3.5 w-3.5" />
                    Recorrência
                  </h3>
                  <Switch
                    checked={watchRecorrente}
                    onCheckedChange={(checked) => setValue("recorrente", checked)}
                  />
                </div>

                {watchRecorrente && (
                  <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    {/* Frequência */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Frequência<span className="text-rose-400">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setValue(
                            "recorrenciaFrequencia",
                            value as "mensal" | "trimestral" | "semestral" | "anual"
                          )
                        }
                      >
                        <SelectTrigger className="h-10 border-white/10 bg-[#121317]/95 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                          <SelectItem value="semestral">Semestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.recorrenciaFrequencia && (
                        <p className="text-xs text-rose-400">
                          {errors.recorrenciaFrequencia.message}
                        </p>
                      )}
                    </div>

                    {/* Repetir até ou indefinido */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="indefinido"
                        checked={watchRecorrenciaIndefinido}
                        onCheckedChange={(checked) =>
                          setValue("recorrenciaIndefinido", checked)
                        }
                      />
                      <Label
                        htmlFor="indefinido"
                        className="text-sm text-white cursor-pointer"
                      >
                        Repetir indefinidamente
                      </Label>
                    </div>

                    {!watchRecorrenciaIndefinido && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Repetir até
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10 border-white/10 bg-[#121317]/95 hover:bg-[#121317] text-white",
                                !watch("recorrenciaDataFim") && "text-slate-500"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                              {watch("recorrenciaDataFim") ? (
                                format(watch("recorrenciaDataFim")!, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                            <Calendar
                              mode="single"
                              selected={watch("recorrenciaDataFim")}
                              onSelect={(date) =>
                                date && setValue("recorrenciaDataFim", date)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    {/* Preview próximas ocorrências */}
                    {proximasOcorrencias.length > 0 && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs font-semibold text-slate-300 mb-2">
                          Próximas 3 ocorrências:
                        </p>
                        <div className="space-y-1">
                          {proximasOcorrencias.map((data, index) => (
                            <p key={index} className="text-xs text-slate-400">
                              • {format(data, "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator className="bg-white/5" />

              {/* Observações */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Observações
                </Label>
                <Textarea
                  placeholder="Informações adicionais..."
                  maxLength={500}
                  rows={4}
                  className="border-white/10 bg-[#121317]/95 text-white resize-none"
                  {...register("observacoes")}
                />
                {errors.observacoes && (
                  <p className="text-xs text-rose-400">
                    {errors.observacoes.message}
                  </p>
                )}
              </div>

              <Separator className="bg-white/5" />

              {/* Upload de Anexos */}
              <div>
                <div className="space-y-4">

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Anexar Comprovante/NF
                    </Label>

                    {/* Área de Upload */}
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-primary/50 transition cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-slate-400" />
                        <p className="text-sm text-slate-300">
                          Clique ou arraste arquivos
                        </p>
                        <p className="text-xs text-slate-500">
                          PDF, JPG, PNG (máx 5MB)
                        </p>
                      </label>
                    </div>

                  </div>

                  {/* Comprovantes - usando FileUploader */}
                  <div className="mt-4">
                    <FileUploader
                      files={comprovantes}
                      onFilesChange={setComprovantes}
                      uploadedBy="André Silva"
                      category="financial-receipt"
                      maxFiles={5}
                      maxSizeMB={10}
                      showPreview={true}
                      compact={true}
                      title="Comprovantes"
                      allowedTypes={['image/*', 'application/pdf']}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-primary/20 bg-[#1A1D29]/95 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="adicionar-outra"
                  checked={adicionarOutra}
                  onCheckedChange={setAdicionarOutra}
                />
                <Label
                  htmlFor="adicionar-outra"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  Adicionar outra após salvar
                </Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-300 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className={cn(
                    "font-semibold shadow-lg",
                    isEntrada
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25"
                      : "bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/25"
                  )}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
