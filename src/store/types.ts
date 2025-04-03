import { Database } from '@/types/database';

// Database table types
export type TablesRow<T extends keyof Database['public']['Tables']> =
  Database["public"]["Tables"][T]["Row"];
// Define Insert types based on the Database types
export type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

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

// Interview System types
export type InterviewTemplate = TablesRow<'interview_templates'>;
export type InterviewInsight = TablesRow<'interview_insights'>;

// Product Design types
export type ProductWireframe = TablesRow<'product_wireframes'>;
export type ProductFeature = TablesRow<'product_features'>;
export type ProductJourneyStage = TablesRow<'product_journey_stages'>;
export type ProductJourneyAction = TablesRow<'product_journey_actions'>;
export type ProductJourneyPainPoint = TablesRow<'product_journey_pain_points'>;

// Product Development types
export type ProductProblem = TablesRow<'product_problems'>;
export type ProductSolution = TablesRow<'product_solutions'>;
export type ProductEvidence = TablesRow<'product_evidence'>;
export type ProductEvidenceLink = TablesRow<'product_evidence_links'>;
export type ProductMVP = TablesRow<'product_mvps'>;
export type ProductMVPFeature = TablesRow<'product_mvp_features'>;

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
export type ValidationRelationship = TablesRow<'validation_relationships'>;
export type ValidationInsight = TablesRow<'validation_insights'>;
export type ValidationDecision = TablesRow<'validation_decisions'>;
export type ValidationMilestone = TablesRow<'validation_milestones'>;

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

