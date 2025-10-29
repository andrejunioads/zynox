# 🚀 PLANO DE IMPLEMENTAÇÃO - MODAL DE PROJETOS

## 📊 ANÁLISE DO ESTADO ATUAL

### ✅ O que está funcionando:
- Modal abre corretamente
- Navegação lateral entre seções
- Overview com métricas e alertas
- Badges de notificação dinâmicos
- Integração com sistema de clientes
- Tarefas urgentes com ações básicas

### ❌ O que precisa ser implementado/corrigido:
- Header de métricas aparece em todas as abas (deve aparecer só no Overview)
- Kanban de tarefas não tem drag-and-drop funcional
- Não há modal de detalhes individuais de tarefa
- Botões de ação em várias abas não funcionam
- CRUD incompleto em várias seções
- Falta integração entre componentes

---

## 🎯 FASE 1: ARQUITETURA E ESTRUTURA BASE

### Objetivo: Organizar header de métricas
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 15 minutos

#### 1.1 Remover Header de Métricas das Abas Secundárias
- **Localização:** `ProjectDetailsModalNew.tsx` linhas ~400-560
- **Ação:** Mover todo o bloco do header (métricas + ações rápidas) para dentro do componente `OverviewSection`
- **Benefício:** Interface mais limpa nas outras abas, foco no conteúdo específico

#### 1.2 Estrutura Proposta:
```typescript
// ANTES (atual):
<div className="px-6 py-4 border-b border-slate-700">
  {/* Header com métricas - APARECE EM TODAS ABAS */}
  <h1>Título</h1>
  <div>4 cards de métricas</div>
  <div>Botões de ação</div>
</div>
<ScrollArea>
  {activeSection === "overview" && <OverviewSection />}
  {activeSection === "tasks" && <TasksSection />}
</ScrollArea>

// DEPOIS (novo):
<ScrollArea>
  {activeSection === "overview" && (
    <OverviewSection>
      {/* Header com métricas DENTRO do Overview */}
      <HeaderMetrics />
      <QuickActions />
      <AlertsSection />
      {/* ... resto do overview */}
    </OverviewSection>
  )}
  {activeSection === "tasks" && (
    <TasksSection>
      {/* SEM header de métricas, apenas título */}
      <h2>Tarefas</h2>
      <KanbanBoard />
    </TasksSection>
  )}
</ScrollArea>
```

#### 1.3 Validação:
- [ ] Header aparece apenas no Overview
- [ ] Outras abas têm título simples
- [ ] Sem quebras visuais

---

## 🎯 FASE 2: ABA TAREFAS - KANBAN FUNCIONAL

### Objetivo: Implementar sistema completo de gestão de tarefas
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 2 horas

### 2.1 Análise da Aba Atual de Tarefas

**Componente atual:** `ProjectTasksKanban`
**Problemas identificados:**
- Drag-and-drop não está implementado (usa `dnd-kit` mas handlers vazios)
- Não há modal de detalhes da tarefa
- Botão "Adicionar Tarefa" não funciona completamente
- Métricas de tarefas não são calculadas dinamicamente

### 2.2 Implementação do Drag-and-Drop

**Biblioteca:** `@dnd-kit/core` + `@dnd-kit/sortable` (já instalada)

#### 2.2.1 Estrutura de Dados:
```typescript
interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  deadline?: string;
  tags?: string[];
  attachments?: number;
  comments?: number;
  checklist?: {
    total: number;
    completed: number;
  };
}
```

#### 2.2.2 Handlers Necessários:
```typescript
const handleDragStart = (event: DragStartEvent) => {
  // Capturar tarefa sendo arrastada
  // Adicionar feedback visual
};

const handleDragOver = (event: DragOverEvent) => {
  // Preview da posição de drop
  // Highlight da coluna alvo
};

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (!over) return;
  
  // Extrair taskId e novo status
  const taskId = active.id;
  const newStatus = over.id; // 'todo', 'in-progress', etc.
  
  // Atualizar projeto
  onTaskMove(taskId, newStatus);
  
  // Toast de confirmação
  toast.success('Tarefa movida!');
  
  // Adicionar ao histórico
  addActivity('task_moved', user, `moveu tarefa para ${newStatus}`);
};
```

