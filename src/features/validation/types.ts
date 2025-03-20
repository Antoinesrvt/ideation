import type { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis,
} from '@/store/types';
import type { Database } from '@/types/database';



// Results types
export interface ExperimentResults {
  success: boolean;
  sampleSize: number;
  conversionRate: number;
  pValue: number;
  notes: string;
}

export interface ABTestResults {
  sampleSize: number;
  conversionA: number;
  conversionB: number;
  confidence: number;
  winner: 'A' | 'B' | 'inconclusive';
  improvement: number;
}

export interface FeedbackAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  impact: 'high' | 'medium' | 'low';
  tags: string[];
  response: string;
  responseTime: number;
}

// Enhanced types that include results
export interface EnhancedValidationExperiment extends Omit<ValidationExperiment, 'results' | 'metrics' | 'learnings'> {
  results: ExperimentResults | null;
  metrics: Array<{
    key: string;
    target: number;
    actual: number;
  }> | null;
  learnings: string | null;
  hypothesis: string | null;
}

export interface EnhancedValidationABTest extends Omit<ValidationABTest, 'results'> {
  results: ABTestResults | null;
  experimentId: string | null;
}

export interface EnhancedValidationUserFeedback extends Omit<ValidationUserFeedback, 'analysis'> {
  analysis: FeedbackAnalysis | null;
  entityId: string | null;
  entityType: string | null;
  sentimentScore: number;
}

// Enhanced validation data type
export interface EnhancedValidationData {
  experiments: EnhancedValidationExperiment[];
  abTests: EnhancedValidationABTest[];
  userFeedback: EnhancedValidationUserFeedback[];
  hypotheses: ValidationHypothesis[];
  // New relationship data
  relationships?: ValidationRelationship[];
  insights?: ValidationInsight[];
  decisions?: ValidationDecision[];
  milestones?: ValidationMilestone[];
}

// Validation metrics type
export interface ValidationMetrics {
  hypotheses: {
    total: number;
    validated: number;
    invalidated: number;
    validationRate: number;
  };
  experiments: {
    total: number;
    completed: number;
    inProgress: number;
    successRate: number;
    avgDuration: number;
  };
  abTests: {
    total: number;
    completed: number;
    running: number;
    avgImprovement: number;
    avgConfidence: number;
  };
  userFeedback: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    sentimentScore: number;
    avgResponseTime?: number;
    implementationRate?: number;
  };
}

// Theme configuration for status colors
export const statusTheme = {
  validated: 'success',
  invalidated: 'destructive',
  planned: 'default',
  'in-progress': 'warning',
  running: 'warning',
  completed: 'success',
  cancelled: 'destructive',
  new: 'default',
  'in-review': 'warning',
  accepted: 'success',
  rejected: 'destructive',
  implemented: 'success',
} as const;

export type ValidationStatus = keyof typeof statusTheme;
export type StatusBadgeVariant = (typeof statusTheme)[ValidationStatus];

// Validation relationship types
export interface ValidationRelationship {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  relationshipType: 'supports' | 'contradicts' | 'related';
  strength: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Validation insight types
export interface ValidationInsight {
  id: string;
  title: string;
  description: string;
  sourceIds: string[];
  sourceTypes: string[];
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  tags: string[];
  status: 'draft' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Validation decision types
export interface ValidationDecision {
  id: string;
  title: string;
  description: string;
  insightIds: string[];
  decision: 'proceed' | 'pivot' | 'stop' | 'iterate';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  nextSteps: string[];
  status: 'pending' | 'approved' | 'implemented' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Validation milestone types
export interface ValidationMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'hypothesis' | 'experiment' | 'abTest' | 'feedback' | 'insight' | 'decision';
  entityId: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Validation Journey types
export interface ValidationPhase {
  id: string;
  name: string;
  description: string;
  icon: 'lightbulb' | 'beaker' | 'split' | 'message' | 'chart' | 'bulb' | 'check';
  order: number;
  isActive: boolean;
  isCompleted: boolean;
  milestones?: ValidationMilestone[];
}

export interface ValidationJourneyState {
  activePhase: string;
  phases: ValidationPhase[];
  progress: number;
}

// Component props types
export interface ValidationJourneyMapProps {
  journey: ValidationJourneyState;
  onPhaseChange: (phaseId: string) => void;
  className?: string;
}

export interface ValidationPhaseCardProps {
  phase: ValidationPhase;
  isActive: boolean;
  onActivate: (phaseId: string) => void;
}

export interface InsightBoardProps {
  insights: ValidationInsight[];
  onAddInsight: (insight: Partial<ValidationInsight>) => void;
  onUpdateInsight: (id: string, insight: Partial<ValidationInsight>) => void;
  groupBy?: 'actionability' | 'impact' | 'status';
}

export interface DecisionFrameworkProps {
  validatedHypotheses: ValidationHypothesis[];
  invalidatedHypotheses: ValidationHypothesis[];
  pendingHypotheses: ValidationHypothesis[];
  decisions: ValidationDecision[];
  onCreateDecision: (decision: Partial<ValidationDecision>) => void;
  onImplementDecision: (id: string) => void;
}

export interface HypothesisValidationTrackerProps {
  hypothesis: ValidationHypothesis;
  linkedExperiments: EnhancedValidationExperiment[];
  linkedTests: EnhancedValidationABTest[];
  linkedFeedback: EnhancedValidationUserFeedback[];
  validationStatus: {
    isValidated: boolean;
    progress: number;
    confidence: number;
  };
  onAddExperiment: () => void;
  onViewResults: () => void;
}

export interface ResultsDashboardProps {
  data: any;
  isLoading: boolean;
} 