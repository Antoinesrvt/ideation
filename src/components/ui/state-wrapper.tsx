import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface StateWrapperProps {
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
  loadingText?: string;
  errorText?: string;
  /**
   * If true, children will still be shown in error state with the error message above
   */
  showChildrenOnError?: boolean;
  /**
   * Optional function to retry the operation when an error occurs
   */
  onRetry?: () => void;
}

export function StateWrapper({
  isLoading,
  error,
  children,
  loadingText = "Loading...",
  errorText = "Something went wrong",
  showChildrenOnError = false,
  onRetry
}: StateWrapperProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-6 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">{loadingText}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 rounded-md border border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">{errorText}</p>
          <p className="text-muted-foreground text-sm text-center mb-4">{error.message}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
            >
              Try Again
            </button>
          )}
        </div>
        {showChildrenOnError && <div className="mt-6">{children}</div>}
      </div>
    );
  }

  // Default state - just render children
  return <>{children}</>;
} 