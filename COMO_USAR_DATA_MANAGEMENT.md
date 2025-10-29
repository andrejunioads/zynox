# 🎯 Como Adicionar o Componente de Gerenciamento de Dados

## 📦 O que foi criado?

Criei 3 novos arquivos:

1. **`STORAGE_STRATEGY.md`** - Guia completo sobre armazenamento
2. **`src/utils/exportImport.ts`** - Funções de export/import
3. **`src/components/settings/DataManagement.tsx`** - Interface visual

---

## 🚀 Como Usar

### **Opção 1: Adicionar na Página de Configurações (Recomendado)**

1. Abra o arquivo `src/pages/Configuracoes.tsx`

2. Importe o componente:
```typescript
import { DataManagement } from '@/components/settings/DataManagement';
```

3. Adicione o componente na página:
```tsx
<div className="space-y-6">
  {/* Seus outros componentes de configuração */}

  {/* Novo: Gerenciamento de Dados */}
  <DataManagement />
</div>
```

### **Opção 2: Via Console do DevTools**

Se quiser testar antes de adicionar na UI:

```javascript
// Exportar dados
import { exportAllData } from './src/utils/exportImport';
exportAllData();

// Importar dados
import { selectAndImportFile } from './src/utils/exportImport';
selectAndImportFile();

// Ver estatísticas
import { showDataStats } from './src/utils/exportImport';
showDataStats();

// Limpar tudo
const { clearAllData } = useData();
clearAllData({ keepMembers: true, createBackup: true });
```

---

## 🎨 Interface do Componente

O componente `<DataManagement />` inclui:

### **1. Status do Armazenamento**
- Mostra quanto espaço está sendo usado
- Barra de progresso visual
- Alerta quando próximo do limite (8MB+)

### **2. Exportar Dados**
- Baixa todos os dados em arquivo JSON
- Nome do arquivo: `nebula-backup-2025-10-29.json`
- Formato legível (JSON formatado)

### **3. Importar Dados**
- Seleciona arquivo JSON de backup
- Valida o formato
- Restaura todos os dados
- Sugere recarregar a página

### **4. Limpar Dados**
- Remove TODOS os dados das abas
- Mantém a equipe (membros)
- Cria backup automático antes
- Modal de confirmação

### **5. Estatísticas**
- Mostra quantos registros tem em cada módulo
- Mostra quanto espaço cada módulo ocupa
- Exibe tabela no console também

---

## 📸 Preview da Interface

