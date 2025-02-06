import { useState, useCallback } from 'react'
import { useSupabase } from "@/context/supabase-context";
import { DocumentService } from '@/lib/services/document/document-service'
import { ModuleType } from '@/types/project'
import { useToast } from '@/hooks/use-toast'

interface DocumentVersion {
  id: string
  version: number
  created_at: string
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface UseDocumentsOptions {
  projectId: string
  moduleType: ModuleType
}

export function useDocuments({ projectId, moduleType }: UseDocumentsOptions) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<DocumentVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const documentService = new DocumentService(supabase)

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const docs = await documentService.getDocuments(projectId, moduleType)
      
      // Get signed URLs for all completed documents
      const docsWithUrls = await Promise.all(
        docs.map(async (doc) => {
          if (doc.status === 'completed') {
            try {
              const url = await documentService.getDocumentUrl(doc.id)
              return {
                id: doc.id,
                version: doc.version,
                created_at: doc.created_at,
                url,
                status: doc.status
              }
            } catch (error) {
              console.error(`Error getting URL for document ${doc.id}:`, error)
              return {
                id: doc.id,
                version: doc.version,
                created_at: doc.created_at,
                url: '',
                status: 'failed' as const
              }
            }
          }
          return {
            id: doc.id,
            version: doc.version,
            created_at: doc.created_at,
            url: '',
            status: doc.status
          }
        })
      )

      setDocuments(docsWithUrls)
    } catch (err) {
      console.error('Error loading documents:', err)
      setError(err instanceof Error ? err : new Error('Failed to load documents'))
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, moduleType, documentService, toast])

  const generateDocument = useCallback(async (
    data: {
      moduleResponses: Record<string, string>
      projectData: Record<string, any>
    },
    format: 'pdf' | 'docx' | 'md' = 'pdf'
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      await documentService.generateDocument({
        projectId,
        moduleType,
        data,
        format
      })

      toast({
        title: "Success",
        description: "Document generation started. It will be available shortly.",
      })

      // Reload documents to show the new one
      await loadDocuments()
    } catch (err) {
      console.error('Error generating document:', err)
      setError(err instanceof Error ? err : new Error('Failed to generate document'))
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, moduleType, documentService, loadDocuments, toast])

  return {
    documents,
    isLoading,
    error,
    loadDocuments,
    generateDocument
  }
} 