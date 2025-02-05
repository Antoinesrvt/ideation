import { useState, useCallback } from 'react'
import { useSupabase } from '@/context/supabase-context'
import { useProject } from '@/context/project-context'
import { ModuleType } from '@/types/project'
import { ModuleResponse } from '@/types/module'
import { DocumentWorkflow } from '@/lib/services/document-workflow'
import { useToast } from '@/hooks/use-toast'

export type GenerationStatus = 'idle' | 'preparing' | 'generating' | 'completed' | 'failed'

export function useDocumentGeneration(moduleType: ModuleType, projectId: string) {
  const { supabase } = useSupabase()
  const { modules } = useProject()
  const { toast } = useToast()
  
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [documentUrl, setDocumentUrl] = useState<string>()
  const [error, setError] = useState<string>()

  const generateDocument = useCallback(async (templateId: string) => {
    const workflow = new DocumentWorkflow(supabase, projectId, moduleType)
    const module = modules.find(m => m.type === moduleType)

    if (!module) {
      setError('Module not found')
      setStatus('failed')
      return
    }

    try {
      setStatus('preparing')
      setProgress(0)
      setError(undefined)
      setDocumentUrl(undefined)

      // Get module responses
      const moduleResponses = module.responses?.reduce<Record<string, ModuleResponse>>((acc, response) => {
        acc[response.step_id] = {
          content: response.content,
          lastUpdated: response.last_updated
        }
        return acc
      }, {}) || {}

      // Get project data
      const projectData = {
        projectName: module.title,
        moduleType: module.type,
        // Add more project data as needed
      }

      // Update progress as we go
      setStatus('generating')
      setProgress(25)

      // Start generation with progress updates
      const result = await workflow.execute(
        moduleResponses,
        projectData,
        {
          generation: { format: 'pdf' },
          enrichment: {
            includeMarketData: true,
            includeCompetitorData: true
          }
        }
      )

      if (result.status === 'failed') {
        throw new Error(result.error || 'Failed to generate document')
      }

      setProgress(75)

      // Get document URL
      const url = await workflow.getDocumentUrl(result.documentId)
      
      setDocumentUrl(url)
      setStatus('completed')
      setProgress(100)

      toast({
        title: "Success",
        description: "Document generated successfully",
      })
    } catch (err) {
      console.error('Error generating document:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate document')
      setStatus('failed')
      
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      })
    }
  }, [supabase, projectId, moduleType, modules, toast])

  return {
    status,
    progress,
    documentUrl,
    error,
    generateDocument
  }
} 