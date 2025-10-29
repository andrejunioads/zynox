/**
 * Serviço de Gerenciamento de Arquivos
 * Sistema universal para upload, download e gerenciamento de arquivos
 * Usa Base64 para persistência no localStorage
 */

export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string; // Base64 data URL
  category?: string; // Ex: 'task', 'project', 'client', 'lead'
  relatedId?: string; // ID da entidade relacionada
}

export class FileService {
  /**
   * Faz upload de um arquivo e converte para Base64
   */
  static async uploadFile(
    file: File,
    uploadedBy: string,
    category?: string,
    relatedId?: string
  ): Promise<FileData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        const fileData: FileData = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy,
          url: base64,
          category,
          relatedId,
        };

        resolve(fileData);
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Faz upload de múltiplos arquivos
   */
  static async uploadMultipleFiles(
    files: File[],
    uploadedBy: string,
    category?: string,
    relatedId?: string
  ): Promise<FileData[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, uploadedBy, category, relatedId)
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Faz download de um arquivo
   */
  static downloadFile(fileData: FileData): void {
    const link = document.createElement('a');
    link.href = fileData.url;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Formata o tamanho do arquivo
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Verifica se o arquivo é uma imagem
   */
  static isImage(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  /**
   * Verifica se o arquivo é um documento
   */
  static isDocument(fileType: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    return documentTypes.includes(fileType);
  }

  /**
   * Verifica se o arquivo é um vídeo
   */
  static isVideo(fileType: string): boolean {
    return fileType.startsWith('video/');
  }

  /**
   * Obtém o ícone apropriado para o tipo de arquivo
   */
  static getFileIcon(fileType: string): string {
    if (this.isImage(fileType)) return 'image';
    if (this.isVideo(fileType)) return 'video';
    if (fileType.includes('pdf')) return 'file-text';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'archive';
    return 'file';
  }

  /**
   * Valida o tamanho do arquivo (padrão: 10MB)
   */
  static validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Valida o tipo do arquivo
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });
  }

  /**
   * Salva arquivos no localStorage
   */
  static saveToLocalStorage(key: string, files: FileData[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(files));
    } catch (error) {
      console.error('Erro ao salvar arquivos no localStorage:', error);
      throw new Error('Limite de armazenamento excedido. Remova alguns arquivos.');
    }
  }

  /**
   * Carrega arquivos do localStorage
   */
  static loadFromLocalStorage(key: string): FileData[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar arquivos do localStorage:', error);
      return [];
    }
  }

  /**
   * Remove um arquivo da lista
   */
  static removeFile(files: FileData[], fileId: string): FileData[] {
    return files.filter(f => f.id !== fileId);
  }

  /**
   * Obtém estatísticas dos arquivos
   */
  static getFileStats(files: FileData[]): {
    totalSize: number;
    totalSizeFormatted: string;
    fileCount: number;
    imageCount: number;
    documentCount: number;
    videoCount: number;
  } {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const imageCount = files.filter(f => this.isImage(f.type)).length;
    const documentCount = files.filter(f => this.isDocument(f.type)).length;
    const videoCount = files.filter(f => this.isVideo(f.type)).length;

    return {
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      fileCount: files.length,
      imageCount,
      documentCount,
      videoCount,
    };
  }

  /**
   * Filtra arquivos por tipo
   */
  static filterByType(files: FileData[], type: 'all' | 'images' | 'documents' | 'videos'): FileData[] {
    switch (type) {
      case 'images':
        return files.filter(f => this.isImage(f.type));
      case 'documents':
        return files.filter(f => this.isDocument(f.type));
      case 'videos':
        return files.filter(f => this.isVideo(f.type));
      default:
        return files;
    }
  }

  /**
   * Busca arquivos por nome
   */
  static searchFiles(files: FileData[], searchTerm: string): FileData[] {
    const term = searchTerm.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(term));
  }

  /**
   * Ordena arquivos
   */
  static sortFiles(
    files: FileData[],
    sortBy: 'name' | 'date' | 'size',
    order: 'asc' | 'desc' = 'desc'
  ): FileData[] {
    const sorted = [...files].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
}

