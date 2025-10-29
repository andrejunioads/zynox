# 📁 Sistema Universal de Gerenciamento de Arquivos

## 🎯 Visão Geral

Sistema completo e universal para upload, download e gerenciamento de arquivos em qualquer parte do sistema. Usa Base64 para persistência no localStorage, garantindo que todos os arquivos sejam salvos localmente.

## 🚀 Componentes Principais

### 1. FileService (`src/services/fileService.ts`)

Serviço centralizado com todas as funções necessárias para gerenciar arquivos.

#### Funcionalidades:

- ✅ **Upload de arquivos** (único ou múltiplo)
- ✅ **Download de arquivos**
- ✅ **Conversão para Base64** (persistência garantida)
- ✅ **Validação de tamanho e tipo**
- ✅ **Formatação de tamanho de arquivo**
- ✅ **Detecção de tipo** (imagem, documento, vídeo)
- ✅ **Estatísticas de arquivos**
- ✅ **Busca e filtros**
- ✅ **Ordenação**
- ✅ **Persistência no localStorage**

### 2. FileUploader (`src/components/common/FileUploader.tsx`)

Componente universal para interface de upload de arquivos.

#### Características:

- 🎨 **Drag & Drop** funcional
- 📸 **Preview automático** para imagens
- 🔍 **Ícones por tipo** de arquivo
- 📊 **Estatísticas** de arquivos
- ⚙️ **Altamente configurável**
- 💾 **Salvamento automático** em Base64

## 📚 Como Usar

### Exemplo Básico

```typescript
import { FileUploader } from "@/components/common/FileUploader";
import { FileData } from "@/services/fileService";
import { useState } from "react";

function MeuComponente() {
  const [files, setFiles] = useState<FileData[]>([]);

  return (
    <FileUploader
      files={files}
      onFilesChange={setFiles}
      uploadedBy="Nome do Usuário"
      category="minhaCategoria"
      relatedId="ID123"
      maxFiles={20}
      maxSizeMB={10}
      showPreview={true}
    />
  );
}
```

### Exemplo com Persistência

```typescript
import { FileUploader } from "@/components/common/FileUploader";
import { FileService, FileData } from "@/services/fileService";
import { useState, useEffect } from "react";

function MeuComponente({ entityId }: { entityId: string }) {
  const [files, setFiles] = useState<FileData[]>([]);

  // Carregar arquivos salvos
  useEffect(() => {
    const savedFiles = FileService.loadFromLocalStorage(`files-${entityId}`);
    setFiles(savedFiles);
  }, [entityId]);

  // Salvar quando arquivos mudarem
  useEffect(() => {
    if (files.length > 0) {
      FileService.saveToLocalStorage(`files-${entityId}`, files);
    }
  }, [files, entityId]);

  return (
    <FileUploader
      files={files}
      onFilesChange={setFiles}
      uploadedBy="André Silva"
      category="projeto"
      relatedId={entityId}
    />
  );
}
```

## ⚙️ Configurações do FileUploader

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `files` | `FileData[]` | - | **Obrigatório.** Array de arquivos |
| `onFilesChange` | `(files: FileData[]) => void` | - | **Obrigatório.** Callback quando arquivos mudam |
| `uploadedBy` | `string` | - | **Obrigatório.** Nome do usuário que fez upload |
| `category` | `string` | - | Opcional. Categoria do arquivo (ex: 'task', 'project', 'client') |
| `relatedId` | `string` | - | Opcional. ID da entidade relacionada |
| `maxFiles` | `number` | `10` | Máximo de arquivos permitidos |
| `maxSizeMB` | `number` | `10` | Tamanho máximo por arquivo em MB |
| `allowedTypes` | `string[]` | `['*/*']` | Tipos de arquivo permitidos |
| `showPreview` | `boolean` | `true` | Mostrar preview de imagens |
| `compact` | `boolean` | `false` | Modo compacto |
| `title` | `string` | `"Arquivos"` | Título da seção |

### Tipos de Arquivo Aceitos

```typescript
// Todos os tipos
allowedTypes: ['*/*']

// Apenas imagens
allowedTypes: ['image/*']

// Apenas PDFs
allowedTypes: ['application/pdf']

// Múltiplos tipos específicos
allowedTypes: ['image/*', 'application/pdf', 'application/msword']
```

## 🔧 Funções Úteis do FileService

### Upload

```typescript
// Upload único
const fileData = await FileService.uploadFile(
  file,
  'André Silva',
  'project',
  'project-123'
);

// Upload múltiplo
const filesData = await FileService.uploadMultipleFiles(
  [file1, file2, file3],
  'André Silva',
  'task',
  'task-456'
);
```

### Download

```typescript
FileService.downloadFile(fileData);
```

### Validação

```typescript
// Validar tamanho
const isValidSize = FileService.validateFileSize(file, 10); // 10MB

// Validar tipo
const isValidType = FileService.validateFileType(file, ['image/*', 'application/pdf']);
```

### Utilitários

