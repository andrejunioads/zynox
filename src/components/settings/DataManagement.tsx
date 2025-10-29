/**
 * 📦 COMPONENTE DE GERENCIAMENTO DE DADOS
 *
 * Interface para export/import e limpeza de dados
 * Adicione este componente na página de Configurações
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Upload, Trash2, Database, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportAllData, selectAndImportFile, getDataStats, showDataStats } from '@/utils/exportImport';
import { getLocalStorageSize, isStorageNearLimit } from '@/utils/storageHelpers';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

export const DataManagement = () => {
  const { clearAllData } = useData();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const storageSize = getLocalStorageSize();
  const isNearLimit = isStorageNearLimit();
  const percentUsed = (storageSize / 10) * 100; // Assumindo limite de 10MB

  const handleExport = () => {
    exportAllData();
  };

  const handleImport = async () => {
    const success = await selectAndImportFile();
    if (success) {
      // Atualizar estatísticas após importar
      setTimeout(() => {
        setStats(getDataStats());
      }, 1000);
    }
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    clearAllData({ keepMembers: true, createBackup: true });
    setShowClearDialog(false);

    toast.success('🧹 Dados limpos com sucesso!', {
      description: 'Backup criado antes da limpeza',
      duration: 5000
    });

    // Atualizar estatísticas
    setTimeout(() => {
      setStats(getDataStats());
    }, 1000);
  };

  const handleShowStats = () => {
    const dataStats = getDataStats();
    setStats(dataStats);
    showDataStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Gerenciamento de Dados</h2>
        <p className="text-sm text-slate-400">
          Faça backup, importe ou limpe seus dados do sistema
        </p>
      </div>

      {/* Storage Status */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-white">Armazenamento Local</CardTitle>
                <CardDescription>localStorage do navegador</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{storageSize.toFixed(2)} MB</p>
              <p className="text-xs text-slate-400">de ~10 MB</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isNearLimit ? 'bg-red-500' : percentUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {percentUsed.toFixed(1)}% utilizado
            </p>
          </div>

          {/* Alert se próximo do limite */}
          {isNearLimit && (
            <Alert className="mt-4 bg-red-500/10 border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-400">
                Você está próximo do limite de armazenamento. Considere fazer backup e limpar dados antigos.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export */}
        <Card className="glass-card border-white/10 hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">Exportar Dados</CardTitle>
                <CardDescription>Fazer backup completo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Baixe todos os dados do sistema em um arquivo JSON. Use para backup ou migração.
            </p>
            <Button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Backup
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card className="glass-card border-white/10 hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Importar Dados</CardTitle>
                <CardDescription>Restaurar de backup</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Importe dados de um arquivo de backup JSON. Isso substituirá os dados atuais.
            </p>
            <Button
              onClick={handleImport}
              variant="outline"
              className="w-full border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Backup
            </Button>
          </CardContent>
        </Card>

        {/* Clear Data */}
        <Card className="glass-card border-white/10 hover:border-red-500/30 transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-white">Limpar Dados</CardTitle>
                <CardDescription>Remover todas as informações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Remove todos os dados (Clientes, Leads, Projetos, Financeiro). Cria backup automático.
            </p>
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="glass-card border-white/10 hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white">Estatísticas</CardTitle>
                <CardDescription>Ver detalhes dos dados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Veja quantos registros você tem em cada módulo e quanto espaço ocupam.
            </p>
            <Button
              onClick={handleShowStats}
              variant="outline"
              className="w-full border-purple-500/30 hover:bg-purple-500/10 text-purple-400"
            >
              <Database className="w-4 h-4 mr-2" />
              Ver Estatísticas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Display */}
      {stats && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Estatísticas dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats).map(([key, value]: [string, any]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-sm font-medium text-white capitalize">
                    {key.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{value.count} registros</span>
                    <span className="text-xs">{value.sizeKB}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="glass-card border border-red-500/30 bg-[rgba(26,29,41,0.95)] backdrop-blur-[30px] max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>

            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-white text-2xl font-bold">
                Limpar Todos os Dados?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#94A3B8] text-base leading-relaxed px-4">
                Isso irá remover <span className="font-bold text-white">TODOS os dados</span> das seguintes abas:
                <ul className="mt-3 space-y-1 text-left list-disc list-inside">
                  <li>Comercial (Leads e Follow-ups)</li>
                  <li>Clientes</li>
                  <li>Projetos e Tarefas</li>
                  <li>Financeiro</li>
                </ul>
                <p className="mt-3 text-green-400 text-sm">
                  ✅ Um backup será criado automaticamente antes da limpeza.
                </p>
                <p className="mt-2 text-blue-400 text-sm">
                  ℹ️ A equipe (membros) será mantida.
                </p>
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 sm:gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              className="flex-1 border-white/20 hover:bg-white/5 hover:border-white/30 text-white h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmClear}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold h-11 shadow-lg shadow-red-500/20"
            >
              Sim, Limpar Tudo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
