"use client"

import { useState } from "react"
import { BarChart2, Target, Users, TrendingUp } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { AIAssistant } from "./ai-assistant"
import { ModuleStep } from "./module-navigation"

interface MarketAnalysisModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "target-market",
    title: "Target Market",
    description: "Who are your ideal customers?",
    placeholder: "Our target market consists of...",
    icon: Target,
  },
  {
    id: "market-size",
    title: "Market Size",
    description: "What's your Total Addressable Market (TAM)?",
    placeholder: "The total market size is approximately...",
    icon: TrendingUp,
  },
  {
    id: "competitors",
    title: "Competition Analysis",
    description: "Who are your main competitors?",
    placeholder: "Our main competitors are...\n\nTheir strengths:\n-\n\nTheir weaknesses:\n-",
    icon: BarChart2,
  },
  {
    id: "unique-value",
    title: "Unique Value Proposition",
    description: "What makes your solution unique?",
    placeholder: "Our unique value proposition is...",
    icon: Users,
  },
]

const expertTips = {
  "target-market": [
    "Create detailed user personas",
    "Consider psychographic factors",
    "Identify market segments"
  ],
  "market-size": [
    "Use credible market research",
    "Calculate TAM, SAM, and SOM",
    "Consider market growth rate"
  ],
  "competitors": [
    "Analyze direct and indirect competitors",
    "Study their business models",
    "Identify market gaps"
  ],
  "unique-value": [
    "Focus on customer benefits",
    "Make it measurable",
    "Ensure it's defensible"
  ]
}

export function MarketAnalysisModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: MarketAnalysisModuleProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  return (
    <ModuleLayout
      title="Market Analysis"
      progress={progress}
      onBack={onBack}
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
          onNext={currentStepIndex < steps.length - 1 ? handleNext : undefined}
        />

        <AIAssistant
          mode={mode}
          context={currentStep.title.toLowerCase()}
          suggestion={aiSuggestion}
          onSuggest={() => setAiSuggestion("Based on your industry, consider...")}
          expertTips={expertTips[currentStep.id as keyof typeof expertTips]}
        />
      </div>
    </ModuleLayout>
  )
} 