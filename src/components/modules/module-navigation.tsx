"use client"

import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModuleType } from "@/types/project"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export type ModuleStep = {
  id: ModuleType
  title: string
  completed?: boolean
  icon?: React.ElementType
}

interface ModuleNavigationProps {
  steps: ModuleStep[]
  currentStepId: ModuleType
  onStepSelect: (stepId: ModuleType) => void
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
          {steps.map((step, stepIdx) => {
            const isCurrent = currentStepId === step.id
            const Icon = step.icon

            return (
              <motion.li
                key={step.id}
                initial={false}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "group relative flex w-full items-center justify-between transition-all duration-200",
                    isCurrent && "bg-primary/10 hover:bg-primary/20",
                    step.completed && !isCurrent && "text-primary hover:text-primary/90"
                  )}
                  onClick={() => onStepSelect(step.id)}
                >
                  <span className="flex items-center">
                    <motion.span 
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 mr-3 transition-colors",
                        step.completed && "border-primary bg-primary/10",
                        isCurrent && !step.completed && "border-primary"
                      )}
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        borderColor: step.completed ? "var(--primary)" : isCurrent ? "var(--primary)" : "var(--border)"
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.completed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </motion.div>
                      ) : (
                        <span className={cn(
                          isCurrent && "text-primary font-medium"
                        )}>{stepIdx + 1}</span>
                      )}
                    </motion.span>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-primary"
                    )}>
                      {step.title}
                    </span>
                  </span>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    isCurrent && "text-primary transform translate-x-1"
                  )} />
                </Button>
              </motion.li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
} 