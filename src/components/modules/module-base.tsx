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

  // Map between step types and database IDs
  const stepIdMapping = useMemo(() => {
    if (!dbModule?.steps) return {}
    return dbModule.steps.reduce((acc, step) => ({
      ...acc,
      [step.step_type]: step.id
    }), {} as Record<string, string>)
  }, [dbModule?.steps])

  // Get current step type from database ID
  const currentStepType = useMemo(() => {
    if (!dbModule?.steps || !currentStepId) return moduleConfig.steps[0].id
    const step = dbModule.steps.find(s => s.id === currentStepId)
    return step?.step_type || moduleConfig.steps[0].id
  }, [dbModule?.steps, currentStepId, moduleConfig])

  // Get database ID from step type
  const getStepDatabaseId = useCallback((stepType: string) => {
    return stepIdMapping[stepType]
  }, [stepIdMapping])

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

  // Always start from first step when entering a module
  useEffect(() => {
    if (dbModule && moduleConfig?.steps && (!currentStepId || !dbModule.steps.find(s => s.id === currentStepId))) {
      const firstStepType = moduleConfig.steps[0].id
      const firstStepId = stepIdMapping[firstStepType]
      if (firstStepId) {
        updateModule({ current_step_id: firstStepId })
      }
    }
  }, [dbModule, moduleConfig?.steps, currentStepId, updateModule, stepIdMapping])

  // Handle next step
  const handleNext = useCallback(async () => {
    if (!moduleConfig?.steps || !currentStepType || !dbModule) return

    const currentIndex = moduleConfig.steps.findIndex(s => s.id === currentStepType)
    if (currentIndex === -1) return

    const isLastStep = currentIndex === moduleConfig.steps.length - 1

    try {
      // Mark current step as completed
      const currentDbStepId = getStepDatabaseId(currentStepType)
      if (currentDbStepId) {
        await markAsCompleted()
      }

      if (isLastStep) {
        // Complete module if all steps are completed
        await completeModule()
      } else {
        // Move to next step using types
        const nextStepType = moduleConfig.steps[currentIndex + 1].id
        const nextStepId = getStepDatabaseId(nextStepType)
        if (nextStepId) {
          await updateModule({ current_step_id: nextStepId })
        }
      }
    } catch (error) {
      console.error('Error handling next step:', error)
      toast({
        title: "Error",
        description: "Failed to proceed to next step. Please try again.",
        variant: "destructive"
      })
    }
  }, [moduleConfig?.steps, currentStepType, dbModule, getStepDatabaseId, markAsCompleted, completeModule, updateModule, toast])

  // Handle previous step
  const handlePrevious = useCallback(async () => {
    if (!moduleConfig?.steps || !currentStepType || !dbModule) return

    try {
      const currentIndex = moduleConfig.steps.findIndex(s => s.id === currentStepType)
      if (currentIndex <= 0) {
        onBack()
        return
      }

      // Move to previous step using types
      const previousStepType = moduleConfig.steps[currentIndex - 1].id
      const previousStepId = getStepDatabaseId(previousStepType)
      if (previousStepId) {
        await updateModule({ current_step_id: previousStepId })
      }
    } catch (error) {
      console.error('Error handling previous step:', error)
      toast({
        title: "Error",
        description: "Failed to go to previous step. Please try again.",
        variant: "destructive"
      })
    }
  }, [moduleConfig?.steps, currentStepType, dbModule, getStepDatabaseId, updateModule, onBack, toast])

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
    if (!moduleConfig.steps) return null

    // Get current step configuration
    const currentStepConfig = moduleConfig.steps[
      dbModule?.current_step_id 
        ? moduleConfig.steps.findIndex(s => 
            dbModule.steps?.find(dbStep => 
              dbStep.step_type === s.id && dbStep.id === dbModule.current_step_id
            )
          )
        : 0
    ]
    
    if (!currentStepConfig) return null

    // Get database step if it exists
    const currentDbStep = dbModule?.steps?.find(s => 
      s.step_type === currentStepConfig.id && 
      s.id === dbModule?.current_step_id
    )

    const currentIndex = moduleConfig.steps.findIndex(s => s.id === currentStepConfig.id)
    const isLastStep = currentIndex === moduleConfig.steps.length - 1
    const isFirstStep = currentIndex === 0
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
        stepProgress={`Step ${currentStepId ? moduleConfig.steps.findIndex(s => dbModule?.steps?.find(dbStep => dbStep.id === currentStepId && dbStep.step_type === s.id)) + 1 : 1} of ${moduleConfig.steps.length}`}
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