export const AI_CONFIG = {
  model: {
    name: 'gpt-4-turbo-preview',
    context_window: 128000,
    max_output_tokens: 4096,
    temperature: {
      analysis: 0.3,  // More focused/precise
      suggestions: 0.7,  // More creative
      research: 0.4   // Balanced
    }
  },
  rate_limits: {
    requests_per_minute: 50,
    tokens_per_minute: 100000
  },
  features: {
    stream_response: true,
    include_sources: true,
    enable_research: true
  },
  research: {
    sources: [
      'market_databases',
      'industry_reports',
      'news_articles',
      'competitor_analysis',
      'academic_papers',
      'expert_opinions'
    ],
    max_age_days: 180,
    min_confidence: 0.8
  }
}

export const RESPONSE_FORMATS = {
  analysis: {
    suggestions: ['string'],
    improvements: {
      clarity: ['string'],
      completeness: ['string'],
      consistency: ['string']
    },
    score: 'number',
    confidence: 'number'
  },
  research: {
    marketInsights: ['string'],
    competitorData: ['string'],
    industryTrends: ['string'],
    sources: ['string']
  }
} 