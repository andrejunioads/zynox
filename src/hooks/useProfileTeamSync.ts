import { useEffect, useCallback } from 'react';
import { useUsuarios } from '@/contexts/DataContext';
import { useUser } from '@/context/UserContext';
import { Usuario } from '@/types/usuario';
import { toast } from 'sonner';

/**
 * Hook para sincronização automática bidirecional entre Perfil e Equipe
 * 
 * FUNCIONALIDADES:
 * - Sincroniza dados do Perfil (Configurações) com Usuario (Equipe)
 * - Mantém consistência entre UserContext e DataContext
 * - Detecta mudanças e atualiza automaticamente
 * - Logs de auditoria para debugging
 */
export const useProfileTeamSync = () => {
  const { usuarios, updateUsuario, getUsuario } = useUsuarios();
  const { user, updateUser } = useUser();

  // ✅ Buscar usuário atual (admin ou primeiro usuário)
  const usuarioAtual = usuarios.find(u => u.isAdmin) || usuarios[0];

  /**
   * Sincronizar Perfil → Equipe
   * Quando dados do Perfil mudam, atualiza o Usuario correspondente
   */
  const syncProfileToTeam = useCallback((profileData: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    cpf?: string;
    cargo?: string;
    departamento?: string;
    dataNascimento?: string;
    endereco?: string;
  }) => {
    if (!usuarioAtual) {
      console.warn('⚠️ useProfileTeamSync: Usuário atual não encontrado');
      return;
    }

    try {
      const updatedUsuario: Partial<Usuario> = {
        ...usuarioAtual,
        nome: profileData.firstName,
        sobrenome: profileData.lastName,
        nomeCompleto: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone || '',
        whatsapp: profileData.whatsapp || '',
        instagram: profileData.instagram || '',
        cpf: profileData.cpf || '',
        cargo: (profileData.cargo as any) || 'comercial',
        departamento: (profileData.departamento as any) || 'comercial',
        dataNascimento: profileData.dataNascimento || '',
        endereco: {
          rua: profileData.endereco || '',
        },
        photoUrl: profileData.avatarUrl || undefined,
        updatedAt: new Date().toISOString(),
      };

      updateUsuario(usuarioAtual.id, updatedUsuario);
      
      console.log('✅ useProfileTeamSync: Perfil → Equipe sincronizado', {
        usuarioId: usuarioAtual.id,
        nome: updatedUsuario.nomeCompleto,
        email: updatedUsuario.email,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ useProfileTeamSync: Erro na sincronização Perfil → Equipe', error);
      toast.error('Erro na sincronização com a equipe', {
        description: 'Tente novamente em alguns segundos'
      });
    }
  }, [usuarioAtual, updateUsuario]);

  /**
   * Sincronizar Equipe → Perfil
   * Quando dados do Usuario mudam, atualiza o UserContext
   */
  const syncTeamToProfile = useCallback((usuario: Usuario) => {
    try {
      updateUser({
        firstName: usuario.nome,
        lastName: usuario.sobrenome || '',
        email: usuario.email,
        avatarUrl: usuario.photoUrl || undefined,
        nickname: user.nickname, // Manter nickname do UserContext
      });

      console.log('✅ useProfileTeamSync: Equipe → Perfil sincronizado', {
        usuarioId: usuario.id,
        nome: usuario.nomeCompleto,
        email: usuario.email,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ useProfileTeamSync: Erro na sincronização Equipe → Perfil', error);
    }
  }, [updateUser, user.nickname]);

  /**
   * Verificar se há divergências entre Perfil e Equipe
   */
  const checkDivergences = useCallback(() => {
    if (!usuarioAtual) return [];

    const divergences = [];

    // Verificar nome
    if (user.firstName !== usuarioAtual.nome) {
      divergences.push({
        field: 'nome',
        profile: user.firstName,
        team: usuarioAtual.nome,
        type: 'mismatch'
      });
    }

    // Verificar sobrenome
    if (user.lastName !== (usuarioAtual.sobrenome || '')) {
      divergences.push({
        field: 'sobrenome',
        profile: user.lastName,
        team: usuarioAtual.sobrenome || '',
        type: 'mismatch'
      });
    }

    // Verificar email
    if (user.email !== usuarioAtual.email) {
      divergences.push({
        field: 'email',
        profile: user.email,
        team: usuarioAtual.email,
        type: 'mismatch'
      });
    }

    // Verificar avatar
    if (user.avatarUrl !== usuarioAtual.photoUrl) {
      divergences.push({
        field: 'avatar',
        profile: user.avatarUrl || 'null',
        team: usuarioAtual.photoUrl || 'null',
        type: 'mismatch'
      });
    }

    return divergences;
  }, [user, usuarioAtual]);

  /**
   * Auto-sincronizar quando usuário atual muda
   */
  useEffect(() => {
    if (usuarioAtual) {
      // Verificar divergências
      const divergences = checkDivergences();
      
      if (divergences.length > 0) {
        console.warn('⚠️ useProfileTeamSync: Divergências detectadas', divergences);
        
        // Auto-corrigir: Equipe → Perfil (Equipe é fonte da verdade)
        syncTeamToProfile(usuarioAtual);
        
        toast.info('🔄 Dados sincronizados automaticamente', {
          description: 'Algumas informações foram atualizadas para manter consistência'
        });
      }
    }
  }, [usuarioAtual, checkDivergences, syncTeamToProfile]);

  return {
    syncProfileToTeam,
    syncTeamToProfile,
    checkDivergences,
    usuarioAtual,
    isSynced: checkDivergences().length === 0
  };
};
