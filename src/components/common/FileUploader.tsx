import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Paperclip, 
  Download, 
  Trash2, 
  Image as ImageIcon,
  FileText,
  Video,
  File as FileIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileService, FileData } from "@/services/fileService";
import { toast } from "sonner";

interface FileUploaderProps {
  files: FileData[];
  onFilesChange: (files: FileData[]) => void;
  uploadedBy: string;
  category?: string;
  relatedId?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[]; // Ex: ['image/*', 'application/pdf']
  showPreview?: boolean;
  compact?: boolean;
  title?: string;
}

export const FileUploader = ({
  files,
  onFilesChange,
  uploadedBy,
  category,
  relatedId,
  maxFiles = 10,
  maxSizeMB = 10,
  allowedTypes = ['*/*'],
  showPreview = true,
  compact = false,
  title = "Arquivos",
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    // Validar número de arquivos
    if (files.length + filesArray.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    // Validar cada arquivo
    for (const file of filesArray) {
      // Validar tamanho
      if (!FileService.validateFileSize(file, maxSizeMB)) {
        toast.error(`${file.name} excede o tamanho máximo de ${maxSizeMB}MB`);
        continue;
      }

      // Validar tipo
      if (allowedTypes[0] !== '*/*' && !FileService.validateFileType(file, allowedTypes)) {
        toast.error(`Tipo de arquivo não permitido: ${file.name}`);
        continue;
      }

      try {
        const fileData = await FileService.uploadFile(file, uploadedBy, category, relatedId);
        onFilesChange([...files, fileData]);
      } catch (error) {
        toast.error(`Erro ao fazer upload de ${file.name}`);
        console.error(error);
      }
    }

    toast.success(`${filesArray.length} arquivo(s) adicionado(s)!`);
  };

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = FileService.removeFile(files, fileId);
    onFilesChange(updatedFiles);
    toast.success("Arquivo removido!");
  };

  const handleDownloadFile = (file: FileData) => {
    FileService.downloadFile(file);
    toast.success("Download iniciado!");
  };

  const getFileIcon = (fileType: string) => {
    if (FileService.isImage(fileType)) return <ImageIcon className="w-6 h-6 text-primary" />;
    if (FileService.isVideo(fileType)) return <Video className="w-6 h-6 text-purple-400" />;
    if (FileService.isDocument(fileType)) return <FileText className="w-6 h-6 text-blue-400" />;
    return <FileIcon className="w-6 h-6 text-slate-400" />;
  };

  const stats = FileService.getFileStats(files);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-white flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          {title}
          {files.length > 0 && (
            <Badge variant="secondary">{files.length}</Badge>
          )}
        </Label>
        {files.length > 0 && !compact && (
          <span className="text-xs text-slate-400">
            {stats.totalSizeFormatted}
          </span>
        )}
      </div>

      {/* Drop Zone */}
      {files.length < maxFiles && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg transition-all duration-200",
            compact ? "p-4" : "p-8",
            isDragging
              ? "border-primary/50 bg-primary/5"
              : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/20",
            "text-center cursor-pointer"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "rounded-full bg-slate-700 flex items-center justify-center",
              compact ? "w-8 h-8" : "w-12 h-12"
            )}>
              <Paperclip className={cn(
                "text-slate-400",
                compact ? "w-4 h-4" : "w-6 h-6"
              )} />
            </div>
            <div>
              <p className={cn(
                "text-white font-medium",
                compact ? "text-sm mb-0" : "mb-1"
              )}>
                {isDragging ? "Solte os arquivos aqui" : "Arraste arquivos ou clique para selecionar"}
              </p>
              {!compact && (
                <p className="text-sm text-slate-400">
                  Máximo de {maxSizeMB}MB por arquivo • {maxFiles - files.length} restantes
                </p>
              )}
            </div>
          </div>
          <input
            id="file-upload-input"
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            accept={allowedTypes.join(',')}
          />
        </div>
      )}

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 rounded-lg glass-card border-slate-700 group hover:border-primary/50 transition-all"
            >
              {/* Preview/Ícone */}
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {showPreview && FileService.isImage(file.type) && file.url ? (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              
              {/* Informações do arquivo */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {file.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{FileService.formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</span>
                  {!compact && file.uploadedBy && (
                    <>
                      <span>•</span>
                      <span>{file.uploadedBy}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                  onClick={() => handleDownloadFile(file)}
                  title="Baixar arquivo"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => handleRemoveFile(file.id)}
                  title="Remover arquivo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas (opcional) */}
      {!compact && files.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700">
          {stats.imageCount > 0 && (
            <div className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{stats.imageCount} imagens</span>
            </div>
          )}
          {stats.documentCount > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{stats.documentCount} documentos</span>
            </div>
          )}
          {stats.videoCount > 0 && (
            <div className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>{stats.videoCount} vídeos</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

