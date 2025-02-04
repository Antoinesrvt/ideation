"use client"

import { useState } from "react"
import { Target, Users, Lightbulb } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { ExpertTips } from "./expert-tips"
import { ModuleStep } from "./module-navigation"

interface VisionProblemModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "vision",
    title: "Vision Statement",
    description: "What future do you want to create?",
    placeholder: "In 5 years, we envision a world where...",
    icon: Target,
  },
  {
    id: "problem",
    title: "Problem Statement",
    description: "What significant problem are you solving?",
    placeholder: "Today, people struggle with...",
    icon: Users,
  },
  {
    id: "solution",
    title: "Solution Concept",
    description: "How will you solve this problem?",
    placeholder: "We will create...",
    icon: Lightbulb,
  },
]

const expertTips = {
  vision: [
    "Consider market trends in your vision",
    "Validate assumptions with data",
    "Think about scalability"
  ]
}

export function VisionProblemModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: VisionProblemModuleProps) {
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
      title="Vision & Problem"
      progress={progress}
      onBack={onBack}
      moduleId={currentModuleId}
      stepId={currentStep.id}
      currentText={responses[currentStep.id] || ""}
      onSuggestionApply={(suggestion) => {
        setResponses((prev) => ({
          ...prev,
          [currentStep.id]: suggestion,
        }));
      }}
    >
      <div className="space-y-2">
        <StepCard
          icon={currentStep.icon}
          title={currentStep.title}
          description={currentStep.description}
          placeholder={currentStep.placeholder}
          value={responses[currentStep.id] || ""}
          onChange={(value) =>
            setResponses((prev) => ({
              ...prev,
              [currentStep.id]: value,
            }))
          }
          onPrevious={currentStepIndex > 0 ? handlePrevious : undefined}
          onNext={handleNext}
          showNext={true}
          showPrevious={currentStepIndex > 0}
        />

        {/* {mode === "expert" && (
          <ExpertTips 
            tips={expertTips[currentStep.id as keyof typeof expertTips]} 
          />
        )} */}
      </div>
    </ModuleLayout>
  );
} 