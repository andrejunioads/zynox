import { useCliente } from "@/context/ClienteContext";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContratoTipo, ContratoStatus } from "@/types/cliente";

export const ClienteContrato = () => {
  const { clienteAtivo, setClienteAtivo, setHasUnsavedChanges } = useCliente();
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    clienteAtivo?.contrato?.dataInicio ? new Date(clienteAtivo.contrato.dataInicio) : undefined
  );

  // Formatar valor monetário
  const formatCurrency = (value: number | undefined): string => {
    if (!value) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Parse do valor monetário
  const parseCurrency = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, "");
    return parseFloat(numericValue) / 100;
  };

  const handleContratoChange = (field: string, value: any) => {
    if (!clienteAtivo) return;

    setClienteAtivo({
      ...clienteAtivo,
      contrato: {
        ...clienteAtivo.contrato,
        [field]: value,
      },
    });

    setHasUnsavedChanges(true);
    toast.success("Contrato atualizado");
  };

  const handleGerarDocumento = () => {
    toast.info("Gerando documento contratual...");
    // TODO: Integrar com módulo de documentos
  };

  const handleVisualizarContrato = () => {
    toast.info("Visualização de contrato em desenvolvimento");
  };

  const isAssinaturaAtiva =
    clienteAtivo?.contrato?.tipo === "recorrente" &&
    clienteAtivo?.contrato?.status === "ativo";

  const statusConfig: Record<ContratoStatus, { color: string; icon: typeof CheckCircle2 }> = {
    ativo: { color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
    suspenso: { color: "bg-amber-500/10 text-amber-300 border-amber-500/30", icon: AlertCircle },
    encerrado: { color: "bg-slate-500/10 text-slate-400 border-slate-500/30", icon: AlertCircle },
  };

  const currentStatus = clienteAtivo?.contrato?.status || "ativo";
  const StatusIcon = statusConfig[currentStatus as ContratoStatus].icon;

  return (
    <div className="space-y-6">
      {/* Dados Contratuais */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dados Contratuais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data de Início */}
          <div>
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-[#121317] px-4 py-2.5 text-sm text-white transition hover:border-primary/50">
                  <span className={!dataInicio ? "text-slate-500" : ""}>
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </span>
                  <CalendarIcon className="ml-2 h-4 w-4 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-white/10 bg-[#0E1019]/95 backdrop-blur-xl">
                <Calendar
                  mode="single"
                  selected={dataInicio}
                  onSelect={(date) => {
                    setDataInicio(date);
                    handleContratoChange("dataInicio", date?.toISOString());
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo de Contrato */}
          <div>
            <Label>Tipo de Contrato</Label>
            <Select
              value={clienteAtivo?.contrato?.tipo}
              onValueChange={(value: ContratoTipo) => handleContratoChange("tipo", value)}
            >
              <SelectTrigger className="bg-[#121317] border-white/10 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recorrente">Recorrente</SelectItem>
                <SelectItem value="pontual">Pontual</SelectItem>
                <SelectItem value="prestacao_servico">Prestação de Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valor Mensal */}
          <div>
            <Label>Valor Mensal</Label>
            <Input
              type="text"
              value={formatCurrency(clienteAtivo?.contrato?.valorMensal)}
              onChange={(e) => {
                const numericValue = parseCurrency(e.target.value);
                handleContratoChange("valorMensal", numericValue);
              }}
              className="bg-[#121317] border-white/10 text-white"
              placeholder="R$ 0,00"
            />
          </div>

          {/* Dia de Vencimento */}
          <div>
            <Label>Dia de Vencimento</Label>
            <Select
              value={clienteAtivo?.contrato?.diaVencimento?.toString()}
              onValueChange={(value) => handleContratoChange("diaVencimento", parseInt(value))}
            >
              <SelectTrigger className="bg-[#121317] border-white/10 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    Dia {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <Label>Forma de Pagamento</Label>
            <Select
              value={clienteAtivo?.contrato?.formaPagamento}
              onValueChange={(value) => handleContratoChange("formaPagamento", value)}
            >
              <SelectTrigger className="bg-[#121317] border-white/10 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status do Contrato */}
          <div>
            <Label>Status</Label>
            <Select
              value={currentStatus}
              onValueChange={(value: ContratoStatus) => handleContratoChange("status", value)}
            >
              <SelectTrigger className="bg-[#121317] border-white/10 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Ativo
                  </span>
                </SelectItem>
                <SelectItem value="suspenso">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Suspenso
                  </span>
                </SelectItem>
                <SelectItem value="encerrado">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    Encerrado
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Badge Grande */}
        <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={cn("w-6 h-6", statusConfig[currentStatus as ContratoStatus].color.split(" ")[1])} />
              <div>
                <p className="text-sm font-semibold text-white">
                  Status do Contrato: {currentStatus === "ativo" ? "Ativo" : currentStatus === "suspenso" ? "Suspenso" : "Encerrado"}
                </p>
                <p className="text-xs text-slate-400">
                  {currentStatus === "ativo" 
                    ? "Contrato em vigor e recebimentos programados"
                    : currentStatus === "suspenso"
                    ? "Contrato temporariamente suspenso"
                    : "Contrato finalizado"}
                </p>
              </div>
            </div>
            <Badge className={cn("border", statusConfig[currentStatus as ContratoStatus].color)}>
              {currentStatus.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Ações com Documentos */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Documentação</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handleGerarDocumento}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            <FileText className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-semibold">Gerar Documento</p>
              <p className="text-xs opacity-75">Criar contrato em PDF</p>
            </div>
          </button>

          <button
            onClick={handleVisualizarContrato}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
          >
            <Download className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-semibold">Visualizar Contrato</p>
              <p className="text-xs text-slate-400">Ver versão digital</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

