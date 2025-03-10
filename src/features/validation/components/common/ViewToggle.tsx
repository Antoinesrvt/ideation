import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ViewMode = 'table' | 'card';

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ viewMode, onChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange('table')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Table View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
            <p>Table View</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange('card')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Card View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
            <p>Card View</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 