// Add Role Template and Project Role types
export type RoleTemplate = TablesRow<'role_templates'>;
export type ProjectRole = TablesRow<'project_roles'>;

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
    // Interview System
    interviewTemplates: InterviewTemplate[];
    interviewInsights: InterviewInsight[];
    // Product Design
    productWireframes: ProductWireframe[];
    productFeatures: ProductFeature[];
    productJourneyStages: ProductJourneyStage[];
    productJourneyActions: ProductJourneyAction[];
    productJourneyPainPoints: ProductJourneyPainPoint[];
    // Product Development
    productProblems: ProductProblem[];
    productSolutions: ProductSolution[];
    productEvidence: ProductEvidence[];
    productEvidenceLinks: ProductEvidenceLink[];
    productMVPs: ProductMVP[];
    productMVPFeatures: ProductMVPFeature[];
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
    validationRelationships: ValidationRelationship[];
    validationInsights: ValidationInsight[];
    validationDecisions: ValidationDecision[];
    validationMilestones: ValidationMilestone[];
    // Team
    teamMembers: TeamMember[];
    teamTasks: TeamTask[];
    teamResponsibilityMatrix: TeamResponsibilityMatrix[];
    projectRoles: ProjectRole[];
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
    // Interview System
    interviewTemplates: InterviewTemplate[];
    interviewInsights: InterviewInsight[];
    // Product Design
    productWireframes: ProductWireframe[];
    productFeatures: ProductFeature[];
    productJourneyStages: ProductJourneyStage[];
    productJourneyActions: ProductJourneyAction[];
    productJourneyPainPoints: ProductJourneyPainPoint[];
    // Product Development
    productProblems: ProductProblem[];
    productSolutions: ProductSolution[];
    productEvidence: ProductEvidence[];
    productEvidenceLinks: ProductEvidenceLink[];
    productMVPs: ProductMVP[];
    productMVPFeatures: ProductMVPFeature[];
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
    validationRelationships: ValidationRelationship[];
    validationInsights: ValidationInsight[];
    validationDecisions: ValidationDecision[];
    validationMilestones: ValidationMilestone[];
    // Team
    teamMembers: TeamMember[];
    teamTasks: TeamTask[];
    teamResponsibilityMatrix: TeamResponsibilityMatrix[];
    projectRoles: ProjectRole[];
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
  setCurrentData: (data: ProjectState["currentData"]) => void;
  setStagedData: (data: ProjectState["currentData"] | null) => void;
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
  updateMarketInterview: (
    id: string,
    updates: Partial<MarketInterview>
  ) => void;
  deleteMarketInterview: (id: string) => void;

  setMarketCompetitors: (competitors: MarketCompetitor[]) => void;
  addMarketCompetitor: (competitor: MarketCompetitor) => void;
  updateMarketCompetitor: (
    id: string,
    updates: Partial<MarketCompetitor>
  ) => void;
  deleteMarketCompetitor: (id: string) => void;

  setMarketTrends: (trends: MarketTrend[]) => void;
  addMarketTrend: (trend: MarketTrend) => void;
  updateMarketTrend: (id: string, updates: Partial<MarketTrend>) => void;
  deleteMarketTrend: (id: string) => void;

  // Interview System actions
  setInterviewTemplates: (templates: InterviewTemplate[]) => void;
  addInterviewTemplate: (template: InterviewTemplate) => void;
  updateInterviewTemplate: (id: string, updates: Partial<InterviewTemplate>) => void;
  deleteInterviewTemplate: (id: string) => void;

  setInterviewInsights: (insights: InterviewInsight[]) => void;
  addInterviewInsight: (insight: InterviewInsight) => void;
  updateInterviewInsight: (id: string, updates: Partial<InterviewInsight>) => void;
  deleteInterviewInsight: (id: string) => void;


  // Product Design actions
  setProductWireframes: (wireframes: ProductWireframe[]) => void;
  addProductWireframe: (wireframe: ProductWireframe) => void;
  updateProductWireframe: (
    id: string,
    updates: Partial<ProductWireframe>
  ) => void;
  deleteProductWireframe: (id: string) => void;

  setProductFeatures: (features: ProductFeature[]) => void;
  addProductFeature: (feature: ProductFeature) => void;
  updateProductFeature: (id: string, updates: Partial<ProductFeature>) => void;
  deleteProductFeature: (id: string) => void;

  setProductJourneyStages: (stages: ProductJourneyStage[]) => void;
  addProductJourneyStage: (stage: ProductJourneyStage) => void;
  updateProductJourneyStage: (
    id: string,
    updates: Partial<ProductJourneyStage>
  ) => void;
  deleteProductJourneyStage: (id: string) => void;

  setProductJourneyActions: (actions: ProductJourneyAction[]) => void;
  addProductJourneyAction: (action: ProductJourneyAction) => void;
  updateProductJourneyAction: (
    id: string,
    updates: Partial<ProductJourneyAction>
  ) => void;
  deleteProductJourneyAction: (id: string) => void;

  setProductJourneyPainPoints: (painPoints: ProductJourneyPainPoint[]) => void;
  addProductJourneyPainPoint: (painPoint: ProductJourneyPainPoint) => void;
  updateProductJourneyPainPoint: (
    id: string,
    updates: Partial<ProductJourneyPainPoint>
  ) => void;
  deleteProductJourneyPainPoint: (id: string) => void;

  // Product Development actions
  setProductProblems: (problems: ProductProblem[]) => void;
  addProductProblem: (problem: ProductProblem) => void;
  updateProductProblem: (id: string, updates: Partial<ProductProblem>) => void;
  deleteProductProblem: (id: string) => void;

  setProductSolutions: (solutions: ProductSolution[]) => void;
  addProductSolution: (solution: ProductSolution) => void;
  updateProductSolution: (
    id: string,
    updates: Partial<ProductSolution>
  ) => void;
  deleteProductSolution: (id: string) => void;

  setProductEvidence: (evidence: ProductEvidence[]) => void;
  addProductEvidence: (evidence: ProductEvidence) => void;
  updateProductEvidence: (
    id: string,
    updates: Partial<ProductEvidence>
  ) => void;
  deleteProductEvidence: (id: string) => void;

  setProductEvidenceLinks: (links: ProductEvidenceLink[]) => void;
  addProductEvidenceLink: (link: ProductEvidenceLink) => void;
  updateProductEvidenceLink: (
    id: string,
    updates: Partial<ProductEvidenceLink>
  ) => void;
  deleteProductEvidenceLink: (id: string) => void;

  setProductMVPs: (mvps: ProductMVP[]) => void;
  addProductMVP: (mvp: ProductMVP) => void;
  updateProductMVP: (id: string, updates: Partial<ProductMVP>) => void;
  deleteProductMVP: (id: string) => void;

  setProductMVPFeatures: (features: ProductMVPFeature[]) => void;
  addProductMVPFeature: (feature: ProductMVPFeature) => void;
  updateProductMVPFeature: (
    id: string,
    updates: Partial<ProductMVPFeature>
  ) => void;
  deleteProductMVPFeature: (id: string) => void;

  // Financial actions
  setFinancialRevenueStreams: (streams: FinancialRevenueStream[]) => void;
  addFinancialRevenueStream: (stream: FinancialRevenueStream) => void;
  updateFinancialRevenueStream: (
    id: string,
    updates: Partial<FinancialRevenueStream>
  ) => void;
  deleteFinancialRevenueStream: (id: string) => void;

  setFinancialCostStructure: (costs: FinancialCostStructure[]) => void;
  addFinancialCostStructure: (cost: FinancialCostStructure) => void;
  updateFinancialCostStructure: (
    id: string,
    updates: Partial<FinancialCostStructure>
  ) => void;
  deleteFinancialCostStructure: (id: string) => void;

  setFinancialPricingStrategies: (
    strategies: FinancialPricingStrategy[]
  ) => void;
  addFinancialPricingStrategy: (strategy: FinancialPricingStrategy) => void;
  updateFinancialPricingStrategy: (
    id: string,
    updates: Partial<FinancialPricingStrategy>
  ) => void;
  deleteFinancialPricingStrategy: (id: string) => void;

  setFinancialProjections: (projections: FinancialProjection[]) => void;
  addFinancialProjection: (projection: FinancialProjection) => void;
  updateFinancialProjection: (
    id: string,
    updates: Partial<FinancialProjection>
  ) => void;
  deleteFinancialProjection: (id: string) => void;

  // Validation actions
  setValidationExperiments: (experiments: ValidationExperiment[]) => void;
  addValidationExperiment: (experiment: ValidationExperiment) => void;
  updateValidationExperiment: (
    id: string,
    updates: Partial<ValidationExperiment>
  ) => void;
  deleteValidationExperiment: (id: string) => void;
  setValidationRelationships: (relationships: ValidationRelationship[]) => void;
  setValidationInsights: (insights: ValidationInsight[]) => void;
  setValidationDecisions: (decisions: ValidationDecision[]) => void;
  setValidationMilestones: (milestones: ValidationMilestone[]) => void;

  setValidationABTests: (tests: ValidationABTest[]) => void;
  addValidationABTest: (test: ValidationABTest) => void;
  updateValidationABTest: (
    id: string,
    updates: Partial<ValidationABTest>
  ) => void;
  deleteValidationABTest: (id: string) => void;

  setValidationUserFeedback: (feedback: ValidationUserFeedback[]) => void;
  addValidationUserFeedback: (feedback: ValidationUserFeedback) => void;
  updateValidationUserFeedback: (
    id: string,
    updates: Partial<ValidationUserFeedback>
  ) => void;
  deleteValidationUserFeedback: (id: string) => void;

  setValidationHypotheses: (hypotheses: ValidationHypothesis[]) => void;
  addValidationHypothesis: (hypothesis: ValidationHypothesis) => void;
  updateValidationHypothesis: (
    id: string,
    updates: Partial<ValidationHypothesis>
  ) => void;
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
  updateTeamResponsibilityMatrix: (
    id: string,
    updates: Partial<TeamResponsibilityMatrix>
  ) => void;
  deleteTeamResponsibilityMatrix: (id: string) => void;

  // Document actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  setDocumentCollaborators: (collaborators: DocumentCollaborator[]) => void;
  addDocumentCollaborator: (collaborator: DocumentCollaborator) => void;
  updateDocumentCollaborator: (
    id: string,
    updates: Partial<DocumentCollaborator>
  ) => void;
  deleteDocumentCollaborator: (id: string) => void;

  // Cross-feature actions
  setNotifications: (notifications: ProjectNotification[]) => void;
  addNotification: (notification: ProjectNotification) => void;
  updateNotification: (
    id: string,
    updates: Partial<ProjectNotification>
  ) => void;
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

  // Project Roles actions
  setProjectRoles: (roles: ProjectRole[]) => void;
  addProjectRole: (role: ProjectRole) => void;
  updateProjectRole: (id: string, updates: Partial<ProjectRole>) => void;
  deleteProjectRole: (id: string) => void;
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
  // Interview System
  interviewTemplates?: FeatureDiff;
  interviewInsights?: FeatureDiff;
  interviewQuestions?: FeatureDiff;
  // Product Design
  productWireframes?: FeatureDiff;
  productFeatures?: FeatureDiff;
  productJourneyStages?: FeatureDiff;
  productJourneyActions?: FeatureDiff;
  productJourneyPainPoints?: FeatureDiff;
  // Product Development
  productProblems?: FeatureDiff;
  productSolutions?: FeatureDiff;
  productEvidence?: FeatureDiff;
  productEvidenceLinks?: FeatureDiff;
  productMVPs?: FeatureDiff;
  productMVPFeatures?: FeatureDiff;
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
  validationRelationships?: FeatureDiff;
  validationInsights?: FeatureDiff;
  validationDecisions?: FeatureDiff;
  validationMilestones?: FeatureDiff;
  // Team
  teamMembers?: FeatureDiff;
  teamTasks?: FeatureDiff;
  teamResponsibilityMatrix?: FeatureDiff;
  projectRoles?: FeatureDiff;
  roleTemplates?: FeatureDiff;
  // Documents
  documents?: FeatureDiff;
  documentCollaborators?: FeatureDiff;
  // Cross-feature
  notifications?: FeatureDiff;
  relatedItems?: FeatureDiff;
  projectTags?: FeatureDiff;
  featureItemTags?: FeatureDiff;
}

