/**
 * 🔍 CENTRALIZED LOGGER
 * 
 * Logger centralizado com controle de ambiente
 * Remove console.logs em produção automaticamente
 */

const IS_DEV = import.meta.env.DEV;
const IS_TEST = import.meta.env.MODE === 'test';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  prefix?: string;
  emoji?: string;
  data?: any;
}

class Logger {
  private enabled: boolean;
  private logHistory: Array<{ level: LogLevel; message: string; timestamp: Date }> = [];
  private maxHistory = 100;

  constructor() {
    this.enabled = IS_DEV || IS_TEST;
  }

  /**
   * Log genérico (apenas em desenvolvimento)
   */
  log(message: string, options?: LogOptions): void {
    if (!this.enabled) return;
    
    const prefix = this.formatPrefix(options);
    console.log(prefix + message, options?.data || '');
    this.addToHistory('log', message);
  }

  /**
   * Log informativo (apenas em desenvolvimento)
   */
  info(message: string, options?: LogOptions): void {
    if (!this.enabled) return;
    
    const prefix = this.formatPrefix(options);
    console.info(prefix + message, options?.data || '');
    this.addToHistory('info', message);
  }

  /**
   * Warning (sempre mostrado)
   */
  warn(message: string, options?: LogOptions): void {
    const prefix = this.formatPrefix(options);
    console.warn(prefix + message, options?.data || '');
    this.addToHistory('warn', message);
  }

  /**
   * Erro (sempre mostrado)
   */
  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const prefix = this.formatPrefix(options);
    console.error(prefix + message, error || '');
    this.addToHistory('error', message);
    
    // Em produção, enviar para serviço de monitoramento (Sentry, etc)
    if (!this.enabled && error instanceof Error) {
      // TODO: Integrar com Sentry ou similar
      // Sentry.captureException(error);
    }
  }

  /**
   * Debug (apenas em desenvolvimento)
   */
  debug(message: string, data?: any): void {
    if (!this.enabled) return;
    console.debug(`🐛 ${message}`, data || '');
    this.addToHistory('debug', message);
  }

  /**
   * Grupo de logs (apenas em desenvolvimento)
   */
  group(label: string, callback: () => void): void {
    if (!this.enabled) return;
    console.group(label);
    callback();
    console.groupEnd();
  }

  /**
   * Tabela (apenas em desenvolvimento)
   */
  table(data: any): void {
    if (!this.enabled) return;
    console.table(data);
  }

  /**
   * Timer (apenas em desenvolvimento)
   */
  time(label: string): void {
    if (!this.enabled) return;
    console.time(label);
  }

  timeEnd(label: string): void {
    if (!this.enabled) return;
    console.timeEnd(label);
  }

  /**
   * Formatar prefixo do log
   */
  private formatPrefix(options?: LogOptions): string {
    const parts: string[] = [];
    
    if (options?.emoji) {
      parts.push(options.emoji);
    }
    
    if (options?.prefix) {
      parts.push(`[${options.prefix}]`);
    }
    
    return parts.length > 0 ? parts.join(' ') + ' ' : '';
  }

  /**
   * Adicionar ao histórico
   */
  private addToHistory(level: LogLevel, message: string): void {
    this.logHistory.push({
      level,
      message,
      timestamp: new Date()
    });

    // Manter apenas os últimos N logs
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory = this.logHistory.slice(-this.maxHistory);
    }
  }

  /**
   * Obter histórico de logs
   */
  getHistory(level?: LogLevel): Array<{ level: LogLevel; message: string; timestamp: Date }> {
    if (level) {
      return this.logHistory.filter(log => log.level === level);
    }
    return this.logHistory;
  }

  /**
   * Limpar histórico
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Ativar/desativar logger manualmente
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Verificar se está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton
export const logger = new Logger();

// Exports para compatibilidade
export default logger;

/**
 * Helpers específicos para cada domínio
 */

export const dataLogger = {
  log: (msg: string, data?: any) => logger.log(msg, { emoji: '📊', prefix: 'DataContext', data }),
  warn: (msg: string, data?: any) => logger.warn(msg, { emoji: '⚠️', prefix: 'DataContext', data }),
  error: (msg: string, error?: any) => logger.error(msg, error, { emoji: '❌', prefix: 'DataContext' }),
};

export const automationLogger = {
  log: (msg: string, data?: any) => logger.log(msg, { emoji: '🤖', prefix: 'Automation', data }),
  warn: (msg: string, data?: any) => logger.warn(msg, { emoji: '⚠️', prefix: 'Automation', data }),
  error: (msg: string, error?: any) => logger.error(msg, error, { emoji: '❌', prefix: 'Automation' }),
};

export const syncLogger = {
  log: (msg: string, data?: any) => logger.log(msg, { emoji: '🔄', prefix: 'Sync', data }),
  warn: (msg: string, data?: any) => logger.warn(msg, { emoji: '⚠️', prefix: 'Sync', data }),
  error: (msg: string, error?: any) => logger.error(msg, error, { emoji: '❌', prefix: 'Sync' }),
};

export const storageLogger = {
  log: (msg: string, data?: any) => logger.log(msg, { emoji: '💾', prefix: 'Storage', data }),
  warn: (msg: string, data?: any) => logger.warn(msg, { emoji: '⚠️', prefix: 'Storage', data }),
  error: (msg: string, error?: any) => logger.error(msg, error, { emoji: '❌', prefix: 'Storage' }),
};
