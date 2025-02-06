import { useMutation } from '@tanstack/react-query'
import { useSupabase } from '@/context/supabase-context'
import { ModuleType } from '@/types/project'
import { DbModuleResponse } from '@/types/module'
import { DocumentWorkflow, WorkflowOptions } from '@/lib/services/document/document-workflow'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

export const generationStatusSchema = z.enum([
  'idle',
  'preparing',
  'generating',
  'completed',
  'failed'
])

export type GenerationStatus = z.infer<typeof generationStatusSchema>

interface UseDocumentGenerationOptions {
  moduleType: ModuleType
  projectId: string
  onComplete?: () => void
}

export function useDocumentGeneration({
  moduleType,
  projectId,
  onComplete
}: UseDocumentGenerationOptions) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const workflow = new DocumentWorkflow(supabase, projectId, moduleType)

  const generationMutation = useMutation({
    mutationFn: async ({
      moduleResponses,
      projectData,
      options = {}
    }: {
      moduleResponses: Record<string, DbModuleResponse>
      projectData: Record<string, any>
      options?: WorkflowOptions
    }) => {
      const result = await workflow.execute(moduleResponses, projectData, {
        generation: { format: 'pdf', ...options.generation },
        enrichment: {
          includeMarketData: true,
          includeCompetitorData: true,
          ...options.enrichment
        },
        customInstructions: options.customInstructions
      })

      if (result.status === 'failed') {
        throw new Error(result.error || 'Failed to generate document')
      }

      // Get document URL if generation was successful
      const url = await workflow.getDocumentUrl(result.documentId)
      
      return {
        documentId: result.documentId,
        url,
        status: result.status,
        contextBuilt: result.contextBuilt,
        enriched: result.enriched,
        processingTime: result.processingTime
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Document generated successfully",
      })
      onComplete?.()
    },
    onError: (error) => {
      console.error('Error generating document:', error)
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      })
    }
  })

  return {
    generate: generationMutation.mutate,
    status: generationStatusSchema.parse(
      generationMutation.isPending ? 'generating' :
      generationMutation.isError ? 'failed' :
      generationMutation.isSuccess ? 'completed' :
      'idle'
    ),
    progress: generationMutation.isPending ? 50 : // Simplified progress tracking
             generationMutation.isSuccess ? 100 :
             0,
    documentUrl: generationMutation.data?.url,
    error: generationMutation.error instanceof Error ? generationMutation.error.message : undefined,
    isLoading: generationMutation.isPending
  }
} 