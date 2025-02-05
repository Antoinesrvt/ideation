"use client"

import { useEffect, useState, Suspense, useCallback, useMemo, memo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, ArrowRight, Clock, Blocks, Lightbulb, Target, Users,
  TrendingUp, DollarSign, Building, Megaphone, BarChart2, Rocket,
  Calendar, Flag, Presentation, Search, Shield, LucideIcon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ModuleBase from "@/components/modules/module-base"
import { ModuleStep } from "@/components/modules/module-navigation"
import { IdeationLayout } from "@/components/layouts/ideation-layout"
import { useProject } from "@/context/project-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleType, MODULES_CONFIG, getNextModule, getPreviousModule } from "@/config/modules"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/types/database"

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"]
type ModuleRow = Database["public"]["Tables"]["modules"]["Row"]

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

interface ModuleBaseProps {
  moduleType: ModuleType
  mode: "guided" | "expert"
  onBack: () => void
  onComplete: () => void
  stepIcons?: Record<string, LucideIcon>
}

// Type guard for ModuleType
function isModuleType(step: StepState): step is ModuleType {
  return step !== 'selection'
}

// Type for step state
type StepState = ModuleType | 'selection'

const ModuleWrapper = memo(function ModuleWrapper({
  currentStep,
  selectedPath,
  onBack,
  onComplete
}: {
  currentStep: ModuleType
  selectedPath: "guided" | "expert"
  onBack: () => void
  onComplete: () => void
}) {
  const moduleConfig = useMemo(() => MODULES_CONFIG.find(m => m.id === currentStep), [currentStep])
  
  if (!moduleConfig) return null

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
        key={currentStep}
        moduleType={currentStep}
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
  const { project, loading, error, updateProject, ensureModule } = useProject()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState<StepState>('selection')
  const [selectedPath, setSelectedPath] = useState<"guided" | "expert" | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // Memoize module data calculations first
  const { currentModules, overallProgress, moduleRecaps } = useMemo(() => {
    const modules = (project as ProjectRow & { modules: ModuleRow[] })?.modules || []
    const completedModules = modules.filter(m => m.completed)
    const overallProgress = (completedModules.length / MODULES_CONFIG.length) * 100

    const currentModules = MODULES_CONFIG.map(config => ({
      id: config.id,
      title: modules.find(m => m.type === config.id)?.title || config.title,
      completed: modules.find(m => m.type === config.id)?.completed ?? false,
      icon: config.icon
    }))

    const moduleRecaps = modules.map(m => ({
      id: m.type,
      title: m.title,
      completed: m.completed,
      summary: (m.metadata as { summary?: string })?.summary
    }))

    return { currentModules, overallProgress, moduleRecaps }
  }, [(project as ProjectRow & { modules: ModuleRow[] })?.modules])

  // Handle module selection
  const handleModuleSelect = useCallback(async (moduleId: ModuleType) => {
    if (!project) return

    setIsNavigating(true)
    try {
      await ensureModule(moduleId)
      setCurrentStep(moduleId)
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
  }, [project, ensureModule, toast])

  // Handle journey start
  const handleStartJourney = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!project || !selectedPath) return

    try {
      await handleModuleSelect('vision-problem')
      
      // Update project metadata
      await updateProject({
        metadata: {
          ...project.metadata as Record<string, unknown>,
          path: selectedPath,
          currentStep: 'vision-problem'
        }
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
  }, [project, selectedPath, handleModuleSelect, updateProject, toast])

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
      const currentModule = currentModules.find(m => m.id === currentStep)
      if (!currentModule?.completed) {
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
        description: "Failed to proceed to next module. Please try again.",
        variant: "destructive"
      })
    }
  }, [currentStep, currentModules, handleModuleSelect, router, toast])

  // Update state when project changes
  useEffect(() => {
    if (project?.metadata) {
      const metadata = project.metadata as { path?: "guided" | "expert", currentStep?: ModuleType }
      setSelectedPath(metadata.path || null)
      setCurrentStep(metadata.currentStep || 'selection')
    }
  }, [project?.metadata])

  // Handle loading state
  if (loading) {
    return null
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Project</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => router.push('/dashboard/projects')}>
          Return to Projects
        </Button>
      </div>
    )
  }

  // Redirect if no project is selected
  if (!project) {
    return null
  }

  return (
    <>
      {currentStep === "selection" ? (
        <motion.div
          key="selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -100 }}
          className="max-w-5xl mx-auto space-y-8 py-6"
        >
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-primary">
                {project.title}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Choose your path and let AI guide you through the ideation process
              </p>
            </motion.div>
          </div>

          {/* Path Selection */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {pathOptions.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden transition-all cursor-pointer hover:shadow-lg",
                    selectedPath === path.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedPath(path.id)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                    <div className="absolute inset-0 bg-primary/10 rotate-45" />
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <path.icon className="h-6 w-6 text-primary" />
                      <CardTitle>{path.title}</CardTitle>
                    </div>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {path.timeEstimate}
                    </div>
                    
                    <ul className="space-y-2">
                      {path.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Start Button */}
          <div className="flex justify-center mt-8">
            {selectedPath && (
              <Button
                size="lg"
                className="group"
                onClick={handleStartJourney}
                disabled={isNavigating}
              >
                Begin Your Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-center text-sm text-muted-foreground"
          >
            <p>
              💡 Tip: You can always switch between modes or revisit modules later
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <IdeationLayout
          steps={currentModules}
          currentStepId={currentStep}
          onStepSelect={handleModuleSelect}
          progress={overallProgress}
          moduleRecaps={moduleRecaps}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isModuleType(currentStep) && (
              <ModuleWrapper
                currentStep={currentStep}
                selectedPath={selectedPath!}
                onBack={handleBack}
                onComplete={handleComplete}
              />
            )}
          </AnimatePresence>
        </IdeationLayout>
      )}
    </>
  )
}
