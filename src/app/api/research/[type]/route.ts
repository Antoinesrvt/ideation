import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize API clients
const API_CLIENTS = {
  market: {
    apiKey: process.env.MARKET_DATA_API_KEY
  },
  competitor: {
    apiKey: process.env.COMPETITOR_DATA_API_KEY
  },
  financial: {
    apiKey: process.env.FINANCIAL_DATA_API_KEY
  }
}

const querySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  filters: z.object({
    industry: z.string().optional(),
    region: z.string().optional(),
    timeframe: z.string().optional(),
    dataSource: z.array(z.string()).optional(),
  }).optional(),
})

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
})

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    // Validate research type
    const type = params.type as keyof typeof API_CLIENTS
    if (!API_CLIENTS[type]) {
      return NextResponse.json(
        { error: 'Invalid research type' },
        { status: 400 }
      )
    }

    // Rate limiting
    try {
      await limiter.check(request, 20, `RESEARCH_${type.toUpperCase()}`)
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = querySchema.parse(body)

    // Get cached data if available
    const cacheKey = `${type}:${validatedData.query}:${JSON.stringify(validatedData.filters)}`
    const cachedData = await getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Fetch fresh data based on type
    let result
    switch (type) {
      case 'market':
        result = await fetchMarketData(validatedData)
        break
      case 'competitor':
        result = await fetchCompetitorData(validatedData)
        break
      case 'financial':
        result = await fetchFinancialData(validatedData)
        break
    }

    // Cache the result
    await cacheData(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Research service error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch research data' },
      { status: 500 }
    )
  }
}

// Helper functions for data fetching
async function fetchMarketData({ query, filters }: z.infer<typeof querySchema>) {
  // Implementation will depend on the actual market data API
  const response = await fetch(`${process.env.MARKET_DATA_API_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CLIENTS.market.apiKey}`
    },
    body: JSON.stringify({ query, filters })
  })

  if (!response.ok) {
    throw new Error('Failed to fetch market data')
  }

  return response.json()
}

async function fetchCompetitorData({ query, filters }: z.infer<typeof querySchema>) {
  // Implementation will depend on the actual competitor data API
  const response = await fetch(`${process.env.COMPETITOR_DATA_API_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CLIENTS.competitor.apiKey}`
    },
    body: JSON.stringify({ query, filters })
  })

  if (!response.ok) {
    throw new Error('Failed to fetch competitor data')
  }

  return response.json()
}

async function fetchFinancialData({ query, filters }: z.infer<typeof querySchema>) {
  // Implementation will depend on the actual financial data API
  const response = await fetch(`${process.env.FINANCIAL_DATA_API_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CLIENTS.financial.apiKey}`
    },
    body: JSON.stringify({ query, filters })
  })

  if (!response.ok) {
    throw new Error('Failed to fetch financial data')
  }

  return response.json()
}

// Cache helpers
async function getCachedData(key: string) {
  try {
    const { data } = await supabase
      .from('research_cache')
      .select('data')
      .eq('key', key)
      .single()

    return data
  } catch {
    return null
  }
}

async function cacheData(key: string, data: any) {
  try {
    await supabase
      .from('research_cache')
      .upsert({
        key,
        data,
        expiry: 60, // 1 hour cache
        type: key.split(':')[0]
      })
  } catch (error) {
    console.error('Failed to cache research data:', error)
  }
} 