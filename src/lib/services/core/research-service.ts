import { ModuleType } from '@/types/project'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { APIError, BaseError, NotFoundError, ServiceError, ValidationError } from '../../errors/base-error'
import { z } from 'zod'

// Validation schemas
const marketDataSchema = z.object({
  marketSize: z.number(),
  growthRate: z.number(),
  trends: z.array(z.string()),
  keyPlayers: z.array(z.string()),
  segments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    growth: z.number()
  }))
})

const competitorDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  marketShare: z.number().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  products: z.array(z.object({
    name: z.string(),
    description: z.string(),
    pricing: z.string().optional()
  })),
  metrics: z.object({
    revenue: z.number().optional(),
    employees: z.number().optional(),
    funding: z.number().optional(),
    social: z.object({
      followers: z.number().optional(),
      engagement: z.number().optional(),
      sentiment: z.number().optional()
    }).optional()
  })
})

// API Types
export type MarketData = z.infer<typeof marketDataSchema>
export type CompetitorData = z.infer<typeof competitorDataSchema>

interface FinancialData {
  metrics: {
    revenue?: number
    profit?: number
    margins?: {
      gross?: number
      operating?: number
      net?: number
    }
  }
  ratios: {
    profitability?: {
      roa?: number
      roe?: number
      ros?: number
    }
    liquidity?: {
      current?: number
      quick?: number
    }
  }
  projections: {
    revenue?: number[]
    growth?: number[]
    margins?: number[]
  }
}

interface ResearchOptions {
  useCache?: boolean
  cacheExpiry?: number // in minutes
  enrichment?: {
    includeNews?: boolean
    includeSocialMedia?: boolean
    includePatents?: boolean
  }
}

interface MarketSizeData {
  total: number
  growth: number
  segments: Array<{
    name: string
    size: number
    growth: number
  }>
}

interface CompanyProfile {
  name: string
  description: string
  marketShare: number
  strengths: string[]
  weaknesses: string[]
}

interface CacheData {
  data: any
  created_at: string
  expiry: number
}

export class ResearchService {
  private readonly DEFAULT_CACHE_EXPIRY = 60 // 1 hour in minutes
  private readonly API_ENDPOINTS = {
    marketSize: process.env.NEXT_PUBLIC_MARKET_SIZE_API,
    marketTrends: process.env.NEXT_PUBLIC_MARKET_TRENDS_API,
    competitors: process.env.NEXT_PUBLIC_COMPETITORS_API,
    news: process.env.NEXT_PUBLIC_NEWS_API,
    financial: process.env.NEXT_PUBLIC_FINANCIAL_API
  }

  constructor(
    private supabase: SupabaseClient<Database>,
    private projectId: string,
    private moduleType: ModuleType,
    private apiKeys?: {
      marketResearch?: string
      financialData?: string
      newsApi?: string
    }
  ) {
    this.validateConfig()
  }

  private validateConfig(): void {
    if (!this.projectId) {
      throw new ValidationError('Project ID is required')
    }
    if (!this.moduleType) {
      throw new ValidationError('Module type is required')
    }
  }

  /**
   * Get market research data
   */
  async getMarketData(
    industry: string,
    options: ResearchOptions = {}
  ): Promise<MarketData> {
    try {
      if (!industry) {
        throw new ValidationError('Industry is required')
      }

      // 1. Check cache if enabled
      if (options.useCache) {
        const cachedData = await this.getCachedData('market', industry)
        if (cachedData) {
          const validatedData = marketDataSchema.safeParse(cachedData)
          if (validatedData.success) {
            return validatedData.data
          }
        }
      }

      // 2. Fetch data from multiple sources
      const [marketSize, trends, competitors] = await Promise.all([
        this.fetchMarketSize(industry),
        this.fetchMarketTrends(industry),
        this.fetchKeyCompetitors(industry)
      ])

      // 3. Enrich with additional data if requested
      let enrichedTrends = [...trends]
      if (options.enrichment?.includeNews) {
        const newsData = await this.fetchIndustryNews(industry)
        enrichedTrends = [...enrichedTrends, ...newsData]
      }

      // 4. Format and validate response
      const marketData = {
        marketSize: marketSize.total,
        growthRate: marketSize.growth,
        trends: enrichedTrends,
        keyPlayers: competitors.map(comp => comp.name),
        segments: marketSize.segments
      }

      const validatedData = marketDataSchema.safeParse(marketData)
      if (!validatedData.success) {
        throw new ServiceError(
          'ValidationError',
          'Invalid market data format',
          { errors: validatedData.error.errors }
        )
      }

      // 5. Cache results if enabled
      if (options.useCache) {
        await this.cacheData(
          'market',
          industry,
          validatedData.data,
          options.cacheExpiry || this.DEFAULT_CACHE_EXPIRY
        )
      }

      return validatedData.data
    } catch (error) {
      if (error instanceof BaseError) {
        throw error
      }
      throw new ServiceError(
        'MarketDataError',
        'Error fetching market data',
        { originalError: error }
      )
    }
  }

