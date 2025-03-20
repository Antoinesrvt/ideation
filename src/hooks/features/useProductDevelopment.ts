import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { ProductDevelopmentService } from '@/lib/services/features/product-development.service';
import { useProjectStore } from '@/store';
import { 
  ProductProblem, 
  ProductSolution, 
  ProductEvidence, 
  ProductEvidenceLink, 
  ProductMVP,
  ProductMVPFeature,
  ProductFeature,
  ChangeType,
  Insert,
  Update
} from '@/store/types';
import { 
  useOptimisticCreate, 
  useOptimisticUpdate, 
  useOptimisticDelete 
} from '@/hooks/utils/optimistic-helpers';
import { productDevelopmentService } from '@/lib/services';

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function to check array equality
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  
  // Sort by ID if present
  const sortedA = [...a].sort((x: any, y: any) => 
    (x.id && y.id) ? x.id.localeCompare(y.id) : 0
  );
  const sortedB = [...b].sort((x: any, y: any) => 
    (x.id && y.id) ? x.id.localeCompare(y.id) : 0
  );
  
  // Simple comparison of stringified arrays (works for our case of objects with IDs)
  return JSON.stringify(sortedA) === JSON.stringify(sortedB);
}

// Add debounce helper function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T;
}

// Interface for the data returned by this hook
export interface ProductDevelopmentData {
  problems: ProductProblem[];
  solutions: ProductSolution[];
  evidence: ProductEvidence[];
  evidenceLinks: ProductEvidenceLink[];
  mvps: ProductMVP[];
  mvpFeatures: ProductMVPFeature[];
}

// Interface for the hook's return value
export interface UseProductDevelopmentReturn {
  data: ProductDevelopmentData;
  isLoading: boolean;
  error: Error | null;
  
  // Problems
  addProblem: (problem: Insert<'product_problems'>) => Promise<ProductProblem | null>;
  updateProblem: (params: { id: string; data: Update<'product_problems'> }) => Promise<ProductProblem | null>;
  deleteProblem: (id: string) => Promise<boolean>;
  
  // Solutions
  addSolution: (solution: Insert<'product_solutions'>) => Promise<ProductSolution | null>;
  updateSolution: (params: { id: string; data: Update<'product_solutions'> }) => Promise<ProductSolution | null>;
  deleteSolution: (id: string) => Promise<boolean>;
  
  // Evidence
  addEvidence: (evidence: Insert<'product_evidence'>) => Promise<ProductEvidence | null>;
  updateEvidence: (params: { id: string; data: Update<'product_evidence'> }) => Promise<ProductEvidence | null>;
  deleteEvidence: (id: string) => Promise<boolean>;
  
  // Evidence Links
  addEvidenceLink: (link: Insert<'product_evidence_links'>) => Promise<ProductEvidenceLink | null>;
  updateEvidenceLink: (params: { id: string; data: Update<'product_evidence_links'> }) => Promise<ProductEvidenceLink | null>;
  deleteEvidenceLink: (id: string) => Promise<boolean>;
  
  // MVPs
  addMVP: (mvp: Insert<'product_mvps'>) => Promise<ProductMVP | null>;
  updateMVP: (params: { id: string; data: Update<'product_mvps'> }) => Promise<ProductMVP | null>;
  deleteMVP: (id: string) => Promise<boolean>;
  
  // MVP Features
  addMVPFeature: (feature: Insert<'product_mvp_features'>) => Promise<ProductMVPFeature | null>;
  updateMVPFeature: (params: { id: string; data: Update<'product_mvp_features'> }) => Promise<ProductMVPFeature | null>;
  deleteMVPFeature: (id: string) => Promise<boolean>;
  
  // Helper methods to get specific entities
  getProblemsWithSolutions: () => Array<ProductProblem & { solutions: ProductSolution[] }>;
  getSolutionsWithFeatures: () => Array<ProductSolution & { features: ProductFeature[] }>;
  getEvidenceForEntity: (entityType: string, entityId: string) => ProductEvidence[];
  getMVPWithFeatures: (mvpId: string) => (ProductMVP & { features: ProductMVPFeature[] }) | null;
  
