import { JOURNEY_STAGES } from '../constants';

// Define the tools with their full details
const TOOL_DETAILS = {
  'business-model': {
    id: 'business-model',
    title: 'Business Model Canvas',
    description: 'Define your value proposition, customer segments, and revenue streams'
  },
  'product-design': {
    id: 'product-design',
    title: 'Product Design',
    description: 'Create your product specifications and user experience'
  },
  'market': {
    id: 'market',
    title: 'Market Research',
    description: 'Analyze market trends, size, and competition'
  },
  'validation': {
    id: 'validation',
    title: 'Customer Validation',
    description: 'Validate your assumptions with real customers'
  },
  'financials': {
    id: 'financials',
    title: 'Financial Planning',
    description: 'Create financial projections and analyze unit economics'
  },
  'team': {
    id: 'team',
    title: 'Team Structure',
    description: 'Define roles, responsibilities, and hiring plans'
  },
  'brand': {
    id: 'brand',
    title: 'Brand Identity',
    description: 'Develop your brand assets and messaging'
  },
  'documents': {
    id: 'documents',
    title: 'Key Documents',
    description: 'Prepare business plans, pitch decks, and legal documents'
  },
  // Decision support tools
  'venture_viability_radar': {
    id: 'venture_viability_radar',
    title: 'Venture Viability Radar',
    description: 'Assess your venture\'s viability across key dimensions',
    category: 'decision_support'
  },
  'go_no_go_framework': {
    id: 'go_no_go_framework',
    title: 'Go/No-Go Framework',
    description: 'Make data-driven decisions at critical points in your journey',
    category: 'decision_support'
  },
  'dependency_matrix': {
    id: 'dependency_matrix',
    title: 'Dependency Matrix',
    description: 'Visualize and manage dependencies between different aspects of your business',
    category: 'decision_support'
  },
  'decision_journal': {
    id: 'decision_journal',
    title: 'Decision Journal',
    description: 'Document and learn from your key decisions',
    category: 'decision_support'
  },
  'risk_assessment_dashboard': {
    id: 'risk_assessment_dashboard',
    title: 'Risk Assessment Dashboard',
    description: 'Identify and manage risks in your venture',
    category: 'decision_support'
  }
};

// Map validation criteria to the format expected by components
export function getValidationCriteria(stageId: string) {
  const stage = JOURNEY_STAGES.find(s => s.id === stageId);
  if (!stage || !stage.validationCriteria) return [];
  
  return stage.validationCriteria.map(criterion => ({
    id: criterion.id,
    label: criterion.name,
    description: `Target threshold: ${criterion.threshold * 100}%`,
    threshold: criterion.threshold,
    currentValue: Math.random() * criterion.threshold * 1.2, // Mock data - replace with real data
    unit: '%'
  }));
}

// Get adapted journey stages with expanded tool details
export function getAdaptedJourneyStages() {
  return JOURNEY_STAGES.map(stage => ({
    ...stage,
    tools: stage.tools.map(toolId => TOOL_DETAILS[toolId as keyof typeof TOOL_DETAILS]),
    recommendedFirst: typeof stage.recommendedFirst === 'string' 
      ? stage.recommendedFirst === 'true' 
      : Boolean(stage.recommendedFirst)
  }));
}

// Get a specific stage with expanded tool details
export function getStageWithExpandedTools(stageId: string) {
  const stage = JOURNEY_STAGES.find(s => s.id === stageId);
  if (!stage) return null;
  
  return {
    ...stage,
    tools: stage.tools.map(toolId => TOOL_DETAILS[toolId as keyof typeof TOOL_DETAILS]),
    validationCriteria: getValidationCriteria(stageId)
  };
}

// Get the IDs of all available tools
export function getAllToolIds() {
  return Object.keys(TOOL_DETAILS);
}

// Get the details of a specific tool
export function getToolDetails(toolId: string) {
  return TOOL_DETAILS[toolId as keyof typeof TOOL_DETAILS];
}

// For any tool ID, find what stage it belongs to
export function findStageForTool(toolId: string): string | undefined {
  for (const stage of JOURNEY_STAGES) {
    if (stage.tools && stage.tools.includes(toolId)) {
      return stage.id;
    }
  }
  
  // Default mappings for decision support tools that may not be explicitly assigned
  const toolStageMap: Record<string, string> = {
    'venture_viability_radar': 'viability',
    'go_no_go_framework': 'validity',
    'dependency_matrix': 'create',
    'risk_assessment_dashboard': 'viability',
    'decision_journal': 'overview' // Decision journal is global
  };
  
  return toolStageMap[toolId];
}

// Convert string ID format (kebab-case) to display format (Title Case)
export function formatIdToDisplay(id: string) {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 