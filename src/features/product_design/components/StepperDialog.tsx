import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { StepperUI } from "./stepper";
import { DiscoverProblemsStep, DefineFeatureStep, PrioritizeMVPStep, ValidateSolutionsStep } from "./stepper";
import { ProductStepperProvider } from "@/context/product-stepper-context";

interface StepperDialogProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
}

// Separate the stepper content from the ProductStepperProvider
// This ensures that the context provider doesn't cause re-renders of dialog content
const StepperContent = React.memo(({
  title,
  description,
  onClose
}: {
  title: string;
  description: string;
  onClose: () => void;
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Use useCallback for the onLinkToValidation handler with empty dependency array
  const handleLinkToValidation = useCallback((solutionId: string, hypothesisData: any) => {
    console.log("Linking to validation:", solutionId, hypothesisData);
  }, []);

  // Memoize the stepper components to prevent unnecessary re-renders
  const discoverProblemsComponent = useMemo(() => (
    <DiscoverProblemsStep />
  ), []);

  const validateSolutionsComponent = useMemo(() => (
    <ValidateSolutionsStep onLinkToValidation={handleLinkToValidation} />
  ), [handleLinkToValidation]);

  const defineFeatureComponent = useMemo(() => (
    <DefineFeatureStep />
  ), []);

  const prioritizeMVPComponent = useMemo(() => (
    <PrioritizeMVPStep />
  ), []);

  // Memoize the steps array to prevent unnecessary re-renders
  const steps = useMemo(() => [
    {
      id: "discover-problems",
      title: "Discover Problems",
      description: "Identify and prioritize customer problems to solve",
      component: discoverProblemsComponent,
      helpText: "Start by identifying key problems your customers face. Use interviews, surveys and research to validate these problems."
    },
    {
      id: "validate-solutions",
      title: "Validate Solutions",
      description: "Generate and validate solution approaches",
      component: validateSolutionsComponent,
      helpText: "Generate potential solutions to the problems identified. Create hypotheses and collect evidence to validate these solution approaches."
    },
    {
      id: "define-features",
      title: "Define Features",
      description: "Break down solutions into specific features",
      component: defineFeatureComponent,
      helpText: "Convert validated solutions into concrete product features. Focus on describing what the feature does, not how it works."
    },
    {
      id: "prioritize-mvp",
      title: "Prioritize MVP",
      description: "Plan your Minimum Viable Product",
      component: prioritizeMVPComponent,
      helpText: "Select the features for your MVP and define success criteria. Create a roadmap for implementing your first release."
    }
  ], [
    discoverProblemsComponent, 
    validateSolutionsComponent, 
    defineFeatureComponent, 
    prioritizeMVPComponent
  ]);

  // Create a memoized handler for the onComplete callback
  const handleComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  // Create a memoized StepperUI component
  const stepper = useMemo(() => (
    <StepperUI
      key="product-stepper"
      steps={steps}
      onComplete={handleComplete}
      className="max-w-full"
    />
  ), [steps, handleComplete]);

  return (
    <DialogContent 
      className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] overflow-y-auto"
      ref={dialogRef}
    >
      <DialogHeader>
        <DialogTitle className="text-2xl">{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogHeader>
      {stepper}
    </DialogContent>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return prevProps.title === nextProps.title && 
         prevProps.description === nextProps.description &&
         prevProps.onClose === nextProps.onClose;
});

// Give the component a display name for better debugging
StepperContent.displayName = "StepperContent";

// Main dialog component with minimal state
export function StepperDialog({
  trigger,
  title = "Product Development Flow",
  description = "Follow these steps to develop your product from initial problem discovery to development planning."
}: StepperDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Create a stable reference for the dialog state manager
  const dialogStateRef = useRef({ isOpen });
  
  // Update the ref whenever state changes
  useEffect(() => {
    dialogStateRef.current.isOpen = isOpen;
  }, [isOpen]);
  
  // Use a consistent reference for the close handler
  const handleCloseDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Create a stable key for the ProductStepperProvider
  const providerKey = useMemo(() => 'product-stepper-provider', []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      {isOpen && (
        <ProductStepperProvider key={providerKey}>
          <StepperContent 
            title={title} 
            description={description} 
            onClose={handleCloseDialog}
          />
        </ProductStepperProvider>
      )}
    </Dialog>
  );
} 