# 📊 Estratégia de Armazenamento - Nebula Stats Hub

## 🎯 VISÃO GERAL

Este documento define a estratégia de armazenamento para desenvolvimento local e produção em VPS.

---

## 📍 FASE 1: DESENVOLVIMENTO LOCAL (Atual)

### ✅ **localStorage (Já Implementado)**

**Vantagens:**
- ✅ Sem necessidade de backend
- ✅ Desenvolvimento rápido
- ✅ Funciona offline
- ✅ Gratuito
- ✅ Ideal para testes e prototipagem

**Limitações:**
- ⚠️ Limite de 5-10MB por domínio
- ⚠️ Dados apenas no navegador (não compartilhados)
- ⚠️ Pode ser limpo pelo usuário
- ⚠️ Sem sincronização entre dispositivos

**Status Atual:** ✅ **Totalmente implementado com:**
- Sistema robusto de erro (`storageHelpers.ts`)
- Backup automático antes de operações destrutivas
- Monitoramento de espaço
- Alertas quando próximo do limite
- Limpeza automática de dados órfãos

### 📊 **Estimativa de Uso de Espaço**

Com os dados atuais:
```
nebula-members:    ~50KB   (10 membros)
nebula-clients:    ~200KB  (50 clientes)
nebula-leads:      ~300KB  (100 leads)
nebula-projects:   ~500KB  (20 projetos)
nebula-followups:  ~100KB  (50 follow-ups)
nebula-financial:  ~150KB  (100 movimentações)
────────────────────────────────────────
TOTAL:             ~1.3MB
```

**Capacidade:** Você pode ter aproximadamente:
- ✅ **500 clientes**
- ✅ **1000 leads**
- ✅ **200 projetos**
- ✅ **500 follow-ups**

**Antes de atingir o limite de 5MB.**

### 🚨 **Quando Migrar para Backend?**

Considere migrar quando:
1. ❌ localStorage atingir 4MB (80% do limite)
2. ❌ Precisar acessar de múltiplos dispositivos
3. ❌ Precisar compartilhar dados com equipe
4. ❌ Precisar de histórico/auditoria completa
5. ❌ Precisar de relatórios complexos

---

## 🚀 FASE 2: PRODUÇÃO EM VPS (Futuro)

### 🎯 **Arquitetura Recomendada**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  - Interface do usuário                                     │
│  - localStorage como cache temporário                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS/REST API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js/Express)                   │
│  - Autenticação (JWT)                                       │
│  - API REST                                                 │
│  - Validações                                               │
│  - Lógica de negócio                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (PostgreSQL/MySQL)              │
│  - Dados persistentes                                       │
│  - Relacionamentos                                          │
│  - Transações ACID                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 **OPÇÕES DE BANCO DE DADOS**

### **Opção 1: PostgreSQL (⭐ RECOMENDADO)**

**Por que PostgreSQL?**
- ✅ Gratuito e open-source
- ✅ Excelente para dados relacionais
- ✅ Suporte a JSON (flexível)
- ✅ ACID compliant (transações seguras)
- ✅ Escalável
- ✅ Ótimo para relatórios complexos
- ✅ Comunidade enorme

**Ideal para:**
- ✅ Clientes, Leads, Projetos (relacionamentos complexos)
- ✅ Histórico e auditoria
- ✅ Relatórios financeiros
- ✅ Performance em grandes volumes

**Stack Recomendada:**
```
Frontend:  React + TanStack Query (react-query)
Backend:   Node.js + Express + Prisma ORM
Database:  PostgreSQL 15+
Auth:      JWT + bcrypt
Deploy:    VPS com Docker
```

**Custo na VPS:**
- PostgreSQL: Gratuito
- VPS básico: R$ 30-50/mês (DigitalOcean, Vultr, Contabo)

---

### **Opção 2: Supabase (⭐ Alternativa Fácil)**

**O que é?** Backend-as-a-Service baseado em PostgreSQL

**Vantagens:**
- ✅ PostgreSQL gerenciado
- ✅ API REST automática
- ✅ Autenticação pronta
- ✅ Storage de arquivos incluído
- ✅ Realtime subscriptions
- ✅ Dashboard administrativo
- ✅ Tier gratuito generoso

**Desvantagens:**
- ⚠️ Vendor lock-in
- ⚠️ Custo pode crescer
- ⚠️ Menos controle que self-hosted

**Ideal para:**
- ✅ MVP rápido
- ✅ Não quer gerenciar servidor
- ✅ Prototipagem

**Custo:**
- Free tier: 500MB database, 2GB storage
- Pro: $25/mês (2GB database, 100GB storage)

