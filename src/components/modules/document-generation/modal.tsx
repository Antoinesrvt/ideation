"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ModuleType } from "@/types/project"
import { TemplateSelection } from "@/components/modules/document-generation/template-selection"
import { GenerationProgress } from "@/components/modules/document-generation/generation-progress"

interface DocumentGenerationModalProps {
  moduleType: ModuleType
  projectId: string
  isOpen: boolean
  onClose: () => void
}

type ModalStep = 'template-selection' | 'generating'

export function DocumentGenerationModal({
  moduleType,
  projectId,
  isOpen,
  onClose
}: DocumentGenerationModalProps) {
  const [step, setStep] = useState<ModalStep>('template-selection')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>()

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    setStep('generating')
  }

  const handleClose = () => {
    setStep('template-selection')
    setSelectedTemplateId(undefined)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[80vw] max-h-[80vh] flex flex-col">
        {step === 'template-selection' ? (
          <TemplateSelection
            moduleType={moduleType}
            onSelect={handleTemplateSelect}
          />
        ) : (
          <GenerationProgress
            moduleType={moduleType}
            projectId={projectId}
            templateId={selectedTemplateId!}
            onComplete={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
} 