"use client"

import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModuleType } from "@/types/project"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export type ModuleStep = {
  id: string // This is the database ID
  step_type: string // This is the step type from config
  title: string
  completed?: boolean
  icon?: React.ElementType
}

interface ModuleNavigationProps {
  steps: ModuleStep[]
  currentStepType: ModuleType // This is the module type
  onStepSelect: (stepType: ModuleType) => void // This takes the module type
  className?: string
}

export function ModuleNavigation({
  steps,
  currentStepType,
  onStepSelect,
  className,
}: ModuleNavigationProps) {
  return (
    <div className={className}>
      <nav aria-label="Progress">
        <ol role="list" className="space-y-3">
          {steps.map((step, stepIdx) => {
            const isCurrent = currentStepType === step.step_type;
            const Icon = step.icon;

            return (
              <motion.li
                key={step.id}
                initial={false}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "group relative flex w-full items-center justify-between transition-all duration-200",
                    isCurrent && "bg-primary/10 hover:bg-primary/20",
                    step.completed &&
                      !isCurrent &&
                      "text-primary hover:text-primary/90"
                  )}
                  onClick={() => onStepSelect(step.step_type as ModuleType)}
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
                        borderColor: step.completed
                          ? "var(--primary)"
                          : isCurrent
                          ? "var(--primary)"
                          : "var(--border)",
                        backgroundColor: step.completed
                          ? "var(--primary-light)"
                          : "transparent",
                      }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 300,
                      }}
                    >
                      {step.completed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </motion.div>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "text-sm",
                            isCurrent && "text-primary font-medium"
                          )}
                        >
                          {stepIdx + 1}
                        </motion.span>
                      )}
                    </motion.span>
                    <motion.span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isCurrent && "text-primary"
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: stepIdx * 0.1 }}
                    >
                      {step.title}
                    </motion.span>
                  </span>
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{
                      opacity: 1,
                      x: isCurrent ? 0 : -5,
                      rotate: isCurrent ? 0 : -45,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isCurrent && "text-primary transform translate-x-1"
                      )}
                    />
                  </motion.div>
                </Button>

                {isCurrent && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 border-2 border-primary rounded-lg"
                    transition={{ type: "spring", damping: 15 }}
                  />
                )}
              </motion.li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
} 