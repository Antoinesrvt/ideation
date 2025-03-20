import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useProjectStore } from '@/store/project-store';
import { useProductDevelopment } from '@/hooks/features/useProductDevelopment';
import { useProductDesign } from '@/hooks/features/useProductDesign';
import { useMarketAnalysis } from '@/hooks/features/useMarketAnalysis';
import { useValidation } from '@/hooks/features/useValidation';
import { 
  SuccessCriterion,
  TimelinePhase 
} from '@/features/product_design/components/stepper/PrioritizeMVPStep';
import type { 
  ProductProblem, 
  ProductSolution, 
  ProductEvidence,
  ProductFeature
} from '@/store/types';

// Define the types that were previously imported from PrioritizeMVPStep
export interface Problem {
  id: string;
  title: string;
  description: string;
  status: 'discovered' | 'validated' | 'critical';
  significance: number; // 1-100
  customerSegments: string[];
  evidenceCount: number;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  problemId: string;
  effectiveness: number; // 1-100
  feasibility: number; // 1-100
  hypothesisStatement: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  source: string;
  type: 'interview' | 'survey' | 'research' | 'observation' | 'test';
  status: 'unverified' | 'partial' | 'verified';
  relatedIds: string[]; // IDs of problems or solutions this evidence relates to
}

// Define the context shape
interface ProductStepperContextType {
  // State
  problems: Problem[];
  solutions: Solution[];
  evidence: Evidence[];
  features: any[];
  selectedMVPFeatures: string[];
  successCriteria: SuccessCriterion[];
  timeline: TimelinePhase[];
  isLoading: boolean;
  error: Error | null;
  
  // Problem actions
  addProblem: (problem: Omit<Problem, 'id'>) => Promise<any>;
  updateProblem: (id: string, updates: Partial<Problem>) => Promise<any>;
  deleteProblem: (id: string) => Promise<any>;
  
  // Solution actions
  addSolution: (solution: Omit<Solution, 'id'>) => Promise<any>;
  updateSolution: (id: string, updates: Partial<Solution>) => Promise<any>;
  deleteSolution: (id: string) => Promise<any>;
  
  // Evidence actions
  addEvidence: (evidence: Omit<Evidence, 'id'>) => Promise<any>;
  updateEvidence: (id: string, updates: Partial<Evidence>) => Promise<any>;
  deleteEvidence: (id: string) => Promise<any>;
  
  // Feature actions
  addFeature: (feature: any) => Promise<any>;
  updateFeature: (id: string, updates: any) => Promise<any>;
  deleteFeature: (id: string) => Promise<any>;
  
  // MVP scope actions
  updateMVPScope: (featureIds: string[]) => void;
  saveSuccessCriteria: (criteria: SuccessCriterion[]) => void;
  saveTimeline: (timelineData: TimelinePhase[]) => void;
}

// Create context with default values
const ProductStepperContext = createContext<ProductStepperContextType | null>(null);

