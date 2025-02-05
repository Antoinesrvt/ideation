import type { Database } from './database'
import type { Json } from './database'

// Type helper for JSON metadata that ensures compatibility with Supabase's Json type
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[]

export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends JsonValue ? T[P] : never
}

// Database row types
export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type ModuleRow = Database['public']['Tables']['modules']['Row']

// Module types
export type ModuleType = ModuleRow['type']

export const MODULE_TYPES: ModuleType[] = [
  'vision-problem',
  'market-analysis',
  'business-model',
  'go-to-market',
  'financial-projections',
  'risk-assessment',
  'implementation-timeline',
  'pitch-deck'
] as const

// Frontend-only types for module configuration
export interface ModuleStepTemplate {
  id: string
  module_type: ModuleType
  step_id: string
  title: string
  description: string
  placeholder?: string
  order_index: number
  expert_tips: string[]
}

// Response types that will be stored in metadata
export interface StepResponse {
  content: string
  lastUpdated: string | null
  aiSuggestion?: string
}

// Base types for metadata content
export interface BaseModuleStep {
  id: string
  module_type: ModuleType
  step_id: string
  title: string
  description: string
  placeholder: string | null
  order_index: number
  expert_tips: string[]
  completed: boolean
  lastUpdated: string
}

export interface BaseModuleFile {
  id: string
  name: string
  url: string
  type: string
}

// Metadata types that will be stored in the database
export interface ProjectMetadataContent {
  path: 'guided' | 'expert' | null
  currentStep: ModuleType | null
  completedAt: string | null
  stage: 'idea' | 'mvp' | 'growth' | null
  industry: string | null
}

export interface ModuleMetadataContent {
  description: string
  currentStep: string | null
  progress: number
  summary: string | null
  steps: BaseModuleStep[]
  responses: { [key: string]: StepResponse }
  lastUpdated: string
  files: BaseModuleFile[]
}

// Type-safe metadata types for database storage
export type ProjectMetadata = JsonCompatible<ProjectMetadataContent>
export type ModuleMetadata = JsonCompatible<ModuleMetadataContent>

// Extended types with relationships
export interface Project extends Omit<ProjectRow, 'metadata'> {
  metadata: ProjectMetadata
  modules: Module[]
}

export interface Module extends Omit<ModuleRow, 'metadata'> {
  metadata: ModuleMetadata
}

// Frontend configuration types
export interface ModuleConfig {
  title: string
  description: string
  steps: ModuleStepTemplate[]
}

export interface ModuleRecap {
  id: ModuleType
  title: string
  completed: boolean
  summary: string | undefined
}

