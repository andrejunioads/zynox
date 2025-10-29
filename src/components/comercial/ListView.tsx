import { useState, useMemo } from "react";
import { Lead } from "@/pages/Comercial";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  Eye, 
  Trash2, 
  Building2,
  Mail,
  Phone,
  Clock,
  TrendingUp
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ListViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDeleteLead?: (id: string) => void;
}

type SortField = 'name' | 'stage' | 'value' | 'daysInStage' | 'company';
type SortOrder = 'asc' | 'desc';

export const ListView = ({ leads, onLeadClick, onDeleteLead }: ListViewProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageLabel = (stage: string) => {
    const stageMap: Record<string, string> = {
      new: "Novo Lead",
      qualified: "Qualificado",
      proposal: "Proposta",
      negotiation: "Negociação",
      won: "Fechado ✓",
      lost: "Perdido"
    };
    return stageMap[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    const colorMap: Record<string, string> = {
      new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      qualified: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      proposal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      negotiation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      won: "bg-green-500/20 text-green-400 border-green-500/30",
      lost: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colorMap[stage] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const getTemperatureBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      hot: { bg: 'bg-danger/20', text: 'text-danger', label: '🔥 HOT' },
      warm: { bg: 'bg-warning/20', text: 'text-warning', label: '⚡ WARM' },
      cold: { bg: 'bg-primary/20', text: 'text-primary', label: '❄️ COLD' }
    };
    return badges[status] || badges.cold;
  };

  const getOriginColor = (origin: string) => {
    const colorMap: Record<string, string> = {
      LinkedIn: "bg-[#0A66C2]/20 text-[#0A66C2] border-[#0A66C2]/30",
      Instagram: "bg-[#C13584]/20 text-[#C13584] border-[#C13584]/30",
      Indicação: "bg-success/20 text-success border-success/30",
      Google: "bg-[#4285F4]/20 text-[#4285F4] border-[#4285F4]/30",
      WhatsApp: "bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30",
      Website: "bg-primary/20 text-primary border-primary/30",
      Evento: "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30"
    };
    return colorMap[origin] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const getDaysColor = (days: number) => {
    if (days > 14) return "text-danger";
    if (days > 7) return "text-warning";
    return "text-muted-foreground";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'name' || sortField === 'company') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-primary" />
      : <ArrowDown className="w-4 h-4 ml-1 text-primary" />;
  };

  return (
    <div className="glass-card border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-white/[0.02]">
              <TableHead className="text-primary font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 font-semibold text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleSort('name')}
                >
                  Lead
                  <SortIcon field="name" />
                </Button>
              </TableHead>
              <TableHead className="text-primary font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 font-semibold text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleSort('company')}
                >
                  Empresa
                  <SortIcon field="company" />
                </Button>
              </TableHead>
              <TableHead className="text-primary font-semibold">Contato</TableHead>
              <TableHead className="text-primary font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 font-semibold text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleSort('stage')}
                >
                  Etapa
                  <SortIcon field="stage" />
                </Button>
              </TableHead>
              <TableHead className="text-primary font-semibold">Origem</TableHead>
              <TableHead className="text-primary font-semibold text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 font-semibold text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleSort('value')}
                >
                  Valor
                  <SortIcon field="value" />
                </Button>
              </TableHead>
              <TableHead className="text-primary font-semibold text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 font-semibold text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleSort('daysInStage')}
                >
                  Tempo
                  <SortIcon field="daysInStage" />
                </Button>
              </TableHead>
              <TableHead className="text-primary font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead, index) => (
              <TableRow 
                key={lead.id}
                className={`
                  border-b border-white/5 
                  hover:bg-white/[0.02] 
                  transition-all duration-200 
                  cursor-pointer
                  group
                  ${index % 2 === 0 ? 'bg-white/[0.01]' : ''}
                `}
                onClick={() => onLeadClick(lead)}
              >
                {/* Lead */}
                <TableCell>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{lead.name}</p>
                    <Badge className={`text-[10px] px-2 py-0.5 mt-1 ${getTemperatureBadge(lead.status).bg} ${getTemperatureBadge(lead.status).text} border-0 font-semibold`}>
                      {getTemperatureBadge(lead.status).label}
                    </Badge>
                  </div>
                </TableCell>

                {/* Empresa */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{lead.company}</span>
                  </div>
                </TableCell>

                {/* Contato */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Etapa */}
                <TableCell>
                  <Badge className={`${getStageColor(lead.stage)} border text-xs`}>
                    {getStageLabel(lead.stage)}
                  </Badge>
                </TableCell>

                {/* Origem */}
                <TableCell>
                  <Badge className={`${getOriginColor(lead.origin)} border text-xs`}>
                    {lead.origin}
                  </Badge>
                </TableCell>

                {/* Valor */}
                <TableCell className="text-right">
                  <span className="text-sm font-bold text-success">
                    {formatCurrency(lead.value)}
                  </span>
                </TableCell>

                {/* Tempo na Etapa */}
                <TableCell className="text-center">
                  <div className={`flex items-center justify-center gap-1 text-xs ${getDaysColor(lead.daysInStage)}`}>
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{lead.daysInStage}d</span>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLeadClick(lead);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLeadClick(lead);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {onDeleteLead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-danger/10 hover:text-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLead(lead.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedLeads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Nenhum lead encontrado</p>
        </div>
      )}
    </div>
  );
};

