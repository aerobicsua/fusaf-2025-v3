"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';

interface FileUploadProps {
  type: 'avatar' | 'document';
  currentValue?: string;
  onFileSelect: (file: File | null, url?: string) => void;
  accept?: string;
  maxSize?: number; // у байтах
  preview?: boolean;
}

interface UploadedFile {
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
}

export function FileUpload({
  type,
  currentValue,
  onFileSelect,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB за замовчуванням
  preview = true
}: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDefaultAccept = () => {
    switch (type) {
      case 'avatar':
        return 'image/jpeg,image/png,image/webp';
      case 'document':
        return '.pdf,.doc,.docx,.jpg,.jpeg,.png';
      default:
        return '*/*';
    }
  };

  const validateFile = (file: File): string | null => {
    // Перевірка розміру
    if (file.size > maxSize) {
      return `Файл занадто великий. Максимальний розмір: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Перевірка типу для аватара
    if (type === 'avatar') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return 'Дозволені тільки файли JPG, PNG, WebP';
      }
    }

    // Перевірка типу для документів
    if (type === 'document') {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
        return 'Дозволені файли: PDF, DOC, DOCX, JPG, PNG';
      }
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError('');

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const url = URL.createObjectURL(file);
    const uploadedFileData: UploadedFile = {
      file,
      url,
      name: file.name,
      size: file.size,
      type: file.type
    };

    setUploadedFile(uploadedFileData);

    // Для аватарів не передаємо URL, оскільки handleFileUpload сам конвертує в Base64
    if (type === 'avatar') {
      onFileSelect(file);
    } else {
      onFileSelect(file, url);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
    setError('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (fileType: string): boolean => {
    return fileType.startsWith('image/');
  };

  const currentFile = uploadedFile || (currentValue ? {
    url: currentValue,
    name: 'Поточний файл',
    size: 0,
    type: type === 'avatar' ? 'image/jpeg' : 'application/pdf'
  } : null);

  return (
    <div className="space-y-4">
      {/* Зона завантаження */}
      {!currentFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {type === 'avatar' ? 'Завантажити аватар' : 'Завантажити документ'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Перетягніть файл сюди або натисніть для вибору
          </p>
          <div className="text-xs text-gray-500">
            <p>Максимальний розмір: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
            <p>
              Дозволені формати: {
                type === 'avatar'
                  ? 'JPG, PNG, WebP'
                  : 'PDF, DOC, DOCX, JPG, PNG'
              }
            </p>
          </div>
        </div>
      )}

      {/* Прихований input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || getDefaultAccept()}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Превью завантаженого файлу */}
      {currentFile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {/* Превью */}
              {preview && type === 'avatar' && isImage(currentFile.type) ? (
                <div className="flex-shrink-0">
                  <img
                    src={currentFile.url}
                    alt="Превью"
                    className="h-20 w-20 object-cover rounded-lg border"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                    {isImage(currentFile.type) ? (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    ) : (
                      <FileText className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                </div>
              )}

              {/* Інформація про файл */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 truncate">
                  {currentFile.name}
                </h4>
                {currentFile.size > 0 && (
                  <p className="text-sm text-gray-600">
                    {formatFileSize(currentFile.size)}
                  </p>
                )}
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">Файл завантажено</span>
                </div>
              </div>

              {/* Дії */}
              <div className="flex space-x-2">
                {currentFile.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(currentFile.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопка заміни */}
      {currentFile && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Замінити файл
        </Button>
      )}

      {/* Помилки */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
