"use client"

import { createContext, useContext, useState } from 'react'
import { AIAnalysis, AIResearchData, QuickAction, QuickActionGroup } from '@/types/ai'
import { FileText, ChartBar, Lightbulb } from 'lucide-react'

interface AIContextType {
  // Current module context
  currentModule: {
    id: string
    step: string
    mode: 'guided' | 'expert' | 'custom'
  }
  // Previous responses for context
  moduleResponses: Record<string, Record<string, string>>
  // Quick Actions
  availableTemplates: Record<string, QuickAction[]>
  availableExamples: Record<string, QuickAction[]>
  // Methods
  updateModuleContext: (moduleId: string, stepId: string) => void
  addModuleResponse: (moduleId: string, stepId: string, response: string) => void
  getQuickActionsForModule: (moduleId: string) => QuickActionGroup
  generateSuggestion: (context: string) => Promise<string | null>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [currentModule, setCurrentModule] = useState<AIContextType['currentModule']>({
    id: '',
    step: '',
    mode: 'guided'
  })
  const [moduleResponses, setModuleResponses] = useState<Record<string, Record<string, string>>>({})

  // Pre-defined templates and examples for each module
  const moduleTemplates: Record<string, QuickAction[]> = {
    'vision-problem': [
      {
        id: 'vision-template-1',
        type: 'template',
        label: 'Problem Statement Template',
        content: `Our solution addresses [specific pain point] for [target audience] by providing [key benefit].
                 Unlike existing solutions that [limitation of current solutions], we [key differentiator].`,
        icon: <FileText />
      },
      // Add more templates
    ],
    'market-analysis': [
      {
        id: 'market-template-1',
        type: 'template',
        label: 'Market Size Analysis',
        content: `The Total Addressable Market (TAM) for [industry] is estimated at [size].
                 Our Serviceable Addressable Market (SAM) focuses on [specific segment] representing [percentage].`,
        icon: <ChartBar />
      },
      // Add more templates
    ],
    // Add templates for other modules
  }

  const moduleExamples: Record<string, QuickAction[]> = {
    'vision-problem': [
      {
        id: 'vision-example-1',
        type: 'example',
        label: 'SaaS Problem Statement',
        content: `Our solution addresses the challenge of manual data entry for small business owners by providing 
                 an AI-powered automation tool. Unlike existing solutions that require technical expertise, 
                 we offer an intuitive, code-free interface.`,
        icon: <Lightbulb />
      },
      // Add more examples
    ],
    // Add examples for other modules
  }

  const getQuickActionsForModule = (moduleId: string): QuickActionGroup => {
    const templates = moduleTemplates[moduleId] || []
    const examples = moduleExamples[moduleId] || []

    return {
      id: 'module-actions',
      label: 'Available Actions',
      actions: [...templates, ...examples]
    }
  }

  const value: AIContextType = {
    currentModule,
    moduleResponses,
    updateModuleContext: (moduleId: string, stepId: string) => {
      setCurrentModule(prev => ({
        ...prev,
        id: moduleId,
        step: stepId
      }))
    },
    addModuleResponse: (moduleId: string, stepId: string, response: string) => {
      setModuleResponses(prev => ({
        ...prev,
        [moduleId]: {
          ...(prev[moduleId] || {}),
          [stepId]: response
        }
      }))
    },
    getQuickActionsForModule,
    availableTemplates: moduleTemplates,
    availableExamples: moduleExamples,
    generateSuggestion: async (context: string) => {
      // TODO: Implement actual AI suggestion generation
      return "Sample suggestion based on context"
    }
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
} 