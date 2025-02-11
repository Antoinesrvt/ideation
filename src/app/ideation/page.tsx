"use client"

import { useEffect, useState, Suspense, useCallback, useMemo, memo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, ArrowRight, Clock, Blocks, Lightbulb, Target, Users,
  TrendingUp, DollarSign, Building, Megaphone, BarChart2, Rocket,
  Calendar, Flag, Presentation, Search, Shield, LucideIcon, Check
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ModuleBase from "@/components/modules/module-base"
import { ModuleStep } from "@/components/modules/module-navigation"
import { IdeationLayout } from "@/components/layouts/ideation-layout"
import { useProject } from "@/context/project-context"
import { useModule } from "@/context/module-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleType, MODULES_CONFIG, getNextModule, getPreviousModule } from "@/config/modules"
import { useToast } from "@/hooks/use-toast"
import { ProjectMetadata, ProjectMetadataContent, ProjectSettings } from "@/types/project"
import { ProjectService } from "@/lib/services/core/project-service"
import { useSupabase } from "@/context/supabase-context"

interface PathOption {
  id: "guided" | "expert"
  title: string
  description: string
  timeEstimate: string
  features: string[]
  icon: React.ElementType
}

const pathOptions: PathOption[] = [
  {
    id: "guided",
    title: "Guided Journey",
    description: "Perfect for first-time entrepreneurs or quick validation",
    timeEstimate: "15-30 min",
    icon: Sparkles,
    features: [
      "Step-by-step AI guidance",
      "Essential business elements",
      "Quick validation tools",
      "Basic market insights"
    ]
  },
  {
    id: "expert",
    title: "Expert Mode",
    description: "Comprehensive business planning with advanced tools",
    timeEstimate: "Flexible",
    icon: Blocks,
    features: [
      "Detailed analysis tools",
      "Custom workflow",
      "Advanced market research",
      "Full validation suite"
    ]
  }
]

// Type guard for ModuleType
function isModuleType(step: StepState): step is ModuleType {
  return step !== 'selection'
}

// Type for step state
type StepState = ModuleType | 'selection'

interface ModuleWrapperProps {
  currentStep: ModuleType
  selectedPath: "guided" | "expert"
  onBack: () => void
  onComplete: () => void
}

const ModuleWrapper = memo(function ModuleWrapper({
  currentStep,
  selectedPath,
  onBack,
  onComplete
}: ModuleWrapperProps) {
  const { state: { currentProject } } = useProject()
  const moduleConfig = useMemo(() => MODULES_CONFIG.find(m => m.id === currentStep), [currentStep])
  
  // Get the actual module ID from the project's modules
  const moduleId = useMemo(() => {
    if (!currentProject?.modules) return null
    const module = currentProject.modules.find(m => m.type === currentStep)
    return module?.id
  }, [currentProject?.modules, currentStep])

  if (!moduleConfig || !moduleId) return null

  const stepIcons = useMemo(() => 
    moduleConfig.steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: step.icon
    }), {}), [moduleConfig.steps])

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.8 }}
      transition={{ 
        duration: 0.15,
        ease: "easeInOut"
      }}
    >
      <ModuleBase
        key={moduleId}
        moduleId={moduleId}
        mode={selectedPath}
        onBack={onBack}
        onComplete={onComplete}
        stepIcons={stepIcons}
      />
    </motion.div>
  )
})

