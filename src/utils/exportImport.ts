/**
 * 📦 SISTEMA DE EXPORT/IMPORT DE DADOS
 *
 * Permite exportar todos os dados do localStorage para backup
 * e importar de volta quando necessário.
 */

import { toast } from 'sonner';
import { createBackup, restoreBackup } from './storageHelpers';

/**
 * Exporta todos os dados do sistema como arquivo JSON
 */
export const exportAllData = () => {
  try {
    const backup = createBackup();

    if (!backup) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    // Criar arquivo JSON formatado
    const formattedData = JSON.stringify(JSON.parse(backup), null, 2);

    // Criar blob e download
    const blob = new Blob([formattedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const timestamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `nebula-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('✅ Backup exportado com sucesso!', {
      description: `Arquivo: nebula-backup-${timestamp}.json`,
      duration: 5000
    });
  } catch (error: any) {
    console.error('Erro ao exportar dados:', error);
    toast.error('Erro ao exportar dados', {
      description: error.message,
      duration: 5000
    });
  }
};

/**
 * Importa dados de um arquivo JSON de backup
 */
export const importDataFromFile = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      toast.error('Nenhum arquivo selecionado');
      resolve(false);
      return;
    }

    if (file.type !== 'application/json') {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione um arquivo JSON válido',
        duration: 5000
      });
      resolve(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const backupString = e.target?.result as string;

        if (!backupString) {
          throw new Error('Arquivo vazio');
        }

        // Validar JSON
        JSON.parse(backupString);

        // Restaurar backup
        const result = restoreBackup(backupString);

        if (result.success) {
          toast.success('✅ Dados importados com sucesso!', {
            description: 'Recarregue a página para ver as mudanças',
            duration: 5000,
            action: {
              label: 'Recarregar',
              onClick: () => window.location.reload()
            }
          });
          resolve(true);
        } else {
          throw new Error(result.error || 'Erro desconhecido');
        }
      } catch (error: any) {
        console.error('Erro ao importar dados:', error);
        toast.error('Erro ao importar dados', {
          description: error.message,
          duration: 5000
        });
        resolve(false);
      }
    };

    reader.onerror = () => {
      toast.error('Erro ao ler arquivo');
      resolve(false);
    };

    reader.readAsText(file);
  });
};

/**
 * Cria um input file invisível e aciona o seletor de arquivos
 */
export const selectAndImportFile = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await importDataFromFile(file);
        resolve(success);
      } else {
        resolve(false);
      }
      document.body.removeChild(input);
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(false);
    };

    document.body.appendChild(input);
    input.click();
  });
};

/**
 * Exporta estatísticas sobre os dados
 */
export const getDataStats = () => {
  try {
    const stats: Record<string, any> = {};

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('nebula-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            const count = Array.isArray(parsed) ? parsed.length : 1;
            const sizeKB = ((data.length * 2) / 1024).toFixed(2); // UTF-16 = 2 bytes por char

            stats[key.replace('nebula-', '')] = {
              count,
              sizeKB: `${sizeKB} KB`
            };
          } catch (e) {
            stats[key.replace('nebula-', '')] = {
              count: 'N/A',
              sizeKB: 'Corrupted'
            };
          }
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return {};
  }
};

/**
 * Mostra estatísticas dos dados no console
 */
export const showDataStats = () => {
  const stats = getDataStats();

  console.table(stats);

  toast.info('Estatísticas dos dados', {
    description: 'Verifique o console para detalhes',
    duration: 3000
  });
};
