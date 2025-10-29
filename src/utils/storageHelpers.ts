import { toast } from 'sonner';

/**
 * ✅ SISTEMA DE ARMAZENAMENTO COM TRATAMENTO DE ERROS ROBUSTO
 *
 * Previne perda de dados e oferece fallbacks automáticos quando:
 * - localStorage atinge limite de 5-10MB
 * - Dados corrompidos
 * - Navegador em modo privado
 */

interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Calcula tamanho aproximado do localStorage em MB
 */
export const getLocalStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total / (1024 * 1024); // Converter para MB
};

/**
 * Verifica se localStorage está próximo do limite
 */
export const isStorageNearLimit = (): boolean => {
  const size = getLocalStorageSize();
  return size > 8; // Alerta se passar de 8MB (limite usual é 10MB)
};

/**
 * Salva dados no localStorage com tratamento completo de erros
 */
export const safeLocalStorageSet = <T>(
  key: string,
  data: T,
  options?: {
    compress?: boolean;
    onError?: (error: Error) => void;
    silent?: boolean; // Não mostrar toast de erro
  }
): StorageResult<void> => {
  try {
    const jsonString = JSON.stringify(data);

    // Verificar tamanho antes de salvar
    if (isStorageNearLimit()) {
      const message = '⚠️ Armazenamento quase cheio! Considere limpar dados antigos.';
      if (!options?.silent) {
        toast.warning(message, {
          duration: 5000,
          action: {
            label: 'Limpar',
            onClick: () => {
              // Trigger cleanup
              window.dispatchEvent(new CustomEvent('storage-cleanup-needed'));
            }
          }
        });
      }
      console.warn(`localStorage near limit: ${getLocalStorageSize().toFixed(2)}MB`);
    }

    localStorage.setItem(key, jsonString);

    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao salvar ${key}:`, error);

    // Tratamento específico para QuotaExceededError
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      const errorMsg = '❌ Limite de armazenamento atingido!';

      if (!options?.silent) {
        toast.error(errorMsg, {
          description: 'Não foi possível salvar os dados. Limpe dados antigos ou exporte para backup.',
          duration: 8000,
          action: {
            label: 'Limpar Agora',
            onClick: () => {
              window.dispatchEvent(new CustomEvent('storage-full'));
            }
          }
        });
      }

      // Callback customizado
      if (options?.onError) {
        options.onError(error);
      }

      return {
        success: false,
        error: 'QUOTA_EXCEEDED'
      };
    }

    // Outros erros (permissão negada, modo privado, etc)
    if (!options?.silent) {
      toast.error('Erro ao salvar dados', {
        description: 'Verifique se o navegador não está em modo privado.',
        duration: 5000
      });
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Carrega dados do localStorage com tratamento de erros
 */
export const safeLocalStorageGet = <T>(
  key: string,
  defaultValue: T,
  options?: {
    onError?: (error: Error) => void;
    silent?: boolean;
  }
): StorageResult<T> => {
  try {
    const item = localStorage.getItem(key);

    if (item === null) {
      return {
        success: true,
        data: defaultValue
      };
    }

    const parsed = JSON.parse(item) as T;

    return {
      success: true,
      data: parsed
    };
  } catch (error: any) {
    console.error(`Erro ao carregar ${key}:`, error);

    // Dados corrompidos
    if (error instanceof SyntaxError) {
      if (!options?.silent) {
        toast.error('Dados corrompidos detectados', {
          description: `A chave "${key}" contém dados inválidos e será resetada.`,
          duration: 5000
        });
      }

      // Remover dados corrompidos
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Não foi possível remover dados corrompidos:', e);
      }
    }

    if (options?.onError) {
      options.onError(error);
    }

    return {
      success: false,
      data: defaultValue,
      error: error.message
    };
  }
};

/**
 * Remove item do localStorage com tratamento de erros
 */
export const safeLocalStorageRemove = (
  key: string,
  options?: {
    onError?: (error: Error) => void;
    silent?: boolean;
  }
): StorageResult<void> => {
  try {
    localStorage.removeItem(key);
    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao remover ${key}:`, error);

    if (!options?.silent) {
      toast.error('Erro ao remover dados', {
        description: error.message,
        duration: 3000
      });
    }

    if (options?.onError) {
      options.onError(error);
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Limpa localStorage mantendo apenas chaves essenciais
 */
export const cleanupOldData = (keepKeys: string[] = []): number => {
  let freedSpace = 0;
  const allKeys = Object.keys(localStorage);

  // Chaves essenciais que sempre devem ser mantidas
  const essentialKeys = [
    'nebula-members',
    'nebula-teams',
    ...keepKeys
  ];

  allKeys.forEach(key => {
    if (!essentialKeys.includes(key)) {
      const itemSize = localStorage[key]?.length || 0;
      freedSpace += itemSize;
      localStorage.removeItem(key);
    }
  });

  const freedMB = freedSpace / (1024 * 1024);

  toast.success(`🧹 Limpeza concluída!`, {
    description: `${freedMB.toFixed(2)}MB liberados`,
    duration: 3000
  });

  return freedSpace;
};

/**
 * Cria backup completo do localStorage
 */
export const createBackup = (): string => {
  const backup: Record<string, string> = {};

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith('nebula-')) {
      backup[key] = localStorage[key];
    }
  }

  return JSON.stringify(backup);
};

/**
 * Restaura backup do localStorage
 */
export const restoreBackup = (backupString: string): StorageResult<void> => {
  try {
    const backup = JSON.parse(backupString);

    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value as string);
    });

    toast.success('✅ Backup restaurado com sucesso!', {
      duration: 3000
    });

    return { success: true };
  } catch (error: any) {
    toast.error('Erro ao restaurar backup', {
      description: error.message,
      duration: 5000
    });

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Monitora eventos de limpeza de storage
 */
export const initStorageMonitoring = () => {
  // Evento: storage quase cheio
  window.addEventListener('storage-cleanup-needed', () => {
    cleanupOldData();
  });

  // Evento: storage completamente cheio
  window.addEventListener('storage-full', () => {
    cleanupOldData();
  });

  // Verificar tamanho a cada 5 minutos
  setInterval(() => {
    if (isStorageNearLimit()) {
      console.warn(`⚠️ localStorage usando ${getLocalStorageSize().toFixed(2)}MB`);
    }
  }, 5 * 60 * 1000);
};
