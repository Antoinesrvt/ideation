import { ModuleType } from '@/types/project'
import { ContextData } from '@/lib/services/ai/context-builder'
import { TemplateEngine } from './template-engine'
import { DocumentService } from './document-service'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export interface GenerationOptions {
  format: 'pdf' | 'docx' | 'md'
  version?: number
  customData?: Record<string, any>
}

export interface GenerationResult {
  documentId: string
  status: 'completed' | 'failed'
  url?: string
  error?: string
}

export class DocumentGenerator {
  private templateEngine: TemplateEngine
  private documentService: DocumentService

  constructor(
    private supabase: SupabaseClient<Database>,
    private projectId: string,
    private moduleType: ModuleType
  ) {
    this.templateEngine = new TemplateEngine()
    this.documentService = new DocumentService(supabase)
  }

  /**
   * Generate a document using the module template and context
   */
  async generateDocument(
    context: ContextData,
    options: GenerationOptions
  ): Promise<GenerationResult> {
    try {
      // 1. Prepare the data for template processing
      const templateData = await this.prepareTemplateData(context, options.customData)

      // 2. Generate the document
      const result = await this.documentService.generateDocument({
        projectId: this.projectId,
        moduleType: this.moduleType,
        data: {
          moduleResponses: this.extractModuleResponses(context),
          projectData: templateData
        },
        format: options.format
      })

      // 3. Get the document URL if generation was successful
      let url: string | undefined
      if (result.status === 'completed') {
        url = await this.documentService.getDocumentUrl(result.id)
      }

      return {
        documentId: result.id,
        status: result.status as 'completed' | 'failed',
        url,
        // TODO: Add error handling
      }
    } catch (error) {
      console.error('Error generating document:', error)
      return {
        documentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Prepare data for template processing
   */
  private async prepareTemplateData(
    context: ContextData,
    customData?: Record<string, any>
  ): Promise<Record<string, any>> {
    // Combine all data sources into a single object
    const templateData: Record<string, any> = {
      generatedAt: new Date().toISOString(),
      ...customData
    }

    // Process each context source
    for (const source of context.sources) {
      switch (source.type) {
        case 'module_response':
          // Module responses are handled separately
          break
        
        case 'project_data':
          Object.assign(templateData, source.content)
          break
        
        case 'market_research':
          if (!templateData.marketResearch) {
            templateData.marketResearch = {}
          }
          Object.assign(templateData.marketResearch, source.content)
          break
        
        case 'competitor_data':
          if (!templateData.competitors) {
            templateData.competitors = []
          }
          templateData.competitors.push(...this.formatCompetitorData(source.content))
          break
        
        case 'financial_data':
          if (!templateData.financials) {
            templateData.financials = {}
          }
          Object.assign(templateData.financials, source.content)
          break
      }
    }

    return templateData
  }

  /**
   * Extract module responses from context
   */
  private extractModuleResponses(context: ContextData): Record<string, string> {
    const responses: Record<string, string> = {}
    
    context.sources
      .filter(source => source.type === 'module_response')
      .forEach(source => {
        const stepId = source.metadata?.stepId
        if (stepId) {
          responses[stepId] = source.content
        }
      })

    return responses
  }

  /**
   * Format competitor data for template
   */
  private formatCompetitorData(data: any): any[] {
    // TODO: Implement proper competitor data formatting
    return Array.isArray(data) ? data : []
  }

  /**
   * Get all generated documents for this module
   */
  async getDocuments() {
    return this.documentService.getDocuments(this.projectId, this.moduleType)
  }

  /**
   * Get a signed URL for a document
   */
  async getDocumentUrl(documentId: string) {
    return this.documentService.getDocumentUrl(documentId)
  }
} 