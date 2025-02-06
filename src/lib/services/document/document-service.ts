import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { ModuleType } from '@/types/project'
import { TemplateEngine } from './template-engine'

export type Tables = Database['public']['Tables']
export type DocumentRow = Tables['documents']['Row']
export type DocumentTemplateRow = Tables['document_templates']['Row']

export interface GenerateDocumentParams {
  projectId: string
  moduleType: ModuleType
  data: {
    stepResponses: Record<string, string>
    projectData: Record<string, any>
  }
  format: 'pdf' | 'docx' | 'md'
  version?: number
}

export interface DocumentResult {
  id: string
  project_id: string
  module_type: ModuleType
  name: string
  type: 'pdf' | 'docx' | 'md'
  storage_path: string
  version: number
  template_version: number
  status: 'completed' | 'failed' | 'pending' | 'processing'
  error?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface GenerateDocumentOptions {
  projectId: string
  moduleType: ModuleType
  data: {
    stepResponses: Record<string, string>
    projectData: Record<string, any>
  }
  format: 'pdf' | 'docx' | 'md'
}

export class DocumentService {
  private templateEngine: TemplateEngine

  constructor(private supabase: SupabaseClient<Database>) {
    this.templateEngine = new TemplateEngine()
  }

  async generateDocument(options: GenerateDocumentOptions): Promise<DocumentRow> {
    try {
      // 1. Create pending document record
      const { data: document, error: createError } = await this.supabase
        .from('documents')
        .insert({
          project_id: options.projectId,
          module_type: options.moduleType,
          name: `${options.moduleType}-v1`,
          type: options.format,
          storage_path: '', // Will be updated later
          status: 'processing',
          metadata: {
            generated_from: {
              step_responses: options.data.stepResponses,
              project_data: options.data.projectData
            }
          }
        })
        .select()
        .single()

      if (createError) throw createError
      if (!document) throw new Error('Failed to create document record')

      try {
        // 2. Get the template
        const { data: template, error: templateError } = await this.supabase
          .from('document_templates')
          .select('*')
          .eq('module_type', options.moduleType)
          .order('version', { ascending: false })
          .limit(1)
          .single()

        if (templateError) throw templateError
        if (!template) throw new Error('Template not found')

        // 3. Download template content
        const { data: templateContent, error: downloadError } = await this.supabase.storage
          .from('templates')
          .download(template.template_path)

        if (downloadError) throw downloadError
        if (!templateContent) throw new Error('Template content not found')

        // 4. Process template with data
        const templateText = await templateContent.text()
        const processedContent = await this.templateEngine.processTemplate(templateText, {
          ...options.data.projectData,
          ...options.data.stepResponses
        })

        // 5. Convert to requested format
        let fileContent: Buffer
        if (options.format === 'pdf') {
          fileContent = await this.templateEngine.convertToPDF(processedContent)
        } else if (options.format === 'docx') {
          fileContent = await this.templateEngine.convertToDocx(processedContent)
        } else {
          fileContent = Buffer.from(processedContent)
        }

        // 6. Upload generated document
        const storagePath = `documents/${options.projectId}/${options.moduleType}/${document.id}.${options.format}`
        const { error: uploadError } = await this.supabase.storage
          .from('documents')
          .upload(storagePath, fileContent, {
            contentType: this.getContentType(options.format)
          })

        if (uploadError) throw uploadError

        // 7. Update document record with success status
        const { data: updatedDocument, error: updateError } = await this.supabase
          .from('documents')
          .update({
            storage_path: storagePath,
            status: 'completed',
            template_version: template.version
          })
          .eq('id', document.id)
          .select()
          .single()

        if (updateError) throw updateError
        if (!updatedDocument) throw new Error('Failed to update document status')

        return updatedDocument
      } catch (error) {
        // Update document status to failed if any error occurs
        await this.supabase
          .from('documents')
          .update({
            status: 'failed',
            metadata: {
              ...document.metadata,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          })
          .eq('id', document.id)

        throw error
      }
    } catch (error) {
      console.error('Error generating document:', error)
      throw error
    }
  }

  async getDocuments(
    projectId: string,
    moduleType: ModuleType
  ): Promise<DocumentRow[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('module_type', moduleType)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getDocumentUrl(documentId: string): Promise<string> {
    const { data: document, error: fetchError } = await this.supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .single()

    if (fetchError) throw fetchError
    if (!document) throw new Error('Document not found')

    const { data } = await this.supabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, 3600) // 1 hour expiry

    if (!data?.signedUrl) throw new Error('Failed to generate URL')
    return data.signedUrl
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf'
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case 'md':
        return 'text/markdown'
      default:
        return 'application/octet-stream'
    }
  }
} 