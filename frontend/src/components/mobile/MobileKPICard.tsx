'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface MobileKPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MobileKPICard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  className,
}: MobileKPICardProps) {
  return (
    <Card className={cn('mobile-card', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              )}
            >
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}