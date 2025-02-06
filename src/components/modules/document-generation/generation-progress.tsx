"use client"

import { useEffect } from "react"
import { FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ModuleType } from "@/types/project"
import { useDocuments } from "@/lib/hooks/use-documents"
import { motion, AnimatePresence } from "framer-motion"
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
    documents,
    isGenerating,
    generateDocument,
    error
  } = useDocuments({ 
    projectId, 
    moduleType,
    enabled: true
  })

  // Start generation when component mounts
  useEffect(() => {
    generateDocument({
      data: {
        stepResponses: { templateId },
        projectData: {}
      },
      format: 'pdf'
    })
  }, [generateDocument, templateId])

  // Auto-close on completion
  useEffect(() => {
    const latestDoc = documents[0]
    if (latestDoc?.status === 'completed') {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [documents, onComplete])

  const currentStepIndex = GENERATION_STEPS.findIndex(step => {
    const latestDoc = documents[0]
    if (!latestDoc || latestDoc.status === 'pending') return step.id === 'preparing'
    if (latestDoc.status === 'processing') {
      // Since we don't have progress in the document type, we'll use a simpler approach
      if (step.id === 'preparing') return true
      if (step.id === 'context') return false
      if (step.id === 'generating') return false
      return step.id === 'finalizing'
    }
    return false
  })

  const status = documents[0]?.status || 'pending'
  const documentUrl = documents[0]?.url

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b"
      >
        <div>
          <h2 className="text-lg font-semibold">Generating Document</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we generate your document
          </p>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="space-y-6">
            {/* Progress Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Progress 
                value={status === 'completed' ? 100 : status === 'processing' ? 50 : 0} 
                className="h-2" 
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{status === 'completed' ? 100 : status === 'processing' ? 50 : 0}%</span>
              </div>
            </motion.div>

            {/* Steps */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {GENERATION_STEPS.map((step, index) => {
                  const isActive = index === currentStepIndex
                  const isComplete = index < currentStepIndex
                  const isFailed = status === 'failed' && index === currentStepIndex

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: isActive ? 1.02 : 1
                      }}
                      transition={{ 
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 100,
                        damping: 20
                      }}
                      className={cn(
                        "p-4 rounded-lg border transition-all duration-300",
                        isActive && "border-primary bg-primary/5 shadow-sm",
                        isComplete && "border-green-500/20 bg-green-500/5",
                        isFailed && "border-destructive/20 bg-destructive/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <AnimatePresence mode="wait">
                            {isComplete ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </motion.div>
                            ) : isFailed ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <XCircle className="h-5 w-5 text-destructive" />
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className={cn(
                                  "h-5 w-5 rounded-full border-2 transition-colors",
                                  isActive ? "border-primary" : "border-muted-foreground/20"
                                )}
                              >
                                {isActive && (
                                  <motion.div
                                    className="h-full w-full rounded-full bg-primary/20"
                                    animate={{
                                      scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div>
                          <h3 className={cn(
                            "font-medium transition-colors",
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
              </AnimatePresence>
            </div>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {status === 'completed' && documentUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 text-green-500 mb-4"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Document Generated Successfully</span>
                </motion.div>
                <div className="flex justify-center">
                  <Button 
                    asChild
                    className="gap-2 group"
                  >
                    <a 
                      href={documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
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
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 text-destructive mb-4"
                >
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Generation Failed</span>
                </motion.div>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'An error occurred during document generation'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => generateDocument({
                    data: {
                      stepResponses: { templateId },
                      projectData: {}
                    },
                    format: 'pdf'
                  })}
                  className="gap-2"
                >
                  <Loader2 className="h-4 w-4" />
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 