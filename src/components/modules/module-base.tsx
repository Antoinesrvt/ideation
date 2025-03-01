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
import { useSupabase } from "@/context/supabase-context"
import { ModuleService } from "@/lib/services/core/module-service"

interface ModuleBaseProps {
  moduleType: ModuleType
  projectId: string
  mode: 'guided' | 'expert'
  onBack: () => void
  onComplete: () => void
  stepIcons: Record<string, LucideIcon>
}

const ModuleBase = memo(function ModuleBase({
  moduleType,
  projectId,
  mode,
  onBack,
  onComplete,
  stepIcons
}: ModuleBaseProps) {
  const { toast } = useToast()
  const [showCompletion, setShowCompletion] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const { supabase } = useSupabase()

  // Get module configuration from MODULES_CONFIG
  const moduleConfig = useMemo(() => {
    const config = MODULES_CONFIG.find(m => m.id === moduleType)
    if (!config) throw new Error(`Module config not found: ${moduleType}`)
    return config
  }, [moduleType])

  // Create module service instance
  const moduleService = useMemo(() => new ModuleService(supabase), [supabase])

  // Use module hook with type-based query
  const {
    module: dbModule,
    isLoading: isLoadingModule,
    error: moduleError,
    currentStepId,
    isCompleted,
    updateModule,
    completeModule
  } = useModule({
    moduleType,
    projectId,
    onComplete: () => {
      if (dbModule?.status === 'completed') {
        setShowUpdate(true)
      } else {
        setShowCompletion(true)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Get current step configuration
  const currentStepConfig = useMemo(() => 
    moduleConfig.steps[currentStepIndex], 
    [moduleConfig.steps, currentStepIndex]
  )

  // Get database step if it exists
  const currentDbStep = useMemo(() => 
    dbModule?.steps?.find(s => 
      s.step_type === currentStepConfig?.id && 
      s.id === currentStepId
    ), 
    [dbModule?.steps, currentStepConfig?.id, currentStepId]
  )

  // Sync current step index with database when it loads
  useEffect(() => {
    if (dbModule?.current_step_id && moduleConfig.steps) {
      const dbStep = dbModule.steps.find(s => s.id === dbModule.current_step_id)
      if (dbStep) {
        const stepIndex = moduleConfig.steps.findIndex(s => s.id === dbStep.step_type)
        if (stepIndex !== -1) {
          setCurrentStepIndex(stepIndex)
        }
      }
    }
  }, [dbModule?.current_step_id, dbModule?.steps, moduleConfig.steps])

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
    moduleType,
    projectId,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Handle next step
  const handleNext = useCallback(async () => {
    if (!moduleConfig?.steps) return

    const isLastStep = currentStepIndex === moduleConfig.steps.length - 1

    try {
      // Mark current step as completed first
      if (currentDbStep) {
        await markAsCompleted()
      }

      if (isLastStep) {
        // For the last step, complete the module first
        await completeModule()
        // Don't update the step index since we're showing completion overlay
      } else {
        // Update front-end state immediately for non-last steps
        setCurrentStepIndex(prev => prev + 1)

        // Then sync with backend
        if (dbModule) {
          // Find the next step in database
          const nextStepConfig = moduleConfig.steps[currentStepIndex + 1]
          const nextDbStep = dbModule.steps.find(s => s.step_type === nextStepConfig.id)
          if (nextDbStep) {
            await updateModule({ current_step_id: nextDbStep.id })
          }
        }
      }
    } catch (error) {
      // Revert front-end state if backend sync fails
      if (!isLastStep) {
        setCurrentStepIndex(prev => prev - 1)
      }
      console.error('Error handling next step:', error)
      toast({
        title: "Error",
        description: "Failed to proceed to next step. Please try again.",
        variant: "destructive"
      })
    }
  }, [moduleConfig?.steps, currentStepIndex, currentDbStep, dbModule, markAsCompleted, completeModule, updateModule, toast])

  // Handle previous step
  const handlePrevious = useCallback(async () => {
    if (!moduleConfig?.steps) return

    try {
      if (currentStepIndex <= 0) {
        onBack()
        return
      }

      // Update front-end state immediately
      setCurrentStepIndex(prev => prev - 1)

      // Then sync with backend if available
      if (dbModule) {
        const prevStepConfig = moduleConfig.steps[currentStepIndex - 1]
        const prevDbStep = dbModule.steps.find(s => s.step_type === prevStepConfig.id)
        if (prevDbStep) {
          await updateModule({ current_step_id: prevDbStep.id })
        }
      }
    } catch (error) {
      // Revert front-end state if backend sync fails
      setCurrentStepIndex(prev => prev + 1)
      console.error('Error handling previous step:', error)
      toast({
        title: "Error",
        description: "Failed to go to previous step. Please try again.",
        variant: "destructive"
      })
    }
  }, [moduleConfig?.steps, currentStepIndex, dbModule, updateModule, onBack, toast])

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
    if (!moduleConfig.steps || !currentStepConfig) return null

    const isLastStep = currentStepIndex === moduleConfig.steps.length - 1
    const isFirstStep = currentStepIndex === 0
    const firstModuleId = MODULES_CONFIG[0]?.id
    const isFirstModule = moduleType === firstModuleId

    return (
      <div className="space-y-6">
        <StepCard
          key={currentDbStep?.id || currentStepConfig.id}
          title={currentStepConfig.title}
          description={currentStepConfig.description}
          placeholder={currentStepConfig.placeholder || ''}
          icon={stepIcons[currentStepConfig.id] || Object.values(stepIcons)[0]}
          value={currentDbStep?.responses?.[0]?.content || ""}
          onChange={(value) => saveResponse(value)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          showNext={true}
          showPrevious={!(isFirstStep && isFirstModule)}
          nextButtonText={isLastStep ? "Finish Module" : "Next"}
          previousButtonText={isFirstStep && !isFirstModule ? "Previous Module" : "Previous"}
          isCompleted={currentStepCompleted}
        />
        {mode === "expert" && currentStepConfig.expert_tips && (
          <ExpertTips 
            key={`tips-${currentDbStep?.id || currentStepConfig.id}`}
            tips={currentStepConfig.expert_tips} 
          />
        )}
      </div>
    )
  }

  // Get next module name for completion overlay
  const getNextModuleName = () => {
    if (!dbModule?.type) return undefined
    const currentModuleIndex = MODULES_CONFIG.findIndex(m => m.id === dbModule.type)
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

  // No module config
  if (!moduleConfig) {
    return <div>Module configuration not found</div>
  }

  return (
    <ModuleErrorBoundary onBack={onBack} onRetry={() => window.location.reload()}>
      <ModuleLayout
        title={moduleConfig.title}
        description={moduleConfig.description}
        stepProgress={`Step ${currentStepIndex + 1} of ${moduleConfig.steps.length}`}
        onBack={onBack}
        currentStep={currentStepId || ''}
        currentResponse={latestResponse}
        previousResponses={{}}
        onSuggestionRequest={handleGenerateSuggestion}
        onSuggestionApply={handleSuggestionApply}
        isGeneratingSuggestion={isGeneratingSuggestion}
        isLoading={isSaving}
        moduleType={moduleType}
        projectId={projectId}
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