### 2.3 Modal de Detalhes da Tarefa

**Novo componente:** `TaskDetailsModal.tsx`

#### 2.3.1 Estrutura do Modal:
```
┌─────────────────────────────────────────┐
│ [X] Nome da Tarefa             [Status]│
├─────────────────────────────────────────┤
│ Descrição:                              │
│ [Editor de texto rico]                  │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│ │Responsável│ │Prioridade│ │Deadline │ │
│ └──────────┘ └──────────┘ └─────────┘ │
│                                         │
│ Tags: [tag1] [tag2] [+]                │
│                                         │
│ Checklist:                              │
│ □ Item 1                                │
│ ☑ Item 2                                │
│ [+ Adicionar item]                      │
│                                         │
│ Anexos: [arquivo1.pdf] [+]             │
│                                         │
│ Comentários (3):                        │
│ └─ João: "Precisa revisar..."          │
│    └─ Maria: "Já revisei!"             │
│                                         │
│ [Salvar] [Cancelar]                     │
└─────────────────────────────────────────┘
```

#### 2.3.2 Funcionalidades:
- ✅ Editar título inline
- ✅ Descrição com markdown support
- ✅ Alterar responsável (dropdown com membros da equipe)
- ✅ Alterar prioridade (low/medium/high)
- ✅ Definir/editar deadline (datepicker)
- ✅ Adicionar/remover tags
- ✅ Checklist interativo
- ✅ Upload de anexos
- ✅ Sistema de comentários com replies
- ✅ Histórico de mudanças
- ✅ Excluir tarefa

### 2.4 Melhorias Visuais no Kanban

#### 2.4.1 Indicadores Visuais:
- **Bordas coloridas por prioridade:**
  - 🔴 Alta: `border-red-500`
  - 🟡 Média: `border-yellow-500`
  - 🔵 Baixa: `border-blue-500`

- **Status de deadline:**
  - ⚠️ Atrasada: fundo vermelho claro, pulsando
  - ⏰ Próxima (< 3 dias): fundo laranja claro
  - ✅ Normal: fundo padrão

- **Progresso de checklist:**
  - Barra de progresso visual
  - Contador "3/5 concluídos"

#### 2.4.2 Métricas por Coluna:
```
┌─────────────────────────────┐
│ 📋 A Fazer (5)              │
│ ────────────────────────    │ ← Contador
│                             │
│ [Tarefa 1] 🔴 High          │
│ [Tarefa 2] 🟡 Medium        │
│ ...                         │
└─────────────────────────────┘
```

### 2.5 Validação da Fase 2:
- [ ] Drag-and-drop funcionando entre colunas
- [ ] Modal de detalhes abre ao clicar na tarefa
- [ ] Todos os campos do modal são editáveis
- [ ] Mudanças são salvas e refletidas no projeto
- [ ] Toast de feedback em todas ações
- [ ] Histórico de atividades registra mudanças
- [ ] Health score recalcula após mudanças

---

## 🎯 FASE 3: ABA EQUIPE

### Objetivo: Gestão completa de membros da equipe
**Prioridade:** 🟡 ALTA
**Tempo estimado:** 1 hora

### 3.1 Funcionalidades Necessárias:

#### 3.1.1 Visualização de Membros:
```
┌────────────────────────────────────────┐
│ [+ Adicionar Membro]           [Grid/List]│
├────────────────────────────────────────┤
│ ┌─────────────────────────────────┐   │
│ │ [Avatar] João Silva            │   │
│ │          Desenvolvedor         │   │
│ │          ──────────────        │   │
│ │          Tarefas: 5/10 (50%)   │   │
│ │          Ativo há 2 dias       │   │
│ │          [Ver Tarefas] [...]   │   │
│ └─────────────────────────────────┘   │
└────────────────────────────────────────┘
```

