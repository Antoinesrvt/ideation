import { ReactNode } from 'react';

export interface ValueMetrics {
  alignment: number;
  implementation: number;
  impact: number;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  impact: 'high' | 'medium' | 'low';
  examples: string[];
  metrics: ValueMetrics;
  category?: string;
  priority?: number;
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  color: string;
  size: number;
  needs: string[];
  painPoints: string[];
  channels: string[];
  marketSize: number;
  growthRate?: number;
  priority: number;
  buyingCriteria?: string[];
}

export interface CompletionMetrics {
  core: number;
  values: number;
  audience: number;
  overall: number;
  lastUpdated: string;
}

export interface BrandEssentialsData {
  name: string;
  tagline: string;
  mission: string;
  vision: string;
  values: ValueItem[];
  targetAudience: AudienceSegment[];
  uniqueValueProposition: string;
  completion: CompletionMetrics;
  lastModified?: string;
  version?: number;
}

export interface VisualIdentityData {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
    };
  };
  logo: {
    primary: string;
    alternative: string;
    favicon: string;
    spacing: string;
  };
  imagery: {
    style: string;
    examples: string[];
  };
}

export interface VoiceToneData {
  personality: string;
  tone: string;
  examples: Array<{
    context: string;
    good: string;
    bad: string;
  }>;
  wordChoices: {
    use: string[];
    avoid: string[];
  };
}

export interface AssetVersion {
  id: string;
  version: string;
  url: string;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

export interface BrandAsset {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  collection: string;
  url: string;
  thumbnailUrl: string;
  metadata: {
    dimensions?: string;
    fileSize: string;
    fileType: string;
    lastModified: string;
    version: string;
    tags: string[];
  };
  usageGuidelines: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canDownload: boolean;
  };
  versions: AssetVersion[];
}

export interface AssetCollection {
  id: string;
  name: string;
  description: string;
  assets: string[];
}

export interface BrandAssetsData {
  assets: BrandAsset[];
  collections: AssetCollection[];
  totalAssets: number;
  totalCollections: number;
}

export interface BrandGuidelinesData {
  logoUsage: string[];
  colorUsage: string[];
  typographyRules: string[];
  accessibilityRequirements: string[];
}

export interface BrandData {
  essentials: BrandEssentialsData;
  visual: VisualIdentityData;
  voice: VoiceToneData;
  brandAssets: BrandAssetsData;
  guidelines: BrandGuidelinesData;
}

export interface SectionProps {
  data: BrandEssentialsData;
  isEditing: boolean;
  onUpdate: (data: Partial<BrandEssentialsData>) => void;
  className?: string;
}

export interface EditableFieldProps {
  label: string;
  value: string;
  name: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  validation?: (value: string) => string | null;
  type?: 'input' | 'textarea';
  className?: string;
  required?: boolean;
  aiSuggestions?: boolean;
}

export interface VisualizationProps {
  data: BrandEssentialsData;
  className?: string;
}

export interface SectionHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  completion?: number;
  actions?: ReactNode;
  className?: string;
}

export type ActiveView = 'form' | 'connections' | 'audience' | 'funnel';

export interface BrandEssentialsProps {
  initialData: BrandEssentialsData;
  onSave?: (data: BrandEssentialsData) => Promise<void>;
  className?: string;
} 