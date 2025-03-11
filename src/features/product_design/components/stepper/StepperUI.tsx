import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CircleCheck, CircleHelp, ArrowRight, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export interface StepperStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  helpText?: string;
}

interface StepperUIProps {
  steps: StepperStep[];
  onComplete?: () => void;
  initialStep?: number;
  className?: string;
}

export function StepperUI({ steps, onComplete, initialStep = 0, className }: StepperUIProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      // Mark current step as completed if not already
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prevSteps => [...prevSteps, currentStep]);
      }
      // Move to next step
      setCurrentStep(prev => prev + 1);
    } else {
      // Last step completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prevSteps => [...prevSteps, currentStep]);
      }
      if (onComplete) onComplete();
    }
  }, [currentStep, completedSteps, steps.length, onComplete]);
  
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  const handleJumpToStep = useCallback((stepIndex: number) => {
    // Only allow jumping to completed steps or the next available step
    if (completedSteps.includes(stepIndex) || stepIndex === completedSteps.length) {
      setCurrentStep(stepIndex);
    }
  }, [completedSteps]);
  
  // Memoize derived values
  const progressPercentage = useMemo(() => {
    return ((completedSteps.length) / steps.length) * 100;
  }, [completedSteps.length, steps.length]);
  
  // Memoize the current step component to prevent unnecessary re-renders
  const currentStepInfo = useMemo(() => {
    return steps[currentStep];
  }, [steps, currentStep]);
  
  return (
    <div className={cn("space-y-8", className)}>
      
      {/* Stepper Header */}
      <div className="flex justify-between items-center relative">
        {/* Connection line */}
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-muted -z-10" />
        
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center z-0">
            <button
              onClick={() => handleJumpToStep(index)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-medium text-white transition-all duration-200",
                completedSteps.includes(index) 
                  ? "bg-green-500" 
                  : index === currentStep 
                    ? "bg-primary ring-4 ring-primary/20" 
                    : "bg-muted text-muted-foreground"
              )}
              disabled={!completedSteps.includes(index) && index > completedSteps.length}
              aria-current={index === currentStep ? "step" : undefined}
            >
              {completedSteps.includes(index) ? (
                <CircleCheck className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </button>
            <span 
              className={cn(
                "text-xs mt-2 font-medium", 
                index === currentStep 
                  ? "text-primary" 
                  : completedSteps.includes(index)
                    ? "text-green-500"
                    : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
      
      {/* Current Step Content */}
      <Card className="border-t-4" style={{ borderTopColor: 'var(--primary)' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentStepInfo.title}</CardTitle>
              <CardDescription className="mt-1">{currentStepInfo.description}</CardDescription>
            </div>
            
            {currentStepInfo.helpText && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <CircleHelp className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">{currentStepInfo.helpText}</p>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepInfo.component}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep !== steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 