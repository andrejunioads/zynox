import { useCliente } from "@/context/ClienteContext";
import { useState, useEffect } from "react";
import { Cliente } from "@/types/cliente";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const ClienteInfo = () => {
  const { clienteAtivo, setClienteAtivo, setHasUnsavedChanges } = useCliente();
  const [formData, setFormData] = useState<Partial<Cliente>>(clienteAtivo || {});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (clienteAtivo) {
      setFormData(clienteAtivo);
    }
  }, [clienteAtivo]);

  // Auto-save após 5 segundos de inatividade
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 5000);

    return () => clearTimeout(timer);
  }, [formData, hasChanges]);

  const handleChange = (field: keyof Cliente, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setHasUnsavedChanges(true);
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
    setHasChanges(true);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Enviar para API
      // await fetch(`/api/clientes/${formData.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(formData)
      // });
      
      setClienteAtivo(formData as Cliente);
      setHasChanges(false);
      toast.success("Informações salvas automaticamente");
    } catch (error) {
      toast.error("Erro ao salvar informações");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCPFCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
  };

  const formatCEP = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  const buscarCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          },
        }));
        setHasChanges(true);
        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de save */}
      {(isSaving || hasChanges) && (
        <div className="flex items-center justify-end gap-2 text-sm text-slate-400 pb-2">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Alterações não salvas</span>
            </>
          )}
        </div>
      )}

      {/* Dados Pessoais */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome || ""}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="sobrenome">Sobrenome</Label>
            <Input
              id="sobrenome"
              value={formData.sobrenome || ""}
              onChange={(e) => handleChange("sobrenome", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="apelido">Apelido</Label>
            <Input
              id="apelido"
              value={formData.apelido || ""}
              onChange={(e) => handleChange("apelido", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
              placeholder="Como prefere ser chamado"
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange("tipo", value)}
            >
              <SelectTrigger className="bg-[#121317] border-white/10 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj || ""}
              onChange={(e) => {
                const formatted = formatCPFCNPJ(e.target.value);
                handleChange("cpfCnpj", formatted);
              }}
              className="bg-[#121317] border-white/10 text-white"
              maxLength={18}
            />
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="bg-[#121317] border-white/10 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone || ""}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                handleChange("telefone", formatted);
              }}
              className="bg-[#121317] border-white/10 text-white"
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formData.endereco?.cep || ""}
              onChange={(e) => {
                const formatted = formatCEP(e.target.value);
                handleEnderecoChange("cep", formatted);
              }}
              onBlur={(e) => buscarCEP(e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
              placeholder="00000-000"
              maxLength={9}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input
              id="logradouro"
              value={formData.endereco?.logradouro || ""}
              onChange={(e) => handleEnderecoChange("logradouro", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={formData.endereco?.numero || ""}
              onChange={(e) => handleEnderecoChange("numero", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={formData.endereco?.complemento || ""}
              onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={formData.endereco?.bairro || ""}
              onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.endereco?.cidade || ""}
              onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={formData.endereco?.estado || ""}
              onChange={(e) => handleEnderecoChange("estado", e.target.value)}
              className="bg-[#121317] border-white/10 text-white"
              maxLength={2}
              placeholder="UF"
            />
          </div>
        </div>
      </div>

      {/* Botão de salvar manual */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "w-full py-3 rounded-xl font-semibold transition-all",
            "bg-gradient-to-r from-primary to-primary-light text-white",
            "hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]",
            isSaving && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Salvar Alterações
            </span>
          )}
        </button>
      )}
    </div>
  );
};

