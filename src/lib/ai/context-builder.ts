import { Project, ProjectModule } from "@/types/project"

export interface AIContext {
  project: {
    industry: string
    stage: string
    marketSize?: string
    targetCustomers?: string
    businessModel?: string
  }
  module: {
    id: string
    title: string
    currentStep: string
    progress: number
    previousResponses: Record<string, string>
  }
  history: {
    previousModules: {
      id: string
      title: string
      keyPoints: string[]
      completed: boolean
    }[]
    relatedResponses: Record<string, string>
  }
  market: {
    trends?: string[]
    competitors?: string[]
    opportunities?: string[]
    challenges?: string[]
  }
}

export function buildModuleContext(
  project: Project,
  moduleId: string,
  stepId: string
): AIContext {
  const currentModule = project.modules.find(m => m.id === moduleId)
  if (!currentModule) throw new Error("Module not found")

  // Get previous modules' key information
  const previousModules = project.modules
    .filter(m => m.completed && m.id !== moduleId)
    .map(m => ({
      id: m.id,
      title: m.title,
      keyPoints: extractKeyPoints(m),
      completed: m.completed
    }))

  // Get related responses from previous modules
  const relatedResponses = getRelatedResponses(project, moduleId, stepId)

  return {
    project: {
      industry: project.industry,
      stage: project.metadata.stage || "idea",
      marketSize: project.metadata.marketSize,
      targetCustomers: project.metadata.targetCustomers,
      businessModel: project.metadata.businessModel
    },
    module: {
      id: moduleId,
      title: currentModule.title,
      currentStep: stepId,
      progress: calculateModuleProgress(currentModule),
      previousResponses: currentModule.steps.reduce((acc, step) => ({
        ...acc,
        [step.id]: step.content
      }), {})
    },
    history: {
      previousModules,
      relatedResponses
    },
    market: getMarketContext(project.industry)
  }
}

function extractKeyPoints(module: ProjectModule): string[] {
  // Extract key information from module responses
  // Implementation depends on module structure
  return []
}

function getRelatedResponses(
  project: Project,
  moduleId: string,
  stepId: string
): Record<string, string> {
  // Find related responses based on step context
  return {}
}

function calculateModuleProgress(module: ProjectModule): number {
  const completedSteps = module.steps.filter(s => s.completed).length
  return (completedSteps / module.steps.length) * 100
}

function getMarketContext(industry: string) {
  // Fetch market context from database or external API
  return {}
} 