/**
 * 🔒 STORAGE CONFIGURATION
 * Centraliza todas as chaves de armazenamento do sistema
 */

export const STORAGE_KEYS = {
  // Nebula (DataContext)
  MEMBERS: 'nebula-members',
  CLIENTS: 'nebula-clients',
  LEADS: 'nebula-leads',
  PROJECTS: 'nebula-projects',
  FOLLOWUPS: 'nebula-followups',
  FINANCIAL: 'nebula-financial',
  TEAMS: 'nebula-teams',
  
  // Automações
  AUTOMATIONS: 'zynox_automations',
  AUTOMATION_LOGS: 'zynox_automation_logs',
  AUTOMATION_VERSION: 'zynox_system_automations_version',
  
  // Configurações
  WEBHOOK_CONFIG: 'zynox_webhook_config',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  
  // Backups
  BACKUP_PREFIX: 'nebula-backup-',
  CORRUPTED_PREFIX: 'corrupted-',
} as const;

/**
 * Versão das automações do sistema
 * Incremente ao atualizar automações padrão
 */
export const SYSTEM_AUTOMATIONS_VERSION = '1.0.0';