// Optimistic update types
export type OptimisticOperation = 'create' | 'update' | 'delete';

export interface OptimisticItem<T> {
  id: string;
  isOptimistic: boolean;
  pendingOperation: OptimisticOperation;
  data: T;
  originalId?: string; // For tracking updates to existing items
  tableName: string;
}

export interface OptimisticItemsState {
  // Key is the temporary ID for optimistic items
  [id: string]: OptimisticItem<any>;
}

export interface OptimisticStoreActions {
  // Add an optimistic item that will be replaced with the real item after API call
  addOptimisticItem: <T extends object>(
    tempId: string, 
    tableName: string, 
    data: T, 
    operation: OptimisticOperation
  ) => void;
  
  // Replace a temporary optimistic item with the real one from the server
  replaceOptimisticItem: <T extends object>(
    tempId: string, 
    realItem: T
  ) => void;
  
  // Remove an optimistic item (e.g., on error)
  removeOptimisticItem: (
    tempId: string
  ) => void;
  
  // Get a list of all optimistic items
  getOptimisticItems: () => OptimisticItemsState;
  
  // Check if an item is an optimistic one
  isOptimisticItem: (id: string) => boolean;
  
  // Helper to map table names to feature keys
  getFeatureKeyFromTable: (tableName: string) => keyof ProjectState['currentData'] | null;
}

export type ProjectStore = ProjectState & ProjectActions & OptimisticStoreActions & {
  comparisonMode: boolean;
  diffMetadata: DiffMetadata;
  
  // Diff tracking
  calculateDiff: () => void;
  getItemChangeType: (feature: keyof ProjectState['currentData'], id: string) => ChangeType;
  applySelectedChanges: (changeSelections: Record<string, boolean>) => void;
  discardSelectedChanges: (changeSelections: Record<string, boolean>) => void;
}; 