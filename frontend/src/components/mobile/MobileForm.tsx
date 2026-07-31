'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MobileFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function MobileFormField({
  label,
  required,
  error,
  children,
  className,
}: MobileFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn('text-sm font-medium', required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

interface MobileFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function MobileFormSection({
  title,
  description,
  children,
  className,
}: MobileFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface MobileFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function MobileForm({
  onSubmit,
  children,
  className,
  submitLabel = 'Submit',
  isSubmitting = false,
  onCancel,
}: MobileFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
      {children}
      
      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}