#### 3.1.2 Modal de Adicionar Membro:
- Buscar membros existentes no sistema
- Definir role no projeto
- Definir permissões
- Adicionar ao histórico

#### 3.1.3 Card de Membro (Expandido):
- **Informações básicas:** Nome, email, telefone
- **Papel no projeto:** Developer, Designer, PM, etc.
- **Tarefas atribuídas:** Lista clicável
- **Workload:** Gráfico visual de capacidade
- **Disponibilidade:** Online/Offline
- **Ações:** Atribuir tarefa, Remover, Editar permissões

### 3.2 Validação:
- [ ] Adicionar membro funciona
- [ ] Remover membro funciona
- [ ] Visualizar tarefas do membro
- [ ] Editar role/permissões
- [ ] Workload calculado corretamente

---

## 🎯 FASE 4: ABA MARCOS (MILESTONES)

### Objetivo: Timeline visual de marcos do projeto
**Prioridade:** 🟡 ALTA
**Tempo estimado:** 1 hora

### 4.1 Componente de Timeline:
```
┌──────────────────────────────────────────┐
│ [+ Novo Marco]                     [⚙️]│
├──────────────────────────────────────────┤
│                                          │
│  ├─⬤ 15 Mar - Início do Projeto ✅     │
│  │                                       │
│  ├─⬤ 30 Mar - Design Aprovado ✅       │
│  │                                       │
│  ├─⬤ 15 Abr - MVP Completo ⏳ 80%     │
│  │   └─ Responsável: João Silva         │
│  │   └─ 3 tarefas pendentes             │
│  │                                       │
│  ├─○ 30 Abr - Testes Finais ⏸️        │
│  │                                       │
│  └─○ 15 Mai - Entrega Final            │
│                                          │
└──────────────────────────────────────────┘
```

### 4.2 Modal de Criar/Editar Marco:
- Nome do marco
- Descrição
- Data prevista
- Responsável
- Tarefas vinculadas
- Status (pending/in-progress/completed/cancelled)
- Critérios de conclusão

### 4.3 Validação:
- [ ] CRUD completo de marcos
- [ ] Timeline visual funcionando
- [ ] Progresso calculado por tarefas vinculadas
- [ ] Notificações de marco próximo

---

## 🎯 FASE 5: ABA ORÇAMENTO

### Objetivo: Gestão financeira completa do projeto
**Prioridade:** 🟢 MÉDIA
**Tempo estimado:** 1.5 horas

### 5.1 Visualização:
```
┌────────────────────────────────────────┐
│ 💰 Valor Total: R$ 50.000,00          │
│ 📊 Gasto: R$ 28.500,00 (57%)          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                        │
│ Plano de Pagamento:                    │
│ ┌────────────────────────────────┐   │
│ │ ✅ Fatura #001 - R$ 15.000,00  │   │
│ │    Pago em 15/03/2025          │   │
│ ├────────────────────────────────┤   │
│ │ ✅ Fatura #002 - R$ 13.500,00  │   │
│ │    Pago em 15/04/2025          │   │
│ ├────────────────────────────────┤   │
│ │ ⏳ Fatura #003 - R$ 10.000,00  │   │
│ │    Vence em 15/05/2025         │   │
│ │    [Marcar Pago]               │   │
│ └────────────────────────────────┘   │
│                                        │
│ Breakdown de Custos:                   │
│ • Desenvolvimento: R$ 30.000 (60%)     │
│ • Design: R$ 10.000 (20%)             │
│ • Hospedagem: R$ 5.000 (10%)          │
│ • Outros: R$ 5.000 (10%)              │
└────────────────────────────────────────┘
```

### 5.2 Funcionalidades:
- Registrar pagamentos recebidos
- Adicionar despesas
- Gerar relatórios
- Exportar para PDF/Excel
- Gráficos de fluxo de caixa

---

## 🎯 FASE 6: ABA RISCOS

