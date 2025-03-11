import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Problem, Solution, Evidence } from '@/features/product_design/components/ProblemSolutionFit';
import { useToast } from '@/components/ui/use-toast';
import { SuccessCriterion, TimelinePhase } from '@/features/product_design/components/MVPScopeDefinition';
import { useProductDevelopment } from './useProductDevelopment';
import { useProductDesign } from './useProductDesign';
import { useMarketAnalysis } from './useMarketAnalysis';
import { useValidation } from './useValidation';
import { ProductFeature, ProductProblem, ProductSolution, ProductEvidence, Insert } from '@/store/types';
import { Json } from '@/types/database';
import { useProjectStore } from '@/store/project-store';

// Helper functions to convert between component types and database types
const mapProblemToDBType = (problem: Omit<Problem, 'id'>, projectId: string): Insert<'product_problems'> => {
  return {
    project_id: projectId,
    title: problem.title,
    description: problem.description,
    status: problem.status,
    significance: problem.significance,
    customer_segments: problem.customerSegments,
    tags: [],
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

const mapDBProblemToComponent = (problem: ProductProblem): Problem => {
  return {
    id: problem.id,
    title: problem.title,
    description: problem.description || '',
    status: (problem.status || 'discovered') as 'discovered' | 'validated' | 'critical',
    significance: problem.significance || 0,
    customerSegments: problem.customer_segments || [],
    evidenceCount: 0 // Default value since evidence_count might not exist
  };
};

const mapSolutionToDBType = (solution: Omit<Solution, 'id'>, projectId: string, problemId: string): Insert<'product_solutions'> => {
  return {
    project_id: projectId,
    problem_id: problemId,
    title: solution.title,
    description: solution.description,
    effectiveness: solution.effectiveness,
    feasibility: solution.feasibility,
    hypothesis_statement: solution.hypothesisStatement,
    status: 'proposed',
    tags: [],
    metadata: {},
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

const mapDBSolutionToComponent = (solution: ProductSolution): Solution => {
  return {
    id: solution.id,
    title: solution.title,
    description: solution.description || '',
    problemId: solution.problem_id || '',
    effectiveness: solution.effectiveness || 0,
    feasibility: solution.feasibility || 0,
    hypothesisStatement: solution.hypothesis_statement || ''
  };
};

const mapEvidenceToDBType = (evidence: Omit<Evidence, 'id'>, projectId: string): Insert<'product_evidence'> => {
  return {
    project_id: projectId,
    title: evidence.title,
    description: evidence.description,
    source: evidence.source,
    type: evidence.type,
    status: evidence.status,
    metadata: {}, // Use metadata for tags instead
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

const mapDBEvidenceToComponent = (evidence: ProductEvidence): Evidence => {
  return {
    id: evidence.id,
    title: evidence.title,
    description: evidence.description || '',
    source: evidence.source || '',
    type: evidence.type as 'interview' | 'survey' | 'research' | 'observation' | 'test',
    status: evidence.status as 'unverified' | 'partial' | 'verified',
    relatedIds: [] // This will be populated separately from evidence links
  };
};

const mapFeatureToComponent = (feature: ProductFeature): any => {
  // Create a safe copy of metadata to spread
  const metadataObj = feature.metadata && typeof feature.metadata === 'object' 
    ? feature.metadata as Record<string, unknown>
    : {};
    
  return {
    ...feature,
    id: feature.id,
    name: feature.name,
    description: feature.description || '',
    priority: feature.priority as 'must' | 'should' | 'could' | 'wont',
    status: feature.status || 'planned',
    effortScore: 50, // Default value if not set in metadata
    valueScore: 50, // Default value if not set in metadata
    isSelected: false,
    // Add any additional fields from metadata if available
    ...metadataObj
  };
};

/**
 * Custom hook for product stepper functionality
 */
export function useProductStepper() {
  // Get project from store
  const { currentData } = useProjectStore();
  const projectId = currentData?.project?.id;
  
  // Use a ref to track if localStorage data has been loaded
  const localDataLoadedRef = useRef(false);
  
  // Call all hooks at the top level
  const productDevelopmentApi = useProductDevelopment(projectId);
  const productDesignApi = useProductDesign(projectId);
  const marketAnalysis = useMarketAnalysis(projectId);
  const validation = useValidation(projectId);
  const { toast } = useToast();
  
  // State for product development entities
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceLinks, setEvidenceLinks] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [selectedMVPFeatures, setSelectedMVPFeatures] = useState<string[]>([]);
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriterion[]>([]);
  const [timeline, setTimeline] = useState<TimelinePhase[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Loading state combines loading from all hooks
  const isLoading = productDevelopmentApi.isLoading || 
                   productDesignApi.isLoading || 
                   marketAnalysis.isLoading || 
                   validation.isLoading;

  // Check for errors in all hooks
  useEffect(() => {
    if (productDevelopmentApi.error) setError(productDevelopmentApi.error);
    else if (productDesignApi.error) setError(productDesignApi.error);
    else if (marketAnalysis.error) setError(marketAnalysis.error);
    else if (validation.error) setError(validation.error);
    else setError(null);
  }, [
    productDevelopmentApi.error, 
    productDesignApi.error, 
    marketAnalysis.error, 
    validation.error
  ]);

  // Convert data between component format and DB format
  const problemsData = useMemo(() => {
    return productDevelopmentApi.data?.problems?.map(mapDBProblemToComponent) || [];
  }, [productDevelopmentApi.data?.problems]);

  const solutionsData = useMemo(() => {
    return productDevelopmentApi.data?.solutions?.map(mapDBSolutionToComponent) || [];
  }, [productDevelopmentApi.data?.solutions]);

  const evidenceData = useMemo(() => {
    if (!productDevelopmentApi.data?.evidence) return [];
    
    const evidenceItems = productDevelopmentApi.data.evidence.map(mapDBEvidenceToComponent);
    
    // Populate relatedIds from evidence links
    return evidenceItems.map(item => {
      const links = productDevelopmentApi.data?.evidenceLinks?.filter(
        link => link.evidence_id === item.id
      ) || [];
      
      return {
        ...item,
        relatedIds: links.map(link => link.entity_id)
      };
    });
  }, [productDevelopmentApi.data?.evidence, productDevelopmentApi.data?.evidenceLinks]);

  const featuresData = useMemo(() => {
    return productDesignApi.data?.features?.map(mapFeatureToComponent) || [];
  }, [productDesignApi.data?.features]);

  // Market and validation data for context
  const marketInterviews = useMemo(() => {
    return marketAnalysis.data?.interviews || [];
  }, [marketAnalysis.data?.interviews]);

  const userFeedback = useMemo(() => {
    return validation.data?.userFeedback || [];
  }, [validation.data?.userFeedback]);

  // Set state from API data when it changes
  useEffect(() => {
    setProblems(problemsData);
  }, [problemsData]);

  useEffect(() => {
    setSolutions(solutionsData);
  }, [solutionsData]);

  useEffect(() => {
    setEvidence(evidenceData);
  }, [evidenceData]);

  useEffect(() => {
    setFeatures(featuresData);
  }, [featuresData]);

  // Load data from localStorage if available
  useEffect(() => {
    // Only try to load from localStorage once
    if (!localDataLoadedRef.current) {
      try {
        // Load other state from localStorage
        const storedMVPFeatures = localStorage.getItem('selectedMVPFeatures');
        if (storedMVPFeatures) {
          setSelectedMVPFeatures(JSON.parse(storedMVPFeatures));
        }
        
        const storedCriteria = localStorage.getItem('successCriteria');
        if (storedCriteria) {
          setSuccessCriteria(JSON.parse(storedCriteria));
        }
        
        const storedTimeline = localStorage.getItem('timeline');
        if (storedTimeline) {
          setTimeline(JSON.parse(storedTimeline));
        }
        
        localDataLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        toast({
          title: 'Error loading saved data',
          description: 'There was a problem loading your saved data.',
          variant: 'destructive'
        });
      }
    }
  }, [toast]);
  
  // Persist selected MVP features to localStorage when they change
  useEffect(() => {
    if (selectedMVPFeatures.length > 0) {
      localStorage.setItem('selectedMVPFeatures', JSON.stringify(selectedMVPFeatures));
    }
  }, [selectedMVPFeatures]);
  
  // Persist success criteria to localStorage when they change
  useEffect(() => {
    if (successCriteria.length > 0) {
      localStorage.setItem('successCriteria', JSON.stringify(successCriteria));
    }
  }, [successCriteria]);
  
  // Persist timeline to localStorage when it changes
  useEffect(() => {
    if (timeline.length > 0) {
      localStorage.setItem('timeline', JSON.stringify(timeline));
    }
  }, [timeline]);

  // CRUD operations for problems
  const addProblem = useCallback(async (problem: Omit<Problem, 'id'>) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const dbProblem = mapProblemToDBType(problem, projectId);
      const result = await productDevelopmentApi.addProblem(dbProblem);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Problem added successfully',
        });
      } else {
        throw new Error('Failed to add problem');
      }
    } catch (err) {
      console.error('Error adding problem:', err);
      toast({
        title: 'Error',
        description: 'Failed to add problem',
        variant: 'destructive'
      });
    }
  }, [projectId, productDevelopmentApi, toast]);
  
  const updateProblem = useCallback(async (id: string, updates: Partial<Problem>) => {
    try {
      // Convert component updates to DB updates
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.significance !== undefined) dbUpdates.significance = updates.significance;
      if (updates.customerSegments !== undefined) dbUpdates.customer_segments = updates.customerSegments;
      if (updates.evidenceCount !== undefined) dbUpdates.evidence_count = updates.evidenceCount;
      
      dbUpdates.updated_at = new Date().toISOString();
      
      const result = await productDevelopmentApi.updateProblem({ id, data: dbUpdates });
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Problem updated successfully',
        });
      } else {
        throw new Error('Failed to update problem');
      }
    } catch (err) {
      console.error('Error updating problem:', err);
      toast({
        title: 'Error',
        description: 'Failed to update problem',
        variant: 'destructive'
      });
    }
  }, [productDevelopmentApi, toast]);
  
  const deleteProblem = useCallback(async (id: string) => {
    try {
      const result = await productDevelopmentApi.deleteProblem(id);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Problem deleted successfully',
        });
      } else {
        throw new Error('Failed to delete problem');
      }
    } catch (err) {
      console.error('Error deleting problem:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete problem',
        variant: 'destructive'
      });
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
        toast({
          title: 'Success',
          description: 'Solution added successfully',
        });
      } else {
        throw new Error('Failed to add solution');
      }
    } catch (err) {
      console.error('Error adding solution:', err);
      toast({
        title: 'Error',
        description: 'Failed to add solution',
        variant: 'destructive'
      });
    }
  }, [projectId, productDevelopmentApi, toast]);
  
  const updateSolution = useCallback(async (id: string, updates: Partial<Solution>) => {
    try {
      // Convert component updates to DB updates
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.effectiveness !== undefined) dbUpdates.effectiveness = updates.effectiveness;
      if (updates.feasibility !== undefined) dbUpdates.feasibility = updates.feasibility;
      if (updates.hypothesisStatement !== undefined) dbUpdates.hypothesis_statement = updates.hypothesisStatement;
      
      dbUpdates.updated_at = new Date().toISOString();
      
      const result = await productDevelopmentApi.updateSolution({ id, data: dbUpdates });
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Solution updated successfully',
        });
      } else {
        throw new Error('Failed to update solution');
      }
    } catch (err) {
      console.error('Error updating solution:', err);
      toast({
        title: 'Error',
        description: 'Failed to update solution',
        variant: 'destructive'
      });
    }
  }, [productDevelopmentApi, toast]);
  
  const deleteSolution = useCallback(async (id: string) => {
    try {
      const result = await productDevelopmentApi.deleteSolution(id);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Solution deleted successfully',
        });
      } else {
        throw new Error('Failed to delete solution');
      }
    } catch (err) {
      console.error('Error deleting solution:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete solution',
        variant: 'destructive'
      });
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
      }
      
      return result;
    } catch (err) {
      console.error('Error adding evidence:', err);
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
      const dbUpdates: Partial<ProductEvidence> = {};
      
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
      }
      
      return result;
    } catch (err) {
      console.error('Error updating evidence:', err);
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
      }
      
      return result;
    } catch (err) {
      console.error('Error deleting evidence:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete evidence',
        variant: 'destructive'
      });
      throw err;
    }
  }, [productDevelopmentApi, toast]);
  
  // Feature operations
  const addFeature = useCallback(async (feature: any) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      // Extract base feature data
      const baseFeature = {
        name: feature.name,
        description: feature.description,
        priority: feature.priority,
        status: feature.status || 'planned',
        solution_id: feature.solutionId || null,
        tags: feature.tags || [],
        project_id: projectId
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
        toast({
          title: 'Success',
          description: 'Feature added successfully',
        });
        return result;
      } else {
        throw new Error('Failed to add feature');
      }
    } catch (err) {
      console.error('Error adding feature:', err);
      toast({
        title: 'Error',
        description: 'Failed to add feature',
        variant: 'destructive'
      });
      return null;
    }
  }, [projectId, productDesignApi, toast]);
  
  const updateFeature = useCallback(async (id: string, updates: any) => {
    try {
      // Separate base updates from metadata updates
      const baseUpdates: any = {};
      const metadataUpdates: any = {};
      
      // Base fields
      if (updates.name !== undefined) baseUpdates.name = updates.name;
      if (updates.description !== undefined) baseUpdates.description = updates.description;
      if (updates.priority !== undefined) baseUpdates.priority = updates.priority;
      if (updates.status !== undefined) baseUpdates.status = updates.status;
      if (updates.solution_id !== undefined) baseUpdates.solution_id = updates.solution_id;
      if (updates.tags !== undefined) baseUpdates.tags = updates.tags;
      
      // Metadata fields
      if (updates.effortScore !== undefined) metadataUpdates.effortScore = updates.effortScore;
      if (updates.valueScore !== undefined) metadataUpdates.valueScore = updates.valueScore;
      if (updates.isSelected !== undefined) metadataUpdates.isSelected = updates.isSelected;
      if (updates.estimatedTime !== undefined) metadataUpdates.estimatedTime = updates.estimatedTime;
      if (updates.assignedTo !== undefined) metadataUpdates.assignedTo = updates.assignedTo;
      
      // Get existing feature to merge metadata
      const existingFeature = productDesignApi.data.features.find(f => f.id === id);
      if (!existingFeature) {
        throw new Error('Feature not found');
      }
      
      // Merge metadata
      const existingMetadata = existingFeature.metadata || {};
      const newMetadata = {
        ...(typeof existingMetadata === 'object' && existingMetadata !== null ? existingMetadata : {}),
        ...metadataUpdates
      };
      
      if (Object.keys(metadataUpdates).length > 0) {
        baseUpdates.metadata = newMetadata;
      }
      
      // Only update if there are changes
      if (Object.keys(baseUpdates).length === 0) {
        return;
      }
      
      const result = await productDesignApi.updateFeature({
        id,
        data: baseUpdates
      });
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Feature updated successfully',
        });
      } else {
        throw new Error('Failed to update feature');
      }
    } catch (err) {
      console.error('Error updating feature:', err);
      toast({
        title: 'Error',
        description: 'Failed to update feature',
        variant: 'destructive'
      });
    }
  }, [productDesignApi, toast]);
  
  const deleteFeature = useCallback(async (id: string) => {
    try {
      const result = await productDesignApi.deleteFeature(id);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Feature deleted successfully',
        });
      } else {
        throw new Error('Failed to delete feature');
      }
    } catch (err) {
      console.error('Error deleting feature:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete feature',
        variant: 'destructive'
      });
    }
  }, [productDesignApi, toast]);
  
  // MVP scope operations
  const updateMVPScope = useCallback((featureIds: string[]) => {
    try {
      setSelectedMVPFeatures(featureIds);
      if (projectId) {
        localStorage.setItem(`mvp-features-${projectId}`, JSON.stringify(featureIds));
      }
    } catch (err) {
      console.error('Error updating MVP scope:', err);
      toast({
        title: 'Error',
        description: 'Failed to update MVP scope',
        variant: 'destructive'
      });
    }
  }, [projectId, toast]);
  
  // Success criteria operations
  const saveSuccessCriteria = useCallback((criteria: SuccessCriterion[]) => {
    try {
      setSuccessCriteria(criteria);
      if (projectId) {
        localStorage.setItem(`success-criteria-${projectId}`, JSON.stringify(criteria));
      }
    } catch (err) {
      console.error('Error saving success criteria:', err);
      toast({
        title: 'Error',
        description: 'Failed to save success criteria',
        variant: 'destructive'
      });
    }
  }, [projectId, toast]);
  
  // Timeline operations
  const saveTimeline = useCallback((timelineData: TimelinePhase[]) => {
    try {
      setTimeline(timelineData);
      if (projectId) {
        localStorage.setItem(`timeline-${projectId}`, JSON.stringify(timelineData));
      }
    } catch (err) {
      console.error('Error saving timeline:', err);
      toast({
        title: 'Error',
        description: 'Failed to save timeline',
        variant: 'destructive'
      });
    }
  }, [projectId, toast]);
  
  // Update the evidence link creation to use metadata instead of link_strength
  const createEvidenceLink = async (evidenceId: string, entityType: string, entityId: string): Promise<void> => {
    if (!projectId) return;
    
    try {
      const actualEntityId = entityId.startsWith('temp-') ? entityId.replace('temp-', '') : entityId;
      
      await productDevelopmentApi.addEvidenceLink({
        evidence_id: evidenceId,
        entity_id: actualEntityId,
        entity_type: entityType,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating evidence link:', error);
      toast({
        title: 'Error',
        description: 'Failed to link evidence to entity',
        variant: 'destructive'
      });
    }
  };
  
  // Fix the updateFeatureMetadata function
  const updateFeatureMetadata = async (featureId: string, metadataUpdates: Record<string, unknown>): Promise<void> => {
    if (!projectId) return;
    
    try {
      const existingFeature = productDesignApi.data.features.find(f => f.id === featureId);
      if (!existingFeature) return;
      
      // Safely handle metadata as Json type
      let existingMetadata: Record<string, Json> = {};
      
      if (existingFeature.metadata && typeof existingFeature.metadata === 'object') {
        existingMetadata = existingFeature.metadata as Record<string, Json>;
      }
      
      // Create new metadata object
      const newMetadata: Record<string, Json> = { ...existingMetadata };
      
      // Add updates
      Object.entries(metadataUpdates).forEach(([key, value]) => {
        newMetadata[key] = value as Json;
      });
      
      await productDesignApi.updateFeature({
        id: featureId,
        data: {
          metadata: newMetadata
        }
      });
    } catch (error) {
      console.error('Error updating feature metadata:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feature metadata',
        variant: 'destructive'
      });
    }
  };
  
  // Return all the data and methods
  return {
    // State
    problems,
    solutions,
    evidence,
    features,
    selectedMVPFeatures,
    successCriteria,
    timeline,
    isLoading,
    error,
    
    // Problem actions
    addProblem: useCallback(async (problem: Omit<Problem, 'id'>) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      try {
        const dbProblem = mapProblemToDBType(problem, projectId);
        const result = await productDevelopmentApi.addProblem(dbProblem);
        if (result) {
          setProblems(prev => [...prev, mapDBProblemToComponent(result)]);
          toast({
            title: 'Success',
            description: 'Problem added successfully',
          });
        }
        return result;
      } catch (err) {
        console.error('Error adding problem:', err);
        toast({
          title: 'Error',
          description: 'Failed to add problem',
          variant: 'destructive'
        });
        throw err;
      }
    }, [projectId, productDevelopmentApi, toast]),
    
    updateProblem: useCallback(async (id: string, updates: Partial<Problem>) => {
      try {
        // Convert component updates to DB format
        const dbUpdates: Partial<ProductProblem> = {};
        
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.significance !== undefined) dbUpdates.significance = updates.significance;
        if (updates.customerSegments !== undefined) dbUpdates.customer_segments = updates.customerSegments;
        
        dbUpdates.updated_at = new Date().toISOString();
        
        const result = await productDevelopmentApi.updateProblem({ id, data: dbUpdates });
        
        if (result) {
          // Update local state
          setProblems(prev => 
            prev.map(p => p.id === id ? { ...p, ...updates } : p)
          );
          
          toast({
            title: 'Success',
            description: 'Problem updated successfully',
          });
        }
        
        return result;
      } catch (err) {
        console.error('Error updating problem:', err);
        toast({
          title: 'Error',
          description: 'Failed to update problem',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDevelopmentApi, toast]),
    
    deleteProblem: useCallback(async (id: string) => {
      try {
        const result = await productDevelopmentApi.deleteProblem(id);
        
        if (result) {
          // Update local state
          setProblems(prev => prev.filter(p => p.id !== id));
          
          toast({
            title: 'Success',
            description: 'Problem deleted successfully',
          });
        }
        
        return result;
      } catch (err) {
        console.error('Error deleting problem:', err);
        toast({
          title: 'Error',
          description: 'Failed to delete problem',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDevelopmentApi, toast]),
    
    // Solution actions
    addSolution: useCallback(async (solution: Omit<Solution, 'id'>) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      try {
        const dbSolution = mapSolutionToDBType(solution, projectId, solution.problemId);
        const result = await productDevelopmentApi.addSolution(dbSolution);
        
        if (result) {
          // Update local state
          setSolutions(prev => [...prev, mapDBSolutionToComponent(result)]);
          
          toast({
            title: 'Success',
            description: 'Solution added successfully',
          });
        }
        
        return result;
      } catch (err) {
        console.error('Error adding solution:', err);
        toast({
          title: 'Error',
          description: 'Failed to add solution',
          variant: 'destructive'
        });
        throw err;
      }
    }, [projectId, productDevelopmentApi, toast]),
    
    updateSolution: useCallback(async (id: string, updates: Partial<Solution>) => {
      try {
        // Convert component updates to DB format
        const dbUpdates: Partial<ProductSolution> = {};
        
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
        }
        
        return result;
      } catch (err) {
        console.error('Error updating solution:', err);
        toast({
          title: 'Error',
          description: 'Failed to update solution',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDevelopmentApi, toast]),
    
    deleteSolution: useCallback(async (id: string) => {
      try {
        const result = await productDevelopmentApi.deleteSolution(id);
        
        if (result) {
          // Update local state
          setSolutions(prev => prev.filter(s => s.id !== id));
          
          toast({
            title: 'Success',
            description: 'Solution deleted successfully',
          });
        }
        
        return result;
      } catch (err) {
        console.error('Error deleting solution:', err);
        toast({
          title: 'Error',
          description: 'Failed to delete solution',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDevelopmentApi, toast]),
    
    // Feature actions and MVP scope actions
    addFeature: useCallback(async (feature: any) => {
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
          setFeatures(prev => [...prev, mapFeatureToComponent(result)]);
          
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
        toast({
          title: 'Error',
          description: 'Failed to add feature',
          variant: 'destructive'
        });
        throw err;
      }
    }, [projectId, productDesignApi, toast]),
    
    updateFeature: useCallback(async (id: string, updates: any) => {
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
        }
        
        return result;
      } catch (err) {
        console.error('Error updating feature:', err);
        toast({
          title: 'Error',
          description: 'Failed to update feature',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDesignApi, toast, features]),
    
    deleteFeature: useCallback(async (id: string) => {
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
        }
        
        return result;
      } catch (err) {
        console.error('Error deleting feature:', err);
        toast({
          title: 'Error',
          description: 'Failed to delete feature',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDesignApi, toast]),
    
    // Evidence actions
    addEvidence: useCallback(async (evidence: Omit<Evidence, 'id'>) => {
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
        }
        
        return result;
      } catch (err) {
        console.error('Error adding evidence:', err);
        toast({
          title: 'Error',
          description: 'Failed to add evidence',
          variant: 'destructive'
        });
        throw err;
      }
    }, [projectId, productDevelopmentApi, problems, solutions, toast]),
    
    updateMVPScope: useCallback((featureIds: string[]) => {
      // Update the list of selected MVP features
      setSelectedMVPFeatures(featureIds);
      
      // Also update the isSelected flag on each feature
      features.forEach(feature => {
        const isSelected = featureIds.includes(feature.id);
        if (feature.isSelected !== isSelected) {
          // We need to update the feature metadata
          const updatedMetadata = {
            ...feature.metadata,
            isSelected
          };
          
          // Call updateFeature
          productDesignApi.updateFeature({
            id: feature.id,
            data: {
              metadata: updatedMetadata
            }
          }).catch(err => {
            console.error('Error updating feature selection state:', err);
          });
        }
      });
    }, [features, productDesignApi]),
    
    saveSuccessCriteria: useCallback((criteria: SuccessCriterion[]) => {
      setSuccessCriteria(criteria);
    }, []),
    
    saveTimeline: useCallback((timelineData: TimelinePhase[]) => {
      setTimeline(timelineData);
    }, []),
    
    updateEvidence: useCallback(async (id: string, updates: Partial<Evidence>) => {
      try {
        // Convert component updates to DB format
        const dbUpdates: Partial<ProductEvidence> = {};
        
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
        }
        
        return result;
      } catch (err) {
        console.error('Error updating evidence:', err);
        toast({
          title: 'Error',
          description: 'Failed to update evidence',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDevelopmentApi, problems, solutions, toast]),
    
    deleteEvidence: useCallback(async (id: string) => {
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
        }
        
        return result;
      } catch (err) {
        console.error('Error deleting evidence:', err);
        toast({
          title: 'Error',
          description: 'Failed to delete evidence',
          variant: 'destructive'
        });
        throw err;
      }
    }, [productDevelopmentApi, toast]),
  };
} 