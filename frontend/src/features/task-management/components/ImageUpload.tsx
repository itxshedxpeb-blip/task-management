'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  label = 'Images',
  description = 'Upload images (PNG, JPEG, WEBP)',
  required = false,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create object URLs for preview - these are temporary and only for display
  const previewUrls = images.map(file => URL.createObjectURL(file));

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    onImagesChange([...images, ...filesToAdd]);
  }, [maxImages, images, onImagesChange]);

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

  const handleRemove = (index: number) => {
    if (disabled) return;
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleReplace = (index: number) => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const openPreview = (url: string) => {
    setPreviewImage(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={cn(
          'text-xs font-medium',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}>
          {label}
        </label>
        <span className="text-[10px] text-muted-foreground">
          {images.length}/{maxImages}
        </span>
      </div>

      {description && (
        <p className="text-[10px] text-muted-foreground">{description}</p>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
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
                {dragActive ? 'Drop images here' : 'Click or drag images here'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, WEBP (max {maxImages} images)
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((file, index) => (
            <Card
              key={`${file.name}-${index}`}
              className="relative group overflow-hidden aspect-square"
            >
              <img
                src={previewUrls[index]}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => openPreview(previewUrls[index])}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                {!disabled && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => handleReplace(index)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-red-500/20"
                      onClick={() => handleRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !disabled && (
        <div className="text-center py-4 border border-dashed rounded-lg">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">No images uploaded</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
