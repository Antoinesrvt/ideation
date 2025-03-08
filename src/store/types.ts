import { Database } from '@/types/database';

// Database table types
type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Project types
export type Project = TablesRow<'projects'>;

// Business Model Canvas types
export type CanvasSection = TablesRow<'canvas_sections'>;
export type CanvasItem = TablesRow<'canvas_items'>;

// GRP Model types
export type GrpCategory = TablesRow<'grp_categories'>;
export type GrpSection = TablesRow<'grp_sections'>;
export type GrpItem = TablesRow<'grp_items'>;

// Market Analysis types
export type MarketPersona = TablesRow<'market_personas'>;
export type MarketInterview = TablesRow<'market_interviews'>;
export type MarketCompetitor = TablesRow<'market_competitors'>;
export type MarketTrend = TablesRow<'market_trends'>;

// Product Design types
export type ProductWireframe = TablesRow<'product_wireframes'>;
export type ProductFeature = TablesRow<'product_features'>;
export type ProductJourneyStage = TablesRow<'product_journey_stages'>;
export type ProductJourneyAction = TablesRow<'product_journey_actions'>;
export type ProductJourneyPainPoint = TablesRow<'product_journey_pain_points'>;

// Financial types
export type FinancialRevenueStream = TablesRow<'financial_revenue_streams'>;
export type FinancialCostStructure = TablesRow<'financial_cost_structure'>;
export type FinancialPricingStrategy = TablesRow<'financial_pricing_strategies'>;
export type FinancialProjection = TablesRow<'financial_projections'>;

// Validation types
export type ValidationExperiment = TablesRow<'validation_experiments'>;
export type ValidationABTest = TablesRow<'validation_ab_tests'>;
export type ValidationUserFeedback = TablesRow<'validation_user_feedback'>;
export type ValidationHypothesis = TablesRow<'validation_hypotheses'>;

// Team types
export type TeamMember = TablesRow<'team_members'>;
export type TeamTask = TablesRow<'team_tasks'>;
export type TeamResponsibilityMatrix = TablesRow<'team_responsibility_matrix'>;

// Document types
export type Document = TablesRow<'documents'>;
export type DocumentCollaborator = TablesRow<'document_collaborators'>;

// Cross-feature types
export type ProjectNotification = TablesRow<'project_notifications'>;
export type RelatedItem = TablesRow<'related_items'>;
export type ProjectTag = TablesRow<'project_tags'>;
export type FeatureItemTag = TablesRow<'feature_item_tags'>;

// RACI Matrix types
export type RACIRole = 'R' | 'A' | 'C' | 'I' | '';

export interface RACIMatrixData {
  [memberId: string]: RACIRole;
}

// Enhanced version of TeamResponsibilityMatrix with typed raci_matrix
export interface EnhancedTeamResponsibilityMatrix extends TeamResponsibilityMatrix {
  raci_matrix: RACIMatrixData;
}

