"use client"

import { useState, useMemo, memo, useCallback, useEffect } from "react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { ExpertTips } from "./expert-tips"
import { ModuleCompletionOverlay } from "./module-completion-overlay"
import { ModuleUpdateOverlay } from "./module-update-overlay"
import { useModule } from "@/hooks/use-module"
import { useStep } from "@/hooks/use-step"
import { ModuleType, MODULES_CONFIG, type ModuleConfig } from "@/config/modules"
import { LucideIcon, AlertCircle } from "lucide-react"
import { ModuleErrorBoundary } from "./module-error-boundary"
import { useToast } from "@/hooks/use-toast"
import { ModuleLoadingSkeleton } from "./module-loading-skeleton"
import { motion, AnimatePresence } from "framer-motion"

interface ModuleBaseProps {
  moduleId: string
  mode: 'guided' | 'expert'
  onBack: () => void
  onComplete: () => void
  stepIcons: Record<string, LucideIcon>
}

const ModuleBase = memo(function ModuleBase({
  moduleId,
  mode,
  onBack,
  onComplete,
  stepIcons
}: ModuleBaseProps) {
  const { toast } = useToast()
  const [showCompletion, setShowCompletion] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)

  // Use module hook
  const {
    module,
    config,
    isLoading: isLoadingModule,
    error: moduleError,
    currentStepId,
    isCompleted,
    updateModule,
    completeModule
  } = useModule(moduleId, {
    onComplete: () => {
      if (module?.status === 'completed') {
        setShowUpdate(true)
      } else {
        setShowCompletion(true)
      }
      onComplete()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Use step hook for current step
  const {
    step,
    latestResponse,
    isLoading: isLoadingStep,
    isCompleted: currentStepCompleted,
    markAsCompleted,
    saveResponse,
    generateAISuggestion,
    enhanceStepContent,
    isGeneratingSuggestion,
    isEnhancing,
    isSaving
  } = useStep(currentStepId, {
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Get the module configuration
  const moduleConfig = useMemo<ModuleConfig>(() => {
    if (!config) {
      // Return a default config to prevent null errors
      return {
        id: 'vision-problem',
        title: '',
        description: '',
        order_index: 0,
        icon: AlertCircle,
        steps: []
      }
    }
    return config
  }, [config])

  // Always start from first step when entering a module
  useEffect(() => {
    if (module && moduleConfig.steps && (!currentStepId || !moduleConfig.steps.find(s => s.id === currentStepId))) {
      const firstStep = moduleConfig.steps[0]
      if (firstStep) {
        updateModule({ current_step_id: firstStep.id })
      }
    }
  }, [module, moduleConfig.steps, currentStepId, updateModule])

  // Handle next step
  const handleNext = useCallback(async () => {
    if (!config?.steps || !currentStepId) return

    // Get current step index
    const currentIndex = config.steps.findIndex(s => s.id === currentStepId)
    if (currentIndex === -1) return

    // Check if this is the last step
    const isLastStep = currentIndex === config.steps.length - 1

    try {
      // Mark current step as completed
      await markAsCompleted()

      if (isLastStep) {
        // Complete module if all steps are completed
        await completeModule()
      } else {
        // Move to next step
        const nextStep = config.steps[currentIndex + 1]
        await updateModule({ current_step_id: nextStep.id })
      }
    } catch (error) {
      console.error('Error handling next step:', error)
      toast({
        title: "Error",
        description: "Failed to proceed to next step. Please try again.",
        variant: "destructive"
      })
    }
  }, [config?.steps, currentStepId, markAsCompleted, completeModule, updateModule, toast])

  // Handle previous step
  const handlePrevious = useCallback(async () => {
    if (!config?.steps || !currentStepId) return

    try {
      // Get current step index
      const currentIndex = config.steps.findIndex(s => s.id === currentStepId)
      if (currentIndex <= 0) {
        onBack()
        return
      }

      // Move to previous step
      const previousStep = config.steps[currentIndex - 1]
      await updateModule({ current_step_id: previousStep.id })
    } catch (error) {
      console.error('Error handling previous step:', error)
      toast({
        title: "Error",
        description: "Failed to go to previous step. Please try again.",
        variant: "destructive"
      })
    }
  }, [config?.steps, currentStepId, updateModule, onBack, toast])

  // Handle AI suggestion generation
  const handleGenerateSuggestion = useCallback(async (context: string) => {
    await generateAISuggestion(context)
  }, [generateAISuggestion])

  // Handle suggestion application
  const handleSuggestionApply = useCallback(async (suggestion: string) => {
    await saveResponse(suggestion)
  }, [saveResponse])

  // Helper function to render module content
  function renderModuleContent() {
    if (!moduleConfig.steps || !currentStepId) return null

    const step = moduleConfig.steps.find((s) => s.id === currentStepId)
    if (!step) return null

    const currentIndex = moduleConfig.steps.findIndex(s => s.id === currentStepId)
    const isLastStep = currentIndex === moduleConfig.steps.length - 1
    const isFirstStep = currentIndex === 0
    const firstModuleId = MODULES_CONFIG[0]?.id
    const isFirstModule = module?.type === firstModuleId

    return (
      <div className="space-y-6">
        <StepCard
          key={step.id}
          title={step.title}
          description={step.description}
          placeholder={step.placeholder || ''}
          icon={stepIcons[step.id] || Object.values(stepIcons)[0]}
          value={latestResponse?.content || ""}
          onChange={(value) => saveResponse(value)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          showNext={true}
          showPrevious={!(isFirstStep && isFirstModule)}
          nextButtonText={isLastStep ? "Finish Module" : "Next"}
          previousButtonText={isFirstStep && !isFirstModule ? "Previous Module" : "Previous"}
          isCompleted={currentStepCompleted}
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

  // Get next module name for completion overlay
  const getNextModuleName = () => {
    if (!module?.type) return undefined
    const currentModuleIndex = MODULES_CONFIG.findIndex(m => m.id === module.type)
    const nextModule = MODULES_CONFIG[currentModuleIndex + 1]
    return nextModule?.title
  }

  // Show loading skeleton during initialization or when module is not yet available
  if (isLoadingModule || isLoadingStep) {
    return <ModuleLoadingSkeleton />
  }

  // Error state
  if (moduleError) {
    return (
      <ModuleErrorBoundary onBack={onBack} onRetry={() => window.location.reload()}>
        <div className="text-destructive">Error: {moduleError.message}</div>
      </ModuleErrorBoundary>
    )
  }

  // No module or config
  if (!module || !moduleConfig) {
    return <div>Module not found</div>
  }

  return (
    <ModuleErrorBoundary onBack={onBack} onRetry={() => window.location.reload()}>
      <ModuleLayout
        title={moduleConfig.title}
        description={moduleConfig.description}
        stepProgress={`Step ${currentStepId ? moduleConfig.steps.findIndex(s => s.id === currentStepId) + 1 : 1} of ${moduleConfig.steps.length}`}
        onBack={onBack}
        currentStep={currentStepId || ''}
        currentResponse={latestResponse}
        previousResponses={{}}
        onSuggestionRequest={handleGenerateSuggestion}
        onSuggestionApply={handleSuggestionApply}
        isGeneratingSuggestion={isGeneratingSuggestion}
        isLoading={isSaving}
        moduleType={module.type}
        projectId={moduleId}
      >
        <AnimatePresence mode="wait">
          {renderModuleContent()}
        </AnimatePresence>
      </ModuleLayout>

      <AnimatePresence>
        {showCompletion && (
          <ModuleCompletionOverlay
            isVisible={showCompletion}
            onNext={() => {
              setShowCompletion(false)
              onComplete()
            }}
            nextModuleName={getNextModuleName()}
          />
        )}
        {showUpdate && (
          <ModuleUpdateOverlay
            isVisible={showUpdate}
            onGenerateDocument={() => {
              setShowUpdate(false)
              onComplete()
            }}
            onSkip={() => {
              setShowUpdate(false)
              onComplete()
            }}
            documentName={moduleConfig.title}
          />
        )}
      </AnimatePresence>
    </ModuleErrorBoundary>
  )
})

export default ModuleBase 