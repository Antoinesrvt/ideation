import { ModuleType } from '@/types/project'

export interface QuickAction {
  id: string
  title: string
  description: string
  content: string
  category: 'template' | 'example' | 'suggestion'
}

export interface QuickActionGroup {
  title: string
  actions: QuickAction[]
}

export function useQuickActions(moduleType: ModuleType) {
  // Define module-specific quick actions
  const getTemplatesForModule = (type: ModuleType): QuickAction[] => {
    switch (type) {
      case 'vision-problem':
        return [
          {
            id: 'vision-template-1',
            title: 'Problem Statement',
            description: 'Clear and concise problem statement template',
            content: 'The [target market] faces [specific problem] because [root cause]. This results in [negative impact], costing them [quantifiable loss] annually.',
            category: 'template'
          },
          {
            id: 'vision-template-2',
            title: 'Vision Statement',
            description: 'Compelling vision statement template',
            content: 'Our vision is to [transformative change] for [target audience] by [key method/solution], enabling them to [desired outcome].',
            category: 'template'
          }
        ]
      case 'market-analysis':
        return [
          {
            id: 'market-template-1',
            title: 'Market Size Analysis',
            description: 'Template for market size breakdown',
            content: 'The Total Addressable Market (TAM) for [industry] is $[X]B, with a Serviceable Addressable Market (SAM) of $[Y]B. Our initial Serviceable Obtainable Market (SOM) target is $[Z]M, representing [P]% of the SAM.',
            category: 'template'
          },
          {
            id: 'market-template-2',
            title: 'Competitor Analysis',
            description: 'Template for competitor comparison',
            content: 'Key competitors in the market include:\n\n1. [Competitor 1]\n- Market Share: [X]%\n- Strengths: [list key strengths]\n- Weaknesses: [list key weaknesses]\n\n2. [Competitor 2]\n- Market Share: [Y]%\n- Strengths: [list key strengths]\n- Weaknesses: [list key weaknesses]',
            category: 'template'
          }
        ]
      case "business-model":
        return [
          {
            id: 'business-template-1',
            title: 'Business Model Canvas',
            description: 'Template for business model canvas',
            content: 'The business model canvas is a visual representation of the key components of a business model.',
            category: 'template'
          },
          {
            id: 'business-template-2',
            title: 'Business Model Canvas',
            description: 'Template for business model canvas',
            content: 'The business model canvas is a visual representation of the key components of a business model.',
            category: 'template'
          }
        ]
      case "go-to-market":
        return [
          {
            id: 'go-to-market-template-1',
            title: 'Go-to-Market Strategy',
            description: 'Template for go-to-market strategy',
            content: 'The go-to-market strategy is a plan for how a business will reach its target customers.',
            category: 'template'
          },
          {
            id: 'go-to-market-template-2',
            title: 'Go-to-Market Strategy',
            description: 'Template for go-to-market strategy',
            content: 'The go-to-market strategy is a plan for how a business will reach its target customers.',
            category: 'template'
          }
        ]
      case "financial-projections":
        return [
          {
            id: 'financial-template-1',
            title: 'Financial Projections',
            description: 'Template for financial projections',
            content: 'The financial projections are a document that outlines the financial projections for a business.',
            category: 'template'
          },
          {
            id: 'financial-template-2',
            title: 'Financial Projections',
            description: 'Template for financial projections',
            content: 'The financial projections are a document that outlines the financial projections for a business.',
            category: 'template'
          }
        ]
      case "implementation-timeline":
        return [
          {
            id: 'implementation-template-1',
            title: 'Implementation Timeline',
            description: 'Template for implementation timeline',
            content: 'The implementation timeline is a document that outlines the timeline for the implementation of a business.',
            category: 'template'
          },
          {
            id: 'implementation-template-2',
            title: 'Implementation Timeline',
            description: 'Template for implementation timeline',
            content: 'The implementation timeline is a document that outlines the timeline for the implementation of a business.',
            category: 'template'
          }
        ]
      case "pitch-deck":
        return [
          {
            id: 'pitch-template-1',
            title: 'Pitch Deck',
            description: 'Template for pitch deck',
            content: 'The pitch deck is a document that outlines the pitch for a business.',
            category: 'template'
          },
          {
            id: 'pitch-template-2',
            title: 'Pitch Deck',
            description: 'Template for pitch deck',
            content: 'The pitch deck is a document that outlines the pitch for a business.',
            category: 'template'
          }
        ]
      case "risk-assessment":
        return [
          {
            id: 'risk-template-1',
            title: 'Risk Assessment',
            description: 'Template for risk assessment',
            content: 'The risk assessment is a document that outlines the risk for a business.',
            category: 'template'
          },
          {
            id: 'risk-template-2',
            title: 'Risk Assessment',
            description: 'Template for risk assessment',
            content: 'The risk assessment is a document that outlines the risk for a business.',
            category: 'template'
          }
        ]
      default:
        return []
    }
  }

  const getExamplesForModule = (type: ModuleType): QuickAction[] => {
    switch (type) {
      case 'vision-problem':
        return [
          {
            id: 'vision-example-1',
            title: 'SaaS Problem Statement',
            description: 'Example of a B2B SaaS problem statement',
            content: 'Small and medium-sized businesses struggle with managing customer support tickets efficiently because existing solutions are either too complex or too expensive. This results in longer response times, decreased customer satisfaction, and an estimated 20% loss in customer retention annually.',
            category: 'example'
          }
        ]
      case 'market-analysis':
        return [
          {
            id: 'market-example-1',
            title: 'FinTech Market Analysis',
            description: 'Example of fintech market analysis',
            content: 'The global fintech market size is $110B in 2023, growing at a CAGR of 23.4%. The digital payments segment represents 40% of the market, followed by alternative lending (25%) and digital banking (20%). Key growth drivers include increasing smartphone penetration, rising demand for contactless payments, and favorable regulatory environment.',
            category: 'example'
          }
        ]
      // Add examples for other module types
      default:
        return []
    }
  }

  const getQuickActionsForModule = (type: ModuleType): QuickActionGroup[] => {
    const templates = getTemplatesForModule(type)
    const examples = getExamplesForModule(type)

    return [
      {
        title: 'Templates',
        actions: templates
      },
      {
        title: 'Examples',
        actions: examples
      }
    ]
  }

  return {
    templates: getTemplatesForModule(moduleType),
    examples: getExamplesForModule(moduleType),
    getQuickActionsForModule: () => getQuickActionsForModule(moduleType)
  }
} 