import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  RefreshCw, 
  Download,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  ValidationResult, 
  AuditLog 
} from "@/services/teamProjectValidator";

interface TeamProjectAuditPanelProps {
  validationResult: ValidationResult | null;
  auditLogs: AuditLog[];
  isRunning: boolean;
  onRefresh: () => void;
  onGenerateReport: () => string;
  onClearLogs: () => void;
}

export const TeamProjectAuditPanel = ({
  validationResult,
  auditLogs,
  isRunning,
  onRefresh,
  onGenerateReport,
  onClearLogs
}: TeamProjectAuditPanelProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    selectedLogType === 'all' || log.severity === selectedLogType
  );

  const downloadReport = () => {
    const report = onGenerateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Auditoria de Integridade</h3>
          <p className="text-sm text-slate-400">
            Validação entre membros da equipe e projetos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="border-slate-700"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDetails ? 'Ocultar' : 'Detalhes'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRunning}
            className="border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              validationResult?.isValid ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {validationResult?.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-400">Status</p>
              <p className={`font-semibold ${
                validationResult?.isValid ? 'text-green-400' : 'text-red-400'
              }`}>
                {validationResult?.isValid ? 'Válido' : 'Com Erros'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Erros</p>
              <p className="font-semibold text-red-400">
                {validationResult?.errors.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Avisos</p>
              <p className="font-semibold text-yellow-400">
                {validationResult?.warnings.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Correções</p>
              <p className="font-semibold text-blue-400">
                {validationResult?.fixed.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detalhes */}
      {showDetails && (
        <div className="space-y-4">
          {/* Erros */}
          {validationResult?.errors && validationResult.errors.length > 0 && (
            <Card className="glass-card border-red-500/30 p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Erros Críticos ({validationResult.errors.length})
              </h4>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-start gap-2">
                        <Badge className={`text-xs ${getSeverityColor(error.severity)}`}>
                          {error.severity.toUpperCase()}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-white">{error.message}</p>
                          <p className="text-xs text-slate-400">
                            Projeto: {error.projectId} | Membro: {error.memberId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}

          {/* Avisos */}
          {validationResult?.warnings && validationResult.warnings.length > 0 && (
            <Card className="glass-card border-yellow-500/30 p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Avisos ({validationResult.warnings.length})
              </h4>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-sm text-white">{warning.message}</p>
                      <p className="text-xs text-slate-400">
                        Projeto: {warning.projectId} | Membro: {warning.memberId}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}

          {/* Logs de Auditoria */}
          <Card className="glass-card border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Logs de Auditoria</h4>
              <div className="flex items-center gap-2">
                <select
                  value={selectedLogType}
                  onChange={(e) => setSelectedLogType(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="all">Todos</option>
                  <option value="error">Erros</option>
                  <option value="warning">Avisos</option>
                  <option value="info">Info</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadReport}
                  className="border-slate-700"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClearLogs}
                  className="border-slate-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-4 text-slate-400">
                    Nenhum log encontrado
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getSeverityColor(log.severity)}`}>
                          {getSeverityIcon(log.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${getSeverityColor(log.severity)}`}>
                              {log.action}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {log.timestamp.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-white">{log.details}</p>
                          {log.projectId !== 'all' && (
                            <p className="text-xs text-slate-400">
                              Projeto: {log.projectId}
                              {log.memberId && ` | Membro: ${log.memberId}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
};
