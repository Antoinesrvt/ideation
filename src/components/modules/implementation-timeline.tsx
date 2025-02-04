"use client"

import { useState } from "react"
import { Calendar, Target, Users, Boxes, Clock } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { ModuleStep } from "./module-navigation"
import { ExpertTips } from "./expert-tips"

interface ImplementationTimelineModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "development-phases",
    title: "Development Phases",
    description: "What are the key development milestones?",
    placeholder: "Development timeline:\n\n1. Phase 1 (Months 1-3):\n- Key activities:\n- Deliverables:\n\n2. Phase 2 (Months 4-6):\n- Key activities:\n- Deliverables:",
    icon: Calendar,
  },
  {
    id: "resource-allocation",
    title: "Resource Allocation",
    description: "What resources are needed for each phase?",
    placeholder: "Resource needs:\n\n1. Team Resources:\n- Roles needed:\n- Timeline for hiring:\n\n2. Technical Resources:\n- Infrastructure:\n- Tools:",
    icon: Boxes,
  },
  {
    id: "milestones",
    title: "Key Milestones",
    description: "What are your critical success milestones?",
    placeholder: "Critical milestones:\n\n1. Short-term (3 months):\n-\n\n2. Medium-term (6 months):\n-\n\n3. Long-term (12 months):\n-",
    icon: Target,
  },
  {
    id: "team-structure",
    title: "Team Structure",
    description: "How will your team evolve over time?",
    placeholder: "Team evolution:\n\n1. Initial Team (Launch):\n-\n\n2. Growth Phase:\n-\n\n3. Scaling Phase:\n-",
    icon: Users,
  }
]

const expertTips = {
  "development-phases": [
    "Break down into manageable sprints",
    "Include testing phases",
    "Plan for iterations"
  ],
  "resource-allocation": [
    "Consider outsourcing vs hiring",
    "Plan for scalability",
    "Include buffer in estimates"
  ],
  "milestones": [
    "Make milestones measurable",
    "Include market validation points",
    "Plan for pivots if needed"
  ],
  "team-structure": [
    "Define clear roles and responsibilities",
    "Plan for knowledge transfer",
    "Consider advisory needs"
  ]
}

export function ImplementationTimelineModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: ImplementationTimelineModuleProps) {
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
      title="Implementation Timeline"
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
        {mode === "expert" && (
          <ExpertTips
            tips={expertTips[currentStep.id as keyof typeof expertTips]}
          />
        )}
      </div>
    </ModuleLayout>
  );
} 