"use client"

import { useEffect } from "react"
import { FileText, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ModuleType } from "@/types/project"
import { useDocumentGeneration } from "@/hooks/use-document-generation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GenerationProgressProps {
  moduleType: ModuleType
  projectId: string
  templateId: string
  onComplete: () => void
}

const GENERATION_STEPS = [
  {
    id: 'preparing',
    title: 'Preparing Template',
    description: 'Loading and validating template...'
  },
  {
    id: 'context',
    title: 'Building Context',
    description: 'Gathering module data...'
  },
  {
    id: 'generating',
    title: 'Generating Document',
    description: 'Processing template with data...'
  },
  {
    id: 'finalizing',
    title: 'Finalizing',
    description: 'Saving and preparing preview...'
  }
]

export function GenerationProgress({
  moduleType,
  projectId,
  templateId,
  onComplete
}: GenerationProgressProps) {
  const {
    status,
    progress,
    documentUrl,
    error,
    generateDocument
  } = useDocumentGeneration(moduleType, projectId)

  // Start generation when component mounts
  useEffect(() => {
    generateDocument(templateId)
  }, [generateDocument, templateId])

  // Auto-close on completion
  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, onComplete])

  const currentStepIndex = GENERATION_STEPS.findIndex(step => {
    if (status === 'preparing') return step.id === 'preparing'
    if (status === 'generating') {
      if (progress < 33) return step.id === 'context'
      if (progress < 66) return step.id === 'generating'
      return step.id === 'finalizing'
    }
    return false
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-lg font-semibold">Generating Document</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we generate your document
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {GENERATION_STEPS.map((step, index) => {
                const isActive = index === currentStepIndex
                const isComplete = index < currentStepIndex
                const isFailed = status === 'failed' && index === currentStepIndex

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={cn(
                      "p-4 rounded-lg border",
                      isActive && "border-primary bg-primary/5",
                      isComplete && "border-green-500/20 bg-green-500/5",
                      isFailed && "border-destructive/20 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : isFailed ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <div
                            className={cn(
                              "h-5 w-5 rounded-full border-2",
                              isActive ? "border-primary" : "border-muted-foreground/20"
                            )}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className={cn(
                          "font-medium",
                          isActive && "text-primary",
                          isComplete && "text-green-500",
                          isFailed && "text-destructive"
                        )}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Result */}
          {status === 'completed' && documentUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 text-green-500 mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Document Generated Successfully</span>
              </div>
              <div className="flex justify-center">
                <Button asChild>
                  <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {status === 'failed' && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 text-destructive mb-4">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Generation Failed</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {error}
              </p>
              <Button variant="outline" onClick={() => generateDocument(templateId)}>
                Try Again
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 