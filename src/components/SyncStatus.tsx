// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYNC STATUS - INDICADOR DE SINCRONIZAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// Componente para mostrar status de sincronização
// em tempo real para o usuário
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Database,
  Users,
  Building2,
  Target,
  FolderOpen,
  DollarSign
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SyncStatusProps {
  showDetails?: boolean;
  className?: string;
}

interface EntityStatus {
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SyncStatus: React.FC<SyncStatusProps> = ({ 
  showDetails = false, 
  className 
}) => {
  const { 
    members, 
    clients, 
    leads, 
    projects, 
    financial, 
    lastSync, 
    isLoading,
    validate,
    sync 
  } = useData();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ESTADO DAS ENTIDADES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const entities: EntityStatus[] = [
    {
      name: 'Membros',
      count: members.length,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      name: 'Clientes',
      count: clients.length,
      icon: Building2,
      color: 'text-green-400'
    },
    {
      name: 'Leads',
      count: leads.length,
      icon: Target,
      color: 'text-orange-400'
    },
    {
      name: 'Projetos',
      count: projects.length,
      icon: FolderOpen,
      color: 'text-purple-400'
    },
    {
      name: 'Financeiro',
      count: financial.length,
      icon: DollarSign,
      color: 'text-emerald-400'
    }
  ];
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EFEITOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  useEffect(() => {
    if (lastSync) {
      setLastSyncTime(lastSync);
    }
  }, [lastSync]);
  
  useEffect(() => {
    const results = validate();
    setValidationResults(results);
  }, [validate, members, clients, leads]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await sync();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const getStatusIcon = () => {
    if (isLoading) return <Clock className="w-4 h-4 text-yellow-400" />;
    if (validationResults.length > 0) return <AlertCircle className="w-4 h-4 text-red-400" />;
    return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  };
  
  const getStatusText = () => {
    if (isLoading) return 'Carregando...';
    if (validationResults.length > 0) return `${validationResults.length} erros`;
    return 'Sincronizado';
  };
  
  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (validationResults.length > 0) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };
  
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Status Principal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Status da Sincronização</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="h-7 px-2"
          >
            <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      {/* Última Sincronização */}
      <div className="text-xs text-slate-500">
        Última sincronização: {formatLastSync()}
      </div>
      
      {/* Detalhes das Entidades */}
      {showDetails && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Entidades Sincronizadas
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {entities.map((entity) => {
              const Icon = entity.icon;
              return (
                <div
                  key={entity.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <Icon className={cn("w-4 h-4", entity.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-300 truncate">
                      {entity.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {entity.count} {entity.count === 1 ? 'item' : 'itens'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Erros de Validação */}
      {validationResults.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-red-400 uppercase tracking-wide">
            Problemas Encontrados
          </div>
          
          <div className="space-y-1">
            {validationResults.slice(0, 3).map((result, index) => (
              <div
                key={index}
                className="text-xs text-red-300 p-2 rounded bg-red-500/10 border border-red-500/20"
              >
                <div className="font-medium">
                  {result.entity} - {result.field}
                </div>
                <div className="text-red-400">
                  {result.message}
                </div>
              </div>
            ))}
            
            {validationResults.length > 3 && (
              <div className="text-xs text-slate-500">
                +{validationResults.length - 3} outros problemas...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE COMPACTO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SyncStatusCompact: React.FC<{ className?: string }> = ({ className }) => {
  const { lastSync, isLoading, validate } = useData();
  const [validationResults, setValidationResults] = useState<any[]>([]);
  
  useEffect(() => {
    const results = validate();
    setValidationResults(results);
  }, [validate]);
  
  const getStatusIcon = () => {
    if (isLoading) return <Clock className="w-3 h-3 text-yellow-400" />;
    if (validationResults.length > 0) return <AlertCircle className="w-3 h-3 text-red-400" />;
    return <CheckCircle2 className="w-3 h-3 text-green-400" />;
  };
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {getStatusIcon()}
      <span className="text-xs text-slate-400">
        {isLoading ? 'Sincronizando...' : 'Sincronizado'}
      </span>
    </div>
  );
};

