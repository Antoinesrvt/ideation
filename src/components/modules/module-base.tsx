"use client"

import { useEffect, useState, useMemo, memo } from "react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { ExpertTips } from "./expert-tips"
import { ModuleCompletionOverlay } from "./module-completion-overlay"
import { useModule } from "@/hooks/use-module"
import { ModuleType, MODULES_CONFIG } from "@/config/modules"
import { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleErrorBoundary } from "./module-error-boundary"
import { useProject } from "@/context/project-context"
import { useToast } from "@/hooks/use-toast"
import { useAI } from "@/context/ai-context"
import { ModuleResponse } from "@/types/module"
import { ModuleLoadingSkeleton } from "./module-loading-skeleton"
import { motion, AnimatePresence } from "framer-motion"

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
    isStepCompleted,
    isModuleCompleted,
    saveResponse,
    markStepAsCompleted,
    navigateToStep,
    completeModule,
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
  const [showCompletion, setShowCompletion] = useState(false)
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

  // Always start from first step when entering a module
  useEffect(() => {
    if (module && config.steps && (!currentStep || !config.steps.find(s => s.id === currentStep))) {
      const firstStep = config.steps[0]
      navigateToStep(firstStep.id)
    }
  }, [module, config.steps, currentStep, navigateToStep])

  const handleNext = async () => {
    if (!currentStep || !config.steps) return

    const currentIndex = config.steps.findIndex(step => step.id === currentStep)
    const isLastStep = currentIndex === config.steps.length - 1

    try {
      // First mark the current step as completed
      await markStepAsCompleted(currentStep)

      if (isLastStep) {
        // If it's the last step, try to complete the module
        const success = await completeModule()
        if (success) {
          setShowCompletion(true)
        }
      } else {
        // Always move to the next step in sequence
        const nextStep = config.steps[currentIndex + 1]
        await navigateToStep(nextStep.id)
      }
    } catch (error) {
      console.error('Error handling next step:', error)
      toast({
        title: "Error",
        description: "Failed to proceed to next step. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handlePrevious = async () => {
    if (!currentStep || !config.steps) return

    const currentIndex = config.steps.findIndex(step => step.id === currentStep)
    
    try {
      if (currentIndex > 0) {
        // Move to the previous step in sequence
        const prevStep = config.steps[currentIndex - 1]
        await navigateToStep(prevStep.id)
      } else {
        // If we're at the first step, go back to the previous module
        onBack?.()
      }
    } catch (error) {
      console.error('Error handling previous step:', error)
      toast({
        title: "Error",
        description: "Failed to go to previous step. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleGenerateSuggestion = async (context: string) => {
    if (!currentStep) return
    await generateAISuggestion(currentStep, context)
  }

  // Helper function to render module content
  function renderModuleContent(currentStepId: string, steps: typeof config.steps) {
    const step = steps.find((s) => s.id === currentStepId)
    if (!step) return null

    const currentIndex = steps.findIndex(s => s.id === currentStepId)
    const isLastStep = currentIndex === steps.length - 1
    const isFirstStep = currentIndex === 0
    const firstModuleId = MODULES_CONFIG[0]?.id
    const isFirstModule = moduleType === firstModuleId

    return (
      <div className="space-y-6">
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
          showPrevious={!(isFirstStep && isFirstModule)}
          nextButtonText={isLastStep ? "Finish Module" : "Next"}
          previousButtonText={isFirstStep && !isFirstModule ? "Previous Module" : "Previous"}
          isCompleted={isStepCompleted(step.id)}
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
    const currentModuleIndex = Object.keys(MODULES_CONFIG).indexOf(moduleType)
    const nextModule = Object.values(MODULES_CONFIG)[currentModuleIndex + 1]
    return nextModule?.title
  }

  // Show loading skeleton during initialization or when module is not yet available
  if (isInitializing || (!module && !previousContent)) {
    return <ModuleLoadingSkeleton />
  }

  return (
    <ModuleErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ModuleLayout
          title={config.title}
          description={config.description}
          onBack={onBack}
          currentStep={currentStep}
          currentResponse={responses[currentStep]}
          previousResponses={responses}
          onSuggestionRequest={handleGenerateSuggestion}
          onSuggestionApply={(suggestion) => currentStep && saveResponse(currentStep, suggestion)}
          isGeneratingSuggestion={isGeneratingSuggestion}
          quickActionGroups={quickActionGroups}
          stepProgress={currentStep && config.steps ? 
            `Step ${config.steps.findIndex(s => s.id === currentStep) + 1} of ${config.steps.length}` : 
            undefined}
        >
          <AnimatePresence mode="wait">
            {currentStep && config.steps && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderModuleContent(currentStep, config.steps)}
              </motion.div>
            )}
          </AnimatePresence>
        </ModuleLayout>

        <ModuleCompletionOverlay
          isVisible={showCompletion}
          onNext={() => {
            setShowCompletion(false)
            onComplete()
          }}
          nextModuleName={getNextModuleName()}
          onClose={() => setShowCompletion(false)}
        />
      </motion.div>
    </ModuleErrorBoundary>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.moduleType === nextProps.moduleType &&
    prevProps.mode === nextProps.mode
  )
})

export default ModuleBase 