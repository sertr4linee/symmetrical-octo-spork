import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useElectronAPI } from '@/hooks/useElectronAPI';
import { useAppStore } from '@/store/app';

interface DropZoneProps {
  onFilesDropped?: (files: File[]) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFilesDropped,
  children,
  className = '',
  disabled = false,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
}) => {
  const electronAPI = useElectronAPI();
  const { currentProject, setError, setLoading } = useAppStore();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Supported image formats
  const acceptedFormats = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/tiff': ['.tiff', '.tif'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'image/bmp': ['.bmp'],
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsDragActive(false);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const { file: f, errors } = file;
        const errorMessages = errors.map((e: any) => {
          switch (e.code) {
            case 'file-invalid-type':
              return `Invalid file type: ${f.name}. Supported formats: JPEG, PNG, TIFF, WebP, GIF, BMP`;
            case 'file-too-large':
              return `File too large: ${f.name}. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
            case 'too-many-files':
              return `Too many files. Maximum: ${maxFiles} files at once`;
            default:
              return `Error with file ${f.name}: ${e.message}`;
          }
        });
        return errorMessages.join(', ');
      }).join(' | ');
      
      setError(`Upload errors: ${errors}`);
    }

    if (acceptedFiles.length === 0) return;

    // Call external handler if provided
    if (onFilesDropped) {
      onFilesDropped(acceptedFiles);
      return;
    }

    // Default behavior: upload to current project
    if (!currentProject) {
      setError('No project selected. Please open or create a project first.');
      return;
    }

    await uploadFiles(acceptedFiles);
  }, [currentProject, onFilesDropped, setError, maxFiles, maxSize]);

  const uploadFiles = async (files: File[]) => {
    if (!electronAPI || !currentProject) return;

    setLoading(true);
    const initialProgress: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(initialProgress);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, progress: 0, status: 'uploading' } : p
        ));

        try {
          // Convert file to base64 for API
          const base64Data = await fileToBase64(file);
          
          // Upload to backend
          const response = await electronAPI.apiCall(`/api/projects/${currentProject.id}/images`, 'POST', {
            name: file.name,
            data: base64Data,
            size: file.size,
            type: file.type,
            width: null, // Will be calculated by backend
            height: null, // Will be calculated by backend
          });

          if (response.success) {
            setUploadProgress(prev => prev.map((p, idx) => 
              idx === i ? { ...p, progress: 100, status: 'success' } : p
            ));
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error);
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { 
              ...p, 
              progress: 0, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed'
            } : p
          ));
        }
      }

      // Clear progress after delay
      setTimeout(() => setUploadProgress([]), 3000);

    } catch (error) {
      console.error('Upload process error:', error);
      setError('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const onDragEnter = useCallback(() => {
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    accept: acceptedFormats,
    maxFiles,
    maxSize,
    disabled,
    noClick: true, // Disable click to upload (we'll handle this separately)
  });

  const isActive = isDragActive || dropzoneActive;

  return (
    <div
      {...getRootProps()}
      className={`
        relative transition-all duration-200 ease-in-out
        ${isActive && !disabled ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      
      {children}
      
      {/* Drag overlay */}
      {isActive && !disabled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-lg border-2 border-dashed border-primary">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm font-medium text-primary">
              Drop image files here
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Supported: JPEG, PNG, TIFF, WebP, GIF, BMP
            </div>
            <div className="text-xs text-muted-foreground">
              Max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(1)}MB each
            </div>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className="absolute bottom-4 right-4 z-40 bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <div className="text-sm font-medium mb-2">Uploading files...</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uploadProgress.map((progress, index) => (
              <div key={index} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="truncate mr-2">{progress.fileName}</span>
                  <span className={`
                    ${progress.status === 'success' ? 'text-green-600' : ''}
                    ${progress.status === 'error' ? 'text-red-600' : ''}
                    ${progress.status === 'uploading' ? 'text-blue-600' : ''}
                  `}>
                    {progress.status === 'success' ? '✓' : 
                     progress.status === 'error' ? '✗' : 
                     `${progress.progress}%`}
                  </span>
                </div>
                {progress.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                )}
                {progress.error && (
                  <div className="text-red-600 mt-1">{progress.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;