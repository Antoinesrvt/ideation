"use client"

import { useState } from "react"
import { AlertTriangle, Shield, Users, Zap, Target } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { AIAssistant } from "./ai-assistant"
import { ModuleStep } from "./module-navigation"

interface RiskAssessmentModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "market-risks",
    title: "Market Risks",
    description: "What market-related risks could affect your success?",
    placeholder: "Market risks analysis:\n\n1. Competition Risks:\n-\n\n2. Market Size Risks:\n-\n\n3. Market Timing Risks:\n-",
    icon: Target,
  },
  {
    id: "technical-risks",
    title: "Technical Risks",
    description: "What technical challenges could impact your product?",
    placeholder: "Technical risks:\n\n1. Development Risks:\n-\n\n2. Scalability Risks:\n-\n\n3. Technology Risks:\n-",
    icon: Zap,
  },
  {
    id: "operational-risks",
    title: "Operational Risks",
    description: "What operational challenges could you face?",
    placeholder: "Operational risks:\n\n1. Team Risks:\n-\n\n2. Supply Chain Risks:\n-\n\n3. Process Risks:\n-",
    icon: Users,
  },
  {
    id: "mitigation-strategies",
    title: "Risk Mitigation",
    description: "How will you address these risks?",
    placeholder: "Mitigation strategies:\n\n1. Market Risk Mitigation:\n-\n\n2. Technical Risk Mitigation:\n-\n\n3. Operational Risk Mitigation:\n-",
    icon: Shield,
  }
]

const expertTips = {
  "market-risks": [
    "Consider macro-economic factors",
    "Analyze competitor responses",
    "Evaluate regulatory risks"
  ],
  "technical-risks": [
    "Assess technology dependencies",
    "Plan for technical debt",
    "Consider security risks"
  ],
  "operational-risks": [
    "Evaluate team scalability",
    "Consider geographic risks",
    "Plan for resource constraints"
  ],
  "mitigation-strategies": [
    "Create contingency plans",
    "Build strategic partnerships",
    "Maintain flexibility in approach"
  ]
}

export function RiskAssessmentModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: RiskAssessmentModuleProps) {
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
      title="Risk Assessment"
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
          onSuggest={() => setAiSuggestion("Based on your business model, consider these risks...")}
          expertTips={expertTips[currentStep.id as keyof typeof expertTips]}
        />
      </div>
    </ModuleLayout>
  )
} 