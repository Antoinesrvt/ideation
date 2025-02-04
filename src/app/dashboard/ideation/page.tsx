"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight, Clock, Blocks, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VisionProblemModule } from "@/components/modules/vision-problem"
import { MarketAnalysisModule } from "@/components/modules/market-analysis"
import { BusinessModelModule } from "@/components/modules/business-model"
import { ModuleStep } from "@/components/modules/module-navigation"
import { GoToMarketModule } from "@/components/modules/go-to-market"
import { FinancialProjectionsModule } from "@/components/modules/financial-projections"
import { RiskAssessmentModule } from "@/components/modules/risk-assessment"
import { ImplementationTimelineModule } from "@/components/modules/implementation-timeline"
import { PitchDeckModule } from "@/components/modules/pitch-deck"

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

type IdeationStep = 
  | "selection" 
  | "vision-problem" 
  | "market-analysis" 
  | "business-model" 
  | "go-to-market" 
  | "financial-projections"
  | "risk-assessment"
  | "implementation-timeline"
  | "pitch-deck"

const moduleSteps: ModuleStep[] = [
  {
    id: "vision-problem",
    title: "Vision & Problem",
    completed: false
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    completed: false
  },
  {
    id: "business-model",
    title: "Business Model",
    completed: false
  },
  {
    id: "go-to-market",
    title: "Go-to-Market",
    completed: false
  },
  {
    id: "financial-projections",
    title: "Financial Projections",
    completed: false
  },
  {
    id: "risk-assessment",
    title: "Risk Assessment",
    completed: false
  },
  {
    id: "implementation-timeline",
    title: "Implementation Timeline",
    completed: false
  },
  {
    id: "pitch-deck",
    title: "Pitch Deck",
    completed: false
  }
]

export default function IdeationPage() {
  const [selectedPath, setSelectedPath] = useState<"guided" | "expert" | null>(null)
  const [currentStep, setCurrentStep] = useState<IdeationStep>("selection")
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())

  const handleStartJourney = () => {
    setCurrentStep("vision-problem")
  }

  const handleNextModule = (current: IdeationStep) => {
    const flow: IdeationStep[] = [
      "selection", 
      "vision-problem", 
      "market-analysis", 
      "business-model",
      "go-to-market",
      "financial-projections",
      "risk-assessment",
      "implementation-timeline",
      "pitch-deck"
    ]
    const currentIndex = flow.indexOf(current)
    if (currentIndex < flow.length - 1) {
      setCurrentStep(flow[currentIndex + 1])
    } else {
      // Handle completion of all modules
      // Redirect to summary dashboard
      console.log("All modules completed!")
    }
  }

  const handleModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => new Set(Array.from(prev).concat(moduleId)))
  }

  const handleModuleSelect = (moduleId: string) => {
    setCurrentStep(moduleId as IdeationStep)
  }

  const currentModules = moduleSteps.map(step => ({
    ...step,
    completed: completedModules.has(step.id)
  }))

  return (
    <AnimatePresence mode="wait">
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
                Start Your Startup Journey
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
      ) : currentStep === "vision-problem" ? (
        <motion.div
          key="vision-problem"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <VisionProblemModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("selection")}
            onComplete={() => {
              handleModuleComplete("vision-problem")
              handleNextModule("vision-problem")
            }}
            currentModuleId="vision-problem"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : currentStep === "market-analysis" ? (
        <motion.div
          key="market-analysis"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          <MarketAnalysisModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("vision-problem")}
            onComplete={() => {
              handleModuleComplete("market-analysis")
              handleNextModule("market-analysis")
            }}
            currentModuleId="market-analysis"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : currentStep === "business-model" ? (
        <motion.div
          key="business-model"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          <BusinessModelModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("market-analysis")}
            onComplete={() => {
              handleModuleComplete("business-model")
              handleNextModule("business-model")
            }}
            currentModuleId="business-model"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : currentStep === "go-to-market" ? (
        <motion.div
          key="go-to-market"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <GoToMarketModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("business-model")}
            onComplete={() => {
              handleModuleComplete("go-to-market")
              // This is the last module, handle completion differently
              // Maybe redirect to summary or dashboard
            }}
            currentModuleId="go-to-market"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : currentStep === "financial-projections" ? (
        <motion.div
          key="financial-projections"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <FinancialProjectionsModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("go-to-market")}
            onComplete={() => {
              handleModuleComplete("financial-projections")
              // This is the last module, handle completion differently
              // Maybe redirect to summary or dashboard
            }}
            currentModuleId="financial-projections"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : currentStep === "risk-assessment" ? (
        <motion.div
          key="risk-assessment"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <RiskAssessmentModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("financial-projections")}
            onComplete={() => {
              handleModuleComplete("risk-assessment")
              handleNextModule("risk-assessment")
            }}
            currentModuleId="risk-assessment"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : currentStep === "implementation-timeline" ? (
        <motion.div
          key="implementation-timeline"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <ImplementationTimelineModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("risk-assessment")}
            onComplete={() => {
              handleModuleComplete("implementation-timeline")
              handleNextModule("implementation-timeline")
            }}
            currentModuleId="implementation-timeline"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : (
        <motion.div
          key="pitch-deck"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <PitchDeckModule 
            mode={selectedPath!}
            onBack={() => setCurrentStep("implementation-timeline")}
            onComplete={() => {
              handleModuleComplete("pitch-deck")
              // Final module - handle completion
              console.log("All modules completed!")
            }}
            currentModuleId="pitch-deck"
            allModules={currentModules}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
