import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ErrorStateProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading data...', 
  className = '',
  size = 'md'
}) => {
  const getSize = () => {
    switch(size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };
  
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <Loader2 className={`${getSize()} text-primary-500 animate-spin mb-2`} />
      <p className="text-dark-500 text-sm">{message}</p>
    </div>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry,
  className = ''
}) => {
  if (!error) return null;
  
  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';
  
  return (
    <Alert variant="destructive" className={`${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <Card variant="default" className={`border-dashed border-gray-300 ${className}`}>
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-lg font-heading font-medium text-primary-800 mb-2">{title}</h3>
        <p className="text-dark-500 max-w-sm mb-4">{description}</p>
        {action && (
          <Button 
            variant="default" 
            onClick={action.onClick}
            className="bg-gradient-primary text-white"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 