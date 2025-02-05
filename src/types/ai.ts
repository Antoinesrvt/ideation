export type AIAnalysisType = "content" | "context" | "research"

export interface AIAnalysis {
  suggestions: string[]
  improvements?: {
    clarity?: string[]
    completeness?: string[]
    consistency?: string[]
  }
  score?: number
  confidence: number
}

export interface AIResearchData {
  marketInsights?: string[]
  competitorData?: string[]
  industryTrends?: string[]
  sources: string[]
}

export interface AIContextSuggestion {
  basedOn: {
    moduleId: string
    stepId: string
    content: string
  }
  suggestions: string[]
  relevance: number
}

export interface QuickAction {
  id: string
  type: 'template' | 'example' | 'command' | 'action'
  label: string
  content: string
  icon?: React.ReactNode
  tags?: string[]  // For filtering/context
  moduleTypes?: string[]  // Which modules this applies to
  shortcut?: string  // Keyboard shortcut for the action
}

export interface QuickActionGroup {
  id: string
  label: string
  actions: QuickAction[]
} 