"use client"

import { useState } from "react"
import { Presentation, Target, Users, LineChart, Rocket } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { AIAssistant } from "./ai-assistant"
import { ModuleStep } from "./module-navigation"

interface PitchDeckModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "story-narrative",
    title: "Story & Narrative",
    description: "What's your compelling story?",
    placeholder: "Pitch narrative:\n\n1. Problem Statement:\n-\n\n2. Your Solution:\n-\n\n3. Why Now:\n-",
    icon: Presentation,
  },
  {
    id: "market-opportunity",
    title: "Market Opportunity",
    description: "What's the big opportunity?",
    placeholder: "Market opportunity:\n\n1. Market Size:\n-\n\n2. Growth Potential:\n-\n\n3. Market Trends:\n-",
    icon: Target,
  },
  {
    id: "business-traction",
    title: "Business Traction",
    description: "What progress have you made?",
    placeholder: "Current traction:\n\n1. Key Metrics:\n-\n\n2. Milestones Achieved:\n-\n\n3. Future Milestones:\n-",
    icon: LineChart,
  },
  {
    id: "team-expertise",
    title: "Team & Expertise",
    description: "Why is your team the right one?",
    placeholder: "Team strengths:\n\n1. Core Team:\n-\n\n2. Advisors:\n-\n\n3. Key Hires Needed:\n-",
    icon: Users,
  },
  {
    id: "growth-strategy",
    title: "Growth Strategy",
    description: "How will you scale?",
    placeholder: "Growth plan:\n\n1. Short-term Growth:\n-\n\n2. Scaling Strategy:\n-\n\n3. Resource Needs:\n-",
    icon: Rocket,
  }
]

const expertTips = {
  "story-narrative": [
    "Keep it compelling and concise",
    "Focus on the problem-solution fit",
    "Use data to support claims"
  ],
  "market-opportunity": [
    "Use credible market data",
    "Show clear segmentation",
    "Highlight market dynamics"
  ],
  "business-traction": [
    "Focus on key metrics",
    "Show growth trajectory",
    "Highlight key partnerships"
  ],
  "team-expertise": [
    "Highlight relevant experience",
    "Show domain expertise",
    "Include advisory board"
  ],
  "growth-strategy": [
    "Show clear scaling path",
    "Include resource requirements",
    "Address potential challenges"
  ]
}

export function PitchDeckModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: PitchDeckModuleProps) {
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
      title="Pitch Deck"
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
          onSuggest={() => setAiSuggestion("To make your pitch more compelling, consider...")}
          expertTips={expertTips[currentStep.id as keyof typeof expertTips]}
        />
      </div>
    </ModuleLayout>
  )
} 