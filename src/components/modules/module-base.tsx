"use client"

import { useEffect, useState, useMemo, memo } from "react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { ExpertTips } from "./expert-tips"
import { ModuleCompletionOverlay } from "./module-completion-overlay"
import { ModuleUpdateOverlay } from "./module-update-overlay"
import { useModule } from "@/hooks/use-module"
import { ModuleType, MODULES_CONFIG, type ModuleConfig } from "@/config/modules"
import { LucideIcon, AlertCircle } from "lucide-react"
import { ModuleErrorBoundary } from "./module-error-boundary"
import { useProject } from "@/context/project-context"
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
    isLoading: isInitializing,
    error
  } = useModule(moduleId, {
    onComplete,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const { project } = useProject()
  const { toast } = useToast()
  const [showCompletion, setShowCompletion] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [previousContent, setPreviousContent] = useState<{
    stepId: string | undefined
  } | null>(null)

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
    if (module && moduleConfig.steps && (!currentStep || !moduleConfig.steps.find(s => s.id === currentStep))) {
      const firstStep = moduleConfig.steps[0]
      if (firstStep) {
        navigateToStep(firstStep.id)
      }
    }
  }, [module, moduleConfig.steps, currentStep, navigateToStep])

  const handleNext = async () => {
    if (!currentStep || !moduleConfig.steps) return

    const currentIndex = moduleConfig.steps.findIndex(step => step.id === currentStep)
    const isLastStep = currentIndex === moduleConfig.steps.length - 1

    try {
      // First mark the current step as completed
      await markStepAsCompleted(currentStep)

      if (isLastStep) {
        // If it's the last step, try to complete the module
        const success = await completeModule()
        if (success) {
          // Check if this is the first completion or an update
          if (module?.completed) {
            setShowUpdate(true)
          } else {
            setShowCompletion(true)
          }
        }
      } else {
        // Always move to the next step in sequence
        const nextStep = moduleConfig.steps[currentIndex + 1]
        if (nextStep) {
          await navigateToStep(nextStep.id)
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
  }

  const handlePrevious = async () => {
    if (!currentStep || !moduleConfig.steps) return

    const currentIndex = moduleConfig.steps.findIndex(step => step.id === currentStep)
    
    try {
      if (currentIndex > 0) {
        // Move to the previous step in sequence
        const prevStep = moduleConfig.steps[currentIndex - 1]
        if (prevStep) {
          await navigateToStep(prevStep.id)
        }
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
    await generateAISuggestion(context)
  }

  // Helper function to render module content
  function renderModuleContent(currentStepId: string, steps: typeof moduleConfig.steps) {
    const step = steps.find((s) => s.id === currentStepId)
    if (!step) return null

    const currentIndex = steps.findIndex(s => s.id === currentStepId)
    const isLastStep = currentIndex === steps.length - 1
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
    if (!module?.type) return undefined
    const currentModuleIndex = MODULES_CONFIG.findIndex(m => m.id === module.type)
    const nextModule = MODULES_CONFIG[currentModuleIndex + 1]
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
          title={moduleConfig.title}
          description={moduleConfig.description}
          onBack={onBack}
          currentStep={currentStep || ''}
          currentResponse={currentStep ? responses[currentStep] : undefined}
          previousResponses={responses}
          onSuggestionRequest={handleGenerateSuggestion}
          onSuggestionApply={(suggestion) => currentStep && saveResponse(currentStep, suggestion)}
          isGeneratingSuggestion={isGeneratingSuggestion}
          stepProgress={currentStep && moduleConfig.steps ? 
            `Step ${moduleConfig.steps.findIndex(s => s.id === currentStep) + 1} of ${moduleConfig.steps.length}` : 
            undefined}
          moduleType={module?.type ?? 'vision-problem'}
          projectId={project?.id || ''}
        >
          <AnimatePresence mode="wait">
            {currentStep && moduleConfig.steps && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderModuleContent(currentStep, moduleConfig.steps)}
              </motion.div>
            )}
          </AnimatePresence>
        </ModuleLayout>

        {/* Completion Overlay */}
        <ModuleCompletionOverlay
          isVisible={showCompletion}
          onNext={() => {
            setShowCompletion(false)
            onComplete()
          }}
          nextModuleName={getNextModuleName()}
        />

        {/* Update Overlay */}
        <ModuleUpdateOverlay
          isVisible={showUpdate}
          onGenerateDocument={() => {
            setShowUpdate(false)
            // TODO: Implement document generation
            onComplete()
          }}
          onSkip={() => {
            setShowUpdate(false)
            onComplete()
          }}
          documentName={moduleConfig.title}
        />
      </motion.div>
    </ModuleErrorBoundary>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.moduleId === nextProps.moduleId &&
    prevProps.mode === nextProps.mode
  )
})

export default ModuleBase 