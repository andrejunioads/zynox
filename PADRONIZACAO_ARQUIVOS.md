# 📋 Padronização de Upload de Arquivos

## ✅ Status de Implementação

### 🎯 Projetos e Tarefas

| Local | Status | Componente | Configuração |
|-------|--------|------------|--------------|
| ✅ Modal de Edição de Tarefa | **IMPLEMENTADO** | `TaskDetailsModal` | maxFiles: 20, maxSizeMB: 10 |
| ✅ Modal de Criação de Tarefa | **IMPLEMENTADO** | `AddTaskModal` | maxFiles: 10, maxSizeMB: 10, compact: true |
| 🔄 Modal de Detalhes do Projeto | PRÓXIMO | `ProjectDetailsModalNew` | maxFiles: 50, maxSizeMB: 20 |

### 👥 Clientes

| Local | Status | Componente | Categoria |
|-------|--------|------------|-----------|
| 🔄 Modal de Cliente - Documentos | PENDENTE | `ClienteDocumentos` | category: "client-documents" |
| 🔄 Modal de Cliente - Contratos | PENDENTE | `ClienteContrato` | category: "client-contracts" |
| 🔄 Modal de Adicionar Cliente | PENDENTE | `AddClienteModal` | category: "client" |

### 💼 CRM / Comercial

| Local | Status | Componente | Categoria |
|-------|--------|------------|-----------|
| 🔄 Modal de Detalhes do Lead | PENDENTE | `LeadDetailsModal` | category: "lead" |
| 🔄 Criação de Novo Lead | PENDENTE | Dentro do Kanban | category: "lead" |

### 💰 Financeiro

| Local | Status | Componente | Categoria |
|-------|--------|------------|-----------|
| 🔄 Modal de Movimentação | PENDENTE | `AddMovimentacaoModal` | category: "financial-receipt" |
| 🔄 Comprovantes de Pagamento | PENDENTE | - | category: "payment-proof" |

### 📅 Reuniões

| Local | Status | Componente | Categoria |
|-------|--------|------------|-----------|
| 🔄 Card de Reunião | PENDENTE | `MeetingCard` | category: "meeting" |
| 🔄 Atas de Reunião | PENDENTE | - | category: "meeting-minutes" |

## 🎨 Padrões de Implementação

### 📐 Configurações Recomendadas por Contexto

#### Tarefas
```typescript
<FileUploader
  files={task.files || []}
  onFilesChange={(files) => updateTask({ ...task, files })}
  uploadedBy={currentUser.name}
  category="task"
  relatedId={task.id}
  maxFiles={20}
  maxSizeMB={10}
  showPreview={true}
  compact={false}
/>
```

#### Projetos
```typescript
<FileUploader
  files={project.files || []}
  onFilesChange={(files) => updateProject({ ...project, files })}
  uploadedBy={currentUser.name}
  category="project"
  relatedId={project.id}
  maxFiles={50}
  maxSizeMB={20}
  showPreview={true}
  allowedTypes={['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
/>
```

#### Clientes - Documentos
```typescript
<FileUploader
  files={cliente.documents || []}
  onFilesChange={(files) => updateCliente({ ...cliente, documents: files })}
  uploadedBy={currentUser.name}
  category="client-documents"
  relatedId={cliente.id}
  maxFiles={30}
  maxSizeMB={15}
  title="Documentos"
  allowedTypes={['application/pdf', 'image/*']}
/>
```

#### Leads / CRM
```typescript
<FileUploader
  files={lead.attachments || []}
  onFilesChange={(files) => updateLead({ ...lead, attachments: files })}
  uploadedBy={currentUser.name}
  category="lead"
  relatedId={lead.id}
  maxFiles={10}
  maxSizeMB={5}
  compact={true}
  title="Anexos"
/>
```

#### Financeiro - Comprovantes
```typescript
<FileUploader
  files={transaction.receipts || []}
  onFilesChange={(files) => updateTransaction({ ...transaction, receipts: files })}
  uploadedBy={currentUser.name}
  category="financial-receipt"
  relatedId={transaction.id}
  maxFiles={5}
  maxSizeMB={10}
  title="Comprovantes"
  allowedTypes={['image/*', 'application/pdf']}
  compact={true}
/>
```

#### Reuniões - Atas
```typescript
<FileUploader
  files={meeting.documents || []}
  onFilesChange={(files) => updateMeeting({ ...meeting, documents: files })}
  uploadedBy={currentUser.name}
  category="meeting"
  relatedId={meeting.id}
  maxFiles={10}
  maxSizeMB={10}
  title="Documentos da Reunião"
  compact={true}
/>
```

## 🔍 Características Padronizadas

### ✨ Funcionalidades Universais

Todos os FileUploaders implementados têm:

- ✅ **Drag & Drop**: Arraste arquivos diretamente
- ✅ **Sem botão**: Interface limpa, apenas drag & drop
- ✅ **Preview**: Visualização automática de imagens
- ✅ **Download**: Um clique para baixar qualquer arquivo
- ✅ **Exclusão**: Botão de remover com confirmação visual
- ✅ **Validação**: Tamanho e tipo validados automaticamente
- ✅ **Persistência**: Salvamento automático em Base64
- ✅ **Ícones por tipo**: Documento, imagem, vídeo, etc.
- ✅ **Estatísticas**: Contadores e tamanho total
- ✅ **Responsivo**: Funciona em todos os tamanhos de tela

### 🎯 Design Visual Consistente

- **Drop Zone**: Área tracejada com feedback visual
- **Cards de Arquivo**: Grid uniforme com informações
- **Preview**: 12x12 com overflow hidden e border-radius
- **Hover States**: Efeitos de hover nos botões de ação
- **Cores**: Primary para seleção, red para exclusão
- **Ícones**: Lucide React em todos os lugares

## 📊 Limites por Contexto

| Contexto | Max Files | Max Size (MB) | Tipos Permitidos |
|----------|-----------|---------------|------------------|
| Tarefa (criar) | 10 | 10 | Todos |
| Tarefa (editar) | 20 | 10 | Todos |
| Projeto | 50 | 20 | Imagens, PDFs, Docs |
| Cliente | 30 | 15 | PDFs, Imagens |
| Lead | 10 | 5 | Todos |
| Financeiro | 5 | 10 | Imagens, PDFs |
| Reunião | 10 | 10 | Todos |

## 🚀 Próximas Implementações

### Prioridade Alta
1. ✅ Modal de Criação de Tarefa
2. 🔄 Modal de Detalhes do Projeto
3. 🔄 Modal de Cliente - Documentos

### Prioridade Média
4. 🔄 Modal de Detalhes do Lead
5. 🔄 Modal de Movimentação Financeira

### Prioridade Baixa
6. 🔄 Cards de Reunião
7. 🔄 Modal de Cliente - Contratos

## 📝 Checklist de Implementação

Para cada novo local:

- [ ] Importar `FileUploader` e `FileData`
- [ ] Adicionar state `files` com tipo `FileData[]`
- [ ] Adicionar campo `files` na interface da entidade
- [ ] Implementar salvamento dos arquivos ao salvar entidade
- [ ] Carregar arquivos existentes ao abrir modal
- [ ] Configurar props apropriadas (maxFiles, maxSizeMB, etc)
- [ ] Testar upload, preview, download e exclusão
- [ ] Verificar persistência no localStorage
- [ ] Validar comportamento em diferentes tamanhos de tela

## 🎨 Exemplo de Implementação Completa

```typescript
// 1. Imports
import { FileUploader } from "@/components/common/FileUploader";
import { FileData } from "@/services/fileService";
import { useState, useEffect } from "react";

// 2. Interface da Entidade
interface MinhaEntidade {
  id: string;
  nome: string;
  // ... outros campos
  files?: FileData[];
}

// 3. Component
function MeuModal({ entidade, onSave }: Props) {
  const [editedEntity, setEditedEntity] = useState(entidade);
  const [files, setFiles] = useState<FileData[]>([]);

  // 4. Carregar arquivos existentes
  useEffect(() => {
    if (entidade.files) {
      setFiles(entidade.files);
    }
  }, [entidade]);

  // 5. Salvar com arquivos
  const handleSave = () => {
    const entityWithFiles = {
      ...editedEntity,
      files: files.length > 0 ? files : undefined,
    };
    onSave(entityWithFiles);
  };

  // 6. Renderizar
  return (
    <Dialog>
      <DialogContent>
        {/* Outros campos */}
        
        <FileUploader
          files={files}
          onFilesChange={setFiles}
          uploadedBy="André Silva"
          category="minha-categoria"
          relatedId={entidade.id}
          maxFiles={20}
          maxSizeMB={10}
        />

        <Button onClick={handleSave}>Salvar</Button>
      </DialogContent>
    </Dialog>
  );
}
```

## 🎯 Objetivos da Padronização

1. **Consistência**: Mesma experiência em todo o sistema
2. **Simplicidade**: Apenas drag & drop, sem botões desnecessários
3. **Visual**: Preview sempre que possível
4. **Funcionalidade**: Download e exclusão sempre disponíveis
5. **Persistência**: Tudo salvo localmente em Base64
6. **Performance**: Validações antes do upload
7. **UX**: Feedback visual em todas as ações

---

**Status Geral**: 2/15 implementados (13%)
**Última Atualização**: Sistema criado com sucesso
**Responsável**: Sistema Zynox - Arquivos Universais