export default function IdeationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  const { state: { currentProject, isLoading }, loadProject, updateProject } = useProject()
  const { state: { currentModule }, loadModule } = useModule()
  const { supabase } = useSupabase()
  const { user } = useSupabase()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState<StepState>('selection')
  const [selectedPath, setSelectedPath] = useState<"guided" | "expert" | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // Create project service instance
  const projectService = useMemo(() => new ProjectService(supabase), [supabase])

  // Load project data
  useEffect(() => {
    if (projectId) {
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  // Memoize module data calculations
  const { currentModules, overallProgress, moduleRecaps } = useMemo(() => {
    if (!currentProject?.modules) return { currentModules: [], overallProgress: 0, moduleRecaps: [] }

    const completedModules = currentProject.modules.filter(m => m.status === 'completed')
    const overallProgress = (completedModules.length / MODULES_CONFIG.length) * 100

    const currentModules = MODULES_CONFIG.map(config => ({
      id: config.id,
      title: currentProject.modules.find(m => m.type === config.id)?.title || config.title,
      completed: currentProject.modules.find(m => m.type === config.id)?.status === 'completed',
      icon: config.icon
    }))

    const moduleRecaps = currentProject.modules.map(m => ({
      id: m.type,
      title: m.title,
      completed: m.status === 'completed',
      summary: (m.metadata as { summary?: string })?.summary
    }))

    return { currentModules, overallProgress, moduleRecaps }
  }, [currentProject?.modules])

  // Handle module selection
  const handleModuleSelect = useCallback(async (moduleType: ModuleType) => {
    if (!currentProject || !user) return

    setIsNavigating(true)
    try {
      // Get or create the module
      let module = currentProject.modules?.find(m => m.type === moduleType)
      if (!module) {
        const moduleConfig = MODULES_CONFIG.find(m => m.id === moduleType)
        if (!moduleConfig) throw new Error('Module configuration not found')

        const newModule = await projectService.createProjectModule({
          project_id: currentProject.id,
          type: moduleType,
          title: moduleConfig.title,
          status: 'draft',
          created_by: user.id
        })
        // Reload project to get the new module
        await loadProject(currentProject.id)
        module = newModule
      }

      if (module) {
        await loadModule(module.id)
        setCurrentStep(moduleType)
      }
    } catch (err) {
      console.error('Error selecting module:', err)
      toast({
        title: "Error",
        description: "Failed to select module. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsNavigating(false)
    }
  }, [currentProject, loadModule, toast, loadProject, user, projectService])

  // Handle journey start
  const handleStartJourney = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!currentProject || !selectedPath || !user) return

    try {
      // Create the first module if it doesn't exist
      const existingModule = currentProject.modules?.find(m => m.type === 'vision-problem')
      if (!existingModule) {
        await projectService.createProjectModule({
          project_id: currentProject.id,
          type: 'vision-problem',
          title: MODULES_CONFIG.find(m => m.id === 'vision-problem')?.title || 'Vision & Problem',
          status: 'draft',
          created_by: user.id
        })
        // Reload project to get the new module
        await loadProject(currentProject.id)
      }

      await handleModuleSelect('vision-problem')
      
      // Update project metadata
      const currentMetadata = currentProject.metadata as ProjectMetadataContent | null
      const defaultSettings = {
        allowCollaboration: true,
        requireApproval: false,
        autoSave: true
      }

      const metadata = {
        path: selectedPath,
        currentStep: 'vision-problem',
        completedAt: null,
        stage: currentProject.stage || null,
        industry: currentProject.industry || null,
        settings: currentMetadata?.settings || defaultSettings,
        customFields: currentMetadata?.customFields || {}
      }
      
      await updateProject({
        metadata
      })
    } catch (err) {
      console.error('Error starting journey:', err)
      toast({
        title: "Error",
        description: "Failed to start journey. Please try again.",
        variant: "destructive"
      })
      setCurrentStep('selection')
    }
  }, [currentProject, selectedPath, handleModuleSelect, updateProject, toast, loadProject, user, projectService])

  const handleBack = useCallback(async () => {
    if (currentStep === 'selection') return

    try {
      if (isModuleType(currentStep)) {
        const prevModule = getPreviousModule(currentStep)
        if (prevModule) {
          await handleModuleSelect(prevModule.id)
        } else {
          setCurrentStep('selection')
        }
      }
    } catch (err) {
      console.error('Error navigating back:', err)
      toast({
        title: "Error",
        description: "Failed to navigate back. Please try again.",
        variant: "destructive"
      })
    }
  }, [currentStep, handleModuleSelect, toast])

  const handleComplete = useCallback(async () => {
    if (currentStep === 'selection') return

    try {
      const currentModuleData = currentModules.find(m => m.id === currentStep)
      if (!currentModuleData?.completed) {
        toast({
          title: "Module Incomplete",
          description: "Please complete all steps before proceeding.",
          variant: "destructive"
        })
        return
      }

      if (isModuleType(currentStep)) {
        const nextModule = getNextModule(currentStep)
        if (nextModule) {
          await handleModuleSelect(nextModule.id)
        } else {
          router.push('/dashboard/projects')
        }
      }
    } catch (err) {
      console.error('Error completing module:', err)
      toast({
        title: "Error",
        description: "Failed to complete module. Please try again.",
        variant: "destructive"
      })
    }
  }, [currentStep, currentModules, handleModuleSelect, router, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Skeleton className="h-[600px] w-full max-w-4xl mx-auto" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {currentStep === 'selection' ? (
        <motion.div
          key="selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center min-h-screen w-full"
        >
          <div className="container max-w-5xl py-8 space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Choose Your Path</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Select how you'd like to build your startup. You can always switch between modes later.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {pathOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.1,
                    type: "spring",
                    damping: 15
                  }}
                >
                  <Card
                    className={cn(
                      "relative cursor-pointer transition-all duration-200",
                      "hover:shadow-lg hover:bg-accent/5",
                      selectedPath === option.id && "ring-2 ring-primary ring-offset-2 shadow-lg"
                    )}
                    onClick={() => setSelectedPath(option.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.2 + 0.2 }}
                          className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                          <option.icon className="h-6 w-6 text-primary" />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.2 + 0.3 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Clock className="h-4 w-4" />
                          {option.timeEstimate}
                        </motion.div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 + 0.4 }}
                      >
                        <CardTitle className="text-xl mt-4">{option.title}</CardTitle>
                        <CardDescription className="mt-2">{option.description}</CardDescription>
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.ul 
                        className="space-y-3"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: {
                            transition: {
                              staggerChildren: 0.1,
                              delayChildren: index * 0.2 + 0.5
                            }
                          }
                        }}
                      >
                        {option.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            variants={{
                              hidden: { opacity: 0, x: -20 },
                              visible: { opacity: 1, x: 0 }
                            }}
                            className="flex items-center text-sm"
                          >
                            <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Start Button */}
            <AnimatePresence mode="wait">
              {selectedPath && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-center mt-8"
                >
                  <Button
                    size="lg"
                    className="group relative overflow-hidden"
                    onClick={handleStartJourney}
                    disabled={isNavigating}
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative z-10"
                    >
                      Begin Your Journey
                      <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-primary/10"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-12 text-center"
            >
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span>Tip: You can always switch between modes or revisit modules later</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <IdeationLayout
          steps={currentModules.map(m => ({
            id: m.id,
            title: m.title,
            completed: m.completed,
            icon: m.icon,
            step_type: m.id
          }))}
          currentStepType={currentStep}
          onStepSelect={handleModuleSelect}
          progress={overallProgress}
          moduleRecaps={moduleRecaps}
        >
          <ModuleWrapper
            currentStep={currentStep}
            selectedPath={selectedPath!}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        </IdeationLayout>
      )}
    </AnimatePresence>
  )
}
