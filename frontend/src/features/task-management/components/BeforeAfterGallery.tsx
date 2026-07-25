'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ZoomIn, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeAfterGalleryProps {
  beforeImages: File[];
  afterImages: File[];
  title?: string;
}

export const BeforeAfterGallery: React.FC<BeforeAfterGalleryProps> = ({
  beforeImages,
  afterImages,
  title = 'Before / After Gallery',
}) => {
  const [selectedBeforeIndex, setSelectedBeforeIndex] = useState<number | null>(null);
  const [selectedAfterIndex, setSelectedAfterIndex] = useState<number | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  
  // Create object URLs for preview - temporary for display only
  const beforeUrls = beforeImages.map(file => URL.createObjectURL(file));
  const afterUrls = afterImages.map(file => URL.createObjectURL(file));

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      beforeUrls.forEach(url => URL.revokeObjectURL(url));
      afterUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [beforeUrls, afterUrls]);

  const openComparison = (beforeIndex: number, afterIndex: number) => {
    setSelectedBeforeIndex(beforeIndex);
    setSelectedAfterIndex(afterIndex);
    setComparisonMode(true);
  };

  const closeComparison = () => {
    setSelectedBeforeIndex(null);
    setSelectedAfterIndex(null);
    setComparisonMode(false);
  };

  const navigateBefore = (direction: 'prev' | 'next') => {
    if (selectedBeforeIndex === null) return;
    const newIndex = direction === 'prev'
      ? (selectedBeforeIndex - 1 + beforeImages.length) % beforeImages.length
      : (selectedBeforeIndex + 1) % beforeImages.length;
    setSelectedBeforeIndex(newIndex);
  };

  const navigateAfter = (direction: 'prev' | 'next') => {
    if (selectedAfterIndex === null) return;
    const newIndex = direction === 'prev'
      ? (selectedAfterIndex - 1 + afterImages.length) % afterImages.length
      : (selectedAfterIndex + 1) % afterImages.length;
    setSelectedAfterIndex(newIndex);
  };

  if (beforeImages.length === 0 && afterImages.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground text-sm">
          No images available
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {beforeImages.length} Before / {afterImages.length} After
        </Badge>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Images */}
        {beforeImages.length > 0 && (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">Before</Badge>
            <div className="grid grid-cols-2 gap-2">
              {beforeImages.map((file, index) => (
                <Card
                  key={`before-${file.name}-${index}`}
                  className="relative group overflow-hidden aspect-square cursor-pointer"
                  onClick={() => setSelectedBeforeIndex(index)}
                >
                  <img
                    src={beforeUrls[index]}
                    alt={`Before ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute bottom-1 left-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {index + 1}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* After Images */}
        {afterImages.length > 0 && (
          <div className="space-y-2">
            <Badge variant="default" className="text-xs">After</Badge>
            <div className="grid grid-cols-2 gap-2">
              {afterImages.map((file, index) => (
                <Card
                  key={`after-${file.name}-${index}`}
                  className="relative group overflow-hidden aspect-square cursor-pointer"
                  onClick={() => setSelectedAfterIndex(index)}
                >
                  <img
                    src={afterUrls[index]}
                    alt={`After ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute bottom-1 left-1">
                    <Badge variant="default" className="text-[10px]">
                      {index + 1}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Button */}
      {beforeImages.length > 0 && afterImages.length > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => openComparison(0, 0)}
        >
          <ZoomIn className="h-4 w-4 mr-2" />
          Compare Before / After
        </Button>
      )}

      {/* Before Image Preview Dialog */}
      <Dialog open={selectedBeforeIndex !== null && !comparisonMode} onOpenChange={() => setSelectedBeforeIndex(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Before Image {selectedBeforeIndex !== null ? selectedBeforeIndex + 1 : ''}</DialogTitle>
          </DialogHeader>
          {selectedBeforeIndex !== null && (
            <div className="space-y-4">
              <img
                src={beforeUrls[selectedBeforeIndex]}
                alt={`Before ${selectedBeforeIndex + 1}`}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateBefore('prev')}
                  disabled={beforeImages.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground self-center">
                  {selectedBeforeIndex + 1} / {beforeImages.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateBefore('next')}
                  disabled={beforeImages.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* After Image Preview Dialog */}
      <Dialog open={selectedAfterIndex !== null && !comparisonMode} onOpenChange={() => setSelectedAfterIndex(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>After Image {selectedAfterIndex !== null ? selectedAfterIndex + 1 : ''}</DialogTitle>
          </DialogHeader>
          {selectedAfterIndex !== null && (
            <div className="space-y-4">
              <img
                src={afterUrls[selectedAfterIndex]}
                alt={`After ${selectedAfterIndex + 1}`}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateAfter('prev')}
                  disabled={afterImages.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground self-center">
                  {selectedAfterIndex + 1} / {afterImages.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateAfter('next')}
                  disabled={afterImages.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={comparisonMode} onOpenChange={closeComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Before / After Comparison</span>
              <Button variant="ghost" size="icon" onClick={closeComparison}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[80vh]">
            {/* Before */}
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">Before</Badge>
              {selectedBeforeIndex !== null && (
                <div className="space-y-2">
                  <img
                    src={beforeUrls[selectedBeforeIndex]}
                    alt={`Before ${selectedBeforeIndex + 1}`}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg border"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateBefore('prev')}
                      disabled={beforeImages.length <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">
                      {selectedBeforeIndex + 1} / {beforeImages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateBefore('next')}
                      disabled={beforeImages.length <= 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* After */}
            <div className="space-y-2">
              <Badge variant="default" className="text-xs">After</Badge>
              {selectedAfterIndex !== null && (
                <div className="space-y-2">
                  <img
                    src={afterUrls[selectedAfterIndex]}
                    alt={`After ${selectedAfterIndex + 1}`}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg border"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateAfter('prev')}
                      disabled={afterImages.length <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">
                      {selectedAfterIndex + 1} / {afterImages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateAfter('next')}
                      disabled={afterImages.length <= 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