---

### **Opção 3: MySQL/MariaDB**

**Vantagens:**
- ✅ Gratuito e open-source
- ✅ Leve e rápido
- ✅ Fácil de configurar
- ✅ Muito usado (fácil encontrar ajuda)

**Desvantagens:**
- ⚠️ Menos recursos que PostgreSQL
- ⚠️ JSON support inferior

**Ideal para:**
- ✅ Projetos menores
- ✅ Hospedagens compartilhadas
- ✅ Orçamento apertado

---

### **Opção 4: MongoDB (❌ NÃO RECOMENDADO para este caso)**

**Por que não?**
- ❌ NoSQL não é ideal para dados relacionais complexos
- ❌ Joins são problemáticos
- ❌ Integridade referencial manual
- ❌ Relatórios complexos difíceis

**Quando usar MongoDB:**
- Se os dados forem puramente documentos independentes
- Logs e analytics
- Chat messages

---

## 🎯 **MINHA RECOMENDAÇÃO PARA VOCÊ**

### **FASE 1 (Agora): localStorage + Backup Manual**

✅ **Continuar com localStorage** porque:
1. Sistema já está robusto (implementei todas proteções)
2. Ideal para desenvolvimento e testes
3. Sem custos
4. Sem complexidade de backend

**Ações recomendadas:**
1. ✅ Usar a função `clearAllData()` para começar limpo
2. ✅ Criar backups periódicos (exportar JSON)
3. ✅ Monitorar o tamanho com `getLocalStorageSize()`
4. ✅ Quando atingir 3-4MB, começar a migração

**Criar sistema de Export/Import:**
```javascript
// Exportar dados para backup
const exportData = () => {
  const { clearAllData } = useData();
  const backup = createBackup(); // Já implementado

  // Download como arquivo JSON
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nebula-backup-${new Date().toISOString()}.json`;
  a.click();
};

// Importar dados de backup
const importData = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const backup = e.target.result;
    restoreBackup(backup); // Já implementado
  };
  reader.readAsText(file);
};
```

---

### **FASE 2 (Quando subir para VPS): PostgreSQL + Prisma**

Quando decidir migrar, recomendo:

**Stack:**
```
Frontend:  React (atual) + TanStack Query
Backend:   Node.js + Express + Prisma ORM
Database:  PostgreSQL 15
Auth:      JWT tokens
Deploy:    Docker na VPS
```

**Por que essa stack?**
- ✅ Prisma ORM é TypeScript-first (mesma linguagem do frontend)
- ✅ Migração do código atual será fácil
- ✅ PostgreSQL é robusto e gratuito
- ✅ Docker facilita deploy e backup
- ✅ Você já conhece JavaScript/TypeScript

**Exemplo de Schema Prisma:**
```prisma
// schema.prisma

