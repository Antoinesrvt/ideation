import { TeamData } from '@/features/team/components/TeamManagement';
import { FinancialData } from '@/features/financials/components/FinancialProjections';

// Project Types
export interface Project {
  id: string;
  name: string;
  lastEdited: string;
  completion: number;
}

export interface ProjectDetails extends Project {
  canvas: BusinessModelCanvas;
  grpModel?: GRPModel;
  marketAnalysis?: MarketAnalysis;
  userFlow?: UserFlow;
  financialProjections?: FinancialData;
  team?: TeamData;
  validation?: ValidationData;
  documents?: Document[];
}


// Business Model Canvas Types
export interface BusinessModelCanvas {
  keyPartners: CanvasItem[];
  keyActivities: CanvasItem[];
  valuePropositions: CanvasItem[];
  customerSegments: CanvasItem[];
  channels: CanvasItem[];
  costStructure: CanvasItem[];
  revenueStreams: CanvasItem[];
  keyResources?: CanvasItem[];
  customerRelationships?: CanvasItem[];
}

export interface CanvasItem {
  id: string;
  text: string;
  checked?: boolean;
}

// GRP Model Types
export interface GRPModel {
  generation: {
    porteurs: GRPItem[];
    propositionValeur: GRPItem[];
    fabricationValeur: GRPItem[];
  };
  remuneration: {
    sourcesRevenus: GRPItem[];
    volumeRevenus: GRPItem[];
    performance: GRPItem[];
  };
  partage: {
    partiesPrenantes: GRPItem[];
    conventions: GRPItem[];
    ecosysteme: GRPItem[];
  };
}

export interface GRPItem {
  id: string;
  title: string;
  description: string;
  percentage?: number;
}

// Market Analysis Types
export interface MarketAnalysis {
  customerInsights: {
    personas: CustomerPersona[];
    interviews: CustomerInterview[];
  };
  competitors: Competitor[];
  trends: MarketTrend[];
}

export interface CustomerPersona {
  id: string;
  name: string;
  role: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
}

export interface CustomerInterview {
  id: string;
  name: string;
  company: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  notes: string;
}

export interface Competitor {
  id: string;
  name: string;
  strengths: string[];
  weaknesses: string[];
  price: string;
}

export interface MarketTrend {
  id: string;
  name: string;
  direction: 'upward' | 'downward' | 'stable';
  type: 'opportunity' | 'threat' | 'neutral';
  description: string;
  tags: string[];
}

// User Flow Types
export interface UserFlow {
  wireframes: Wireframe[];
  features: Feature[];
  journey: UserJourney;
}

export interface Wireframe {
  id: string;
  name: string;
  createdAt: string;
  imageUrl?: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'planned' | 'in-progress' | 'completed';
  tags: string[];
}

export interface UserJourney {
  stages: JourneyStage[];
}

export interface JourneyStage {
  id: string;
  name: string;
  description: string;
  actions: string[];
  painPoints: {
    issue: string;
    solution: string;
  }[];
  completed: boolean;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: 'business-plan' | 'pitch-deck' | 'financial-projections';
  url: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Validation Types
export interface Experiment {
  id: string;
  title: string;
  description: string;
  hypothesis: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  results?: string;
  learnings?: string;
  metrics: {
    key: string;
    target: string;
    actual?: string;
  }[];
}

export interface ABTest {
  id: string;
  title: string;
  description: string;
  variantA: string;
  variantB: string;
  metric: string;
  status: 'planned' | 'running' | 'completed';
  startDate?: string;
  endDate?: string;
  sampleSize?: number;
  conversionA?: number;
  conversionB?: number;
  confidence?: number;
  winner?: 'A' | 'B' | 'inconclusive';
  notes?: string;
}

export interface UserFeedback {
  id: string;
  source: string;
  date: string;
  type: 'feature-request' | 'bug-report' | 'testimonial' | 'criticism' | 'suggestion';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impact: 'low' | 'medium' | 'high';
  status: 'new' | 'in-review' | 'accepted' | 'rejected' | 'implemented';
  response?: string;
  tags: string[];
}

export interface Hypothesis {
  id: string;
  statement: string;
  assumptions: string[];
  validationMethod: string;
  status: 'unvalidated' | 'validated' | 'invalidated';
  confidence: number;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationData {
  experiments: Experiment[];
  abTests: ABTest[];
  userFeedback: UserFeedback[];
  hypotheses: Hypothesis[];
}