// Store state types
export interface ProjectState {
  currentData: {
    project: Project | null;
    // Business Model Canvas
    canvasSections: CanvasSection[];
    canvasItems: CanvasItem[];
    // GRP Model
    grpCategories: GrpCategory[];
    grpSections: GrpSection[];
    grpItems: GrpItem[];
    // Market Analysis
    marketPersonas: MarketPersona[];
    marketInterviews: MarketInterview[];
    marketCompetitors: MarketCompetitor[];
    marketTrends: MarketTrend[];
    // Product Design
    productWireframes: ProductWireframe[];
    productFeatures: ProductFeature[];
    productJourneyStages: ProductJourneyStage[];
    productJourneyActions: ProductJourneyAction[];
    productJourneyPainPoints: ProductJourneyPainPoint[];
    // Financial
    financialRevenueStreams: FinancialRevenueStream[];
    financialCostStructure: FinancialCostStructure[];
    financialPricingStrategies: FinancialPricingStrategy[];
    financialProjections: FinancialProjection[];
    // Validation
    validationExperiments: ValidationExperiment[];
    validationABTests: ValidationABTest[];
    validationUserFeedback: ValidationUserFeedback[];
    validationHypotheses: ValidationHypothesis[];
    // Team
    teamMembers: TeamMember[];
    teamTasks: TeamTask[];
    teamResponsibilityMatrix: TeamResponsibilityMatrix[];
    // Documents
    documents: Document[];
    documentCollaborators: DocumentCollaborator[];
    // Cross-feature
    notifications: ProjectNotification[];
    relatedItems: RelatedItem[];
    projectTags: ProjectTag[];
    featureItemTags: FeatureItemTag[];
  };
  stagedData: {
    project: Project | null;
    // Business Model Canvas
    canvasSections: CanvasSection[];
    canvasItems: CanvasItem[];
    // GRP Model
    grpCategories: GrpCategory[];
    grpSections: GrpSection[];
    grpItems: GrpItem[];
    // Market Analysis
    marketPersonas: MarketPersona[];
    marketInterviews: MarketInterview[];
    marketCompetitors: MarketCompetitor[];
    marketTrends: MarketTrend[];
    // Product Design
    productWireframes: ProductWireframe[];
    productFeatures: ProductFeature[];
    productJourneyStages: ProductJourneyStage[];
    productJourneyActions: ProductJourneyAction[];
    productJourneyPainPoints: ProductJourneyPainPoint[];
    // Financial
    financialRevenueStreams: FinancialRevenueStream[];
    financialCostStructure: FinancialCostStructure[];
    financialPricingStrategies: FinancialPricingStrategy[];
    financialProjections: FinancialProjection[];
    // Validation
    validationExperiments: ValidationExperiment[];
    validationABTests: ValidationABTest[];
    validationUserFeedback: ValidationUserFeedback[];
    validationHypotheses: ValidationHypothesis[];
    // Team
    teamMembers: TeamMember[];
    teamTasks: TeamTask[];
    teamResponsibilityMatrix: TeamResponsibilityMatrix[];
    // Documents
    documents: Document[];
    documentCollaborators: DocumentCollaborator[];
    // Cross-feature
    notifications: ProjectNotification[];
    relatedItems: RelatedItem[];
    projectTags: ProjectTag[];
    featureItemTags: FeatureItemTag[];
  } | null;
  isLoading: boolean;
  error: Error | null;
  comparisonMode: boolean;
}

export interface ProjectActions {

  // Core actions
  setCurrentData: (data: ProjectState['currentData']) => void;
  setStagedData: (data: ProjectState['currentData'] | null) => void;
  setComparisonMode: (enabled: boolean) => void;
  commitStagedChanges: () => void;
  discardStagedChanges: () => void;
  
  // Project actions
  setProject: (project: Project | null) => void;
  updateProject: (updates: Partial<Project>) => void;
  
  // Business Model Canvas actions
  setCanvasSections: (sections: CanvasSection[]) => void;
  addCanvasSection: (section: CanvasSection) => void;
  updateCanvasSection: (id: string, updates: Partial<CanvasSection>) => void;
  deleteCanvasSection: (id: string) => void;
  
  setCanvasItems: (items: CanvasItem[]) => void;
  addCanvasItem: (item: CanvasItem) => void;
  updateCanvasItem: (id: string, updates: Partial<CanvasItem>) => void;
  deleteCanvasItem: (id: string) => void;
  
  // GRP Model actions
  setGrpCategories: (categories: GrpCategory[]) => void;
  addGrpCategory: (category: GrpCategory) => void;
  updateGrpCategory: (id: string, updates: Partial<GrpCategory>) => void;
  deleteGrpCategory: (id: string) => void;
  
  setGrpSections: (sections: GrpSection[]) => void;
  addGrpSection: (section: GrpSection) => void;
  updateGrpSection: (id: string, updates: Partial<GrpSection>) => void;
  deleteGrpSection: (id: string) => void;
  
  setGrpItems: (items: GrpItem[]) => void;
  addGrpItem: (item: GrpItem) => void;
  updateGrpItem: (id: string, updates: Partial<GrpItem>) => void;
  deleteGrpItem: (id: string) => void;
  
  // Market Analysis actions
  setMarketPersonas: (personas: MarketPersona[]) => void;
  addMarketPersona: (persona: MarketPersona) => void;
  updateMarketPersona: (id: string, updates: Partial<MarketPersona>) => void;
  deleteMarketPersona: (id: string) => void;
  
  setMarketInterviews: (interviews: MarketInterview[]) => void;
  addMarketInterview: (interview: MarketInterview) => void;
  updateMarketInterview: (id: string, updates: Partial<MarketInterview>) => void;
  deleteMarketInterview: (id: string) => void;
  
  setMarketCompetitors: (competitors: MarketCompetitor[]) => void;
  addMarketCompetitor: (competitor: MarketCompetitor) => void;
  updateMarketCompetitor: (id: string, updates: Partial<MarketCompetitor>) => void;
  deleteMarketCompetitor: (id: string) => void;
  
