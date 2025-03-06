import { MarketPersona, MarketInterview, MarketCompetitor, MarketTrend } from '@/store/types';

// Extended types for UI that add status for comparison mode
export interface ExtendedMarketPersona extends MarketPersona {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

export interface ExtendedMarketInterview extends MarketInterview {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

export interface ExtendedMarketCompetitor extends MarketCompetitor {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

export interface ExtendedMarketTrend extends MarketTrend {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

// Define UI data structure
export interface MarketAnalysisUIData {
  personas: ExtendedMarketPersona[];
  interviews: ExtendedMarketInterview[];
  competitors: ExtendedMarketCompetitor[];
  trends: ExtendedMarketTrend[];
}

// Component Props Types
export interface CustomerPersonaCardProps {
  persona: ExtendedMarketPersona;
  onEdit?: (id: string) => void;
  onUpdate?: (params: { id: string; data: Partial<Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export interface CustomerInterviewCardProps {
  interview: ExtendedMarketInterview;
  onEdit?: (id: string) => void;
  onUpdate?: (params: { id: string; data: Partial<Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export interface CompetitorTableProps {
  competitors: ExtendedMarketCompetitor[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onUpdate?: (params: { id: string; data: Partial<Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export interface MarketTrendCardProps {
  trend: ExtendedMarketTrend;
  onEdit?: (id: string) => void;
  onUpdate?: (params: { id: string; data: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

// Form Values Types
export interface PersonaFormValues {
  name: string;
  role: string;
  demographics: string;
  pain_points: string[];
  goals: string[];
}

export interface InterviewFormValues {
  name: string;
  company: string;
  interview_date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  notes: string;
  key_insights: string[];
  tags: string[];
}

export interface CompetitorFormValues {
  name: string;
  website: string;
  strengths: string[];
  weaknesses: string[];
  price: string;
  market_share: string;
  notes: string;
}

export interface TrendFormValues {
  name: string;
  direction: 'upward' | 'downward' | 'stable';
  trend_type: 'opportunity' | 'threat' | 'neutral';
  description: string;
  tags: string[];
  sources: string[];
} 