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
import { ModuleBase } from "@/components/modules/module-base"
import { ModuleStep } from "@/components/modules/module-navigation"
import { IdeationLayout } from "@/components/layouts/ideation-layout"
import { useProject } from "@/context/project-context"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ModuleType, 
  MODULE_TYPES, 
  ProjectMetadataContent, 
  ModuleMetadataContent,
  JsonCompatible,
  isProjectMetadata
} from "@/types/project"
import { useToast } from "@/hooks/use-toast"

// Map of icons for each module's steps
const MODULE_STEP_ICONS = {
  'vision-problem': {
    vision: Target,
    problem: Users,
    solution: Lightbulb
  },
  'market-analysis': {
    'target-market': Target,
    'market-size': TrendingUp,
    'competitors': Users,
    'market-trends': Search
  },
  'business-model': {
    'revenue-model': DollarSign,
    'customer-segments': Users,
    'value-proposition': Rocket,
    'channels': Building
  },
  'go-to-market': {
    'launch-strategy': Rocket,
    'marketing-plan': Megaphone,
    'growth-metrics': BarChart2,
    'partnerships': Users
  },
  'financial-projections': {
    'revenue-projections': TrendingUp,
    'cost-structure': DollarSign,
    'funding-requirements': Building
  },
  'risk-assessment': {
    'market-risks': Target,
    'operational-risks': Building,
    'risk-mitigation': Shield
  },
  'implementation-timeline': {
    'milestones': Flag,
    'timeline': Calendar,
    'resources': Clock,
    'success-metrics': Target
  },
  'pitch-deck': {
    'problem-solution': Target,
    'market-opportunity': TrendingUp,
    'business-model': DollarSign,
    'team': Users,
    'ask': Presentation
  }
} as const

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

// Add type guard
function isModuleType(step: StepState): step is ModuleType {
  return step !== 'selection'
}

// Add type for step state
type StepState = ModuleType | 'selection'

// Memoize the module component wrapper to prevent re-renders
const ModuleWrapper = memo(function ModuleWrapper({
  currentStep,
  selectedPath,
  onBack,
  onComplete,
  stepIcons
}: {
  currentStep: ModuleType
  selectedPath: "guided" | "expert"
  onBack: () => void
  onComplete: () => void
  stepIcons: Record<string, LucideIcon>
}) {
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
        stepIcons={MODULE_STEP_ICONS[currentStep]}
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

  // Memoize project metadata getter
  const getProjectMetadata = useCallback((): ProjectMetadataContent => {
    if (!project?.metadata || !isProjectMetadata(project.metadata)) {
      return {
        path: null,
        currentStep: null,
        completedAt: null,
        stage: 'idea',
        industry: null
      }
    }
    return project.metadata
  }, [project?.metadata])

  const [currentStep, setCurrentStep] = useState<StepState>(() => {
    const metadata = getProjectMetadata()
    return metadata?.currentStep || 'selection'
  })
  
  const [selectedPath, setSelectedPath] = useState<"guided" | "expert" | null>(() => {
    const metadata = getProjectMetadata()
    return metadata?.path || null
  })

  // Update state only when metadata actually changes
  useEffect(() => {
    if (project?.metadata) {
      const metadata = getProjectMetadata()
      const newPath = metadata.path
      const newStep = metadata.currentStep || 'selection'

      setSelectedPath(prevPath => {
        if (prevPath !== newPath) return newPath
        return prevPath
      })

      setCurrentStep(prevStep => {
        if (prevStep !== newStep) return newStep
        return prevStep
      })
    }
  }, [project?.metadata, getProjectMetadata])

  const handleStartJourney = async () => {
    console.log('Starting journey:', {
      selectedPath,
      projectId: project?.id,
      hasProject: !!project,
      timestamp: new Date().toISOString()
    })

    if (!selectedPath || !project) {
      console.warn('Missing required data:', {
        selectedPath,
        hasProject: !!project,
        timestamp: new Date().toISOString()
      })
      return
    }

    try {
      // First ensure the module exists
      console.log('Creating vision-problem module...')
      const module = await ensureModule('vision-problem')
      
      console.log('Module created:', {
        moduleId: module.id,
        type: module.type,
        timestamp: new Date().toISOString()
      })

      // Then update project metadata
      await updateProject({
        metadata: {
          path: selectedPath,
          currentStep: 'vision-problem',
          completedAt: null,
          stage: 'idea',
          industry: null
        } as JsonCompatible<ProjectMetadataContent>
      })

      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('Journey started successfully, updating UI...')
      setCurrentStep('vision-problem')
    } catch (err) {
      console.error('Error starting journey:', {
        error: err,
        context: 'handleStartJourney',
        timestamp: new Date().toISOString()
      })
      toast({
        title: "Error",
        description: "Failed to start journey. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Memoize handlers to prevent unnecessary re-renders
  const handleModuleSelect = useCallback(async (moduleId: ModuleType) => {
    if (!project) return

    try {
      const currentMetadata = getProjectMetadata()
      if (!currentMetadata) return

      // First ensure module exists before switching to it
      await ensureModule(moduleId)

      // Then update project metadata
      await updateProject({
        metadata: {
          ...currentMetadata,
          currentStep: moduleId
        } as JsonCompatible<ProjectMetadataContent>
      })
      
      // Update state after successful API calls
      setCurrentStep(moduleId)
    } catch (err) {
      console.error('Error selecting module:', err)
      toast({
        title: "Error",
        description: "Failed to select module. Please try again.",
        variant: "destructive"
      })
    }
  }, [project, updateProject, ensureModule, toast])

  // Memoize module data calculations
  const { currentModules, overallProgress, moduleRecaps } = useMemo(() => {
    const completedModules = project?.modules.filter(m => m.completed) || []
    const overallProgress = (completedModules.length / MODULE_TYPES.length) * 100

    const currentModules = MODULE_TYPES.map(type => {
      const module = project?.modules.find(m => m.type === type)
      return {
        id: type,
        title: module?.title || type.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        completed: module?.completed ?? false
      }
    })

    const moduleRecaps = project?.modules.map(m => {
      const metadata = m.metadata as unknown as ModuleMetadataContent
      return {
        id: m.type,
        title: m.title,
        completed: m.completed,
        summary: metadata?.summary || undefined
      }
    }) || []

    return { currentModules, overallProgress, moduleRecaps }
  }, [project?.modules])

  // Memoize handlers
  const handleBack = useCallback(() => {
    if (currentStep === 'selection') return

    const currentIndex = MODULE_TYPES.indexOf(currentStep)
    if (currentIndex > 0) {
      handleModuleSelect(MODULE_TYPES[currentIndex - 1])
    } else {
      setCurrentStep("selection")
    }
  }, [currentStep, handleModuleSelect])

  const handleComplete = useCallback(() => {
    if (currentStep === 'selection') return

    const currentIndex = MODULE_TYPES.indexOf(currentStep)
    if (currentIndex < MODULE_TYPES.length - 1) {
      handleModuleSelect(MODULE_TYPES[currentIndex + 1])
    } else {
      router.push('/dashboard/projects')
    }
  }, [currentStep, handleModuleSelect, router])

  // Handle loading state - return null to prevent layout shift
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: selectedPath ? 1 : 0, y: selectedPath ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center mt-8"
          >
            {selectedPath && (
              <Button
                size="lg"
                className="group"
                onClick={handleStartJourney}
              >
                Begin Your Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </motion.div>

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
                stepIcons={MODULE_STEP_ICONS[currentStep]}
              />
            )}
          </AnimatePresence>
        </IdeationLayout>
      )}
    </>
  )
}
