import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyPlaceholderProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({
  icon,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div className={cn(
      "flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
      className
    )}>
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        {icon && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
        )}
        <h3 className="mt-6 text-xl font-semibold">{title}</h3>
        <p className="mt-2 mb-6 text-center text-muted-foreground text-sm">
          {description}
        </p>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}; 