  setMarketTrends: (trends: MarketTrend[]) => void;
  addMarketTrend: (trend: MarketTrend) => void;
  updateMarketTrend: (id: string, updates: Partial<MarketTrend>) => void;
  deleteMarketTrend: (id: string) => void;
  
  // Product Design actions
  setProductWireframes: (wireframes: ProductWireframe[]) => void;
  addProductWireframe: (wireframe: ProductWireframe) => void;
  updateProductWireframe: (id: string, updates: Partial<ProductWireframe>) => void;
  deleteProductWireframe: (id: string) => void;
  
  setProductFeatures: (features: ProductFeature[]) => void;
  addProductFeature: (feature: ProductFeature) => void;
  updateProductFeature: (id: string, updates: Partial<ProductFeature>) => void;
  deleteProductFeature: (id: string) => void;
  
  setProductJourneyStages: (stages: ProductJourneyStage[]) => void;
  addProductJourneyStage: (stage: ProductJourneyStage) => void;
  updateProductJourneyStage: (id: string, updates: Partial<ProductJourneyStage>) => void;
  deleteProductJourneyStage: (id: string) => void;
  
  setProductJourneyActions: (actions: ProductJourneyAction[]) => void;
  addProductJourneyAction: (action: ProductJourneyAction) => void;
  updateProductJourneyAction: (id: string, updates: Partial<ProductJourneyAction>) => void;
  deleteProductJourneyAction: (id: string) => void;
  
  setProductJourneyPainPoints: (painPoints: ProductJourneyPainPoint[]) => void;
  addProductJourneyPainPoint: (painPoint: ProductJourneyPainPoint) => void;
  updateProductJourneyPainPoint: (id: string, updates: Partial<ProductJourneyPainPoint>) => void;
  deleteProductJourneyPainPoint: (id: string) => void;
  
  // Financial actions
  setFinancialRevenueStreams: (streams: FinancialRevenueStream[]) => void;
  addFinancialRevenueStream: (stream: FinancialRevenueStream) => void;
  updateFinancialRevenueStream: (id: string, updates: Partial<FinancialRevenueStream>) => void;
  deleteFinancialRevenueStream: (id: string) => void;
  
  setFinancialCostStructure: (costs: FinancialCostStructure[]) => void;
  addFinancialCostStructure: (cost: FinancialCostStructure) => void;
  updateFinancialCostStructure: (id: string, updates: Partial<FinancialCostStructure>) => void;
  deleteFinancialCostStructure: (id: string) => void;
  
  setFinancialPricingStrategies: (strategies: FinancialPricingStrategy[]) => void;
  addFinancialPricingStrategy: (strategy: FinancialPricingStrategy) => void;
  updateFinancialPricingStrategy: (id: string, updates: Partial<FinancialPricingStrategy>) => void;
  deleteFinancialPricingStrategy: (id: string) => void;
  
  setFinancialProjections: (projections: FinancialProjection[]) => void;
  addFinancialProjection: (projection: FinancialProjection) => void;
  updateFinancialProjection: (id: string, updates: Partial<FinancialProjection>) => void;
  deleteFinancialProjection: (id: string) => void;
  
  // Validation actions
  setValidationExperiments: (experiments: ValidationExperiment[]) => void;
  addValidationExperiment: (experiment: ValidationExperiment) => void;
  updateValidationExperiment: (id: string, updates: Partial<ValidationExperiment>) => void;
  deleteValidationExperiment: (id: string) => void;
  
  setValidationABTests: (tests: ValidationABTest[]) => void;
  addValidationABTest: (test: ValidationABTest) => void;
  updateValidationABTest: (id: string, updates: Partial<ValidationABTest>) => void;
  deleteValidationABTest: (id: string) => void;
  
  setValidationUserFeedback: (feedback: ValidationUserFeedback[]) => void;
  addValidationUserFeedback: (feedback: ValidationUserFeedback) => void;
  updateValidationUserFeedback: (id: string, updates: Partial<ValidationUserFeedback>) => void;
  deleteValidationUserFeedback: (id: string) => void;
  
  setValidationHypotheses: (hypotheses: ValidationHypothesis[]) => void;
  addValidationHypothesis: (hypothesis: ValidationHypothesis) => void;
  updateValidationHypothesis: (id: string, updates: Partial<ValidationHypothesis>) => void;
  deleteValidationHypothesis: (id: string) => void;
  
  // Team actions
  setTeamMembers: (members: TeamMember[]) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  
  setTeamTasks: (tasks: TeamTask[]) => void;
  addTeamTask: (task: TeamTask) => void;
  updateTeamTask: (id: string, updates: Partial<TeamTask>) => void;
  deleteTeamTask: (id: string) => void;
  
