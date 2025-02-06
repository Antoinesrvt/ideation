import { useState, useCallback } from 'react'
import { useSupabase } from '@/context/supabase-context'
import { ModuleType } from '@/types/project'
import { AIEnhancementService, EnhancementOptions } from '@/lib/services/ai-enhancement'
import { useToast } from '@/hooks/use-toast'

export type EnhancementStatus = 'idle' | 'enhancing' | 'completed' | 'failed'

export function useAIEnhancement(moduleType: ModuleType, projectId: string) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  
  const [status, setStatus] = useState<EnhancementStatus>('idle')
  const [enhancedContent, setEnhancedContent] = useState<string>()
  const [error, setError] = useState<string>()
  const [metadata, setMetadata] = useState<any>()

  const enhance = useCallback(async (
    content: string,
    stepId: string,
    options: EnhancementOptions = {}
  ) => {
    const service = new AIEnhancementService(supabase, projectId, moduleType)

    try {
      setStatus('enhancing')
      setError(undefined)
      setEnhancedContent(undefined)
      setMetadata(undefined)

      const result = await service.enhanceContent(content, stepId, options)

      setEnhancedContent(result.enhancedContent)
      setMetadata(result.metadata)
      setStatus('completed')

      toast({
        title: "Success",
        description: "Content enhanced successfully",
      })

      return result.enhancedContent
    } catch (err) {
      console.error('Error enhancing content:', err)
      setError(err instanceof Error ? err.message : 'Failed to enhance content')
      setStatus('failed')
      
      toast({
        title: "Error",
        description: "Failed to enhance content. Please try again.",
        variant: "destructive"
      })
    }
  }, [supabase, projectId, moduleType, toast])

  return {
    status,
    enhancedContent,
    error,
    metadata,
    enhance
  }
} 