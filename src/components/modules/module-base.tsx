"use client"

import { useEffect, useState, useMemo, memo } from "react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { ExpertTips } from "./expert-tips"
import { useModule } from "@/hooks/use-module"
import { MODULE_CONFIG, ModuleType } from "@/types/project"
import { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleErrorBoundary } from "./module-error-boundary"
import { useProject } from "@/context/project-context"
import { useToast } from "@/hooks/use-toast"
import { useAI } from "@/context/ai-context"
import { JsonCompatible, ModuleMetadataContent, StepResponse } from "@/types/project"

// Add loading skeleton component that matches the real design
function ModuleLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-[2fr,1fr] gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-[200px]" />
            </div>
            <Skeleton className="h-4 w-[300px] mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
            <div className="flex justify-between mt-6">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[90%]" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface ModuleBaseProps {
  moduleType: ModuleType
  mode: 'guided' | 'expert'
  onBack: () => void
  onComplete: () => void
  stepIcons: Record<string, LucideIcon>
}

const ModuleBase = memo(function ModuleBase({
  moduleType,
  mode,
  onBack,
  onComplete,
  stepIcons
}: ModuleBaseProps) {
  const { project, updateModule } = useProject()
  const { toast } = useToast()
  const { generateSuggestion } = useAI()
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [previousContent, setPreviousContent] = useState<{
    metadata: ModuleMetadataContent | undefined
    step: any
  } | null>(null)

  // Memoize module lookup to prevent unnecessary re-renders
  const module = useMemo(() => 
    project?.modules.find((m: { type: ModuleType }) => m.type === moduleType),
    [project?.modules, moduleType]
  )

  const currentMetadata = module?.metadata as ModuleMetadataContent | undefined
  const responses = currentMetadata?.responses || {}
  
  // Memoize steps and current step calculations
  const { steps, currentStep, validStepIndex, currentResponse } = useMemo(() => {
    const steps = MODULE_CONFIG[moduleType].steps
    const savedStep = currentMetadata?.currentStep
    const currentStepIndex = savedStep 
      ? steps.findIndex(step => step.step_id === savedStep)
      : 0
    const validStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex
    const currentStep = steps[validStepIndex]
    const currentResponse = currentStep ? responses[currentStep.step_id] : undefined

    return { steps, currentStep, validStepIndex, currentResponse }
  }, [moduleType, currentMetadata?.currentStep, responses])

  // Store previous content when transitioning
  useEffect(() => {
    if (currentMetadata && currentStep) {
      setPreviousContent({
        metadata: currentMetadata,
        step: currentStep
      })
      setIsInitializing(false)
    }
  }, [currentMetadata, currentStep])

  // Memoize handlers to prevent unnecessary re-renders
  const handleUpdateMetadata = useMemo(() => async (updates: Partial<ModuleMetadataContent>) => {
    if (!module || !currentMetadata) return

    try {
      await updateModule(module.id, {
        metadata: {
          ...currentMetadata,
          ...updates,
          lastUpdated: new Date().toISOString()
        } as JsonCompatible<ModuleMetadataContent>
      })
    } catch (err) {
      console.error('Error updating module metadata:', err)
      toast({
        title: "Error",
        description: "Failed to update module. Please try again.",
        variant: "destructive"
      })
    }
  }, [module, currentMetadata, updateModule, toast])

  const saveResponse = async (stepId: string, content: string) => {
    if (!currentMetadata) return

    const updatedResponses = {
      ...responses,
      [stepId]: {
        content,
        lastUpdated: new Date().toISOString()
      } as StepResponse
    }

    await handleUpdateMetadata({
      responses: updatedResponses
    })
  }

  const completeStep = async (stepId: string) => {
    if (!currentMetadata) return

    const updatedSteps = currentMetadata.steps.map(step =>
      step.step_id === stepId ? { ...step, completed: true } : step
    )

    const progress = (updatedSteps.filter(step => step.completed).length / steps.length) * 100

    await handleUpdateMetadata({
      steps: updatedSteps,
      progress
    })
  }

  const setCurrentStep = async (stepId: string) => {
    await handleUpdateMetadata({
      currentStep: stepId
    })
  }

  useEffect(() => {
    // Initialize first step if none is set
    if (currentMetadata && !currentMetadata.currentStep && currentStep) {
      console.log('Initializing first step:', {
        moduleId: module?.id,
        moduleType,
        stepId: currentStep.step_id,
        timestamp: new Date().toISOString()
      })
      handleUpdateMetadata({
        currentStep: currentStep.step_id
      })
    }
  }, [currentMetadata, currentStep, module?.id, moduleType])

  const handleNext = async () => {
    if (!currentStep) return

    // Save current step as completed
    await completeStep(currentStep.step_id)

    if (validStepIndex < steps.length - 1) {
      const nextStep = steps[validStepIndex + 1]
      await setCurrentStep(nextStep.step_id)
    } else {
      // Complete module
      if (module) {
        await updateModule(module.id, {
          completed: true
        })
      }
      onComplete?.()
    }
  }

  const handlePrevious = async () => {
    if (validStepIndex > 0) {
      const prevStep = steps[validStepIndex - 1]
      await setCurrentStep(prevStep.step_id)
    } else {
      onBack?.()
    }
  }

  const handleGenerateSuggestion = async () => {
    if (!currentStep || !currentResponse) return

    setIsGeneratingSuggestion(true)
    try {
      const suggestion = await generateSuggestion(currentStep.step_id)
      if (suggestion) {
        await saveResponse(currentStep.step_id, suggestion)
      }
    } catch (err) {
      console.error('Error generating suggestion:', err)
      toast({
        title: "Error",
        description: "Failed to generate suggestion. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingSuggestion(false)
    }
  }

  // Only show skeleton on very first load
  if (isInitializing && !previousContent) {
    return <ModuleLoadingSkeleton />
  }

  // Use previous content during transitions
  if (!module || !currentMetadata || !currentStep) {
    if (previousContent) {
      return (
        <ModuleErrorBoundary>
          <ModuleLayout
            title={MODULE_CONFIG[moduleType].title}
            description={MODULE_CONFIG[moduleType].description}
            progress={previousContent.metadata?.progress || 0}
            onBack={onBack}
            currentStep={previousContent.step.step_id}
            currentResponse={responses[previousContent.step.step_id]}
            previousResponses={responses}
            onSuggestionRequest={handleGenerateSuggestion}
            onSuggestionApply={handleGenerateSuggestion}
            isGeneratingSuggestion={isGeneratingSuggestion}
            quickActionGroups={[]}
          >
            <div className="grid md:grid-cols-[2fr,1fr] gap-6">
              <StepCard
                key={previousContent.step.step_id}
                title={previousContent.step.title}
                description={previousContent.step.description}
                placeholder={previousContent.step.placeholder || ''}
                icon={stepIcons[previousContent.step.step_id] || Object.values(stepIcons)[0]}
                value={responses[previousContent.step.step_id]?.content || ""}
                onChange={(value) => saveResponse(previousContent.step.step_id, value)}
                onPrevious={validStepIndex > 0 ? handlePrevious : undefined}
                onNext={handleNext}
                showNext={true}
                showPrevious={validStepIndex > 0}
              />
              {mode === "expert" && (
                <ExpertTips 
                  key={`tips-${previousContent.step.step_id}`}
                  tips={previousContent.step.expert_tips} 
                />
              )}
            </div>
          </ModuleLayout>
        </ModuleErrorBoundary>
      )
    }
    return <ModuleLoadingSkeleton />
  }

  return (
    <ModuleErrorBoundary>
      <ModuleLayout
        title={MODULE_CONFIG[moduleType].title}
        description={MODULE_CONFIG[moduleType].description}
        progress={currentMetadata.progress}
        onBack={onBack}
        currentStep={currentStep.step_id}
        currentResponse={currentResponse}
        previousResponses={responses}
        onSuggestionRequest={handleGenerateSuggestion}
        onSuggestionApply={handleGenerateSuggestion}
        isGeneratingSuggestion={isGeneratingSuggestion}
        quickActionGroups={[]}
      >
        <div className="grid md:grid-cols-[2fr,1fr] gap-6">
          <StepCard
            key={currentStep.step_id}
            title={currentStep.title}
            description={currentStep.description}
            placeholder={currentStep.placeholder || ''}
            icon={stepIcons[currentStep.step_id] || Object.values(stepIcons)[0]}
            value={responses[currentStep.step_id]?.content || ""}
            onChange={(value) => saveResponse(currentStep.step_id, value)}
            onPrevious={validStepIndex > 0 ? handlePrevious : undefined}
            onNext={handleNext}
            showNext={true}
            showPrevious={validStepIndex > 0}
          />
          {mode === "expert" && (
            <ExpertTips 
              key={`tips-${currentStep.step_id}`}
              tips={currentStep.expert_tips} 
            />
          )}
        </div>
      </ModuleLayout>
    </ModuleErrorBoundary>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to determine if re-render is needed
  return (
    prevProps.moduleType === nextProps.moduleType &&
    prevProps.mode === nextProps.mode &&
    prevProps.stepIcons === nextProps.stepIcons
  )
})

// Export the memoized component
export { ModuleBase } 