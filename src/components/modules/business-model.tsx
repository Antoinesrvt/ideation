"use client"

import { useState } from "react"
import { DollarSign, Users, Boxes, Truck, Target } from "lucide-react"
import { ModuleLayout } from "./module-layout"
import { StepCard } from "./step-card"
import { AIAssistant } from "./ai-assistant"
import { ModuleStep } from "./module-navigation"

interface BusinessModelModuleProps {
  mode: "guided" | "expert"
  onBack: () => void
  onComplete?: () => void
  currentModuleId: string
  allModules: ModuleStep[]
  onModuleSelect: (moduleId: string) => void
}

const steps = [
  {
    id: "revenue-streams",
    title: "Revenue Streams",
    description: "How will you make money?",
    placeholder: "Our main revenue streams will be:\n\n1. Primary Revenue:\n-\n\n2. Secondary Revenue:\n-",
    icon: DollarSign,
  },
  {
    id: "customer-segments",
    title: "Customer Segments",
    description: "What customer segments will you serve?",
    placeholder: "Our key customer segments are:\n\n1. Primary Segment:\n- Demographics:\n- Needs:\n- Willingness to pay:",
    icon: Users,
  },
  {
    id: "key-resources",
    title: "Key Resources",
    description: "What key resources do you need?",
    placeholder: "Essential resources needed:\n\n1. Physical Resources:\n-\n\n2. Intellectual Resources:\n-\n\n3. Human Resources:\n-",
    icon: Boxes,
  },
  {
    id: "distribution",
    title: "Distribution Channels",
    description: "How will you reach your customers?",
    placeholder: "Our distribution strategy:\n\n1. Sales Channels:\n-\n\n2. Marketing Channels:\n-",
    icon: Truck,
  },
  {
    id: "cost-structure",
    title: "Cost Structure",
    description: "What are your main costs?",
    placeholder: "Key costs:\n\n1. Fixed Costs:\n-\n\n2. Variable Costs:\n-\n\n3. Economies of scale:\n-",
    icon: Target,
  },
]

const expertTips = {
  "revenue-streams": [
    "Consider multiple revenue models",
    "Think about recurring revenue",
    "Price based on value, not cost"
  ],
  "customer-segments": [
    "Focus on specific niches first",
    "Consider B2B vs B2C dynamics",
    "Identify decision makers"
  ],
  "key-resources": [
    "Include both tangible and intangible assets",
    "Consider strategic partnerships",
    "Plan for scalability"
  ],
  "distribution": [
    "Mix direct and indirect channels",
    "Consider digital vs physical presence",
    "Optimize for customer experience"
  ],
  "cost-structure": [
    "Identify fixed vs variable costs",
    "Look for cost optimization opportunities",
    "Plan for scaling costs"
  ]
}

export function BusinessModelModule({ 
  mode, 
  onBack, 
  onComplete,
  currentModuleId,
  allModules,
  onModuleSelect
}: BusinessModelModuleProps) {
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
      title="Business Model"
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
          onSuggest={() => setAiSuggestion("Based on your industry, consider...")}
          expertTips={expertTips[currentStep.id as keyof typeof expertTips]}
        />
      </div>
    </ModuleLayout>
  )
} 