import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, AlertCircle, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormFieldGuidanceProps {
  tip?: string;
  examples?: string[];
  required?: boolean;
  alert?: {
    type: 'info' | 'warning' | 'error';
    message: string;
  };
  children?: React.ReactNode;
  className?: string;
}

export function FormFieldGuidance({
  tip,
  examples,
  required = false,
  alert,
  children,
  className = ''
}: FormFieldGuidanceProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      <div className="flex items-center gap-2 mt-1">
        {required && (
          <Badge variant="outline" className="text-xs py-0 h-5">Required</Badge>
        )}
        
        {tip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  <span>Tip</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {examples && examples.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
                >
                  <Info className="h-3 w-3 mr-1" />
                  <span>Examples</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium mb-1">Examples:</p>
                  <ul className="list-disc list-inside text-sm">
                    {examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mt-2 py-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <AlertDescription className="text-sm">{alert.message}</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
} 