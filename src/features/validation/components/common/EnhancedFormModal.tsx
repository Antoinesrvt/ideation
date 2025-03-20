import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  HelpCircle, 
  ChevronDown, 
  Play
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  condition?: (formValues: any) => boolean;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  values: Record<string, any>;
}

export interface SaveAndAction {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface EnhancedFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  steps: FormStep[];
  completionPercentage: number;
  templates?: FormTemplate[];
  onApplyTemplate?: (template: FormTemplate) => void;
  saveAndActions?: SaveAndAction[];
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  firstFieldRef?: React.RefObject<HTMLInputElement>;
  children: React.ReactNode;
  guidanceTips?: Record<string, React.ReactNode>;
}

export function EnhancedFormModal({
  open,
  onOpenChange,
  title,
  steps,
  completionPercentage,
  templates,
  onApplyTemplate,
  saveAndActions,
  onSave,
  onCancel,
  isEditing,
  firstFieldRef,
  children,
  guidanceTips
}: EnhancedFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showGuidance, setShowGuidance] = useState(!isEditing);
  
  // Reset step when modal opens/closes or when editing status changes
  useEffect(() => {
    setCurrentStep(0);
  }, [open, isEditing]);
  
  // Focus first field when modal opens
  useEffect(() => {
    if (open && firstFieldRef?.current) {
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 100);
    }
  }, [open, firstFieldRef]);
  
  // Filter steps based on conditions
  const filteredSteps = steps.filter(step => !step.condition || step.condition);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          onSave();
        }
        
        // Esc to cancel - handled by Dialog component
        
        // Ctrl/Cmd + arrow keys for navigation
        if ((e.ctrlKey || e.metaKey)) {
          if (e.key === 'ArrowRight' && currentStep < filteredSteps.length - 1) {
            e.preventDefault();
            setCurrentStep(currentStep + 1);
          } else if (e.key === 'ArrowLeft' && currentStep > 0) {
            e.preventDefault();
            setCurrentStep(currentStep - 1);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentStep, filteredSteps.length, onSave]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${title}` : `Add ${title}`}
          </DialogTitle>
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2 flex-wrap">
              {filteredSteps.map((step, index) => (
                <Button
                  key={step.id}
                  variant={currentStep === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentStep(index)}
                  className="px-3 py-1 h-8"
                >
                  {step.title}
                </Button>
              ))}
            </div>
            {guidanceTips && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowGuidance(!showGuidance)}
                className="flex items-center gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                {showGuidance ? "Hide Help" : "Show Help"}
              </Button>
            )}
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Completion</span>
              <span className="text-xs font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-1" />
          </div>
        </DialogHeader>
        
        {!isEditing && templates && templates.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Quick Start Templates</h4>
            <div className="flex gap-2 flex-wrap">
              {templates.map(template => (
                <TooltipProvider key={template.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onApplyTemplate && onApplyTemplate(template)}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        {template.name}
                      </Button>
                    </TooltipTrigger>
                    {template.description && (
                      <TooltipContent>
                        <p>{template.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
        
        {showGuidance && guidanceTips && guidanceTips[filteredSteps[currentStep]?.id] && (
          <Card className="mb-4 bg-muted/30 border-muted">
            <CardContent className="pt-4 pb-3">
              <h4 className="font-medium mb-2">Tips for {filteredSteps[currentStep]?.title}</h4>
              {guidanceTips[filteredSteps[currentStep]?.id]}
            </CardContent>
          </Card>
        )}
        
        {/* Form wrapper */}
        <div>
          {/* Render only the current step's children */}
          {React.Children.map(children, (child, index) => {
            if (index === currentStep) {
              return child;
            }
            return null;
          })}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            
            {currentStep < filteredSteps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button type="button" onClick={onSave}>
                Save {isEditing ? 'Changes' : title}
              </Button>
            )}
          </div>
          
          {currentStep === filteredSteps.length - 1 && saveAndActions && saveAndActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span>Save and...</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {saveAndActions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.action}>
                    <div className="flex items-center gap-2">
                      {action.icon}
                      {action.label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 