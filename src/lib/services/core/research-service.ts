import { z } from 'zod'

// Schema definitions
export const marketDataSchema = z.object({
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

export const competitorDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  marketShare: z.number().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  products: z.array(z.object({
    name: z.string(),
    description: z.string(),
    marketShare: z.number().optional()
  }))
})

export const financialDataSchema = z.object({
  metrics: z.object({
    revenue: z.number().optional(),
    profit: z.number().optional(),
    margins: z.object({
      gross: z.number().optional(),
      operating: z.number().optional(),
      net: z.number().optional()
    }).optional()
  }).optional(),
  ratios: z.object({
    profitability: z.object({
      roa: z.number().optional(),
      roe: z.number().optional(),
      ros: z.number().optional()
    }).optional(),
    liquidity: z.object({
      current: z.number().optional(),
      quick: z.number().optional()
    }).optional()
  }).optional(),
  projections: z.object({
    revenue: z.array(z.number()).optional(),
    growth: z.array(z.number()).optional(),
    margins: z.array(z.number()).optional()
  }).optional()
})

// Type exports
export type MarketData = z.infer<typeof marketDataSchema>
export type CompetitorData = z.infer<typeof competitorDataSchema>
export type FinancialData = z.infer<typeof financialDataSchema>
export type ResearchType = 'market' | 'competitor' | 'financial'

export interface ResearchQuery {
  query: string
  filters?: {
    industry?: string
    region?: string
    timeframe?: string
    dataSource?: string[]
  }
}

export interface ResearchResult<T> {
  data: T
  source: string
  confidence: number
  timestamp: string
}

// Main fetch function
export async function fetchResearch<T>(
  type: ResearchType,
  query: ResearchQuery
): Promise<ResearchResult<T>> {
  const res = await fetch(`/api/research/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || `Failed to fetch ${type} research data`)
  }

  return res.json()
}

// Type-safe fetch functions
export async function fetchMarketResearch(
  query: ResearchQuery
): Promise<ResearchResult<MarketData>> {
  return fetchResearch<MarketData>('market', query)
}

export async function fetchCompetitorResearch(
  query: ResearchQuery
): Promise<ResearchResult<CompetitorData>> {
  return fetchResearch<CompetitorData>('competitor', query)
}

export async function fetchFinancialResearch(
  query: ResearchQuery
): Promise<ResearchResult<FinancialData>> {
  return fetchResearch<FinancialData>('financial', query)
} 