  setTeamResponsibilityMatrix: (matrix: TeamResponsibilityMatrix[]) => void;
  addTeamResponsibilityMatrix: (matrix: TeamResponsibilityMatrix) => void;
  updateTeamResponsibilityMatrix: (id: string, updates: Partial<TeamResponsibilityMatrix>) => void;
  deleteTeamResponsibilityMatrix: (id: string) => void;
  
  // Document actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  
  setDocumentCollaborators: (collaborators: DocumentCollaborator[]) => void;
  addDocumentCollaborator: (collaborator: DocumentCollaborator) => void;
  updateDocumentCollaborator: (id: string, updates: Partial<DocumentCollaborator>) => void;
  deleteDocumentCollaborator: (id: string) => void;
  
  // Cross-feature actions
  setNotifications: (notifications: ProjectNotification[]) => void;
  addNotification: (notification: ProjectNotification) => void;
  updateNotification: (id: string, updates: Partial<ProjectNotification>) => void;
  deleteNotification: (id: string) => void;
  
  setRelatedItems: (items: RelatedItem[]) => void;
  addRelatedItem: (item: RelatedItem) => void;
  updateRelatedItem: (id: string, updates: Partial<RelatedItem>) => void;
  deleteRelatedItem: (id: string) => void;
  
  setProjectTags: (tags: ProjectTag[]) => void;
  addProjectTag: (tag: ProjectTag) => void;
  updateProjectTag: (id: string, updates: Partial<ProjectTag>) => void;
  deleteProjectTag: (id: string) => void;
  
  setFeatureItemTags: (tags: FeatureItemTag[]) => void;
  addFeatureItemTag: (tag: FeatureItemTag) => void;
  updateFeatureItemTag: (id: string, updates: Partial<FeatureItemTag>) => void;
  deleteFeatureItemTag: (id: string) => void;
  
  // Version control actions
  stageChanges: () => void;
  commitChanges: () => void;
  discardChanges: () => void;
  toggleComparisonMode: () => void;
  
  // Loading and error states
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export type ChangeType = 'added' | 'modified' | 'deleted' | 'unchanged';

export interface ItemDiff {
  id: string;
  changeType: ChangeType;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface FeatureDiff {
  additions: string[]; // IDs of added items
  modifications: string[]; // IDs of modified items
  deletions: string[]; // IDs of deleted items
}

export interface DiffMetadata {
  // One diff object per feature
  project?: FeatureDiff;
  // Business Model Canvas
  canvasSections?: FeatureDiff;
  canvasItems?: FeatureDiff;
  // GRP Model
  grpCategories?: FeatureDiff;
  grpSections?: FeatureDiff;
  grpItems?: FeatureDiff;
  // Market Analysis
  marketPersonas?: FeatureDiff;
  marketInterviews?: FeatureDiff;
  marketCompetitors?: FeatureDiff;
  marketTrends?: FeatureDiff;
  // Product Design
  productWireframes?: FeatureDiff;
  productFeatures?: FeatureDiff;
  productJourneyStages?: FeatureDiff;
  productJourneyActions?: FeatureDiff;
  productJourneyPainPoints?: FeatureDiff;
  // Financial
  financialRevenueStreams?: FeatureDiff;
  financialCostStructure?: FeatureDiff;
  financialPricingStrategies?: FeatureDiff;
  financialProjections?: FeatureDiff;
  // Validation
  validationExperiments?: FeatureDiff;
  validationABTests?: FeatureDiff;
  validationUserFeedback?: FeatureDiff;
  validationHypotheses?: FeatureDiff;
  // Team
  teamMembers?: FeatureDiff;
  teamTasks?: FeatureDiff;
  teamResponsibilityMatrix?: FeatureDiff;
  // Documents
  documents?: FeatureDiff;
  documentCollaborators?: FeatureDiff;
  // Cross-feature
  notifications?: FeatureDiff;
  relatedItems?: FeatureDiff;
  projectTags?: FeatureDiff;
  featureItemTags?: FeatureDiff;
}

export interface ProjectStore extends ProjectState, ProjectActions {
  // UI state
  comparisonMode: boolean;
  
  // Diff metadata
  diffMetadata: DiffMetadata;
  
  // Change tracking actions
  calculateDiff: () => void;
  getItemChangeType: (feature: keyof ProjectState['currentData'], id: string) => ChangeType;
  
  // Selective change application
  applySelectedChanges: (changeSelections: Record<string, boolean>) => void;
  discardSelectedChanges: (changeSelections: Record<string, boolean>) => void;
} 