import { ModuleType } from '@/types/project'
import { ModuleResponse } from '@/types/module'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { AIContextBuilder, EnrichmentOptions } from '@/lib/ai/context-builder'
import { DocumentGenerator, GenerationOptions, GenerationResult } from './document-generator'

export interface WorkflowOptions {
  enrichment?: EnrichmentOptions
  generation?: GenerationOptions
  customInstructions?: string
}

export interface WorkflowResult extends GenerationResult {
  contextBuilt: boolean
  enriched: boolean
  processingTime: number
}

export class DocumentWorkflow {
  private contextBuilder: AIContextBuilder
  private documentGenerator: DocumentGenerator

  constructor(
    private supabase: SupabaseClient<Database>,
    private projectId: string,
    private moduleType: ModuleType
  ) {
    this.contextBuilder = new AIContextBuilder(moduleType, projectId)
    this.documentGenerator = new DocumentGenerator(supabase, projectId, moduleType)
  }

  /**
   * Execute the document generation workflow
   */
  async execute(
    moduleResponses: Record<string, ModuleResponse>,
    projectData: Record<string, any>,
    options: WorkflowOptions = {}
  ): Promise<WorkflowResult> {
    const startTime = Date.now()

    try {
      // 1. Build initial context
      this.contextBuilder
        .addModuleResponses(moduleResponses)
        .addProjectData(projectData)

      // 2. Enrich context if requested
      if (options.enrichment) {
        await this.contextBuilder.enrichContext({
          ...options.enrichment,
          customInstructions: options.customInstructions
        })
      }

      // 3. Generate document
      const context = this.contextBuilder.getContext()
      const generationResult = await this.documentGenerator.generateDocument(
        context,
        options.generation || { format: 'pdf' }
      )

      return {
        ...generationResult,
        contextBuilt: true,
        enriched: context.enriched,
        processingTime: Date.now() - startTime
      }
    } catch (error) {
      console.error('Error in document workflow:', error)
      return {
        documentId: '',
        status: 'failed',
        contextBuilt: false,
        enriched: false,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get all documents generated for this module
   */
  async getDocuments() {
    return this.documentGenerator.getDocuments()
  }

  /**
   * Get a signed URL for a document
   */
  async getDocumentUrl(documentId: string) {
    return this.documentGenerator.getDocumentUrl(documentId)
  }

  /**
   * Validate module data before processing
   */
  private validateModuleData(
    moduleResponses: Record<string, ModuleResponse>,
    projectData: Record<string, any>
  ): boolean {
    // TODO: Implement validation logic
    // This could check for:
    // - Required fields
    // - Data format
    // - Content quality
    return true
  }

  /**
   * Handle errors in the workflow
   */
  private handleError(error: Error, stage: string) {
    // TODO: Implement error handling
    // This could:
    // - Log errors
    // - Send notifications
    // - Trigger retries
    console.error(`Error in ${stage}:`, error)
  }
} 