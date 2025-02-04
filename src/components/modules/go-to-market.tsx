"use client"

import { useState } from "react"
import { Target, Users, Megaphone, BarChart2, Rocket } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { AIAssistant } from "./ai-assistant"
import { ModuleStep } from "./module-navigation"

interface GoToMarketModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "launch-strategy",
    title: "Launch Strategy",
    description: "How will you introduce your product to the market?",
    placeholder: "Our launch strategy includes:\n\n1. Pre-launch:\n-\n\n2. Launch phase:\n-\n\n3. Post-launch:\n-",
    icon: Rocket,
  },
  {
    id: "marketing-plan",
    title: "Marketing Plan",
    description: "What marketing channels and tactics will you use?",
    placeholder: "Marketing channels:\n\n1. Primary channels:\n-\n\n2. Content strategy:\n-\n\n3. Budget allocation:\n-",
    icon: Megaphone,
  },
  {
    id: "growth-metrics",
    title: "Growth Metrics",
    description: "What metrics will you track?",
    placeholder: "Key metrics:\n\n1. Acquisition metrics:\n-\n\n2. Engagement metrics:\n-\n\n3. Revenue metrics:\n-",
    icon: BarChart2,
  },
  {
    id: "partnerships",
    title: "Strategic Partnerships",
    description: "What partnerships will accelerate your growth?",
    placeholder: "Partnership strategy:\n\n1. Key partners:\n-\n\n2. Value exchange:\n-\n\n3. Timeline:\n-",
    icon: Users,
  }
]

const expertTips = {
  "launch-strategy": [
    "Build pre-launch anticipation",
    "Plan for different scenarios",
    "Prepare contingency plans"
  ],
  "marketing-plan": [
    "Focus on ROI-driven channels",
    "Start with one channel mastery",
    "Plan content calendar"
  ],
  "growth-metrics": [
    "Define north star metric",
    "Set up analytics early",
    "Track cohort behavior"
  ],
  "partnerships": [
    "Identify strategic fit",
    "Create win-win scenarios",
    "Plan resource allocation"
  ]
}

export function GoToMarketModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: GoToMarketModuleProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else if (onComplete) {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  return (
    <ModuleLayout
      title="Go-to-Market Strategy"
      progress={progress}
      onBack={onBack}
      currentModuleId={currentModuleId}
      allModules={allModules}
      onModuleSelect={onModuleSelect}
    >
      <div className="grid gap-6 md:grid-cols-7">
        <StepCard
          icon={currentStep.icon}
          title={currentStep.title}
          description={currentStep.description}
          placeholder={currentStep.placeholder}
          value={responses[currentStep.id] || ""}
          onChange={(value) => 
            setResponses(prev => ({
              ...prev,
              [currentStep.id]: value
            }))
          }
          onPrevious={currentStepIndex > 0 ? handlePrevious : undefined}
          onNext={handleNext}
          showNext={true}
          showPrevious={currentStepIndex > 0}
        />

        <AIAssistant
          mode={mode}
          context={currentStep.title.toLowerCase()}
          suggestion={aiSuggestion}
          onSuggest={() => setAiSuggestion("Based on your market approach, consider...")}
          expertTips={expertTips[currentStep.id as keyof typeof expertTips]}
        />
      </div>
    </ModuleLayout>
  )
} 