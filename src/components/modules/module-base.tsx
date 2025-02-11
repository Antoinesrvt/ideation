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
    moduleType: module?.type || 'vision-problem',
    projectId: module?.project_id || '',
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

  // Create a mapping between step types and database IDs
  const stepIdMapping = useMemo(() => {
    if (!module?.steps) return {}
    return module.steps.reduce((acc, step) => ({
      ...acc,
      [step.step_type]: step.id
    }), {} as Record<string, string>)
  }, [module?.steps])

  // Get step type from database ID
  const getStepTypeFromId = useCallback((stepId: string) => {
    if (!module?.steps) return null
    const step = module.steps.find(s => s.id === stepId)
    return step?.step_type || null
  }, [module?.steps])

  // Always start from first step when entering a module
  useEffect(() => {
    if (module && moduleConfig.steps && (!currentStepId || !module.steps.find(s => s.id === currentStepId))) {
      const firstStepType = moduleConfig.steps[0].id
      const firstStepId = stepIdMapping[firstStepType]
      if (firstStepId) {
        updateModule({ current_step_id: firstStepId })
      }
    }
  }, [module, moduleConfig.steps, currentStepId, updateModule, stepIdMapping])

  // Handle next step
  const handleNext = useCallback(async () => {
    if (!config?.steps || !currentStepId || !module) return

    // Get current step type
    const currentStepType = getStepTypeFromId(currentStepId)
    if (!currentStepType) return

    // Get current step index from config using step type
    const currentIndex = config.steps.findIndex(s => s.id === currentStepType)
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
        // Move to next step - get the next step type from config
        const nextStepType = config.steps[currentIndex + 1].id
        // Get the actual database ID for this step type
        const nextStepId = stepIdMapping[nextStepType]
        if (!nextStepId) {
          throw new Error('Step not found')
        }
        await updateModule({ current_step_id: nextStepId })
      }
    } catch (error) {
      console.error('Error handling next step:', error)
      toast({
        title: "Error",
        description: "Failed to proceed to next step. Please try again.",
        variant: "destructive"
      })
    }
  }, [config?.steps, currentStepId, module, stepIdMapping, getStepTypeFromId, markAsCompleted, completeModule, updateModule, toast])

  // Handle previous step
  const handlePrevious = useCallback(async () => {
    if (!config?.steps || !currentStepId || !module) return

    try {
      // Get current step type
      const currentStepType = getStepTypeFromId(currentStepId)
      if (!currentStepType) return

      // Get current step index from config using step type
      const currentIndex = config.steps.findIndex(s => s.id === currentStepType)
      if (currentIndex <= 0) {
        onBack()
        return
      }

      // Move to previous step - get the previous step type from config
      const previousStepType = config.steps[currentIndex - 1].id
      // Get the actual database ID for this step type
      const previousStepId = stepIdMapping[previousStepType]
      if (!previousStepId) {
        throw new Error('Step not found')
      }
      await updateModule({ current_step_id: previousStepId })
    } catch (error) {
      console.error('Error handling previous step:', error)
      toast({
        title: "Error",
        description: "Failed to go to previous step. Please try again.",
        variant: "destructive"
      })
    }
  }, [config?.steps, currentStepId, module, stepIdMapping, getStepTypeFromId, updateModule, onBack, toast])

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
    if (!moduleConfig.steps || !currentStepId || !module?.steps) return null

    // Get current step from module steps
    const currentStep = module.steps.find(s => s.id === currentStepId)
    if (!currentStep) return null

    // Get step config using step type
    const stepConfig = moduleConfig.steps.find(s => s.id === currentStep.step_type)
    if (!stepConfig) return null

    const currentIndex = moduleConfig.steps.findIndex(s => s.id === currentStep.step_type)
    const isLastStep = currentIndex === moduleConfig.steps.length - 1
    const isFirstStep = currentIndex === 0
    const firstModuleId = MODULES_CONFIG[0]?.id
    const isFirstModule = module.type === firstModuleId

    return (
      <div className="space-y-6">
        <StepCard
          key={currentStep.id}
          title={stepConfig.title}
          description={stepConfig.description}
          placeholder={stepConfig.placeholder || ''}
          icon={stepIcons[stepConfig.id] || Object.values(stepIcons)[0]}
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
        {mode === "expert" && stepConfig.expert_tips && (
          <ExpertTips 
            key={`tips-${currentStep.id}`}
            tips={stepConfig.expert_tips} 
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
        projectId={module.project_id}
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