model Cliente {
  id              String    @id @default(cuid())
  nome            String
  empresa         String
  email           String    @unique
  telefone        String?
  foto            String?
  healthScore     Int       @default(0)
  mrr             Float     @default(0)
  status          String    @default("ativo")

  // Relacionamentos
  projetos        Projeto[]
  movimentacoes   Movimentacao[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Lead {
  id              String    @id @default(cuid())
  nome            String
  empresa         String
  email           String
  telefone        String?
  stage           String
  value           Float
  origin          String?

  // Relacionamentos
  owner           Usuario?  @relation(fields: [ownerId], references: [id])
  ownerId         String?
  followUps       FollowUp[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Projeto {
  id              String    @id @default(cuid())
  nome            String
  descricao       String?
  status          String
  priority        String
  progress        Int       @default(0)
  healthScore     Int       @default(0)
  deadline        DateTime
  value           Float

  // Relacionamentos
  cliente         Cliente   @relation(fields: [clienteId], references: [id])
  clienteId       String
  tarefas         Tarefa[]
  team            ProjetoMembro[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Tarefa {
  id              String    @id @default(cuid())
  nome            String
  descricao       String?
  status          String
  priority        String
  deadline        DateTime?

  // Relacionamentos
  projeto         Projeto   @relation(fields: [projetoId], references: [id])
  projetoId       String
  usuario         Usuario?  @relation(fields: [usuarioId], references: [id])
  usuarioId       String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Usuario {
  id              String    @id @default(cuid())
  nome            String
  email           String    @unique
  senha           String    // Hashed com bcrypt
  avatar          String?
  cargo           String?
  isAdmin         Boolean   @default(false)

  // Relacionamentos
  leads           Lead[]
  tarefas         Tarefa[]
  projetos        ProjetoMembro[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 🔄 **ESTRATÉGIA DE MIGRAÇÃO (localStorage → PostgreSQL)**

### **Passo 1: Preparar Backend**

1. Criar API REST com Express
2. Configurar PostgreSQL
3. Criar schema com Prisma
4. Implementar autenticação JWT

### **Passo 2: Migração de Dados**

```typescript
// Script de migração
async function migrateLocalStorageToPostgres() {
  // 1. Exportar do localStorage
  const backup = createBackup();
  const data = JSON.parse(backup);

  // 2. Importar para PostgreSQL via API
  for (const cliente of data['nebula-clients']) {
    await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
  }

  // Repetir para leads, projetos, etc...
}
```

### **Passo 3: Atualizar Frontend Gradualmente**

```typescript
// Antes (localStorage)
const { clients } = useClients();

// Depois (API)
import { useQuery } from '@tanstack/react-query';

const { data: clients } = useQuery({
  queryKey: ['clients'],
  queryFn: () => fetch('/api/clientes').then(res => res.json())
});
```

### **Passo 4: Cache Híbrido**

Usar localStorage como **cache** + backend como fonte da verdade:

```typescript
// Carregar do servidor
const { data } = useQuery(['clients'], fetchClients);

// Salvar no localStorage como cache
useEffect(() => {
  if (data) {
    localStorage.setItem('nebula-clients-cache', JSON.stringify(data));
  }
}, [data]);

// Fallback offline: usar cache do localStorage
const cachedData = localStorage.getItem('nebula-clients-cache');
```

---

## 💰 **CUSTOS ESTIMADOS**

### **Opção 1: Self-Hosted na VPS (RECOMENDADO)**

```
VPS (2GB RAM, 50GB SSD):     R$ 30-50/mês
PostgreSQL:                  Gratuito
Node.js:                     Gratuito
Docker:                      Gratuito
Domain (.com.br):            R$ 40/ano
SSL Certificate:             Gratuito (Let's Encrypt)
────────────────────────────────────────
TOTAL:                       R$ 30-50/mês
```

**Provedores recomendados:**
- Contabo: Mais barato (€5/mês)
- DigitalOcean: Melhor UX ($6/mês)
- Vultr: Bom custo-benefício ($6/mês)
- Hetzner: Europa ($4/mês)

### **Opção 2: Supabase (Managed)**

```
Free Tier:                   R$ 0/mês (limite 500MB DB)
Pro Tier:                    R$ 130/mês ($25)
Domain:                      R$ 40/ano
────────────────────────────────────────
TOTAL:                       R$ 0-130/mês
```

---

## 🎯 **RECOMENDAÇÃO FINAL**

### **Agora (Desenvolvimento Local):**
✅ **Continuar com localStorage**
- Já está robusto e seguro
- Implementar export/import de backups
- Monitorar uso de espaço

### **Quando Migrar (3-6 meses):**
✅ **PostgreSQL + Prisma na VPS**
- Melhor custo-benefício
- Controle total
- Escalável
- R$ 30-50/mês

### **Alternativa Rápida:**
✅ **Supabase Free Tier**
- Se precisar migrar rápido
- Se não quiser gerenciar servidor
- Depois pode migrar para self-hosted

---

## 📚 **RECURSOS ÚTEIS**

### **Para Aprender PostgreSQL + Prisma:**
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [TanStack Query Docs](https://tanstack.com/query)

### **Para Deploy na VPS:**
- [Docker Tutorial](https://docs.docker.com/get-started/)
- [PM2 (Process Manager)](https://pm2.keymetrics.io/)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/)

---

## ❓ **PERGUNTAS FREQUENTES**

**Q: Quando exatamente devo migrar?**
A: Quando o localStorage atingir 4MB OU você precisar acessar de múltiplos dispositivos.

**Q: Vou perder os dados ao migrar?**
A: Não! O script de migração transfere tudo. Você pode manter ambos por um tempo.

**Q: PostgreSQL é difícil?**
A: Com Prisma ORM é muito fácil. É como usar o DataContext atual, mas com banco de dados.

**Q: Preciso mudar todo o código?**
A: Não! A migração pode ser gradual. DataContext pode buscar dados da API em vez do localStorage.

**Q: E se a VPS cair?**
A: Configure backups automáticos diários. PostgreSQL tem ferramentas nativas (`pg_dump`).

---

**Resumo:** Continue com localStorage agora, migre para PostgreSQL quando precisar. Você terá controle total e custos baixos (R$ 30-50/mês).

**Desenvolvido por:** Claude Code
**Data:** Outubro 2025
