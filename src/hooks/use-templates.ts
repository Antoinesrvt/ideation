import { useState, useEffect } from 'react'
import { useSupabase } from '@/context/supabase-context'
import { ModuleType } from '@/types/project'
import { Tables } from '@/types/database'

export type DocumentTemplate = Tables['document_templates']['Row']

export function useTemplates(moduleType: ModuleType) {
  const { supabase } = useSupabase()
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadTemplates() {
      try {
        console.log('🔍 Fetching templates for module:', moduleType)
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('document_templates')
          .select('*')
          .eq('module_type', moduleType)
          .order('version', { ascending: false })

        if (fetchError) {
          console.error('❌ Error fetching templates:', fetchError)
          throw fetchError
        }

        console.log('✅ Templates fetched:', data)
        setTemplates(data || [])
      } catch (err) {
        console.error('Error loading templates:', err)
        setError(err instanceof Error ? err : new Error('Failed to load templates'))
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [supabase, moduleType])

  return {
    templates,
    isLoading,
    error
  }
} 