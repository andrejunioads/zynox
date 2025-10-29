/**
 * 🔒 SAFE JSON PARSING
 * Utilitários para parsing seguro com tratamento de erros
 */

import { toast } from 'sonner';

export interface SafeParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Parse JSON com tratamento completo de erros
 * @param json - String JSON para fazer parse
 * @param fallback - Valor padrão em caso de erro
 * @param options - Opções de configuração
 * @returns Dados parseados ou fallback
 */
export function safeParse<T>(
  json: string | null | undefined,
  fallback: T,
  options?: {
    silent?: boolean;
    onError?: (error: Error) => void;
    validate?: (data: unknown) => boolean;
    storageKey?: string;
  }
): T {
  // Retornar fallback se json for nulo/undefined/vazio
  if (!json || json.trim() === '') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(json);
    
    // Validação customizada (opcional)
    if (options?.validate && !options.validate(parsed)) {
      throw new Error('Validation failed');
    }
    
    return parsed as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log do erro
    console.error('[safeParse] Parse error:', {
      error: errorMessage,
      key: options?.storageKey,
      jsonPreview: json.substring(0, 100)
    });

    // Criar backup do dado corrompido
    if (options?.storageKey && typeof localStorage !== 'undefined') {
      try {
        const corruptedKey = `corrupted-${options.storageKey}-${Date.now()}`;
        localStorage.setItem(corruptedKey, json);
        console.warn(`[safeParse] Corrupted data backed up to: ${corruptedKey}`);
      } catch (backupError) {
        console.error('[safeParse] Failed to backup corrupted data:', backupError);
      }
    }

    // Toast de erro (opcional)
    if (!options?.silent) {
      toast.error('Erro ao carregar dados', {
        description: `Dados corrompidos detectados${options?.storageKey ? ` em "${options.storageKey}"` : ''}. Usando valores padrão.`,
        duration: 5000
      });
    }

    // Callback customizado
    if (options?.onError) {
      options.onError(error instanceof Error ? error : new Error(errorMessage));
    }

    return fallback;
  }
}

/**
 * Parse JSON e retorna resultado detalhado
 */
export function safeParseWithResult<T>(
  json: string | null | undefined,
  options?: {
    validate?: (data: unknown) => boolean;
    storageKey?: string;
  }
): SafeParseResult<T> {
  if (!json || json.trim() === '') {
    return { success: false, error: 'Empty or null input' };
  }

  try {
    const parsed = JSON.parse(json);
    
    if (options?.validate && !options.validate(parsed)) {
      return { success: false, error: 'Validation failed' };
    }
    
    return { success: true, data: parsed as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('[safeParseWithResult] Parse error:', {
      error: errorMessage,
      key: options?.storageKey,
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Stringify JSON com tratamento de erros
 */
export function safeStringify<T>(
  data: T,
  options?: {
    silent?: boolean;
    onError?: (error: Error) => void;
  }
): string | null {
  try {
    return JSON.stringify(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('[safeStringify] Stringify error:', errorMessage);

    if (!options?.silent) {
      toast.error('Erro ao processar dados', {
        description: 'Não foi possível converter dados para salvamento.',
        duration: 3000
      });
    }

    if (options?.onError) {
      options.onError(error instanceof Error ? error : new Error(errorMessage));
    }

    return null;
  }
}

/**
 * Validadores comuns
 */
export const validators = {
  isArray: (data: unknown): data is unknown[] => Array.isArray(data),
  isObject: (data: unknown): data is Record<string, unknown> => 
    typeof data === 'object' && data !== null && !Array.isArray(data),
  isNonEmptyArray: (data: unknown): boolean => 
    Array.isArray(data) && data.length > 0,
  hasRequiredFields: (data: unknown, fields: string[]): boolean => {
    if (typeof data !== 'object' || data === null) return false;
    return fields.every(field => field in data);
  }
};