  // Diff helpers
  getProblemChangeType: (id: string) => ChangeType;
  getSolutionChangeType: (id: string) => ChangeType;
  getEvidenceChangeType: (id: string) => ChangeType;
  getEvidenceLinkChangeType: (id: string) => ChangeType;
  getMVPChangeType: (id: string) => ChangeType;
  getMVPFeatureChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;
}

// Helper function to retry failed database operations
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries === 0) {
      throw error;
    }
    console.warn(`Operation failed, retrying... (${maxRetries} attempts left)`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    return executeWithRetry(fn, maxRetries - 1, delay);
  }
}

// Define query keys for React Query
const queryKeys = {
  all: ['productDevelopment'] as const,
  problems: ['productDevelopment', 'problems'] as const,
  solutions: ['productDevelopment', 'solutions'] as const,
  evidence: ['productDevelopment', 'evidence'] as const,
  evidenceLinks: ['productDevelopment', 'evidenceLinks'] as const,
  mvps: ['productDevelopment', 'mvps'] as const,
  mvpFeatures: ['productDevelopment', 'mvpFeatures'] as const,
};

// The main hook function
export function useProductDevelopment(projectId: string | undefined): UseProductDevelopmentReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [isSubmitting, setSubmitting] = useState(false);
  
  // State for error
  const [error, setError] = useState<Error | null>(null);
  
  // Set up optimistic helpers with correct parameters
  const addProblemOptimistic = useOptimisticCreate<'product_problems'>({
    projectId,
    tableName: 'product_problems',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.problems],
    setSubmitting,
    methods: {
      add: 'createProblem'
    }
  });
  
  const updateProblemOptimistic = useOptimisticUpdate<'product_problems'>({
    tableName: 'product_problems',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.problems],
    setSubmitting,
    methods: {
      update: 'updateProblem'
    }
  });
  
  const deleteProblemOptimistic = useOptimisticDelete({
    tableName: 'product_problems',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.problems],
    setSubmitting,
    methods: {
      delete: 'deleteProblem'
    }
  });
  
  const addSolutionOptimistic = useOptimisticCreate<'product_solutions'>({
    projectId,
    tableName: 'product_solutions',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.solutions],
    setSubmitting,
    methods: {
      add: 'createSolution'
    }
  });
  
  const updateSolutionOptimistic = useOptimisticUpdate<'product_solutions'>({
    tableName: 'product_solutions',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.solutions],
    setSubmitting,
    methods: {
      update: 'updateSolution'
    }
  });
  
  const deleteSolutionOptimistic = useOptimisticDelete({
    tableName: 'product_solutions',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.solutions],
    setSubmitting,
    methods: {
      delete: 'deleteSolution'
    }
  });
  
  const addEvidenceOptimistic = useOptimisticCreate<'product_evidence'>({
    projectId,
    tableName: 'product_evidence',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.evidence],
    setSubmitting,
    methods: {
      add: 'createEvidence'
    }
  });
  
  const updateEvidenceOptimistic = useOptimisticUpdate<'product_evidence'>({
    tableName: 'product_evidence',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.evidence],
    setSubmitting,
    methods: {
      update: 'updateEvidence'
    }
  });
  
  const deleteEvidenceOptimistic = useOptimisticDelete({
    tableName: 'product_evidence',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.evidence],
    setSubmitting,
    methods: {
      delete: 'deleteEvidence'
    }
  });
  
  const addEvidenceLinkOptimistic = useOptimisticCreate<'product_evidence_links'>({
    projectId,
    tableName: 'product_evidence_links',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.evidenceLinks],
    setSubmitting,
    methods: {
      add: 'createEvidenceLink'
    }
  });
  
  const updateEvidenceLinkOptimistic = useOptimisticUpdate<'product_evidence_links'>({
    tableName: 'product_evidence_links',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.evidenceLinks],
    setSubmitting,
    methods: {
      update: 'updateEvidenceLink'
    }
  });
  
  const deleteEvidenceLinkOptimistic = useOptimisticDelete({
    tableName: 'product_evidence_links',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.evidenceLinks],
    setSubmitting,
    methods: {
      delete: 'deleteEvidenceLink'
    }
  });
  
  const addMVPOptimistic = useOptimisticCreate<'product_mvps'>({
    projectId,
    tableName: 'product_mvps',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.mvps],
    setSubmitting,
    methods: {
      add: 'createMVP'
    }
  });
  
  const updateMVPOptimistic = useOptimisticUpdate<'product_mvps'>({
    tableName: 'product_mvps',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.mvps],
    setSubmitting,
    methods: {
      update: 'updateMVP'
    }
  });
  
  const deleteMVPOptimistic = useOptimisticDelete({
    tableName: 'product_mvps',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.mvps],
    setSubmitting,
    methods: {
      delete: 'deleteMVP'
    }
  });
  
  const addMVPFeatureOptimistic = useOptimisticCreate<'product_mvp_features'>({
    projectId,
    tableName: 'product_mvp_features',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.mvpFeatures],
    setSubmitting,
    methods: {
      add: 'createMVPFeature'
    }
  });
  
  const updateMVPFeatureOptimistic = useOptimisticUpdate<'product_mvp_features'>({
    tableName: 'product_mvp_features',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.mvpFeatures],
    setSubmitting,
    methods: {
      update: 'updateMVPFeature'
    }
  });
  
  const deleteMVPFeatureOptimistic = useOptimisticDelete({
    tableName: 'product_mvp_features',
    store,
    service: productDevelopmentService,
    queryClient,
    queryKey: [...queryKeys.mvpFeatures],
    setSubmitting,
    methods: {
      delete: 'deleteMVPFeature'
    }
  });
  
  // Query for getting all product development data
  const { data: problemsData, isLoading: problemsLoading, error: problemsError } = useQuery({
    queryKey: [...queryKeys.problems, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return productDevelopmentService.getProblems(projectId);
    },
    enabled: !!projectId
  });
  
  const { data: solutionsData, isLoading: solutionsLoading, error: solutionsError } = useQuery({
    queryKey: [...queryKeys.solutions, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return productDevelopmentService.getSolutions(projectId);
    },
    enabled: !!projectId
  });
  
  const { data: evidenceData, isLoading: evidenceLoading, error: evidenceError } = useQuery({
    queryKey: [...queryKeys.evidence, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return productDevelopmentService.getEvidence(projectId);
    },
    enabled: !!projectId
  });
  
  const { data: evidenceLinksData, isLoading: evidenceLinksLoading, error: evidenceLinksError } = useQuery({
    queryKey: [...queryKeys.evidenceLinks, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return productDevelopmentService.getEvidenceLinks();
    },
    enabled: !!projectId
  });
  
  const { data: mvpsData, isLoading: mvpsLoading, error: mvpsError } = useQuery({
    queryKey: [...queryKeys.mvps, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return productDevelopmentService.getMVPs(projectId);
    },
    enabled: !!projectId
  });
  
  const { data: mvpFeaturesData, isLoading: mvpFeaturesLoading, error: mvpFeaturesError } = useQuery({
    queryKey: [...queryKeys.mvpFeatures],
    queryFn: async () => {
      return productDevelopmentService.getMVPFeatures();
    }
  });
  
  // Create debounced update functions to prevent too many store updates
  const debouncedStoreUpdate = useMemo(() => ({
    problems: debounce((data: ProductProblem[]) => {
      if (data && !arraysEqual(data, store.currentData.productProblems)) {
        store.setProductProblems(data);
      }
    }, 300),
    solutions: debounce((data: ProductSolution[]) => {
      if (data && !arraysEqual(data, store.currentData.productSolutions)) {
        store.setProductSolutions(data);
      }
    }, 300),
    evidence: debounce((data: ProductEvidence[]) => {
      if (data && !arraysEqual(data, store.currentData.productEvidence)) {
        store.setProductEvidence(data);
      }
    }, 300),
    evidenceLinks: debounce((data: ProductEvidenceLink[]) => {
      if (data && !arraysEqual(data, store.currentData.productEvidenceLinks)) {
        store.setProductEvidenceLinks(data);
      }
    }, 300),
    mvps: debounce((data: ProductMVP[]) => {
      if (data && !arraysEqual(data, store.currentData.productMVPs)) {
        store.setProductMVPs(data);
      }
    }, 300),
    mvpFeatures: debounce((data: ProductMVPFeature[]) => {
      if (data && !arraysEqual(data, store.currentData.productMVPFeatures)) {
        store.setProductMVPFeatures(data);
      }
    }, 300),
  }), [store]);

  // Update store with data from queries - using debounce
  useEffect(() => {
    if (!store.comparisonMode && problemsData) {
      debouncedStoreUpdate.problems(problemsData);
    }
  }, [problemsData, store.comparisonMode, debouncedStoreUpdate]);

  useEffect(() => {
    if (!store.comparisonMode && solutionsData) {
      debouncedStoreUpdate.solutions(solutionsData);
    }
  }, [solutionsData, store.comparisonMode, debouncedStoreUpdate]);

  useEffect(() => {
    if (!store.comparisonMode && evidenceData) {
      debouncedStoreUpdate.evidence(evidenceData);
    }
  }, [evidenceData, store.comparisonMode, debouncedStoreUpdate]);

  useEffect(() => {
    if (!store.comparisonMode && evidenceLinksData) {
      debouncedStoreUpdate.evidenceLinks(evidenceLinksData);
    }
  }, [evidenceLinksData, store.comparisonMode, debouncedStoreUpdate]);

  useEffect(() => {
    if (!store.comparisonMode && mvpsData) {
      debouncedStoreUpdate.mvps(mvpsData);
    }
  }, [mvpsData, store.comparisonMode, debouncedStoreUpdate]);

  useEffect(() => {
    if (!store.comparisonMode && mvpFeaturesData) {
      debouncedStoreUpdate.mvpFeatures(mvpFeaturesData);
    }
  }, [mvpFeaturesData, store.comparisonMode, debouncedStoreUpdate]);
  
  // Access data from store or query results
  const storeData = useMemo(() => ({
    problems: store.currentData.productProblems || [],
    solutions: store.currentData.productSolutions || [],
    evidence: store.currentData.productEvidence || [],
    evidenceLinks: store.currentData.productEvidenceLinks || [],
    mvps: store.currentData.productMVPs || [],
    mvpFeatures: store.currentData.productMVPFeatures || []
  }), [store.currentData]);
  
  // Consolidated data - from store in comparison mode, or queries otherwise
  const data = useMemo<ProductDevelopmentData>(() => {
    if (store.comparisonMode) {
      return storeData;
    }
    
    return {
      problems: problemsData || [],
      solutions: solutionsData || [],
      evidence: evidenceData || [],
      evidenceLinks: evidenceLinksData || [],
      mvps: mvpsData || [],
      mvpFeatures: mvpFeaturesData || []
    };
  }, [
    store.comparisonMode,
    // Only include storeData in dependencies when in comparison mode
    ...(store.comparisonMode ? [storeData] : []),
    // Only depend on query data when not in comparison mode
    ...(store.comparisonMode ? [] : [
      problemsData,
      solutionsData,
      evidenceData,
      evidenceLinksData,
      mvpsData,
      mvpFeaturesData
    ])
  ]);
  
  // Compute loading and error states
  const isLoading = problemsLoading || solutionsLoading || evidenceLoading || 
                   evidenceLinksLoading || mvpsLoading || mvpFeaturesLoading;
  const queryError = problemsError || solutionsError || evidenceError || 
                    evidenceLinksError || mvpsError || mvpFeaturesError;
  
  // Problem CRUD operations
  const addProblem = useCallback(async (problem: Insert<'product_problems'>): Promise<ProductProblem | null> => {
    if (!projectId) return null;
    try {
      return await addProblemOptimistic(problem);
    } catch (error) {
      console.error('Error adding problem:', error);
      setError(error as Error);
      return null;
    }
  }, [projectId, addProblemOptimistic]);

  const updateProblem = useCallback(async (params: { id: string; data: Update<'product_problems'> }): Promise<ProductProblem | null> => {
    try {
      return await updateProblemOptimistic(params.id, params.data);
    } catch (error) {
      console.error('Error updating problem:', error);
      setError(error as Error);
      return null;
    }
  }, [updateProblemOptimistic]);

  const deleteProblem = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await deleteProblemOptimistic(id);
    } catch (error) {
      console.error('Error deleting problem:', error);
      setError(error as Error);
      return false;
    }
  }, [deleteProblemOptimistic]);

  // Solution CRUD operations 
  const addSolution = useCallback(async (solution: Insert<'product_solutions'>): Promise<ProductSolution | null> => {
    if (!projectId) return null;
    try {
      return await addSolutionOptimistic(solution);
    } catch (error) {
      console.error('Error adding solution:', error);
      setError(error as Error);
      return null;
    }
  }, [projectId, addSolutionOptimistic]);

  const updateSolution = useCallback(async (params: { id: string; data: Update<'product_solutions'> }): Promise<ProductSolution | null> => {
    try {
      return await updateSolutionOptimistic(params.id, params.data);
    } catch (error) {
      console.error('Error updating solution:', error);
      setError(error as Error);
      return null;
    }
  }, [updateSolutionOptimistic]);

  const deleteSolution = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await deleteSolutionOptimistic(id);
    } catch (error) {
      console.error('Error deleting solution:', error);
      setError(error as Error);
      return false;
    }
  }, [deleteSolutionOptimistic]);

  // Evidence CRUD operations
  const addEvidence = useCallback(async (evidence: Insert<'product_evidence'>): Promise<ProductEvidence | null> => {
    if (!projectId) return null;
    try {
      return await addEvidenceOptimistic(evidence);
    } catch (error) {
      console.error('Error adding evidence:', error);
      setError(error as Error);
      return null;
    }
  }, [projectId, addEvidenceOptimistic]);

  const updateEvidence = useCallback(async (params: { id: string; data: Update<'product_evidence'> }): Promise<ProductEvidence | null> => {
    try {
      return await updateEvidenceOptimistic(params.id, params.data);
    } catch (error) {
      console.error('Error updating evidence:', error);
      setError(error as Error);
      return null;
    }
  }, [updateEvidenceOptimistic]);

  const deleteEvidence = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await deleteEvidenceOptimistic(id);
    } catch (error) {
      console.error('Error deleting evidence:', error);
      setError(error as Error);
      return false;
    }
  }, [deleteEvidenceOptimistic]);

  // Evidence Link CRUD operations
  const addEvidenceLink = useCallback(async (link: Insert<'product_evidence_links'>): Promise<ProductEvidenceLink | null> => {
    try {
      return await addEvidenceLinkOptimistic(link);
    } catch (error) {
      console.error('Error adding evidence link:', error);
      setError(error as Error);
      return null;
    }
  }, [addEvidenceLinkOptimistic]);

  const updateEvidenceLink = useCallback(async (params: { id: string; data: Update<'product_evidence_links'> }): Promise<ProductEvidenceLink | null> => {
    try {
      return await updateEvidenceLinkOptimistic(params.id, params.data);
    } catch (error) {
      console.error('Error updating evidence link:', error);
      setError(error as Error);
      return null;
    }
  }, [updateEvidenceLinkOptimistic]);

  const deleteEvidenceLink = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await deleteEvidenceLinkOptimistic(id);
    } catch (error) {
      console.error('Error deleting evidence link:', error);
      setError(error as Error);
      return false;
    }
  }, [deleteEvidenceLinkOptimistic]);

  // MVP CRUD operations
  const addMVP = useCallback(async (mvp: Insert<'product_mvps'>): Promise<ProductMVP | null> => {
    if (!projectId) return null;
    try {
      return await addMVPOptimistic(mvp);
    } catch (error) {
      console.error('Error adding MVP:', error);
      setError(error as Error);
      return null;
    }
  }, [projectId, addMVPOptimistic]);

  const updateMVP = useCallback(async (params: { id: string; data: Update<'product_mvps'> }): Promise<ProductMVP | null> => {
    try {
      return await updateMVPOptimistic(params.id, params.data);
    } catch (error) {
      console.error('Error updating MVP:', error);
      setError(error as Error);
      return null;
    }
  }, [updateMVPOptimistic]);

  const deleteMVP = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await deleteMVPOptimistic(id);
    } catch (error) {
      console.error('Error deleting MVP:', error);
      setError(error as Error);
      return false;
    }
  }, [deleteMVPOptimistic]);

  // MVP Feature CRUD operations
  const addMVPFeature = useCallback(async (feature: Insert<'product_mvp_features'>): Promise<ProductMVPFeature | null> => {
    try {
      return await addMVPFeatureOptimistic(feature);
    } catch (error) {
      console.error('Error adding MVP feature:', error);
      setError(error as Error);
      return null;
    }
  }, [addMVPFeatureOptimistic]);

  const updateMVPFeature = useCallback(async (params: { id: string; data: Update<'product_mvp_features'> }): Promise<ProductMVPFeature | null> => {
    try {
      return await updateMVPFeatureOptimistic(params.id, params.data);
    } catch (error) {
      console.error('Error updating MVP feature:', error);
      setError(error as Error);
      return null;
    }
  }, [updateMVPFeatureOptimistic]);

  const deleteMVPFeature = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await deleteMVPFeatureOptimistic(id);
    } catch (error) {
      console.error('Error deleting MVP feature:', error);
      setError(error as Error);
      return false;
    }
  }, [deleteMVPFeatureOptimistic]);

  // Helper methods
  const getProblemsWithSolutions = useCallback(() => {
    return data.problems.map(problem => {
      const solutions = data.solutions.filter(solution => solution.problem_id === problem.id);
      return { ...problem, solutions };
    });
  }, [data.problems, data.solutions]);

  const getSolutionsWithFeatures = useCallback(() => {
    // This needs to be implemented based on your actual data structure
    // For now, just returning empty arrays for features
    return data.solutions.map(solution => {
      const features: ProductFeature[] = []; 
      return { ...solution, features };
    });
  }, [data.solutions]);

  const getEvidenceForEntity = useCallback((entityType: string, entityId: string) => {
    const relevantLinks = data.evidenceLinks.filter(
      link => link.entity_type === entityType && link.entity_id === entityId
    );
    
    const evidenceIds = relevantLinks.map(link => link.evidence_id);
    return data.evidence.filter(evidence => evidenceIds.includes(evidence.id));
  }, [data.evidenceLinks, data.evidence]);

  const getMVPWithFeatures = useCallback((mvpId: string) => {
    const mvp = data.mvps.find(m => m.id === mvpId);
    if (!mvp) return null;
    
    const features = data.mvpFeatures.filter(feature => feature.mvp_id === mvpId);
    return { ...mvp, features };
  }, [data.mvps, data.mvpFeatures]);

  // Diff helpers
  const isDiffMode = store.comparisonMode;
  
  // Use the store's built-in getItemChangeType method
  const getProblemChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productProblems', id), [store]);

  const getSolutionChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productSolutions', id), [store]);

  const getEvidenceChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productEvidence', id), [store]);

  const getEvidenceLinkChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productEvidenceLinks', id), [store]);

  const getMVPChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productMVPs', id), [store]);

  const getMVPFeatureChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productMVPFeatures', id), [store]);

  return {
    data,
    isLoading,
    error: error || queryError as Error | null,
    
    // CRUD operations
    addProblem,
    updateProblem,
    deleteProblem,
    
    addSolution,
    updateSolution,
    deleteSolution,
    
    addEvidence,
    updateEvidence,
    deleteEvidence,
    
    addEvidenceLink,
    updateEvidenceLink,
    deleteEvidenceLink,
    
    addMVP,
    updateMVP,
    deleteMVP,
    
    addMVPFeature,
    updateMVPFeature,
    deleteMVPFeature,
    
    // Helper methods
    getProblemsWithSolutions,
    getSolutionsWithFeatures,
    getEvidenceForEntity,
    getMVPWithFeatures,
    
    // Diff helpers
    getProblemChangeType,
    getSolutionChangeType,
    getEvidenceChangeType,
    getEvidenceLinkChangeType,
    getMVPChangeType,
    getMVPFeatureChangeType,
    isDiffMode
  };
} 