```typescript
// Formatar tamanho
const formatted = FileService.formatFileSize(1024000); // "1 MB"

// Verificar tipo
const isImage = FileService.isImage('image/png'); // true
const isDocument = FileService.isDocument('application/pdf'); // true
const isVideo = FileService.isVideo('video/mp4'); // true

// Obter ícone apropriado
const icon = FileService.getFileIcon('application/pdf'); // 'file-text'
```

### Estatísticas

```typescript
const stats = FileService.getFileStats(files);
console.log(stats);
// {
//   totalSize: 5242880,
//   totalSizeFormatted: "5 MB",
//   fileCount: 3,
//   imageCount: 2,
//   documentCount: 1,
//   videoCount: 0
// }
```

### Busca e Filtros

```typescript
// Filtrar por tipo
const images = FileService.filterByType(files, 'images');
const documents = FileService.filterByType(files, 'documents');

// Buscar por nome
const results = FileService.searchFiles(files, 'relatório');

// Ordenar
const sorted = FileService.sortFiles(files, 'name', 'asc');
const sortedByDate = FileService.sortFiles(files, 'date', 'desc');
```

## 💾 Persistência no localStorage

### Salvar

```typescript
FileService.saveToLocalStorage('my-files-key', files);
```

### Carregar

```typescript
const files = FileService.loadFromLocalStorage('my-files-key');
```

### Remover

```typescript
const updatedFiles = FileService.removeFile(files, 'file-id-123');
```

## 🎨 Exemplos de Uso em Diferentes Contextos

### 1. Tarefas (Tasks)

```typescript
<FileUploader
  files={task.files || []}
  onFilesChange={(files) => updateTask({ ...task, files })}
  uploadedBy={currentUser.name}
  category="task"
  relatedId={task.id}
  maxFiles={20}
  maxSizeMB={10}
/>
```

### 2. Projetos

```typescript
<FileUploader
  files={project.files || []}
  onFilesChange={(files) => updateProject({ ...project, files })}
  uploadedBy={currentUser.name}
  category="project"
  relatedId={project.id}
  maxFiles={50}
  maxSizeMB={20}
  allowedTypes={['image/*', 'application/pdf', 'application/msword']}
/>
```

### 3. Clientes

```typescript
<FileUploader
  files={client.documents || []}
  onFilesChange={(files) => updateClient({ ...client, documents: files })}
  uploadedBy={currentUser.name}
  category="client"
  relatedId={client.id}
  maxFiles={30}
  maxSizeMB={15}
  title="Documentos do Cliente"
/>
```

### 4. Leads (CRM)

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
/>
```

### 5. Financeiro

```typescript
<FileUploader
  files={transaction.receipts || []}
  onFilesChange={(files) => updateTransaction({ ...transaction, receipts: files })}
  uploadedBy={currentUser.name}
  category="financial"
  relatedId={transaction.id}
  maxFiles={5}
  maxSizeMB={10}
  allowedTypes={['image/*', 'application/pdf']}
  title="Comprovantes"
/>
```

## 🔒 Segurança e Limites

### Limites Padrão

- **Tamanho máximo por arquivo**: 10MB
- **Número máximo de arquivos**: 10
- **Tipos permitidos**: Todos (`*/*`)

### LocalStorage

- **Limite do navegador**: ~5-10MB total
- **Compressão**: Base64 aumenta ~33% do tamanho original
- **Recomendação**: Limite arquivos a 5MB para evitar exceder o limite do localStorage

### Tratamento de Erros

O sistema trata automaticamente:
- ✅ Arquivos muito grandes
- ✅ Tipos não permitidos
- ✅ Limite de arquivos excedido
- ✅ Erros de leitura de arquivo
- ✅ Limite do localStorage excedido

## 📦 Interface FileData

```typescript
interface FileData {
  id: string;              // ID único gerado automaticamente
  name: string;            // Nome do arquivo
  size: number;            // Tamanho em bytes
  type: string;            // MIME type
  uploadedAt: string;      // ISO timestamp
  uploadedBy: string;      // Nome do usuário
  url: string;             // Base64 data URL
  category?: string;       // Categoria (opcional)
  relatedId?: string;      // ID relacionado (opcional)
}
```

## 🎯 Benefícios

✅ **Universal**: Funciona em qualquer parte do sistema
✅ **Persistente**: Salva localmente com Base64
✅ **Consistente**: Interface e comportamento uniformes
✅ **Validado**: Validações automáticas de tamanho e tipo
✅ **Visual**: Preview automático para imagens
✅ **Eficiente**: Estatísticas e filtros integrados
✅ **Simples**: Fácil de implementar e usar
✅ **Robusto**: Tratamento completo de erros

## 🚀 Próximos Passos

Para adicionar arquivos em qualquer nova funcionalidade:

1. Importe o componente `FileUploader`
2. Adicione um campo `files` à sua entidade (tipo `FileData[]`)
3. Use o componente passando as props necessárias
4. Implemente persistência com `FileService.saveToLocalStorage`
5. Pronto! 🎉

---

**Desenvolvido para o sistema Zynox** | Gerenciamento universal de arquivos

