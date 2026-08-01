'use client';

import { File, FileArchive, FileImage, FileText, Download, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
  uploadedByName?: string | null;
  uploadedAt?: string | Date | null;
  createdAt?: string | Date | null;
  description?: string | null;
}

const getFileIcon = (fileType?: string) => {
  const type = fileType?.toLowerCase() ?? '';
  if (['image', 'png', 'jpg', 'jpeg', 'webp', 'gif'].some((t) => type.includes(t))) return FileImage;
  if (['zip', 'rar', '7z'].some((t) => type.includes(t))) return FileArchive;
  if (['pdf', 'xlsx', 'xls', 'csv', 'docx', 'doc', 'word', 'excel', 'text', 'pdf'].some((t) => type.includes(t))) return FileText;
  return File;
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '—';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export function AttachmentsSection({
  attachments,
  className,
}: {
  attachments: AttachmentItem[];
  className?: string;
}) {
  const hasDate = (a: AttachmentItem) => Boolean(a.uploadedAt || a.createdAt);

  return (
    <Card className={cn('mobile-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="h-4 w-4" />
          Files ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No files attached.</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.fileType);
              const fileDate = attachment.uploadedAt ?? attachment.createdAt;
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{attachment.fileName}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                      {attachment.fileType && <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal">{attachment.fileType}</Badge>}
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      {attachment.uploadedByName && <span>by {attachment.uploadedByName}</span>}
                      {hasDate(attachment) && fileDate && <span>· {formatDate(fileDate)}</span>}
                    </div>
                    {attachment.description && (
                      <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{attachment.description}</p>
                    )}
                  </div>
                  {attachment.fileUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-muted-foreground"
                      title="Download"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = attachment.fileUrl!;
                        link.download = attachment.fileName;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
