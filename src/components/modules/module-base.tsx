"use client"

import { useEffect, useState, useMemo, memo } from "react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { ExpertTips } from "./expert-tips"
import { useModule } from "@/hooks/use-module"
import { ModuleType } from "@/config/modules"
import { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleErrorBoundary } from "./module-error-boundary"
import { useProject } from "@/context/project-context"
import { useToast } from "@/hooks/use-toast"
import { useAI } from "@/context/ai-context"
import { ModuleResponse } from "@/types/module"
import { MODULE_CONFIG } from "@/config/modules"
import { ModuleLoadingSkeleton } from "./module-loading-skeleton"

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
  const {
    module,
    config,
    responses,
    currentStep,
    progress,
    saveResponse,
    completeStep,
    setCurrentStep,
    generateAISuggestion,
    isGeneratingSuggestion,
    isInitializing,
    quickActionGroups
  } = useModule(moduleType, {
    onComplete,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const { toast } = useToast()
  const [previousContent, setPreviousContent] = useState<{
    stepId: string | undefined
  } | null>(null)

  // Store previous content when transitioning
  useEffect(() => {
    if (module && currentStep) {
      setPreviousContent({
        stepId: currentStep
      })
    }
  }, [module, currentStep])

  const handleNext = async () => {
    if (!currentStep || !config.steps) return

    // Save current step as completed
    await completeStep(currentStep)

    const currentIndex = config.steps.findIndex(step => step.id === currentStep)
    if (currentIndex < config.steps.length - 1) {
      const nextStep = config.steps[currentIndex + 1]
      await setCurrentStep(nextStep.id)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = async () => {
    if (!currentStep || !config.steps) return

    const currentIndex = config.steps.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      const prevStep = config.steps[currentIndex - 1]
      await setCurrentStep(prevStep.id)
    } else {
      onBack?.()
    }
  }

  const handleGenerateSuggestion = async (context: string) => {
    if (!currentStep) return
    await generateAISuggestion(currentStep, context)
  }

  // Helper function to render module content
  function renderModuleContent(currentStepId: string, steps: typeof MODULE_CONFIG[ModuleType]['steps']) {
    const step = steps.find((s) => s.id === currentStepId)
    if (!step) return null

    return (
      <div className="grid md:grid-cols-[2fr,1fr] gap-6">
        <StepCard
          key={step.id}
          title={step.title}
          description={step.description}
          placeholder={step.placeholder || ''}
          icon={stepIcons[step.id] || Object.values(stepIcons)[0]}
          value={responses[step.id]?.content || ""}
          onChange={(value) => saveResponse(step.id, value)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          showNext={true}
          showPrevious={true}
        />
        {mode === "expert" && step.expert_tips && (
          <ExpertTips 
            key={`tips-${step.id}`}
            tips={step.expert_tips} 
          />
        )}
      </div>
    )
  }

  // Show loading skeleton during initialization or when module is not yet available
  if (isInitializing || (!module && !previousContent)) {
    return <ModuleLoadingSkeleton />
  }

  // Use previous content during transitions or while waiting for initialization
  if (!module || !currentStep || !config.steps) {
    if (previousContent?.stepId) {
      return (
        <ModuleErrorBoundary>
          <ModuleLayout
            title={config.title}
            description={config.description}
            progress={progress}
            onBack={onBack}
            currentStep={previousContent.stepId}
            currentResponse={responses[previousContent.stepId]}
            previousResponses={responses}
            onSuggestionRequest={handleGenerateSuggestion}
            onSuggestionApply={(suggestion) => {
              if (previousContent.stepId) {
                saveResponse(previousContent.stepId, suggestion)
              }
            }}
            isGeneratingSuggestion={isGeneratingSuggestion}
            quickActionGroups={quickActionGroups}
          >
            {renderModuleContent(previousContent.stepId, config.steps)}
          </ModuleLayout>
        </ModuleErrorBoundary>
      )
    }
    return <ModuleLoadingSkeleton />
  }

  return (
    <ModuleErrorBoundary>
      <ModuleLayout
        title={config.title}
        description={config.description}
        progress={progress}
        onBack={onBack}
        currentStep={currentStep}
        currentResponse={responses[currentStep]}
        previousResponses={responses}
        onSuggestionRequest={handleGenerateSuggestion}
        onSuggestionApply={(suggestion) => saveResponse(currentStep, suggestion)}
        isGeneratingSuggestion={isGeneratingSuggestion}
        quickActionGroups={quickActionGroups}
      >
        {renderModuleContent(currentStep, config.steps)}
      </ModuleLayout>
    </ModuleErrorBoundary>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.moduleType === nextProps.moduleType &&
    prevProps.mode === nextProps.mode &&
    prevProps.stepIcons === nextProps.stepIcons
  )
})

export default ModuleBase 