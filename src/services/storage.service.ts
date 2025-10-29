// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORAGE SERVICE - CAMADA DE ABSTRAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// ESTRATÉGIA:
// 1. FASE 1 (ATUAL): LocalStorage
// 2. FASE 2 (FUTURO): Supabase
// 
// Para migrar: Trocar apenas a implementação interna
// sem alterar o código dos componentes!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Member } from '@/types/member';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STORAGE_KEYS = {
  MEMBERS: 'nebula-members',
  TEAMS: 'nebula-teams',
  PROJECTS: 'nebula-projects',
  LEADS: 'nebula-leads',
} as const;

// Toggle para futura migração
const USE_SUPABASE = false; // 🔄 Mudar para true quando migrar

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACE DO SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface StorageService {
  // Members
  getMembers(): Promise<Member[]>;
  saveMember(member: Member): Promise<Member>;
  updateMember(id: string, updates: Partial<Member>): Promise<Member>;
  deleteMember(id: string): Promise<void>;
  
  // Images
  uploadImage(file: File, path: string): Promise<string>;
  deleteImage(url: string): Promise<void>;
  
  // Utility
  clearAllData(): Promise<void>;
  exportData(): Promise<string>; // JSON
  importData(jsonData: string): Promise<void>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPLEMENTAÇÃO: LOCAL STORAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LocalStorageService implements StorageService {
  // ── Members ─────────────────────────────────
  
  async getMembers(): Promise<Member[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      // Converter datas de string para Date
      return parsed.map((m: any) => ({
        ...m,
        joinedAt: new Date(m.joinedAt),
        lastActivity: new Date(m.lastActivity),
        stats: {
          ...m.stats,
          periodStart: new Date(m.stats.periodStart),
          periodEnd: new Date(m.stats.periodEnd),
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      return [];
    }
  }
  
  async saveMember(member: Member): Promise<Member> {
    const members = await this.getMembers();
    const exists = members.find(m => m.id === member.id);
    
    if (exists) {
      return this.updateMember(member.id, member);
    }
    
    const updated = [...members, member];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
    return member;
  }
  
  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    const members = await this.getMembers();
    const index = members.findIndex(m => m.id === id);
    
    if (index === -1) {
      throw new Error(`Membro ${id} não encontrado`);
    }
    
    const updated = {
      ...members[index],
      ...updates,
      lastActivity: new Date(), // Atualizar última atividade
    };
    
    members[index] = updated;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return updated;
  }
  
  async deleteMember(id: string): Promise<void> {
    const members = await this.getMembers();
    const filtered = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filtered));
  }
  
  // ── Images ─────────────────────────────────
  
  async uploadImage(file: File, path: string): Promise<string> {
    // LocalStorage: Converter para base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  async deleteImage(url: string): Promise<void> {
    // LocalStorage: Nada a fazer (base64 inline)
    return Promise.resolve();
  }
  
  // ── Utility ────────────────────────────────
  
  async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  async exportData(): Promise<string> {
    const data = {
      members: await this.getMembers(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  }
  
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (data.members) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
      }
    } catch (error) {
      throw new Error('Dados inválidos para importação');
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPLEMENTAÇÃO: SUPABASE (FUTURO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SupabaseService implements StorageService {
  // TODO: Implementar quando migrar para Supabase
  // - Conectar com Supabase Client
  // - Members → supabase.from('members')
  // - Images → supabase.storage.from('avatars')
  
  async getMembers(): Promise<Member[]> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async saveMember(member: Member): Promise<Member> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async deleteMember(id: string): Promise<void> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async uploadImage(file: File, path: string): Promise<string> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async deleteImage(url: string): Promise<void> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async clearAllData(): Promise<void> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async exportData(): Promise<string> {
    throw new Error('Supabase ainda não configurado');
  }
  
  async importData(jsonData: string): Promise<void> {
    throw new Error('Supabase ainda não configurado');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON - INSTÂNCIA ÚNICA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 🔄 Para migrar: Mude apenas esta linha!
const storageService: StorageService = USE_SUPABASE 
  ? new SupabaseService() 
  : new LocalStorageService();

export default storageService;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOKS AUXILIARES (React)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useMembers = () => {
  // TODO: Implementar hook customizado
  // - Gerenciar loading state
  // - Gerenciar error state
  // - Cache com React Query
};