// Helper functions to map between component and DB types
const mapProblemToDBType = (problem: Omit<Problem, 'id'>, projectId: string): any => ({
  project_id: projectId,
  title: problem.title,
  description: problem.description,
  status: problem.status,
  significance: problem.significance,
  customer_segments: problem.customerSegments,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const mapDBProblemToComponent = (problem: ProductProblem): Problem => ({
  id: problem.id,
  title: problem.title || '',
  description: problem.description || '',
  status: problem.status as 'discovered' | 'validated' | 'critical',
  significance: problem.significance || 50,
  customerSegments: problem.customer_segments || [],
  evidenceCount: 0 // This will be calculated separately
});

const mapSolutionToDBType = (solution: Omit<Solution, 'id'>, projectId: string, problemId: string): any => ({
  project_id: projectId,
  problem_id: problemId,
  title: solution.title,
  description: solution.description,
  effectiveness: solution.effectiveness,
  feasibility: solution.feasibility,
  hypothesis_statement: solution.hypothesisStatement,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const mapDBSolutionToComponent = (solution: ProductSolution): Solution => ({
  id: solution.id,
  title: solution.title || '',
  description: solution.description || '',
  problemId: solution.problem_id || '',
  effectiveness: solution.effectiveness || 50,
  feasibility: solution.feasibility || 50,
  hypothesisStatement: solution.hypothesis_statement || ''
});

const mapEvidenceToDBType = (evidence: Omit<Evidence, 'id'>, projectId: string): any => ({
  project_id: projectId,
  title: evidence.title,
  description: evidence.description,
  source: evidence.source,
  type: evidence.type,
  status: evidence.status,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const mapDBEvidenceToComponent = (evidence: ProductEvidence): Evidence => ({
  id: evidence.id,
  title: evidence.title || '',
  description: evidence.description || '',
  source: evidence.source || '',
  type: evidence.type as 'interview' | 'survey' | 'research' | 'observation' | 'test',
  status: evidence.status as 'unverified' | 'partial' | 'verified',
  relatedIds: [] // This will be populated separately
});

const mapFeatureToComponent = (feature: ProductFeature): any => {
  // Extract metadata and ensure it's an object
  const metadata = feature.metadata || {};
  
  // Type assertion for TypeScript
  const metadataObj = metadata as Record<string, any>;
  
  return {
    id: feature.id,
    name: feature.name,
    description: feature.description,
    priority: feature.priority || 'should',
    status: feature.status || 'planned',
    tags: feature.tags || [],
    
    // Metadata fields with safe fallbacks
    effortScore: (metadataObj.effortScore !== undefined) ? metadataObj.effortScore : 50,
    valueScore: (metadataObj.valueScore !== undefined) ? metadataObj.valueScore : 50,
    isSelected: (metadataObj.isSelected !== undefined) ? metadataObj.isSelected : false,
    estimatedTime: metadataObj.estimatedTime,
    assignedTo: metadataObj.assignedTo,
    
    // Original DB fields
    project_id: feature.project_id,
    created_by: feature.created_by,
    created_at: feature.created_at,
    updated_at: feature.updated_at
  };
};

// Provider component
export const ProductStepperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { currentData } = useProjectStore();
  const projectId = currentData?.project?.id;
  
  // Use refs to store previous API data for comparison
  const prevProblemsData = useRef<ProductProblem[]>([]);
  const prevSolutionsData = useRef<ProductSolution[]>([]);
  const prevEvidenceData = useRef<ProductEvidence[]>([]);
  const prevEvidenceLinksData = useRef<any[]>([]); // Using any[] temporarily to fix the type error
  const prevFeaturesData = useRef<ProductFeature[]>([]);
  
  // Flag to prevent initial load effects from running multiple times
  const initialLoadRef = useRef({
    problems: false,
    solutions: false,
    evidence: false,
    features: false
  });
  
  // Create API hooks by passing the projectId
  const productDevelopmentApi = useProductDevelopment(projectId);
  const productDesignApi = useProductDesign(projectId);
  const marketAnalysisApi = useMarketAnalysis(projectId);
  const validationApi = useValidation(projectId);
  
  // Calculate loading state
  const isLoading = useMemo(() => {
    return productDevelopmentApi.isLoading || 
           productDesignApi.isLoading || 
           marketAnalysisApi.isLoading || 
           validationApi.isLoading;
  }, [
    productDevelopmentApi.isLoading,
    productDesignApi.isLoading,
    marketAnalysisApi.isLoading,
    validationApi.isLoading
  ]);

  // Helper function for deep equality check using memo to prevent recreation
  const hasDataChanged = useCallback((prev: any, current: any): boolean => {
    // Quick equality check first
    if (prev === current) return false;
    if (!prev || !current) return true;
    
    // Deep comparison with JSON stringify for complex objects
    try {
      return JSON.stringify(prev) !== JSON.stringify(current);
    } catch (e) {
      // If stringify fails (e.g., circular references), fallback to simple comparison
      console.warn("JSON stringify failed in comparison:", e);
      return true;
    }
  }, []);

  // Local state for derived data
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [selectedMVPFeatures, setSelectedMVPFeatures] = useState<string[]>([]);
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriterion[]>([]);
  const [timeline, setTimeline] = useState<TimelinePhase[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Load problems from DB
  useEffect(() => {
    // Skip if loading or no data
    if (productDevelopmentApi.isLoading || !productDevelopmentApi.data.problems) {
      return;
    }
    
    // Skip if already processed this data
    if (!hasDataChanged(prevProblemsData.current, productDevelopmentApi.data.problems)) {
      return;
    }
    
    // Only process this data once
    if (!initialLoadRef.current.problems && productDevelopmentApi.data.problems.length > 0) {
      initialLoadRef.current.problems = true;
    }
    
    // Update ref for comparison on next render
    prevProblemsData.current = productDevelopmentApi.data.problems;
    
    // Map and update state
    const mappedProblems = productDevelopmentApi.data.problems.map(mapDBProblemToComponent);
    setProblems(mappedProblems);
  }, [productDevelopmentApi.data.problems, productDevelopmentApi.isLoading, hasDataChanged]);

  // Load solutions from DB
  useEffect(() => {
    // Skip if loading or no data
    if (productDevelopmentApi.isLoading || !productDevelopmentApi.data.solutions) {
      return;
    }
    
    // Skip if already processed this data
    if (!hasDataChanged(prevSolutionsData.current, productDevelopmentApi.data.solutions)) {
      return;
    }
    
    // Only process this data once
    if (!initialLoadRef.current.solutions && productDevelopmentApi.data.solutions.length > 0) {
      initialLoadRef.current.solutions = true;
    }
    
    // Update ref for comparison on next render
    prevSolutionsData.current = productDevelopmentApi.data.solutions;
    
    // Map and update state
    const mappedSolutions = productDevelopmentApi.data.solutions.map(mapDBSolutionToComponent);
    setSolutions(mappedSolutions);
  }, [productDevelopmentApi.data.solutions, productDevelopmentApi.isLoading, hasDataChanged]);

  // Load evidence from DB
  useEffect(() => {
    // Skip if loading or no data
    if (productDevelopmentApi.isLoading || 
        !productDevelopmentApi.data.evidence || 
        !productDevelopmentApi.data.evidenceLinks) {
      return;
    }
    
    // Skip if already processed this data
    if (!hasDataChanged(prevEvidenceData.current, productDevelopmentApi.data.evidence) &&
        !hasDataChanged(prevEvidenceLinksData.current, productDevelopmentApi.data.evidenceLinks)) {
      return;
    }
    
    // Only process this data once
    if (!initialLoadRef.current.evidence && 
        productDevelopmentApi.data.evidence.length > 0 && 
        productDevelopmentApi.data.evidenceLinks.length > 0) {
      initialLoadRef.current.evidence = true;
    }
    
    // Update refs for comparison on next render
    prevEvidenceData.current = productDevelopmentApi.data.evidence;
    prevEvidenceLinksData.current = productDevelopmentApi.data.evidenceLinks;
    
    // First, map basic evidence
    const mappedEvidence = productDevelopmentApi.data.evidence.map(mapDBEvidenceToComponent);
    
    // Then, add related IDs for each evidence item
    const evidenceWithRelatedIds = mappedEvidence.map(evidenceItem => {
      const links = productDevelopmentApi.data.evidenceLinks.filter(
        link => link.evidence_id === evidenceItem.id
      );
      
      const relatedIds = links.map(link => {
        // Format ID based on entity type
        if (link.entity_type === 'problem') {
          return `problem-${link.entity_id}`;
        } else if (link.entity_type === 'solution') {
          return `solution-${link.entity_id}`;
        }
        return link.entity_id;
      });
      
      return {
        ...evidenceItem,
        relatedIds
      };
    });
    
    setEvidence(evidenceWithRelatedIds);
  }, [
    productDevelopmentApi.data.evidence, 
    productDevelopmentApi.data.evidenceLinks,
    productDevelopmentApi.isLoading,
    hasDataChanged
  ]);

  // Load features from DB
  useEffect(() => {
    // Skip if loading or no data
    if (productDesignApi.isLoading || !productDesignApi.data.features) {
      return;
    }
    
    // Skip if already processed this data
    if (!hasDataChanged(prevFeaturesData.current, productDesignApi.data.features)) {
      return;
    }
    
    // Only process this data once
    if (!initialLoadRef.current.features && productDesignApi.data.features.length > 0) {
      initialLoadRef.current.features = true;
    }
    
    // Update ref for comparison on next render
    prevFeaturesData.current = productDesignApi.data.features;
    
    // Map and update state
    const mappedFeatures = productDesignApi.data.features.map(mapFeatureToComponent);
    setFeatures(mappedFeatures);
    
    // Extract selected MVP features
    const selectedFeatures = mappedFeatures
      .filter(feature => feature.isSelected)
      .map(feature => feature.id);
    
    setSelectedMVPFeatures(selectedFeatures);
  }, [productDesignApi.data.features, productDesignApi.isLoading, hasDataChanged]);

  // CRUD operations for problems
  const addProblem = useCallback(async (problem: Omit<Problem, 'id'>) => {
    try {
      const formattedProblem = mapProblemToDBType(problem, projectId || '');
      const result = await productDevelopmentApi.addProblem(formattedProblem);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error adding problem",
        description: (err as Error).message,
        variant: "destructive"
      });
      return null;
    }
  }, [projectId, productDevelopmentApi, toast]);

  const updateProblem = useCallback(async (id: string, updates: Partial<Problem>) => {
    try {
      // Convert component fields to DB fields
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.significance !== undefined) dbUpdates.significance = updates.significance;
      if (updates.customerSegments !== undefined) dbUpdates.customer_segments = updates.customerSegments;
      
      const result = await productDevelopmentApi.updateProblem({ 
        id, 
        data: dbUpdates 
      });
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error updating problem",
        description: (err as Error).message,
        variant: "destructive"
      });
      return null;
    }
  }, [productDevelopmentApi, toast]);

  const deleteProblem = useCallback(async (id: string) => {
    try {
      const result = await productDevelopmentApi.deleteProblem(id);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error deleting problem",
        description: (err as Error).message,
        variant: "destructive"
      });
      return false;
    }
  }, [productDevelopmentApi, toast]);

  // CRUD operations for solutions
  const addSolution = useCallback(async (solution: Omit<Solution, 'id'>) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const dbSolution = mapSolutionToDBType(solution, projectId, solution.problemId);
      const result = await productDevelopmentApi.addSolution(dbSolution);
      
      if (result) {
        const newSolution = mapDBSolutionToComponent(result);
        setSolutions(prev => [...prev, newSolution]);
        
        toast({
          title: 'Success',
          description: 'Solution added successfully',
        });
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('Error adding solution:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to add solution',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [projectId, productDevelopmentApi, toast]);

  const updateSolution = useCallback(async (id: string, updates: Partial<Solution>) => {
    try {
      // Convert component updates to DB format
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.problemId !== undefined) dbUpdates.problem_id = updates.problemId;
      if (updates.effectiveness !== undefined) dbUpdates.effectiveness = updates.effectiveness;
      if (updates.feasibility !== undefined) dbUpdates.feasibility = updates.feasibility;
      if (updates.hypothesisStatement !== undefined) dbUpdates.hypothesis_statement = updates.hypothesisStatement;
      
      dbUpdates.updated_at = new Date().toISOString();
      
      const result = await productDevelopmentApi.updateSolution({ id, data: dbUpdates });
      
      if (result) {
        // Update local state
        setSolutions(prev => 
          prev.map(s => s.id === id ? { ...s, ...updates } : s)
        );
        
        toast({
          title: 'Success',
          description: 'Solution updated successfully',
        });
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating solution:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to update solution',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [productDevelopmentApi, toast]);

  const deleteSolution = useCallback(async (id: string) => {
    try {
      const result = await productDevelopmentApi.deleteSolution(id);
      
      if (result) {
        // Update local state
        setSolutions(prev => prev.filter(s => s.id !== id));
        
        toast({
          title: 'Success',
          description: 'Solution deleted successfully',
        });
        
        return result;
      }
      
      return false;
    } catch (err) {
      console.error('Error deleting solution:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to delete solution',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [productDevelopmentApi, toast]);

  // CRUD operations for evidence
  const addEvidence = useCallback(async (evidence: Omit<Evidence, 'id'>) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const dbEvidence = mapEvidenceToDBType(evidence, projectId);
      const result = await productDevelopmentApi.addEvidence(dbEvidence);
      
      if (result) {
        // Create links for related items
        const relatedIds = evidence.relatedIds || [];
        
        for (const entityId of relatedIds) {
          // Determine entity type
          let entityType = 'unknown';
          let actualEntityId = entityId;
          
          if (entityId.startsWith('problem-')) {
            entityType = 'problem';
            actualEntityId = entityId.replace(/^(problem-)/, '');
          } else if (entityId.startsWith('solution-')) {
            entityType = 'solution';
            actualEntityId = entityId.replace(/^(solution-)/, '');
          } else {
            // Try to guess by looking at problems and solutions
            if (problems.some(p => p.id === entityId)) {
              entityType = 'problem';
            } else if (solutions.some(s => s.id === entityId)) {
              entityType = 'solution';
            }
          }
          
          // Add link
          await productDevelopmentApi.addEvidenceLink({
            evidence_id: result.id,
            entity_id: actualEntityId,
            entity_type: entityType,
            created_at: new Date().toISOString()
          });
        }
        
        // Update local state with the new evidence
        const mappedEvidence = {
          ...mapDBEvidenceToComponent(result),
          relatedIds
        };
        
        setEvidence(prev => [...prev, mappedEvidence]);
        
        toast({
          title: 'Success',
          description: 'Evidence added successfully',
        });
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('Error adding evidence:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to add evidence',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [projectId, productDevelopmentApi, problems, solutions, toast]);

  const updateEvidence = useCallback(async (id: string, updates: Partial<Evidence>) => {
    try {
      // Convert component updates to DB format
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.source !== undefined) dbUpdates.source = updates.source;
      
      dbUpdates.updated_at = new Date().toISOString();
      
      const result = await productDevelopmentApi.updateEvidence({ id, data: dbUpdates });
      
      if (result) {
        // Update local state
        setEvidence(prev => prev.map(e => 
          e.id === id 
            ? { ...e, ...updates, relatedIds: e.relatedIds } 
            : e
        ));
        
        // Handle relatedIds if provided
        if (updates.relatedIds) {
          // Get current links
          const currentLinks = productDevelopmentApi.data.evidenceLinks.filter(
            link => link.evidence_id === id
          );
          
          // Delete all current links
          for (const link of currentLinks) {
            await productDevelopmentApi.deleteEvidenceLink(link.id);
          }
          
          // Add new links
          for (const entityId of updates.relatedIds) {
            // Determine entity type
            let entityType = 'unknown';
            let actualEntityId = entityId;
            
            if (entityId.startsWith('problem-')) {
              entityType = 'problem';
              actualEntityId = entityId.replace(/^(problem-)/, '');
            } else if (entityId.startsWith('solution-')) {
              entityType = 'solution';
              actualEntityId = entityId.replace(/^(solution-)/, '');
            } else {
              // Try to guess by looking at problems and solutions
              if (problems.some(p => p.id === entityId)) {
                entityType = 'problem';
              } else if (solutions.some(s => s.id === entityId)) {
                entityType = 'solution';
              }
            }
            
            // Add link
            await productDevelopmentApi.addEvidenceLink({
              evidence_id: id,
              entity_id: actualEntityId,
              entity_type: entityType,
              created_at: new Date().toISOString()
            });
          }
        }
        
        toast({
          title: 'Success',
          description: 'Evidence updated successfully',
        });
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating evidence:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to update evidence',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [productDevelopmentApi, problems, solutions, toast]);

  const deleteEvidence = useCallback(async (id: string) => {
    try {
      // First, delete all links
      const links = productDevelopmentApi.data.evidenceLinks.filter(
        link => link.evidence_id === id
      );
      
      for (const link of links) {
        await productDevelopmentApi.deleteEvidenceLink(link.id);
      }
      
      // Then delete the evidence
      const result = await productDevelopmentApi.deleteEvidence(id);
      
      if (result) {
        // Update local state
        setEvidence(prev => prev.filter(e => e.id !== id));
        
        toast({
          title: 'Success',
          description: 'Evidence deleted successfully',
        });
        
        return result;
      }
      
      return false;
    } catch (err) {
      console.error('Error deleting evidence:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to delete evidence',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [productDevelopmentApi, toast]);

  // CRUD operations for features
  const addFeature = useCallback(async (feature: any) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      // Create base feature
      const baseFeature = {
        project_id: projectId,
        name: feature.name,
        description: feature.description,
        priority: feature.priority,
        status: feature.status,
        tags: feature.tags || [],
      };
      
      // Extract metadata fields
      const metadata: Record<string, any> = {
        effortScore: feature.effortScore || 50,
        valueScore: feature.valueScore || 50,
        isSelected: feature.isSelected || false
      };
      
      // Add optional metadata
      if (feature.estimatedTime) metadata.estimatedTime = feature.estimatedTime;
      if (feature.assignedTo) metadata.assignedTo = feature.assignedTo;
      
      const result = await productDesignApi.addFeature({
        ...baseFeature,
        metadata
      });
      
      if (result) {
        // Update local state
        const newFeature = mapFeatureToComponent(result);
        setFeatures(prev => [...prev, newFeature]);
        
        // Update selected MVP features if needed
        if (feature.isSelected) {
          setSelectedMVPFeatures(prev => [...prev, result.id]);
        }
        
        toast({
          title: 'Success',
          description: 'Feature added successfully',
        });
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('Error adding feature:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to add feature',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [projectId, productDesignApi, toast]);

  const updateFeature = useCallback(async (id: string, updates: any) => {
    try {
      // Convert component updates to DB format
      const baseUpdates: any = {};
      
      // Handle basic fields
      if (updates.name !== undefined) baseUpdates.name = updates.name;
      if (updates.description !== undefined) baseUpdates.description = updates.description;
      if (updates.priority !== undefined) baseUpdates.priority = updates.priority;
      if (updates.status !== undefined) baseUpdates.status = updates.status;
      if (updates.tags !== undefined) baseUpdates.tags = updates.tags;
      
      // Get existing feature to merge metadata
      const existingFeature = features.find(f => f.id === id);
      if (!existingFeature) {
        throw new Error('Feature not found');
      }
      
      // Handle metadata fields if present
      const hasMetadataUpdates = [
        'effortScore', 
        'valueScore', 
        'isSelected', 
        'estimatedTime', 
        'assignedTo'
      ].some(field => updates[field] !== undefined);
      
      if (hasMetadataUpdates) {
        // Start with existing metadata
        const metadata = existingFeature.metadata ? { ...existingFeature.metadata } : {};
        
        // Update metadata fields
        if (updates.effortScore !== undefined) metadata.effortScore = updates.effortScore;
        if (updates.valueScore !== undefined) metadata.valueScore = updates.valueScore;
        if (updates.estimatedTime !== undefined) metadata.estimatedTime = updates.estimatedTime;
        if (updates.assignedTo !== undefined) metadata.assignedTo = updates.assignedTo;
        
        baseUpdates.metadata = metadata;
      }
      
      baseUpdates.updated_at = new Date().toISOString();
      
      const result = await productDesignApi.updateFeature({
        id,
        data: baseUpdates
      });
      
      if (result) {
        // Update local state
        setFeatures(prev => 
          prev.map(f => f.id === id ? { ...f, ...updates } : f)
        );
        
        // Handle isSelected separately for MVP features
        if (updates.isSelected !== undefined) {
          if (updates.isSelected) {
            setSelectedMVPFeatures(prev => 
              prev.includes(id) ? prev : [...prev, id]
            );
          } else {
            setSelectedMVPFeatures(prev => 
              prev.filter(featureId => featureId !== id)
            );
          }
        }
        
        toast({
          title: 'Success',
          description: 'Feature updated successfully',
        });
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating feature:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to update feature',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [productDesignApi, features, toast]);

  const deleteFeature = useCallback(async (id: string) => {
    try {
      const result = await productDesignApi.deleteFeature(id);
      
      if (result) {
        // Update local state
        setFeatures(prev => prev.filter(f => f.id !== id));
        
        // Update selected MVP features if needed
        setSelectedMVPFeatures(prev => prev.filter(featureId => featureId !== id));
        
        toast({
          title: 'Success',
          description: 'Feature deleted successfully',
        });
        
        return result;
      }
      
      return false;
    } catch (err) {
      console.error('Error deleting feature:', err);
      setError(err as Error);
      
      toast({
        title: 'Error',
        description: 'Failed to delete feature',
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [productDesignApi, toast]);

  // MVP scope operations
  const updateMVPScope = useCallback((featureIds: string[]) => {
    // Set selected MVP features with the provided IDs - this is a single state update
    setSelectedMVPFeatures(featureIds);
    
    // Create a stable reference to the current features to avoid closure issues
    const currentFeatures = features;
    
    // Find which features need updating based on the new selection
    const featuresToUpdate = currentFeatures.map(feature => {
      const shouldBeSelected = featureIds.includes(feature.id);
      const isCurrentlySelected = feature.isSelected || 
                                 (feature.metadata && feature.metadata.isSelected) || 
                                 false;
      
      // Return feature if it needs updating
      if (shouldBeSelected !== isCurrentlySelected) {
        return {
          id: feature.id,
          isSelected: shouldBeSelected,
          metadata: {
            ...(feature.metadata || {}),
            isSelected: shouldBeSelected
          }
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries
    
    // If there are features to update, do so quietly without causing state updates
    if (featuresToUpdate.length > 0) {
      // Use a detached Promise to avoid React update cycles
      // We don't need to track these updates as they'll be reflected in the next data fetch
      Promise.all(
        featuresToUpdate.map(feature => {
          if (!feature) return Promise.resolve();
          
          return productDesignApi.updateFeature({
            id: feature.id,
            data: {
              metadata: feature.metadata
            }
          }).catch(err => {
            console.error(`Error updating feature ${feature.id} selection:`, err);
          });
        })
      ).catch(err => {
        console.error('Error updating features:', err);
      });
      
      // Also update local state once to reflect changes immediately
      // This is controlled and won't cause an infinite loop
      setFeatures(currentFeatures => 
        currentFeatures.map(feature => {
          const updatedFeature = featuresToUpdate.find(f => f && f.id === feature.id);
          if (updatedFeature) {
            return {
              ...feature,
              isSelected: updatedFeature.isSelected,
              metadata: {
                ...(feature.metadata || {}),
                isSelected: updatedFeature.isSelected
              }
            };
          }
          return feature;
        })
      );
    }
  }, [features, productDesignApi]);

  const saveSuccessCriteria = useCallback((criteria: SuccessCriterion[]) => {
    setSuccessCriteria(criteria);
  }, []);

  const saveTimeline = useCallback((timelineData: TimelinePhase[]) => {
    setTimeline(timelineData);
  }, []);

  // Create memoized value objects for context slices
  const problemsContextValue = useMemo(() => ({
    problems,
    addProblem,
    updateProblem,
    deleteProblem
  }), [problems, addProblem, updateProblem, deleteProblem]);

  const solutionsContextValue = useMemo(() => ({
    solutions,
    addSolution,
    updateSolution,
    deleteSolution
  }), [solutions, addSolution, updateSolution, deleteSolution]);

  const evidenceContextValue = useMemo(() => ({
    evidence,
    addEvidence,
    updateEvidence,
    deleteEvidence
  }), [evidence, addEvidence, updateEvidence, deleteEvidence]);

  const featuresContextValue = useMemo(() => ({
    features,
    selectedMVPFeatures,
    successCriteria,
    timeline,
    addFeature,
    updateFeature,
    deleteFeature,
    updateMVPScope,
    saveSuccessCriteria,
    saveTimeline
  }), [
    features, 
    selectedMVPFeatures, 
    successCriteria, 
    timeline, 
    addFeature, 
    updateFeature, 
    deleteFeature, 
    updateMVPScope, 
    saveSuccessCriteria, 
    saveTimeline
  ]);

  // Create stable status values
  const statusContextValue = useMemo(() => ({
    isLoading,
    error
  }), [isLoading, error]);

  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...problemsContextValue,
    ...solutionsContextValue,
    ...evidenceContextValue,
    ...featuresContextValue,
    ...statusContextValue
  }), [
    problemsContextValue,
    solutionsContextValue,
    evidenceContextValue,
    featuresContextValue,
    statusContextValue
  ]);

  return (
    <ProductStepperContext.Provider value={contextValue}>
      {children}
    </ProductStepperContext.Provider>
  );
};

// Custom hook for using the context
export const useProductStepper = () => {
  const context = useContext(ProductStepperContext);
  
  if (!context) {
    throw new Error('useProductStepper must be used within a ProductStepperProvider');
  }
  
  return context;
}; 