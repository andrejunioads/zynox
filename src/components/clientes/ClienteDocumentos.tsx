import { useCliente } from "@/context/ClienteContext";
import { useState } from "react";
import { ClienteDocumento } from "@/types/cliente";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import {
  Upload,
  FileText,
  File,
  Download,
  Trash2,
  Folder,
  Plus,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock de documentos
const mockDocumentos: ClienteDocumento[] = [
  {
    id: "1",
    clienteId: "123",
    nome: "contrato_assinado.pdf",
    tipo: "application/pdf",
    categoria: "contrato",
    tamanho: 245678,
    url: "#",
    dataUpload: "2025-10-10T10:00:00Z",
  },
  {
    id: "2",
    clienteId: "123",
    nome: "logo_empresa.png",
    tipo: "image/png",
    categoria: "outro",
    tamanho: 123456,
    url: "#",
    dataUpload: "2025-10-12T14:30:00Z",
  },
];

const categoriaConfig = {
  contrato: { label: "Contrato", color: "bg-primary/10 text-primary border-primary/30" },
  nota_fiscal: { label: "Nota Fiscal", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  identidade: { label: "Identidade", color: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  outro: { label: "Outro", color: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
};

export const ClienteDocumentos = () => {
  const { clienteAtivo } = useCliente();
  const [documentos, setDocumentos] = useState<ClienteDocumento[]>(mockDocumentos);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    fileName: string;
    progress: number;
    total: number;
    current: number;
  } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ClienteDocumento | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const documentosFiltrados = documentos.filter(
    (doc) => filtroCategoria === "todos" || doc.categoria === filtroCategoria
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes("pdf")) return FileText;
    if (tipo.includes("image")) return File;
    return File;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const totalFiles = files.length;

    try {
      // Processar todos os arquivos
      const novosDocumentos: ClienteDocumento[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Atualizar progresso
        setUploadProgress({
          fileName: file.name,
          progress: Math.round(((i + 1) / totalFiles) * 100),
          total: totalFiles,
          current: i + 1,
        });
        
        // Validar tamanho (100MB)
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Arquivo "${file.name}" excede 100MB`);
          continue;
        }

        // Simular delay de upload para feedback visual
        await new Promise(resolve => setTimeout(resolve, 500));

        const novoDoc: ClienteDocumento = {
          id: Math.random().toString(),
          clienteId: clienteAtivo?.id || "",
          nome: file.name,
          tipo: file.type,
          categoria: "outro",
          tamanho: file.size,
          url: URL.createObjectURL(file),
          dataUpload: new Date().toISOString(),
        };

        novosDocumentos.push(novoDoc);
      }

      setDocumentos([...novosDocumentos, ...documentos]);
      
      if (novosDocumentos.length === 1) {
        toast.success(`Arquivo "${novosDocumentos[0].nome}" enviado com sucesso!`);
      } else {
        toast.success(`${novosDocumentos.length} arquivos enviados com sucesso!`);
      }
    } catch (error) {
      toast.error("Erro ao fazer upload dos arquivos");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDownload = (doc: ClienteDocumento) => {
    // Criar link temporário e fazer download
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Baixando ${doc.nome}...`);
  };

  const handlePreview = (doc: ClienteDocumento) => {
    setPreviewDoc(doc);
    setZoomLevel(100);
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setZoomLevel(100);
  };

  const isImage = (tipo: string) => {
    return tipo.includes('image');
  };

  const isPDF = (tipo: string) => {
    return tipo.includes('pdf');
  };

  const handleDelete = (id: string) => {
    setDocumentos(documentos.filter((doc) => doc.id !== id));
    toast.success("Documento excluído");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Criar um evento simulado para passar os arquivos
    const event = {
      target: { files: files }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleUpload(event);
  };

  return (
    <div className="space-y-6">
      {/* Modal de Preview */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Header do Preview */}
            <div className="glass-card p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {isImage(previewDoc.tipo) ? (
                    <File className="w-5 h-5 text-primary" />
                  ) : isPDF(previewDoc.tipo) ? (
                    <FileText className="w-5 h-5 text-primary" />
                  ) : (
                    <File className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate" title={previewDoc.nome}>
                    {previewDoc.nome}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {formatBytes(previewDoc.tamanho)}
                  </p>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isImage(previewDoc.tipo) && (
                  <>
                    <button
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                      title="Diminuir zoom"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400 w-12 text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                      title="Aumentar zoom"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                  </>
                )}
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                  title="Baixar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={closePreview}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Preview */}
            <div className="glass-card flex-1 overflow-hidden flex items-center justify-center">
              {isImage(previewDoc.tipo) ? (
                <div className="w-full h-full overflow-auto scrollbar-thin flex items-center justify-center p-4">
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.nome}
                    style={{ 
                      width: `${zoomLevel}%`,
                      maxWidth: 'none',
                      height: 'auto',
                    }}
                    className="object-contain transition-all duration-200"
                  />
                </div>
              ) : isPDF(previewDoc.tipo) ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-full"
                  title={previewDoc.nome}
                />
              ) : (
                <div className="text-center p-12">
                  <File className="w-24 h-24 text-white/20 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Preview não disponível
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Este tipo de arquivo não pode ser visualizado diretamente.
                  </p>
                  <button
                    onClick={() => handleDownload(previewDoc)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    Baixar Arquivo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popup de Carregamento */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <Upload className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white mb-2">
                Enviando Arquivos
              </h3>
              <p className="text-sm text-slate-400 mb-1">
                {uploadProgress.current} de {uploadProgress.total} arquivo{uploadProgress.total > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-500 truncate" title={uploadProgress.fileName}>
                {uploadProgress.fileName}
              </p>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-3">
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Progresso</span>
                <span className="text-primary font-semibold">{uploadProgress.progress}%</span>
              </div>
            </div>

            {/* Indicador de Processamento */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Área de Drag & Drop com Botão */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "glass-card p-8 border-2 border-dashed transition-all relative",
          isDragging 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-primary/30 hover:border-primary/50",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm rounded-2xl flex items-center justify-center pointer-events-none z-10">
            <div className="text-center">
              <Upload className="w-16 h-16 text-primary mx-auto mb-2 animate-bounce" />
              <p className="text-lg font-semibold text-primary">Solte os arquivos aqui</p>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Upload className={cn(
            "w-12 h-12 text-primary mx-auto mb-4 transition-all",
            uploading ? "animate-pulse" : "opacity-50"
          )} />
          <h3 className="text-lg font-semibold text-white mb-2">
            {uploading ? "Enviando..." : "Arraste arquivos aqui"}
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            ou clique no botão abaixo para selecionar
          </p>
          <label className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20 transition cursor-pointer">
            <Upload className="h-4 w-4" />
            {uploading ? "Enviando..." : "Selecionar Arquivos"}
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
              multiple
            />
          </label>
          <p className="text-xs text-slate-500 mt-4">
            Máx: 100MB por arquivo
          </p>
        </div>
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentosFiltrados.map((doc) => {
          const Icon = getFileIcon(doc.tipo);

          return (
            <div
              key={doc.id}
              className="group glass-card p-4 hover:border-primary/30 transition relative"
            >
              {/* Tamanho no canto superior direito */}
              <div className="absolute top-3 right-3 text-xs text-slate-400 font-semibold">
                {formatBytes(doc.tamanho)}
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0 pr-16">
                  <h4 className="text-sm font-semibold text-white truncate mb-1" title={doc.nome}>
                    {doc.nome}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {new Intl.DateTimeFormat("pt-BR").format(new Date(doc.dataUpload))}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => handlePreview(doc)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-semibold"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                  title="Baixar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {documentosFiltrados.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhum documento encontrado
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            {filtroCategoria === "todos"
              ? "Faça upload do primeiro documento"
              : "Nenhum documento nesta categoria"}
          </p>
          <label className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20 transition cursor-pointer">
            <Plus className="h-5 w-5" />
            Adicionar Documento
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>
      )}
    </div>
  );
};

