# 🎯 Sistema de Modais por Tipo de Projeto

Este diretório contém modais específicos otimizados para cada tipo de projeto.

## 📂 Estrutura

```
modals/
├── WebsiteProjectModal.tsx      ✅ IMPLEMENTADO - Website/Desenvolvimento
├── TrafficProjectModal.tsx      🚧 TODO - Campanha de Tráfego Pago
├── AutomationProjectModal.tsx   🚧 TODO - Automação/Integração
├── DesignProjectModal.tsx       🚧 TODO - Design/Branding
├── ConsultingProjectModal.tsx   🚧 TODO - Consultoria/Serviço
└── GeneralProjectModal.tsx      ✅ Modal padrão/fallback
```

## 🎨 Tipos de Projeto

### 🌐 Website/Desenvolvimento (`website`)
**Modal:** `WebsiteProjectModal`  
**Foco:** Desenvolvimento técnico, features, bugs, testes  
**Métricas:**
- Features desenvolvidas
- Bugs corrigidos
- Testes realizados
- Progresso do desenvolvimento
- Timeline de deploys

### 📢 Tráfego Pago (`traffic`)
**Modal:** `TrafficProjectModal` (TODO)  
**Foco:** Métricas de ads, orçamento, conversões  
**Métricas Planejadas:**
- CPC (Custo por Clique)
- CTR (Taxa de Cliques)
- ROAS (Retorno sobre investimento em ads)
- Conversões
- Gastos por plataforma (Google, Facebook, etc)
- Otimizações de campanha

### ⚡ Automação (`automation`)
**Modal:** `AutomationProjectModal` (TODO)  
**Foco:** Fluxos, integrações, webhooks  
**Métricas Planejadas:**
- Fluxos criados
- Integrações configuradas
- Webhooks ativos
- Tempo economizado
- Processos automatizados
- Testes de automação

### 🎨 Design/Branding (`design`)
**Modal:** `DesignProjectModal` (TODO)  
**Foco:** Artes, aprovações, revisões  
**Métricas Planejadas:**
- Artes criadas
- Revisões solicitadas
- Aprovações recebidas
- Assets entregues
- Feedback do cliente
- Iterações de design

### 💼 Consultoria/Serviço (`consulting`)
**Modal:** `ConsultingProjectModal` (TODO)  
**Foco:** Horas trabalhadas, reuniões, deliverables  
**Métricas Planejadas:**
- Horas trabalhadas
- Reuniões realizadas
- Documentos entregues
- Recomendações implementadas
- Satisfação do cliente
- Outcomes alcançados

### 📋 Geral (`general`)
**Modal:** `GeneralProjectModal`  
Modal padrão que usa o `ProjectDetailsModalNew` completo.

## 🔄 Como Funciona

1. **Roteamento Automático:** O `ProjectModalRouter` detecta o tipo do projeto
2. **Modal Específico:** Carrega o modal otimizado para aquele tipo
3. **Fallback:** Se o tipo não tiver modal específico, usa o GeneralProjectModal

## 🚀 Como Adicionar um Novo Tipo

1. Adicione o tipo em `src/pages/Projetos.tsx`:
```typescript
export type ProjectType = 
  | "website"
  | "traffic"
  | "novo-tipo"; // ← adicione aqui
```

2. Crie o modal em `modals/NovoTipoModal.tsx`

3. Adicione no roteador (`ProjectModalRouter.tsx`):
```typescript
case "novo-tipo":
  return <NovoTipoModal {...modalProps} />;
```

## 💡 Benefícios

- ✅ **Foco:** Cada modal mostra só o que importa para aquele tipo
- ✅ **Métricas Relevantes:** KPIs específicos do tipo de projeto
- ✅ **UX Melhorada:** Interface otimizada para o workflow específico
- ✅ **Manutenibilidade:** Código organizado e separado por responsabilidade
- ✅ **Escalável:** Fácil adicionar novos tipos conforme necessário

## 📝 Próximos Passos

1. ✅ Implementar TrafficProjectModal com métricas de ads
2. ✅ Implementar AutomationProjectModal com fluxos
3. ✅ Implementar DesignProjectModal com aprovações
4. ✅ Implementar ConsultingProjectModal com horas/reuniões
5. ✅ Adicionar gráficos específicos em cada modal


