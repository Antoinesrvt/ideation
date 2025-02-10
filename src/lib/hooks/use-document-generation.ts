
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/context/supabase-context'
import { ModuleType } from '@/types/project'
import { DbModuleStep, DbStepResponse } from '@/types/module'
import { DocumentWorkflow, WorkflowOptions, WorkflowResult } from '@/lib/services/document/document-workflow'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

const documentSchema = z.object({
  id: z.string(),
  version: z.number(),
  created_at: z.string(),
  url: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed'])
})

type Document = z.infer<typeof documentSchema>

interface UseDocumentsOptions {
  projectId: string
  moduleType: ModuleType
  enabled?: boolean
}

export function useDocuments({ projectId, moduleType, enabled = true }: UseDocumentsOptions) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const workflow = new DocumentWorkflow(supabase, projectId, moduleType)

  // Query for fetching documents
  const documentsQuery = useQuery({
    queryKey: ['documents', projectId, moduleType],
    queryFn: async () => {
      const docs = await workflow.getDocuments()
      
      // Get signed URLs for all completed documents
      const docsWithUrls = await Promise.all(
        docs.map(async (doc) => {
          if (doc.status === 'completed') {
            try {
              const url = await workflow.getDocumentUrl(doc.id)
              return documentSchema.parse({
                id: doc.id,
                version: doc.version || 1,
                created_at: doc.created_at,
                url,
                status: doc.status
              })
            } catch (error) {
              console.error(`Error getting URL for document ${doc.id}:`, error)
              return documentSchema.parse({
                id: doc.id,
                version: doc.version || 1,
                created_at: doc.created_at,
                status: 'failed' as const
              })
            }
          }
          return documentSchema.parse({
            id: doc.id,
            version: doc.version || 1,
            created_at: doc.created_at,
            status: doc.status
          })
        })
      )

      return docsWithUrls
    },
    enabled,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5 // 5 minutes
  })

  // Mutation for generating documents
  const generateMutation = useMutation({
    mutationFn: async ({
      steps,
      projectData,
      options = {}
    }: {
      steps: (DbModuleStep & { responses: DbStepResponse[] })[]
      projectData: Record<string, any>
      options?: WorkflowOptions
    }) => {
      return workflow.execute(steps, projectData, {
        generation: { format: 'pdf', ...options.generation },
        enrichment: {
          includeMarketData: true,
          includeCompetitorData: true,
          ...options.enrichment
        },
        customInstructions: options.customInstructions
      })
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document generation started. It will be available shortly.",
      })
      // Invalidate documents query to show the new document
      queryClient.invalidateQueries({ queryKey: ['documents', projectId, moduleType] })
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
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    generateDocument: generateMutation.mutate,
    isGenerating: generateMutation.isPending
  }
} 