// This is a frontend-only configuration object
export const MODULE_CONFIG: Record<ModuleType, ModuleConfig> = {
  'vision-problem': {
    title: 'Vision & Problem',
    description: 'Define your vision and identify the problem you\'re solving',
    steps: [
      {
        id: 'vision',
        module_type: 'vision-problem',
        step_id: 'vision',
        title: 'Vision Statement',
        description: 'What future do you want to create?',
        placeholder: 'In 5 years, we envision a world where...',
        order_index: 0,
        expert_tips: [
          'Consider market trends in your vision',
          'Validate assumptions with data',
          'Think about scalability'
        ]
      },
      {
        id: 'problem',
        module_type: 'vision-problem',
        step_id: 'problem',
        title: 'Problem Statement',
        description: 'What significant problem are you solving?',
        placeholder: 'Today, people struggle with...',
        order_index: 1,
        expert_tips: [
          'Quantify the problem\'s impact',
          'Identify key stakeholders',
          'Research existing solutions'
        ]
      },
      {
        id: 'solution',
        module_type: 'vision-problem',
        step_id: 'solution',
        title: 'Solution Concept',
        description: 'How will you solve this problem?',
        placeholder: 'We will create...',
        order_index: 2,
        expert_tips: [
          'Focus on unique value proposition',
          'Consider technical feasibility',
          'Think about scalability'
        ]
      }
    ]
  },
  'market-analysis': {
    title: 'Market Analysis',
    description: 'Analyze your target market and competition',
    steps: [
      {
        id: 'target-market',
        module_type: 'market-analysis',
        step_id: 'target-market',
        title: 'Target Market',
        description: 'Who are your ideal customers?',
        placeholder: 'Our target market consists of...',
        order_index: 0,
        expert_tips: [
          'Define demographics clearly',
          'Consider psychographic factors',
          'Identify market size'
        ]
      },
      {
        id: 'market-size',
        module_type: 'market-analysis',
        step_id: 'market-size',
        title: 'Market Size',
        description: 'What is your total addressable market (TAM)?',
        placeholder: 'The total market size is...',
        order_index: 1,
        expert_tips: [
          'Break down TAM, SAM, and SOM',
          'Use credible market research',
          'Consider growth trends'
        ]
      },
      {
        id: 'competitors',
        module_type: 'market-analysis',
        step_id: 'competitors',
        title: 'Competitor Analysis',
        description: 'Who are your main competitors?',
        placeholder: 'Our main competitors are...',
        order_index: 2,
        expert_tips: [
          'Analyze direct and indirect competitors',
          'Identify competitive advantages',
          'Study market leaders'
        ]
      },
      {
        id: 'market-trends',
        module_type: 'market-analysis',
        step_id: 'market-trends',
        title: 'Market Trends',
        description: 'What are the key market trends?',
        placeholder: 'The key trends shaping our market are...',
        order_index: 3,
        expert_tips: [
          'Consider technological trends',
          'Analyze regulatory changes',
          'Study consumer behavior shifts'
        ]
      }
    ]
  },
  'business-model': {
    title: 'Business Model',
    description: 'Define how your business will create and capture value',
    steps: [
      {
        id: 'revenue-model',
        module_type: 'business-model',
        step_id: 'revenue-model',
        title: 'Revenue Model',
        description: 'How will you generate revenue?',
        placeholder: 'Our revenue model consists of...',
        order_index: 0,
        expert_tips: [
          'Consider multiple revenue streams',
          'Analyze pricing strategies',
          'Think about scalability'
        ]
      },
      {
        id: 'customer-segments',
        module_type: 'business-model',
        step_id: 'customer-segments',
        title: 'Customer Segments',
        description: 'Who are your key customer segments?',
        placeholder: 'Our key customer segments are...',
        order_index: 1,
        expert_tips: [
          'Define clear segments',
          'Consider segment size',
          'Analyze willingness to pay'
        ]
      },
      {
        id: 'value-proposition',
        module_type: 'business-model',
        step_id: 'value-proposition',
        title: 'Value Proposition',
        description: 'What unique value do you offer?',
        placeholder: 'Our unique value proposition is...',
        order_index: 2,
        expert_tips: [
          'Focus on customer benefits',
          'Differentiate from competitors',
          'Make it measurable'
        ]
      },
      {
        id: 'channels',
        module_type: 'business-model',
        step_id: 'channels',
        title: 'Distribution Channels',
        description: 'How will you reach your customers?',
        placeholder: 'We will reach our customers through...',
        order_index: 3,
        expert_tips: [
          'Consider direct and indirect channels',
          'Analyze channel costs',
          'Think about scalability'
        ]
      }
    ]
  },
  'go-to-market': {
    title: 'Go-to-Market Strategy',
    description: 'Plan how you\'ll reach and acquire customers',
    steps: [
      {
        id: 'target-audience',
        module_type: 'go-to-market',
        step_id: 'target-audience',
        title: 'Target Audience',
        description: 'Who are your early adopters?',
        placeholder: 'Our initial target audience is...',
        order_index: 0,
        expert_tips: [
          'Define early adopter characteristics',
          'Identify pain points',
          'Consider acquisition channels'
        ]
      },
      {
        id: 'positioning',
        module_type: 'go-to-market',
        step_id: 'positioning',
        title: 'Market Positioning',
        description: 'How will you position your product?',
        placeholder: 'Our market positioning is...',
        order_index: 1,
        expert_tips: [
          'Define unique selling points',
          'Analyze competitor positioning',
          'Consider brand perception'
        ]
      },
      {
        id: 'acquisition',
        module_type: 'go-to-market',
        step_id: 'acquisition',
        title: 'Customer Acquisition',
        description: 'How will you acquire customers?',
        placeholder: 'Our customer acquisition strategy includes...',
        order_index: 2,
        expert_tips: [
          'Calculate acquisition costs',
          'Define marketing channels',
          'Plan growth strategies'
        ]
      }
    ]
  },
  'financial-projections': {
    title: 'Financial Projections',
    description: 'Forecast your financial performance and requirements',
    steps: [
      {
        id: 'revenue',
        module_type: 'financial-projections',
        step_id: 'revenue',
        title: 'Revenue Projections',
        description: 'What are your revenue projections?',
        placeholder: 'Our projected revenue growth is...',
        order_index: 0,
        expert_tips: [
          'Use realistic growth rates',
          'Consider market size',
          'Factor in seasonality'
        ]
      },
      {
        id: 'costs',
        module_type: 'financial-projections',
        step_id: 'costs',
        title: 'Cost Structure',
        description: 'What are your main costs?',
        placeholder: 'Our main cost categories are...',
        order_index: 1,
        expert_tips: [
          'Include fixed and variable costs',
          'Consider scaling costs',
          'Plan for contingencies'
        ]
      },
      {
        id: 'funding',
        module_type: 'financial-projections',
        step_id: 'funding',
        title: 'Funding Requirements',
        description: 'What funding do you need?',
        placeholder: 'Our funding requirements are...',
        order_index: 2,
        expert_tips: [
          'Calculate runway needed',
          'Consider funding sources',
          'Plan funding milestones'
        ]
      }
    ]
  },
  'risk-assessment': {
    title: 'Risk Assessment',
    description: 'Identify and plan for potential risks and challenges',
    steps: [
      {
        id: 'market-risks',
        module_type: 'risk-assessment',
        step_id: 'market-risks',
        title: 'Market Risks',
        description: 'What market risks do you face?',
        placeholder: 'The key market risks are...',
        order_index: 0,
        expert_tips: [
          'Consider market changes',
          'Analyze competition risks',
          'Evaluate market timing'
        ]
      },
      {
        id: 'operational-risks',
        module_type: 'risk-assessment',
        step_id: 'operational-risks',
        title: 'Operational Risks',
        description: 'What operational challenges might you face?',
        placeholder: 'Our operational risks include...',
        order_index: 1,
        expert_tips: [
          'Assess supply chain risks',
          'Consider scaling challenges',
          'Plan for contingencies'
        ]
      },
      {
        id: 'mitigation',
        module_type: 'risk-assessment',
        step_id: 'mitigation',
        title: 'Risk Mitigation',
        description: 'How will you address these risks?',
        placeholder: 'Our risk mitigation strategies are...',
        order_index: 2,
        expert_tips: [
          'Develop contingency plans',
          'Consider insurance options',
          'Plan risk monitoring'
        ]
      }
    ]
  },
  'implementation-timeline': {
    title: 'Implementation Timeline',
    description: 'Create a roadmap for executing your plan',
    steps: [
      {
        id: 'milestones',
        module_type: 'implementation-timeline',
        step_id: 'milestones',
        title: 'Key Milestones',
        description: 'What are your key milestones?',
        placeholder: 'Our key milestones are...',
        order_index: 0,
        expert_tips: [
          'Set realistic timelines',
          'Define clear objectives',
          'Include measurable outcomes'
        ]
      },
      {
        id: 'resources',
        module_type: 'implementation-timeline',
        step_id: 'resources',
        title: 'Resource Requirements',
        description: 'What resources will you need?',
        placeholder: 'The resources we need include...',
        order_index: 1,
        expert_tips: [
          'Consider human resources',
          'Plan for equipment needs',
          'Budget for resources'
        ]
      },
      {
        id: 'dependencies',
        module_type: 'implementation-timeline',
        step_id: 'dependencies',
        title: 'Dependencies',
        description: 'What are the critical dependencies?',
        placeholder: 'Our critical dependencies are...',
        order_index: 2,
        expert_tips: [
          'Identify critical path',
          'Plan for bottlenecks',
          'Consider external factors'
        ]
      }
    ]
  },
  'pitch-deck': {
    title: 'Pitch Deck',
    description: 'Create a compelling presentation of your business',
    steps: [
      {
        id: 'story',
        module_type: 'pitch-deck',
        step_id: 'story',
        title: 'Story & Vision',
        description: 'What\'s your compelling story?',
        placeholder: 'Our story begins with...',
        order_index: 0,
        expert_tips: [
          'Make it memorable',
          'Focus on the problem',
          'Show your passion'
        ]
      },
      {
        id: 'highlights',
        module_type: 'pitch-deck',
        step_id: 'highlights',
        title: 'Key Highlights',
        description: 'What are your key achievements and metrics?',
        placeholder: 'Our key highlights include...',
        order_index: 1,
        expert_tips: [
          'Focus on traction',
          'Show key metrics',
          'Highlight team strengths'
        ]
      },
      {
        id: 'ask',
        module_type: 'pitch-deck',
        step_id: 'ask',
        title: 'The Ask',
        description: 'What are you asking for?',
        placeholder: 'We are seeking...',
        order_index: 2,
        expert_tips: [
          'Be specific about needs',
          'Show use of funds',
          'Define clear milestones'
        ]
      }
    ]
  }
}

// Type guards for metadata
export function isProjectMetadata(metadata: unknown): metadata is ProjectMetadataContent {
  if (!metadata || typeof metadata !== 'object') return false
  const m = metadata as Record<string, unknown>
  
  return (
    (m.path === 'guided' || m.path === 'expert' || m.path === null) &&
    (typeof m.currentStep === 'string' || m.currentStep === null) &&
    (typeof m.completedAt === 'string' || m.completedAt === null) &&
    (m.stage === 'idea' || m.stage === 'mvp' || m.stage === 'growth' || m.stage === null) &&
    (typeof m.industry === 'string' || m.industry === null)
  )
}

export function isModuleMetadata(metadata: unknown): metadata is ModuleMetadataContent {
  if (!metadata || typeof metadata !== 'object') return false
  const m = metadata as Record<string, unknown>
  
  return (
    typeof m.description === 'string' &&
    (typeof m.currentStep === 'string' || m.currentStep === null) &&
    typeof m.progress === 'number' &&
    (typeof m.summary === 'string' || m.summary === null) &&
    Array.isArray(m.steps) &&
    typeof m.lastUpdated === 'string' &&
    Array.isArray(m.files) &&
    typeof m.responses === 'object'
  )
} 