  /**
   * Get competitor analysis data
   */
  async getCompetitorData(
    competitors: string[],
    options: ResearchOptions = {}
  ): Promise<CompetitorData[]> {
    try {
      // 1. Check cache if enabled
      if (options.useCache) {
        const cachedData = await this.getCachedData('competitors', competitors.join(','))
        if (cachedData) return cachedData as CompetitorData[]
      }

      // 2. Fetch data for each competitor
      const competitorData = await Promise.all(
        competitors.map(async (competitor) => {
          const [
            profile,
            products,
            metrics
          ] = await Promise.all([
            this.fetchCompanyProfile(competitor),
            this.fetchCompanyProducts(competitor),
            this.fetchCompanyMetrics(competitor)
          ])

          // Enrich with social media data if requested
          const enrichedMetrics = { ...metrics }
          if (options.enrichment?.includeSocialMedia) {
            enrichedMetrics.social = await this.fetchSocialMediaMetrics(competitor)
          }

          return {
            name: competitor,
            description: profile.description,
            marketShare: profile.marketShare,
            strengths: profile.strengths,
            weaknesses: profile.weaknesses,
            products,
            metrics: enrichedMetrics
          }
        })
      )

      // 3. Cache results if enabled
      if (options.useCache) {
        await this.cacheData('competitors', competitors.join(','), competitorData, options.cacheExpiry)
      }

      return competitorData
    } catch (error) {
      console.error('Error fetching competitor data:', error)
      throw error
    }
  }

  /**
   * Get financial analysis data
   */
  async getFinancialData(
    industry: string,
    options: ResearchOptions = {}
  ): Promise<FinancialData> {
    try {
      // 1. Check cache if enabled
      if (options.useCache) {
        const cachedData = await this.getCachedData('financial', industry)
        if (cachedData) return cachedData as FinancialData
      }

      // 2. Fetch financial data
      const [
        metrics,
        ratios,
        projections
      ] = await Promise.all([
        this.fetchIndustryMetrics(industry),
        this.fetchIndustryRatios(industry),
        this.fetchIndustryProjections(industry)
      ])

      // 3. Format response
      const financialData: FinancialData = {
        metrics,
        ratios,
        projections
      }

      // 4. Cache results if enabled
      if (options.useCache) {
        await this.cacheData('financial', industry, financialData, options.cacheExpiry)
      }

      return financialData
    } catch (error) {
      console.error('Error fetching financial data:', error)
      throw error
    }
  }

  /**
   * Cache management methods
   */
  private async getCachedData(type: string, key: string): Promise<any | null> {
    const { data: cacheEntry } = await this.supabase
      .from('research_cache')
      .select('data, created_at, expiry')
      .eq('type', type)
      .eq('key', key)
      .single()

    if (!cacheEntry) return null

    // Check if cache is expired
    const cacheAge = Date.now() - new Date(cacheEntry.created_at).getTime()
    if (cacheAge > (cacheEntry.expiry * 60 * 1000)) {
      await this.supabase
        .from('research_cache')
        .delete()
        .eq('type', type)
        .eq('key', key)
      return null
    }

    return cacheEntry.data
  }

  private async cacheData(
    type: string,
    key: string,
    data: any,
    expiry: number = 60 // default 1 hour
  ): Promise<void> {
    await this.supabase
      .from('research_cache')
      .upsert({
        type,
        key,
        data,
        expiry,
        created_at: new Date().toISOString()
      })
  }

  /**
   * API integration methods (to be implemented)
   */
  private async fetchMarketSize(industry: string): Promise<MarketSizeData> {
    if (!this.API_ENDPOINTS.marketSize) {
      throw new ServiceError(
        'ConfigError',
        'Market size API endpoint not configured'
      )
    }

    try {
      const data = await this.fetchWithRetry<MarketSizeData>(
        `${this.API_ENDPOINTS.marketSize}/size/${encodeURIComponent(industry)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys?.marketResearch}`
          }
        }
      )

      return data
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new ServiceError(
        'MarketSizeError',
        'Error fetching market size data',
        { originalError: error }
      )
    }
  }

  private async fetchMarketTrends(industry: string): Promise<string[]> {
    // TODO: Implement market trends API integration
    return []
  }

  private async fetchKeyCompetitors(industry: string): Promise<CompanyProfile[]> {
    // TODO: Implement competitor API integration
    return []
  }

  private async fetchIndustryNews(industry: string): Promise<string[]> {
    // TODO: Implement news API integration
    return []
  }

  private async fetchCompanyProfile(company: string): Promise<CompanyProfile> {
    // TODO: Implement company profile API integration
    return {
      name: company,
      description: '',
      marketShare: 0,
      strengths: [],
      weaknesses: []
    }
  }

  private async fetchCompanyProducts(company: string): Promise<CompetitorData['products']> {
    // TODO: Implement product API integration
    return []
  }

  private async fetchCompanyMetrics(company: string): Promise<CompetitorData['metrics']> {
    // TODO: Implement company metrics API integration
    return {}
  }

  private async fetchSocialMediaMetrics(company: string): Promise<CompetitorData['metrics']['social']> {
    // TODO: Implement social media API integration
    return {
      followers: 0,
      engagement: 0,
      sentiment: 0
    }
  }

  private async fetchIndustryMetrics(industry: string): Promise<FinancialData['metrics']> {
    // TODO: Implement industry metrics API integration
    return {}
  }

  private async fetchIndustryRatios(industry: string): Promise<FinancialData['ratios']> {
    // TODO: Implement industry ratios API integration
    return {}
  }

  private async fetchIndustryProjections(industry: string): Promise<FinancialData['projections']> {
    // TODO: Implement industry projections API integration
    return {}
  }

  /**
   * Enhanced API integration methods
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        })

        if (!response.ok) {
          throw new APIError(
            'APIRequestError',
            response.status,
            response.statusText,
            { url, attempt: i + 1 }
          )
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        if (i === retries - 1) break
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }

    throw new APIError(
      'APIRequestFailed',
      500,
      'Failed after multiple retries',
      { originalError: lastError }
    )
  }
} 