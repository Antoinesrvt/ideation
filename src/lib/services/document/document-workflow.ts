import { ModuleType } from '@/types/project'
import { DbModuleStep, DbStepResponse } from '@/types/module'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { AIContextBuilder, EnrichmentOptions } from '@/lib/services/ai/context-builder'
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
    steps: (DbModuleStep & { responses: DbStepResponse[] })[],
    projectData: Record<string, any>,
    options: WorkflowOptions = {}
  ): Promise<WorkflowResult> {
    const startTime = Date.now()

    try {
      // 1. Build initial context
      this.contextBuilder
        .addStepResponses(steps)
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
    steps: (DbModuleStep & { responses: DbStepResponse[] })[],
    projectData: Record<string, any>
  ): boolean {
    if (!steps?.length) return false
    if (!projectData) return false
    
    // Check if all required steps have responses
    return steps.every(step => step.responses?.some(r => r.is_latest))
  }

  /**
   * Handle errors in the workflow
   */
  private handleError(error: Error, stage: string) {
    console.error(`Error in ${stage}:`, error)
    // TODO: Add error reporting/monitoring
  }
} 