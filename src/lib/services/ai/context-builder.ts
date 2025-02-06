import { ModuleType } from '@/types/project'
import { DbModuleStep, DbStepResponse } from '@/types/module'
import { 
  fetchMarketResearch,
  fetchCompetitorResearch,
  fetchFinancialResearch,
  ResearchQuery,
  ResearchResult,
  MarketData,
  CompetitorData,
  FinancialData 
} from '@/lib/services/core/research-service'
import { z } from 'zod'

// Validation schemas
const contextSourceSchema = z.object({
  type: z.enum(['step_response', 'project_data', 'market_research', 'financial_data', 'competitor_data']),
  content: z.any(),
  metadata: z.record(z.string(), z.any()).optional()
})

const contextDataSchema = z.object({
  sources: z.array(contextSourceSchema),
  enriched: z.boolean(),
  lastUpdated: z.string(),
  metadata: z.record(z.string(), z.any())
})

export type ContextSource = z.infer<typeof contextSourceSchema>
export type ContextData = z.infer<typeof contextDataSchema>

export interface EnrichmentOptions {
  includeMarketData?: boolean
  includeCompetitorData?: boolean
  includeFinancialData?: boolean
  customInstructions?: string
}

export class AIContextBuilder {
  private context: ContextData = {
    sources: [],
    enriched: false,
    lastUpdated: new Date().toISOString(),
    metadata: {}
  }

  constructor(
    private moduleType: ModuleType,
    private projectId: string
  ) {}

  /**
   * Add step responses to the context
   */
  addStepResponses(steps: (DbModuleStep & { responses: DbStepResponse[] })[]) {
    steps.forEach(step => {
      const latestResponse = step.responses
        ?.sort((a, b) => b.version - a.version)
        .find(r => r.is_latest)

      if (latestResponse) {
        this.context.sources.push({
          type: 'step_response',
          content: latestResponse.content,
          metadata: {
            stepId: step.id,
            stepType: step.step_type,
            version: latestResponse.version,
            createdAt: latestResponse.created_at
          }
        })
      }
    })

    this.updateLastUpdated()
    return this
  }

  /**
   * Add project data to the context
   */
  addProjectData(data: Record<string, any>) {
    this.context.sources.push({
      type: 'project_data',
      content: data,
      metadata: {
        timestamp: new Date().toISOString()
      }
    })

    this.updateLastUpdated()
    return this
  }

  /**
   * Add market research data
   */
  async addMarketResearch(query: string) {
    try {
      const result = await fetchMarketResearch({
        query,
        filters: {
          industry: this.extractIndustry()
        }
      })

      if (result.data) {
        this.context.sources.push({
          type: 'market_research',
          content: result.data,
          metadata: {
            query,
            confidence: result.confidence,
            timestamp: result.timestamp
          }
        })
      }

      this.updateLastUpdated()
    } catch (error) {
      console.error('Error fetching market research:', error)
    }

    return this
  }

  /**
   * Add competitor data
   */
  async addCompetitorData(competitors: string[]) {
    try {
      const result = await fetchCompetitorResearch({
        query: competitors.join(', '),
        filters: {
          industry: this.extractIndustry()
        }
      })

      if (result.data) {
        this.context.sources.push({
          type: 'competitor_data',
          content: result.data,
          metadata: {
            competitors,
            confidence: result.confidence,
            timestamp: result.timestamp
          }
        })
      }

      this.updateLastUpdated()
    } catch (error) {
      console.error('Error fetching competitor data:', error)
    }

    return this
  }

  /**
   * Add financial data
   */
  async addFinancialData(metrics: string[]) {
    try {
      const result = await fetchFinancialResearch({
        query: metrics.join(', '),
        filters: {
          industry: this.extractIndustry()
        }
      })

      if (result.data) {
        this.context.sources.push({
          type: 'financial_data',
          content: result.data,
          metadata: {
            metrics,
            confidence: result.confidence,
            timestamp: result.timestamp
          }
        })
      }

      this.updateLastUpdated()
    } catch (error) {
      console.error('Error fetching financial data:', error)
    }

    return this
  }

  /**
   * Enrich context with additional data
   */
  async enrichContext(options: EnrichmentOptions = {}) {
    if (this.context.enriched) return this

    try {
      const keyTerms = this.extractKeyTerms()
      const competitors = this.extractCompetitors()
      const financialMetrics = this.extractFinancialMetrics()

      const enrichmentTasks: Promise<any>[] = []

      if (options.includeMarketData) {
        enrichmentTasks.push(this.addMarketResearch(keyTerms.join(' ')))
      }

      if (options.includeCompetitorData && competitors.length > 0) {
        enrichmentTasks.push(this.addCompetitorData(competitors))
      }

      if (options.includeFinancialData && financialMetrics.length > 0) {
        enrichmentTasks.push(this.addFinancialData(financialMetrics))
      }

      await Promise.all(enrichmentTasks)

      if (options.customInstructions) {
        this.context.metadata.customInstructions = options.customInstructions
      }

      this.context.enriched = true
      this.updateLastUpdated()
    } catch (error) {
      console.error('Error enriching context:', error)
    }

    return this
  }

  /**
   * Get the built context
   */
  getContext(): ContextData {
    return contextDataSchema.parse(this.context)
  }

  /**
   * Extract key terms from context
   */
  private extractKeyTerms(): string[] {
    const terms = new Set<string>()

    this.context.sources.forEach(source => {
      if (source.type === 'step_response') {
        const content = source.content as string
        const words = content.split(/\s+/)
        words.forEach(word => {
          if (word.length > 3) terms.add(word.toLowerCase())
        })
      }
    })

    return Array.from(terms)
  }

  /**
   * Extract competitors from context
   */
  private extractCompetitors(): string[] {
    const competitors = new Set<string>()

    this.context.sources.forEach(source => {
      if (source.type === 'step_response' && source.metadata?.stepType === 'competitor-analysis') {
        const content = source.content as string
        // Simple extraction - could be enhanced with NLP
        const lines = content.split('\n')
        lines.forEach(line => {
          if (line.toLowerCase().includes('competitor')) {
            const words = line.split(/[,:]/)
            words.forEach(word => {
              if (word.length > 2) competitors.add(word.trim())
            })
          }
        })
      }
    })

    return Array.from(competitors)
  }

  /**
   * Extract financial metrics from context
   */
  private extractFinancialMetrics(): string[] {
    const metrics = new Set<string>()
    const commonMetrics = ['revenue', 'profit', 'margin', 'cost', 'growth']

    this.context.sources.forEach(source => {
      if (source.type === 'step_response' && source.metadata?.stepType === 'financial-analysis') {
        const content = source.content as string
        commonMetrics.forEach(metric => {
          if (content.toLowerCase().includes(metric)) {
            metrics.add(metric)
          }
        })
      }
    })

    return Array.from(metrics)
  }

  /**
   * Extract industry from project data
   */
  private extractIndustry(): string | undefined {
    const projectData = this.context.sources.find(source => source.type === 'project_data')
    return projectData?.content?.industry
  }

  /**
   * Update last updated timestamp
   */
  private updateLastUpdated() {
    this.context.lastUpdated = new Date().toISOString()
  }
} 