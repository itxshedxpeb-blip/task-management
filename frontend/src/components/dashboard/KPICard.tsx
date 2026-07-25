'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPICard as KPICardType } from '@/types';
import { componentTextSizes } from '@/lib/design-system';

interface KPICardProps {
  data: KPICardType;
  onClick?: () => void;
  showComparison?: boolean;
}

export const KPICard = memo(function KPICard({ data, onClick, showComparison = false }: KPICardProps) {
  const isPositive = data.change >= 0;
  const color = data.color || (isPositive ? 'text-green-600' : 'text-red-600');

  return (
    <Card
      className={cn(
        'cursor-pointer',
        onClick && 'hover:border-blue-300'
      )}
      onClick={onClick}
    >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={cn(componentTextSizes.kpiCard.label, 'font-medium text-muted-foreground')}>{data.title}</p>
              <p className={cn(componentTextSizes.kpiCard.value, 'font-bold mt-1')}>{data.value}</p>
              
              {/* Change Percentage */}
              {data.change !== 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {isPositive ? (
                    <ArrowUp className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-red-600" />
                  )}
                  <span className={cn(componentTextSizes.kpiCard.change, 'font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
                    {Math.abs(data.change)}%
                  </span>
                  {showComparison && data.comparisonLabel && (
                    <span className={cn(componentTextSizes.kpiCard.change, 'text-muted-foreground')}>
                      {data.comparisonLabel}
                    </span>
                  )}
                </div>
              )}

              {/* Previous Value for Comparison */}
              {showComparison && data.previousValue !== undefined && (
                <p className={cn(componentTextSizes.kpiCard.change, 'text-muted-foreground mt-1')}>
                  Prev: {data.previousValue}
                </p>
              )}
            </div>
            
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3', data.color?.replace('text-', 'bg-') + '/15')}>
              <div className={cn('flex items-center justify-center', color)}>
                {data.icon}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
});
