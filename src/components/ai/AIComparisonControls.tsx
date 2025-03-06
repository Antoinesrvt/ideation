import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  RotateCw,
  Check, 
  X, 
  PlusCircle, 
  Pencil, 
  Trash 
} from 'lucide-react';
import { useAIStore } from '@/hooks/useAIStore';

interface AIComparisonControlsProps {
  onApply: () => void;
  onReject: () => void;
  isComparingChanges: boolean;
  className?: string;
  showBanner?: boolean;
  diffSummary?: {
    total: number;
    added: number;
    modified: number;
    deleted: number;
  };
}

export const AIComparisonControls: React.FC<AIComparisonControlsProps> = ({
  onApply,
  onReject,
  isComparingChanges,
  className = '',
  showBanner = true,
  diffSummary = { total: 0, added: 0, modified: 0, deleted: 0 }
}) => {
  if (!isComparingChanges) return null;

  return (
    <div className={`${className}`}>
      {showBanner && <AIComparisonBanner isComparingChanges={isComparingChanges} diffSummary={diffSummary} />}
      
      <div className="p-3 bg-white border-t border-blue-100 shadow-lg flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-medium">Viewing AI suggested changes</span>
          <span className="px-2 py-1 bg-blue-50 rounded-full text-xs font-medium">
            {diffSummary.total} changes
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onReject}
            className="flex items-center"
            size="sm"
          >
            <X className="w-4 h-4 mr-1" />
            Discard
          </Button>
          <Button 
            onClick={onApply}
            className="flex items-center"
            size="sm"
          >
            <Check className="w-4 h-4 mr-1" />
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AIComparisonBanner: React.FC<{
  isComparingChanges: boolean;
  className?: string;
  diffSummary?: {
    total: number;
    added: number;
    modified: number;
    deleted: number;
  };
}> = ({ 
  isComparingChanges, 
  className = '',
  diffSummary = { total: 0, added: 0, modified: 0, deleted: 0 }
}) => {
  if (!isComparingChanges) return null;

  return (
    <div className={`bg-blue-50 py-2 px-4 border-t border-b border-blue-200 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-blue-800">AI Suggested Changes</span>
          
          <div className="flex space-x-3 text-sm">
            <div className="flex items-center text-green-600">
              <PlusCircle className="w-4 h-4 mr-1" />
              <span>{diffSummary.added} added</span>
            </div>
            <div className="flex items-center text-blue-600">
              <Pencil className="w-4 h-4 mr-1" />
              <span>{diffSummary.modified} modified</span>
            </div>
            <div className="flex items-center text-red-600">
              <Trash className="w-4 h-4 mr-1" />
              <span>{diffSummary.deleted} deleted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIInstructionPrompt: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}> = ({
  isLoading = false,
  disabled = false,
  value,
  onChange,
  onSubmit,
  placeholder = "Ask AI to suggest improvements or changes...",
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 bg-white p-2 rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !disabled) {
            onSubmit();
          }
        }}
      />
      <Button 
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        size="icon"
        className="h-8 w-8"
      >
        {isLoading ? (
          <RotateCw className="h-4 w-4 animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
          </svg>
        )}
      </Button>
    </div>
  );
}; 