# 🚀 Guia de Migração: LocalStorage → Supabase

## 📋 Índice

1. [Situação Atual](#situação-atual)
2. [Plano de Migração](#plano-de-migração)
3. [Configuração Supabase](#configuração-supabase)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Implementação](#implementação)
6. [Alternativas ao Supabase](#alternativas-ao-supabase)

---

## 📍 Situação Atual

### ✅ O que já funciona (LocalStorage):

```
✅ Salvar membros da equipe
✅ Editar informações (nome, email, telefone, etc)
✅ Upload de fotos (base64)
✅ Persistência local (mesmo desligando PC)
✅ Reset de dados
```

### ⚠️ Limitações:

```
❌ Dados apenas no navegador local
❌ Não sincroniza entre dispositivos
❌ Não compartilha entre usuários
❌ Sem backup automático
❌ Limite de ~5MB (suficiente para ±50 membros com fotos)
```

---

## 🗺️ Plano de Migração

### **FASE 1: LocalStorage** ✅ (ATUAL)
```
┌──────────┐      ┌───────────────┐
│  React   │ ←──→ │ LocalStorage  │
│  App     │      │  (Navegador)  │
└──────────┘      └───────────────┘
```
**Status:** ✅ Funcionando  
**Prazo:** Pronto para desenvolvimento

---

### **FASE 2: Service Layer** 🔄 (IMPLEMENTADA)
```
┌──────────┐      ┌──────────┐      ┌───────────────┐
│  React   │ ←──→ │ Storage  │ ←──→ │ LocalStorage  │
│  App     │      │ Service  │      │  (Navegador)  │
└──────────┘      └──────────┘      └───────────────┘
```
**Status:** ✅ Pronto  
**Arquivo:** `src/services/storage.service.ts`  
**Benefício:** Facilita migração futura

---

### **FASE 3: Supabase** 🚀 (FUTURO)
```
┌──────────┐      ┌──────────┐      ┌────────────────┐
│  React   │ ←──→ │ Storage  │ ←──→ │   Supabase     │
│  App     │      │ Service  │      │ PostgreSQL +   │
│          │      │          │      │ Storage Bucket │
└──────────┘      └──────────┘      └────────────────┘
```
**Status:** 📝 Planejado  
**Prazo:** Quando estiver pronto para produção

---

## 🔧 Configuração Supabase

### Passo 1: Criar Conta
```bash
1. Acesse: https://supabase.com
2. Crie conta (grátis até 500MB + 2GB storage)
3. Crie novo projeto
4. Anote:
   - Project URL
   - anon/public key
```

### Passo 2: Instalar Dependências
```bash
npm install @supabase/supabase-js
```

### Passo 3: Configurar Cliente
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Passo 4: Variáveis de Ambiente
```bash
# .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

---

## 🗃️ Estrutura do Banco de Dados

### Tabela: `members`
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar TEXT NOT NULL,
  photo_url TEXT, -- URL do Supabase Storage
  instagram TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  department TEXT NOT NULL CHECK (department IN ('comercial', 'design', 'dev', 'ia', 'suporte', 'financeiro')),
  status TEXT NOT NULL CHECK (status IN ('online', 'away', 'offline')),
  type TEXT NOT NULL CHECK (type IN ('human', 'ai')),
  
  -- Stats (JSON)
  stats JSONB DEFAULT '{}',
  
  -- Metrics
  assigned_leads INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  active_tasks INTEGER DEFAULT 0,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- IA (opcional)
  ai_model TEXT,
  ai_capabilities TEXT[]
);

-- Índices
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_department ON members(department);
CREATE INDEX idx_members_type ON members(type);
CREATE INDEX idx_members_status ON members(status);

-- RLS (Row Level Security)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Membros visíveis para todos"
  ON members FOR SELECT
  USING (true);

CREATE POLICY "Apenas admins podem inserir"
  ON members FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM members WHERE is_admin = true));

CREATE POLICY "Apenas admins podem atualizar"
  ON members FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM members WHERE is_admin = true));
```

### Storage Bucket: `avatars`
```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Política de leitura
CREATE POLICY "Avatares públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Política de upload (apenas autenticados)
CREATE POLICY "Upload de avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );
```

---

## 💻 Implementação

### Implementar SupabaseService

```typescript
// src/services/storage.service.ts

import { supabase } from '@/lib/supabase';

class SupabaseService implements StorageService {
  
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Converter para formato Member
    return data.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      photoUrl: row.photo_url,
      instagram: row.instagram,
      role: row.role,
      department: row.department,
      status: row.status,
      type: row.type,
      stats: row.stats,
      assignedLeads: row.assigned_leads,
      activeProjects: row.active_projects,
      activeTasks: row.active_tasks,
      joinedAt: new Date(row.joined_at),
      lastActivity: new Date(row.last_activity),
      isActive: row.is_active,
      isAdmin: row.is_admin,
      aiModel: row.ai_model,
      aiCapabilities: row.ai_capabilities,
    }));
  }
  
  async saveMember(member: Member): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert({
        name: member.name,
        email: member.email,
        phone: member.phone,
        avatar: member.avatar,
        photo_url: member.photoUrl,
        instagram: member.instagram,
        role: member.role,
        department: member.department,
        status: member.status,
        type: member.type,
        stats: member.stats,
        assigned_leads: member.assignedLeads,
        active_projects: member.activeProjects,
        active_tasks: member.activeTasks,
        is_active: member.isActive,
        is_admin: member.isAdmin,
        ai_model: member.aiModel,
        ai_capabilities: member.aiCapabilities,
      })
      .select()
      .single();
      
    if (error) throw error;
    return member;
  }
  
  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        photo_url: updates.photoUrl,
        instagram: updates.instagram,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Member;
  }
  
  async uploadImage(file: File, path: string): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${path}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (error) throw error;
    
    // Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return publicUrl;
  }
  
  async deleteImage(url: string): Promise<void> {
    // Extrair path da URL
    const path = url.split('/avatars/')[1];
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([path]);
      
    if (error) throw error;
  }
}
```

### Ativar Supabase

```typescript
// src/services/storage.service.ts

// Mudar de false para true:
const USE_SUPABASE = true; // 🔥 ATIVAR SUPABASE
```

---

## 🔄 Migração de Dados

### Script de Migração

```typescript
// scripts/migrate-to-supabase.ts

import storageService from '@/services/storage.service';
import { supabase } from '@/lib/supabase';

async function migrateLocalToSupabase() {
  console.log('🚀 Iniciando migração...');
  
  // 1. Exportar dados do LocalStorage
  const localData = localStorage.getItem('nebula-members');
  if (!localData) {
    console.log('❌ Nenhum dado para migrar');
    return;
  }
  
  const members = JSON.parse(localData);
  console.log(`📊 Encontrados ${members.length} membros`);
  
  // 2. Inserir no Supabase
  for (const member of members) {
    console.log(`⬆️  Migrando ${member.name}...`);
    
    try {
      await supabase.from('members').insert({
        name: member.name,
        email: member.email,
        // ... outros campos
      });
      console.log(`✅ ${member.name} migrado`);
    } catch (error) {
      console.error(`❌ Erro ao migrar ${member.name}:`, error);
    }
  }
  
  console.log('🎉 Migração concluída!');
}

// Executar
migrateLocalToSupabase();
```

---

## 🆚 Alternativas ao Supabase

### 1. **Supabase** ⭐ (Recomendado)
```
✅ PostgreSQL + Storage integrado
✅ Auth built-in
✅ Real-time subscriptions
✅ Open source
✅ Free tier generoso (500MB DB + 1GB storage)
✅ Fácil migração de LocalStorage

❌ Requer configuração inicial
❌ Vendor lock-in leve
```

### 2. **Firebase** 
```
✅ Google Cloud Platform
✅ NoSQL (Firestore)
✅ Real-time sync
✅ Auth integrado
✅ Free tier OK

❌ NoSQL (diferente de SQL)
❌ Mais caro em escala
❌ Vendor lock-in forte
```

### 3. **PocketBase**
```
✅ Backend em Go (super rápido)
✅ Self-hosted (controle total)
✅ SQLite (simples)
✅ Admin UI built-in
✅ Gratuito (self-hosted)

❌ Precisa hospedar você mesmo
❌ Menos features que Supabase
```

### 4. **Appwrite**
```
✅ Open source
✅ Self-hosted
✅ Auth + Storage + Database
✅ Docker

❌ Setup mais complexo
❌ Self-hosted only
```

### 5. **Backend Próprio (Node.js + PostgreSQL)**
```
✅ Controle total
✅ Customizável
✅ Sem vendor lock-in

❌ Muito trabalho
❌ Precisa gerenciar infraestrutura
❌ Mais caro
```

---

## 📊 Comparação de Custos

| Serviço | Free Tier | Custo Mensal (100 users) |
|---------|-----------|--------------------------|
| **Supabase** | 500MB DB + 1GB storage | $25 (Pro) |
| **Firebase** | 1GB storage | $30-50 |
| **PocketBase** | Ilimitado (self-host) | $5-10 (VPS) |
| **Backend Próprio** | N/A | $20-100 (servidor) |

---

## 🎯 Recomendação

### Para seu caso:

**Use SUPABASE porque:**

1. ✅ **Compatível com sua stack:** PostgreSQL (SQL familiar)
2. ✅ **Fácil migração:** Service layer já preparado
3. ✅ **Storage integrado:** Upload de fotos direto
4. ✅ **Auth pronto:** Para multi-usuário futuro
5. ✅ **Real-time:** Sincronização automática
6. ✅ **Free tier suficiente:** Para MVP/testes
7. ✅ **Escalável:** Cresce com você

---

## 📅 Roadmap Sugerido

### **Agora (Desenvolvimento):**
- ✅ LocalStorage funcionando
- ✅ Service Layer criado
- ✅ Fotos em base64

### **Próximo Mês (Preparação):**
- 🔄 Criar conta Supabase
- 🔄 Configurar banco de dados
- 🔄 Testar com dados mock

### **Futuro (Produção):**
- 🚀 Ativar SupabaseService
- 🚀 Migrar dados existentes
- 🚀 Adicionar autenticação
- 🚀 Deploy para produção

---

## 🆘 Precisa de Ajuda?

Quando estiver pronto para migrar, basta me avisar que eu:
1. ✅ Implemento o SupabaseService completo
2. ✅ Crio script de migração automática
3. ✅ Configuro autenticação
4. ✅ Ajusto toda aplicação

**Você está no caminho certo! 🚀**