### Objetivo: Gestão proativa de riscos
**Prioridade:** 🟢 MÉDIA
**Tempo estimado:** 45 minutos

### 6.1 Matriz de Riscos:
```
Alta     │ [!] Risco 3
         │
Média    │         [!] Risco 2
         │
Baixa    │ [!] Risco 1
         │
         └────────────────────
           Baixa  Média  Alta
              Probabilidade
```

### 6.2 Card de Risco:
- Título e descrição
- Severidade (baixa/média/alta/crítica)
- Probabilidade (baixa/média/alta)
- Impacto estimado
- Status (identificado/em-monitoramento/mitigado/ocorreu)
- Plano de mitigação
- Responsável pelo acompanhamento

---

## 🎯 FASE 7-10: ABAS RESTANTES

### FASE 7: Notas (45min)
- Editor de notas com markdown
- Tags e categorização
- Busca e filtros
- Pin importantes

### FASE 8: Arquivos (1h)
- Upload drag-and-drop
- Preview de arquivos
- Organização por pastas
- Compartilhamento

### FASE 9: Comentários (1h)
- Sistema de comments
- Replies (respostas)
- Mentions (@usuario)
- Reactions (emojis)

### FASE 10: Histórico (30min)
- Timeline de todas atividades
- Filtros por tipo/usuário/data
- Exportação
- Busca

---

## 🎯 FASE 11: TESTES E OTIMIZAÇÃO

### 11.1 Checklist de Testes:
- [ ] Todos botões funcionando
- [ ] Sem console errors
- [ ] Sem warnings do React
- [ ] Performance (< 100ms em ações)
- [ ] Responsividade mobile
- [ ] Acessibilidade (keyboard navigation)
- [ ] Estados de loading
- [ ] Estados de erro
- [ ] Validações de formulário

### 11.2 Otimizações:
- Lazy loading de componentes pesados
- Memoização de cálculos complexos
- Debounce em inputs de busca
- Virtual scrolling em listas grandes
- Code splitting por rota

---

## 📈 CRONOGRAMA ESTIMADO

| Fase | Descrição | Tempo | Prioridade |
|------|-----------|-------|------------|
| 1 | Arquitetura Base | 15min | 🔴 Crítica |
| 2 | Kanban + Task Modal | 2h | 🔴 Crítica |
| 3 | Equipe | 1h | 🟡 Alta |
| 4 | Marcos | 1h | 🟡 Alta |
| 5 | Orçamento | 1.5h | 🟢 Média |
| 6 | Riscos | 45min | 🟢 Média |
| 7 | Notas | 45min | 🟢 Média |
| 8 | Arquivos | 1h | 🟢 Média |
| 9 | Comentários | 1h | 🟢 Média |
| 10 | Histórico | 30min | 🟢 Média |
| 11 | Testes | 1h | 🟡 Alta |
| **TOTAL** | **~10-12 horas** | - | - |

---

## 🎯 ENTREGAS POR SPRINT

### Sprint 1 (Primeira Sessão - 2-3h):
- ✅ Fase 1: Remover header das abas
- ✅ Fase 2: Kanban funcional + Task modal
- ✅ Validação e testes da Fase 2

### Sprint 2 (Segunda Sessão - 2-3h):
- ✅ Fase 3: Aba Equipe
- ✅ Fase 4: Aba Marcos
- ✅ Fase 5: Aba Orçamento

### Sprint 3 (Terceira Sessão - 2-3h):
- ✅ Fases 6-10: Abas restantes
- ✅ Fase 11: Testes gerais
- ✅ Polimento final

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ **Aprovar este plano** ou sugerir ajustes
2. 🔨 **Iniciar Fase 1** - Remover header das abas secundárias
3. 🔨 **Iniciar Fase 2** - Implementar Kanban funcional
4. 📝 **Documentar** cada implementação
5. 🧪 **Testar** continuamente

---

**Criado em:** 26/10/2025
**Status:** 🟡 Aguardando Aprovação
**Autor:** AI Engineering Assistant


