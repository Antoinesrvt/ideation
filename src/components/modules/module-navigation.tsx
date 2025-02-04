"use client"

import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ModuleStep = {
  id: string
  title: string
  completed?: boolean
}

interface ModuleNavigationProps {
  steps: ModuleStep[]
  currentStepId: string
  onStepSelect: (stepId: string) => void
  className?: string
}

export function ModuleNavigation({ 
  steps, 
  currentStepId, 
  onStepSelect,
  className 
}: ModuleNavigationProps) {
  return (
    <div className={className}>
      <nav aria-label="Progress">
        <ol role="list" className="space-y-3">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative">
              <Button
                variant="ghost"
                className={`group relative flex w-full items-center justify-between ${
                  currentStepId === step.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => onStepSelect(step.id)}
              >
                <span className="flex items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 mr-3">
                    {step.completed ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <span>{stepIdx + 1}</span>
                    )}
                  </span>
                  <span className="text-sm font-medium">
                    {step.title}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
} 