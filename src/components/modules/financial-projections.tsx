"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Calculator, PiggyBank, LineChart } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { AIAssistant } from "./ai-assistant"
import { ModuleStep } from "./module-navigation"
import { ExpertTips } from "./expert-tips"

interface FinancialProjectionsModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "startup-costs",
    title: "Startup Costs",
    description: "What initial investments are needed?",
    placeholder: "Initial costs breakdown:\n\n1. Development Costs:\n-\n\n2. Operating Costs:\n-\n\n3. Marketing Costs:\n-",
    icon: DollarSign,
  },
  {
    id: "revenue-projections",
    title: "Revenue Projections",
    description: "Project your revenue for the next 12-24 months",
    placeholder: "Revenue projections:\n\n1. First 6 months:\n-\n\n2. 6-12 months:\n-\n\n3. Year 2:\n-",
    icon: TrendingUp,
  },
  {
    id: "break-even",
    title: "Break-even Analysis",
    description: "When will you become profitable?",
    placeholder: "Break-even analysis:\n\n1. Fixed Costs:\n-\n\n2. Variable Costs:\n-\n\n3. Break-even Point:\n-",
    icon: Calculator,
  },
  {
    id: "funding-needs",
    title: "Funding Requirements",
    description: "How much funding do you need and when?",
    placeholder: "Funding requirements:\n\n1. Initial Investment:\n-\n\n2. Future Rounds:\n-\n\n3. Use of Funds:\n-",
    icon: PiggyBank,
  },
  {
    id: "financial-metrics",
    title: "Key Financial Metrics",
    description: "What metrics will you track?",
    placeholder: "Key metrics:\n\n1. Growth Metrics:\n-\n\n2. Profitability Metrics:\n-\n\n3. Efficiency Metrics:\n-",
    icon: LineChart,
  }
]

const expertTips = {
  "startup-costs": [
    "Include buffer for unexpected costs",
    "Consider opportunity costs",
    "Plan for contingencies"
  ],
  "revenue-projections": [
    "Use conservative estimates",
    "Consider seasonal factors",
    "Account for market conditions"
  ],
  "break-even": [
    "Include all cost components",
    "Consider different scenarios",
    "Factor in growth costs"
  ],
  "funding-needs": [
    "Plan for multiple scenarios",
    "Include runway calculations",
    "Consider different funding sources"
  ],
  "financial-metrics": [
    "Focus on unit economics",
    "Track cash flow closely",
    "Monitor customer acquisition costs"
  ]
}

export function FinancialProjectionsModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: FinancialProjectionsModuleProps) {
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
      title="Financial Projections"
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