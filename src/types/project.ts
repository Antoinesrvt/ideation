export interface ProjectDocument {
  id: string
  moduleId: string
  stepId: string
  content: string
  lastUpdated: Date
  version: number
}

export interface ProjectModule {
  id: string
  title: string
  completed: boolean
  steps: {
    id: string
    title: string
    content: string
    completed: boolean
    lastUpdated: Date
  }[]
}

export interface Project {
  id: string
  title: string
  description: string
  industry: string
  createdAt: Date
  updatedAt: Date
  modules: ProjectModule[]
  documents: ProjectDocument[]
  metadata: {
    marketSize?: string
    targetCustomers?: string
    stage?: 'idea' | 'mvp' | 'growth'
    businessModel?: string
    // ... other metadata useful for AI context
  }
} 