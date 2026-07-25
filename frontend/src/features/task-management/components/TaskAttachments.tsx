'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Upload, Download, Trash2, FileText, FileImage, FileArchive, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Attachment, AttachmentType } from '../types';

interface TaskAttachmentsProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

const getFileIcon = (fileType: AttachmentType) => {
  switch (fileType) {
    case 'Image':
      return FileImage;
    case 'PDF':
      return FileText;
    case 'Excel':
      return FileText;
    case 'Word':
      return FileText;
    case 'ZIP':
      return FileArchive;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileTypeFromFileName = (fileName: string): AttachmentType => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'Image';
  if (ext === 'pdf') return 'PDF';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'Excel';
  if (['docx', 'doc'].includes(ext)) return 'Word';
  if (['zip', 'rar', '7z'].includes(ext)) return 'ZIP';
  return 'Other';
};

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  attachments,
  onChange,
  disabled = false,
  currentUserId = 'current-user',
  currentUserName = 'Current User',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const newAttachment: Attachment = {
            id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            taskId: '',
            fileName: file.name,
            fileType: getFileTypeFromFileName(file.name),
            fileSize: file.size,
            fileUrl: result,
            uploadedBy: currentUserId,
            uploadedByName: currentUserName,
            uploadedAt: new Date(),
          };

          onChange([...attachments, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [currentUserId, currentUserName, onChange, attachments]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleRemove = (id: string) => {
    if (disabled) return;
    const updatedAttachments = attachments.filter(a => a.id !== id);
    onChange(updatedAttachments);
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    link.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Attachments</h3>
        <Badge variant="outline" className="text-xs">
          {attachments.length}
        </Badge>
      </div>

      {/* Upload Area */}
      {!disabled && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {dragActive ? 'Drop files here' : 'Click or drag files here'}
              </p>
              <p className="text-xs text-muted-foreground">
                Images, PDF, Excel, Word, ZIP
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.xlsx,.xls,.docx,.doc,.zip,.rar,.7z"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.fileType);
            return (
              <Card key={attachment.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {attachment.fileType}
                      </Badge>
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>{attachment.uploadedByName}</span>
                      <span>•</span>
                      <span>{attachment.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(attachment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {attachments.length === 0 && disabled && (
        <Card className="p-6">
          <div className="text-center text-sm text-muted-foreground">
            No attachments
          </div>
        </Card>
      )}
    </div>
  );
};
