import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle } from 'lucide-react';
import { useAIStore } from '@/hooks/useAIStore';

interface AIComparisonControlsProps {
  onApply: () => void;
  onReject: () => void;
  isComparingChanges: boolean;
  className?: string;
  showBanner?: boolean;
}

export const AIComparisonControls: React.FC<AIComparisonControlsProps> = ({
  onApply,
  onReject,
  isComparingChanges,
  className = '',
  showBanner = true,
}) => {
  if (!isComparingChanges) return null;

  return (
    <div className={`${className}`}>
      {showBanner && (
        <div className="bg-blue-50 px-4 py-3 rounded-lg flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-blue-700 text-sm font-medium">
            Viewing AI-suggested changes. Review the differences and apply or reject them.
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          className="text-gray-600" 
          onClick={onReject}
        >
          <X className="mr-2 h-4 w-4" /> Reject Changes
        </Button>
        <Button 
          variant="default" 
          className="bg-green-600 hover:bg-green-700 text-white" 
          onClick={onApply}
        >
          <Check className="mr-2 h-4 w-4" /> Apply Changes
        </Button>
      </div>
    </div>
  );
};

export const AIComparisonBanner: React.FC<{
  isComparingChanges: boolean;
  className?: string;
}> = ({ isComparingChanges, className = '' }) => {
  if (!isComparingChanges) return null;

  return (
    <div className={`bg-blue-50 px-4 py-3 rounded-lg flex items-center mb-4 ${className}`}>
      <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
      <span className="text-blue-700 text-sm font-medium">
        Viewing AI-suggested changes
      </span>
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
    <div className={`relative mt-6 ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="ai-prompt" className="text-sm font-medium text-gray-700">
            AI Assistance
          </label>
          <span className="text-xs text-gray-500">
            Powered by OpenAI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="ai-prompt"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={disabled || isLoading || !value.trim()}
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Processing...' : 'Send'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-2 text-sm text-blue-600 animate-pulse">
          Analyzing your project and generating suggestions...
        </div>
      )}
    </div>
  );
}; 