import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { SectionHeaderProps } from '../../types/brand-essentials.types';

export function SectionHeader({
  title,
  description,
  icon: Icon,
  completion,
  actions,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
              {Icon}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {typeof completion === 'number' && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{Math.round(completion)}%</span>
          </div>
          <Progress 
            value={completion} 
            className="h-1"
            indicatorClassName={cn(
              completion === 100 ? "bg-green-500" :
              completion > 50 ? "bg-blue-500" :
              "bg-amber-500"
            )}
          />
        </div>
      )}
    </div>
  );
} 