```
┌─────────────────────────────────────────────────────────┐
│  Gerenciamento de Dados                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🖥️ Armazenamento Local                    1.3 MB      │
│  ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░ 13%                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📥 Exportar Dados          📤 Importar Dados           │
│  Fazer backup completo      Restaurar de backup         │
│  [Exportar Backup]          [Importar Backup]          │
│                                                          │
│  🗑️ Limpar Dados            📊 Estatísticas             │
│  Remover tudo               Ver detalhes                │
│  [Limpar Tudo]              [Ver Estatísticas]         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Funcionalidades

### **Exportar Backup**

Quando você clica em "Exportar Backup":

1. ✅ Cria arquivo JSON com TODOS os dados
2. ✅ Formata o JSON (legível)
3. ✅ Faz download automático
4. ✅ Nome com timestamp
5. ✅ Toast de confirmação

**Arquivo gerado:**
```json
{
  "nebula-members": [...],
  "nebula-clients": [...],
  "nebula-leads": [...],
  "nebula-projects": [...],
  "nebula-followups": [...],
  "nebula-financial": [...]
}
```

### **Importar Backup**

Quando você clica em "Importar Backup":

1. ✅ Abre seletor de arquivos
2. ✅ Valida se é JSON válido
3. ✅ Restaura todos os dados
4. ✅ Sugere recarregar página
5. ✅ Toast de confirmação

### **Limpar Tudo**

Quando você clica em "Limpar Tudo":

1. ✅ Mostra modal de confirmação
2. ✅ Lista o que será removido
3. ✅ Cria backup automático
4. ✅ Remove dados das abas
5. ✅ Mantém equipe
6. ✅ Toast de confirmação

### **Ver Estatísticas**

Quando você clica em "Ver Estatísticas":

1. ✅ Calcula registros por módulo
2. ✅ Calcula tamanho em KB
3. ✅ Mostra tabela no console
4. ✅ Mostra card na interface
5. ✅ Atualiza em tempo real

---

## 💡 Dicas de Uso

### **Faça Backups Periódicos**

Recomendo criar backups:
- ✅ **Diariamente** se adicionando muitos dados
- ✅ **Semanalmente** em uso normal
- ✅ **Antes de qualquer operação destrutiva**

### **Monitore o Espaço**

Quando o armazenamento chegar a:
- 🟢 **0-3MB**: Tudo OK
- 🟡 **3-5MB**: Fique atento
- 🔴 **5-8MB**: Comece a limpar dados antigos
- 🚨 **8MB+**: URGENTE - Migre para backend ou limpe

### **Organize os Backups**

Crie uma pasta no computador:
```
Backups-Nebula/
├── 2025-10-29-nebula-backup.json
├── 2025-10-30-nebula-backup.json
├── 2025-11-01-nebula-backup.json
└── ...
```

---

## 🔧 Personalização

Se quiser customizar o componente:

### **Mudar cores:**
```typescript
// Em DataManagement.tsx

// Barra de progresso
isNearLimit ? 'bg-red-500' : 'bg-green-500'

// Cards
className="border-green-500/30" // Verde para export
className="border-blue-500/30"  // Azul para import
```

### **Adicionar mais opções:**
```typescript
// Exemplo: Exportar apenas clientes
const exportClients = () => {
  const clients = localStorage.getItem('nebula-clients');
  // ... download
};
```

### **Mudar comportamento de limpeza:**
```typescript
// Limpar TUDO incluindo equipe
clearAllData({ keepMembers: false, createBackup: true });

// Limpar sem backup (não recomendado)
clearAllData({ keepMembers: true, createBackup: false });
```

---

## ⚠️ Importante

### **Backups NÃO são automáticos**

Os backups precisam ser feitos manualmente pelo usuário:
- ❌ Não há backup automático em nuvem
- ❌ Se limpar o navegador, perde os dados
- ✅ Sempre faça backup antes de limpar

### **Importar SUBSTITUI os dados**

Quando você importa um backup:
- ⚠️ Sobrescreve todos os dados atuais
- ⚠️ Não mescla com dados existentes
- ✅ Faça backup antes de importar

### **localStorage tem limite**

- 🔴 Máximo: ~10MB
- 🔴 Se atingir, o sistema para de salvar
- 🔴 Navegador pode limpar se ficar sem espaço

---

## 🎯 Próximos Passos

1. **Agora:** Adicione o componente nas Configurações
2. **Teste:** Exporte um backup e teste importar
3. **Monitore:** Verifique o tamanho periodicamente
4. **Quando atingir 4MB:** Leia o `STORAGE_STRATEGY.md` para migrar para VPS

---

## 📞 Ajuda Rápida

**Como adiciono isso nas configurações?**
→ Importe `<DataManagement />` em `Configuracoes.tsx`

**Onde ficam os backups?**
→ Na pasta de Downloads do seu computador

**Posso importar em outro computador?**
→ Sim! Basta ter o arquivo JSON

**E se eu deletar algo por engano?**
→ Importe o último backup que você fez

**Quanto espaço tenho?**
→ ~10MB no localStorage (entre 500-1000 clientes)

**Quando devo migrar para VPS?**
→ Quando atingir 4-5MB ou precisar acessar de vários lugares

---

**Desenvolvido por:** Claude Code
**Data:** Outubro 2025
