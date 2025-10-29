// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEAM SYNC HOOK - SINCRONIZAÇÃO SIMPLIFICADA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// Hook simplificado para sincronização de equipe
// A sincronização real é feita pelo DataContext
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useMembers } from '@/contexts/DataContext';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TeamSyncOptions {
  // Opções futuras se necessário
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useTeamSync = (options: TeamSyncOptions = {}) => {
  const { members } = useMembers();
  
  // Hook simplificado - apenas retorna os membros
  // A sincronização é feita pelo DataContext
  return {
    members,
    isLoading: false
  };
};