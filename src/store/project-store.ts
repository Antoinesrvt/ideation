import { useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  ProjectState,
  ProjectStore,
  Project,
  // Business Model Canvas
  CanvasSection,
  CanvasItem,
  // GRP Model
  GrpCategory,
  GrpSection,
  GrpItem,
  // Market Analysis
  MarketPersona,
  MarketInterview,
  MarketCompetitor,
  MarketTrend,
  // Product Design
  ProductWireframe,
  ProductFeature,
  ProductJourneyStage,
  ProductJourneyAction,
  ProductJourneyPainPoint,
  // Financial
  FinancialRevenueStream,
  FinancialCostStructure,
  FinancialPricingStrategy,
  FinancialProjection,
  // Validation
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis,
  // Team
  TeamMember,
  TeamTask,
  TeamResponsibilityMatrix,
  // Document
  Document,
  DocumentCollaborator,
  // Cross-feature
  ProjectNotification,
  RelatedItem,
  ProjectTag,
  FeatureItemTag,
  // Diff types
  DiffMetadata,
  FeatureDiff,
  ChangeType,
  // Optimistic Update types
  OptimisticItem,
  OptimisticItemsState,
  OptimisticOperation,
  ProjectRole,
  // Role Template
  RoleTemplate
} from './types';

// Initial state
const initialState: ProjectState = {
  currentData: {
    project: null,
    // Business Model Canvas
    canvasSections: [],
    canvasItems: [],
    // GRP Model
    grpCategories: [],
    grpSections: [],
    grpItems: [],
    // Market Analysis
    marketPersonas: [],
    marketInterviews: [],
    marketCompetitors: [],
    marketTrends: [],
    // Product Design
    productWireframes: [],
    productFeatures: [],
    productJourneyStages: [],
    productJourneyActions: [],
    productJourneyPainPoints: [],
    // Financial
    financialRevenueStreams: [],
    financialCostStructure: [],
    financialPricingStrategies: [],
    financialProjections: [],
    // Validation
    validationExperiments: [],
    validationABTests: [],
    validationUserFeedback: [],
    validationHypotheses: [],
    // Team
    teamMembers: [],
    teamTasks: [],
    teamResponsibilityMatrix: [],
    projectRoles: [],
    // Documents
    documents: [],
    documentCollaborators: [],
    // Cross-feature
    notifications: [],
    relatedItems: [],
    projectTags: [],
    featureItemTags: [],
  },
  stagedData: null,
  isLoading: false,
  error: null,
  comparisonMode: false,
};

// Initial diff metadata
const initialDiffMetadata: DiffMetadata = {
  project: { additions: [], modifications: [], deletions: [] },
  canvasSections: { additions: [], modifications: [], deletions: [] },
  canvasItems: { additions: [], modifications: [], deletions: [] },
  grpCategories: { additions: [], modifications: [], deletions: [] },
  grpSections: { additions: [], modifications: [], deletions: [] },
  grpItems: { additions: [], modifications: [], deletions: [] },
  marketPersonas: { additions: [], modifications: [], deletions: [] },
  marketInterviews: { additions: [], modifications: [], deletions: [] },
  marketCompetitors: { additions: [], modifications: [], deletions: [] },
  marketTrends: { additions: [], modifications: [], deletions: [] },
  productWireframes: { additions: [], modifications: [], deletions: [] },
  productFeatures: { additions: [], modifications: [], deletions: [] },
  productJourneyStages: { additions: [], modifications: [], deletions: [] },
  productJourneyActions: { additions: [], modifications: [], deletions: [] },
  productJourneyPainPoints: { additions: [], modifications: [], deletions: [] },
  financialRevenueStreams: { additions: [], modifications: [], deletions: [] },
  financialCostStructure: { additions: [], modifications: [], deletions: [] },
  financialPricingStrategies: { additions: [], modifications: [], deletions: [] },
  financialProjections: { additions: [], modifications: [], deletions: [] },
  validationExperiments: { additions: [], modifications: [], deletions: [] },
  validationABTests: { additions: [], modifications: [], deletions: [] },
  validationUserFeedback: { additions: [], modifications: [], deletions: [] },
  validationHypotheses: { additions: [], modifications: [], deletions: [] },
  teamMembers: { additions: [], modifications: [], deletions: [] },
  teamTasks: { additions: [], modifications: [], deletions: [] },
  teamResponsibilityMatrix: { additions: [], modifications: [], deletions: [] },
  documents: { additions: [], modifications: [], deletions: [] },
  documentCollaborators: { additions: [], modifications: [], deletions: [] },
  notifications: { additions: [], modifications: [], deletions: [] },
  relatedItems: { additions: [], modifications: [], deletions: [] },
  projectTags: { additions: [], modifications: [], deletions: [] },
  featureItemTags: { additions: [], modifications: [], deletions: [] },
  projectRoles: { additions: [], modifications: [], deletions: [] },
};

// Create the base atom
export const baseAtom = atom<ProjectState>(initialState);

// Create atoms for persisted UI state
export const comparisonModeAtom = atomWithStorage('projectComparisonMode', false);

// Create atom for diff metadata
export const diffMetadataAtom = atom<DiffMetadata>(initialDiffMetadata);

// Create atoms for optimistic updates
export const optimisticItemsAtom = atom<OptimisticItemsState>({});

// Helper function to update arrays
const updateArray = <T extends { id: string }>(
  array: T[],
  id: string,
  updates: Partial<T>
): T[] => {
  const index = array.findIndex((item) => item.id === id);
  if (index === -1) return array;
  return [
    ...array.slice(0, index),
    { ...array[index], ...updates },
    ...array.slice(index + 1),
  ];
};

// Helper function to calculate diff between two arrays
const calculateArrayDiff = <T extends { id: string }>(
  currentArray: T[],
  stagedArray: T[]
): FeatureDiff => {
  const currentIds = new Set(currentArray.map(item => item.id));
  const stagedIds = new Set(stagedArray.map(item => item.id));
  
  // Find additions (items in staged but not in current)
  const additions = stagedArray
    .filter(item => !currentIds.has(item.id))
    .map(item => item.id);
  
  // Find deletions (items in current but not in staged)
  const deletions = currentArray
    .filter(item => !stagedIds.has(item.id))
    .map(item => item.id);
  
  // Find modifications (items in both but with different values)
  const modifications = stagedArray
    .filter(stagedItem => {
      const currentItem = currentArray.find(c => c.id === stagedItem.id);
      if (!currentItem) return false;
      
      // Compare all properties except id
      return JSON.stringify(stagedItem) !== JSON.stringify(currentItem);
    })
    .map(item => item.id);
  
  return {
    additions,
    modifications,
    deletions
  };
};

// Helper function to get the feature key for a table name
const getFeatureKeyFromTable = (tableName: string): keyof ProjectState['currentData'] | null => {
  const tableToFeatureMap: Record<string, keyof ProjectState['currentData']> = {
    'projects': 'project',
    'canvas_sections': 'canvasSections',
    'canvas_items': 'canvasItems',
    'grp_categories': 'grpCategories',
    'grp_sections': 'grpSections',
    'grp_items': 'grpItems',
    'market_personas': 'marketPersonas',
    'market_interviews': 'marketInterviews',
    'market_competitors': 'marketCompetitors',
    'market_trends': 'marketTrends',
    'product_wireframes': 'productWireframes',
    'product_features': 'productFeatures',
    'product_journey_stages': 'productJourneyStages',
    'product_journey_actions': 'productJourneyActions',
    'product_journey_pain_points': 'productJourneyPainPoints',
    'financial_revenue_streams': 'financialRevenueStreams',
    'financial_cost_structure': 'financialCostStructure',
    'financial_pricing_strategies': 'financialPricingStrategies',
    'financial_projections': 'financialProjections',
    'validation_experiments': 'validationExperiments',
    'validation_ab_tests': 'validationABTests',
    'validation_user_feedback': 'validationUserFeedback',
    'validation_hypotheses': 'validationHypotheses',
    'team_members': 'teamMembers',
    'team_tasks': 'teamTasks',
    'team_responsibility_matrix': 'teamResponsibilityMatrix',
    'project_roles': 'projectRoles',
    'documents': 'documents',
    'document_collaborators': 'documentCollaborators',
    'project_notifications': 'notifications',
    'related_items': 'relatedItems',
    'project_tags': 'projectTags',
    'feature_item_tags': 'featureItemTags',
  };
  
  return tableToFeatureMap[tableName] || null;
};

// Create the store with all actions
export function useProjectStore(): ProjectStore {
  const [state, setState] = useAtom(baseAtom);
  const [comparisonMode, setComparisonMode] = useAtom(comparisonModeAtom);
  const [diffMetadata, setDiffMetadata] = useAtom(diffMetadataAtom);
  const [optimisticItems, setOptimisticItems] = useAtom(optimisticItemsAtom);

  // Calculate diff between current and staged data
  const calculateDiff = useCallback(() => {
    if (!state.stagedData) {
      setDiffMetadata(initialDiffMetadata);
      return;
    }
    
    const newDiffMetadata: DiffMetadata = { ...initialDiffMetadata };
    
    // Calculate diff for each feature
    Object.keys(state.currentData).forEach(featureKey => {
      const feature = featureKey as keyof ProjectState['currentData'];
      
      // Skip if feature is not an array
      if (!Array.isArray(state.currentData[feature])) {
        return;
      }
      
      // Calculate diff for this feature
      newDiffMetadata[feature] = calculateArrayDiff(
        state.currentData[feature] as any[],
        state.stagedData![feature] as any[]
      );
    });
    
    setDiffMetadata(newDiffMetadata);
  }, [state.currentData, state.stagedData, setDiffMetadata]);
  
  // Get change type for a specific item
  const getItemChangeType = useCallback((
    feature: keyof ProjectState['currentData'],
    id: string
  ): ChangeType => {
    if (!diffMetadata[feature]) return 'unchanged';
    
    if (diffMetadata[feature]!.additions.includes(id)) return 'added';
    if (diffMetadata[feature]!.modifications.includes(id)) return 'modified';
    if (diffMetadata[feature]!.deletions.includes(id)) return 'deleted';
    
    return 'unchanged';
  }, [diffMetadata]);
  
  // Apply selected changes
  const applySelectedChanges = useCallback((changeSelections: Record<string, boolean>) => {
    if (!state.stagedData) return;
    
    setState(prev => {
      const newCurrentData = { ...prev.currentData };
      
      // Process each selected change
      Object.entries(changeSelections).forEach(([changeId, isSelected]) => {
        if (!isSelected) return;
        
        const [featureKey, id] = changeId.split(':');
        const feature = featureKey as keyof ProjectState['currentData'];
        
        // Skip if feature is not an array
        if (!Array.isArray(newCurrentData[feature])) return;
        
        const changeType = getItemChangeType(feature, id);
        
        if (changeType === 'added' || changeType === 'modified') {
          // Find the item in staged data
          const stagedItem = (state.stagedData![feature] as any[]).find(item => item.id === id);
          if (!stagedItem) return;
          
          // Add or update the item in current data
          const index = (newCurrentData[feature] as any[]).findIndex(item => item.id === id);
          if (index >= 0) {
            // Update existing item
            (newCurrentData[feature] as any[])[index] = stagedItem;
          } else {
            // Add new item
            (newCurrentData[feature] as any[]) = [...(newCurrentData[feature] as any[]), stagedItem];
          }
        } else if (changeType === 'deleted') {
          // Remove the item from current data
          (newCurrentData[feature] as any[]) = (newCurrentData[feature] as any[]).filter(item => item.id !== id);
        }
      });
      
      return {
        ...prev,
        currentData: newCurrentData
      };
    });
    
    // Recalculate diff after applying changes
    calculateDiff();
  }, [state.stagedData, setState, getItemChangeType, calculateDiff]);
  
  // Discard selected changes
  const discardSelectedChanges = useCallback((changeSelections: Record<string, boolean>) => {
    if (!state.stagedData) return;
    
    setState(prev => {
      const newStagedData = { ...prev.stagedData! };
      
      // Process each selected change
      Object.entries(changeSelections).forEach(([changeId, isSelected]) => {
        if (!isSelected) return;
        
        const [featureKey, id] = changeId.split(':');
        const feature = featureKey as keyof ProjectState['currentData'];
        
        // Skip if feature is not an array
        if (!Array.isArray(newStagedData[feature])) return;
        
        const changeType = getItemChangeType(feature, id);
        
        if (changeType === 'added') {
          // Remove the added item from staged data
          (newStagedData[feature] as any[]) = (newStagedData[feature] as any[]).filter(item => item.id !== id);
        } else if (changeType === 'modified') {
          // Revert to the original item from current data
          const currentItem = (prev.currentData[feature] as any[]).find(item => item.id === id);
          if (!currentItem) return;
          
          const index = (newStagedData[feature] as any[]).findIndex(item => item.id === id);
          if (index >= 0) {
            (newStagedData[feature] as any[])[index] = currentItem;
          }
        } else if (changeType === 'deleted') {
          // Restore the deleted item from current data
          const currentItem = (prev.currentData[feature] as any[]).find(item => item.id === id);
          if (!currentItem) return;
          
          (newStagedData[feature] as any[]) = [...(newStagedData[feature] as any[]), currentItem];
        }
      });
      
      return {
        ...prev,
        stagedData: newStagedData
      };
    });
    
    // Recalculate diff after discarding changes
    calculateDiff();
  }, [state.stagedData, setState, getItemChangeType, calculateDiff]);

  // Set the entire current data state
  const setCurrentData = useCallback((data: ProjectState['currentData']) => {
    setState(prev => ({
      ...prev,
      currentData: data
    }));
  }, [setState]);

  // Set staged data
  const setStagedData = useCallback((data: ProjectState['currentData'] | null) => {
    setState(prev => ({
      ...prev,
      stagedData: data
    }));
    
    // Calculate diff when staged data changes
    if (data) {
      calculateDiff();
    } else {
      setDiffMetadata(initialDiffMetadata);
    }
  }, [setState, calculateDiff, setDiffMetadata]);

  // Commit staged changes
  const commitStagedChanges = useCallback(() => {
    setState(prev => {
      if (!prev.stagedData) return prev;
      return {
        ...prev,
        currentData: prev.stagedData,
        stagedData: null,
        comparisonMode: false
      };
    });
    
    // Reset diff metadata after committing
    setDiffMetadata(initialDiffMetadata);
  }, [setState, setDiffMetadata]);

  // Discard staged changes
  const discardStagedChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      stagedData: null,
      comparisonMode: false
    }));
    
    // Reset diff metadata after discarding
    setDiffMetadata(initialDiffMetadata);
  }, [setState, setDiffMetadata]);

  // Optimistic update functions
  const addOptimisticItem = useCallback(<T extends object>(
    tempId: string,
    tableName: string,
    data: T,
    operation: OptimisticOperation
  ) => {
    // Add to optimistic items
    setOptimisticItems(prev => ({
      ...prev,
      [tempId]: {
        id: tempId,
        isOptimistic: true,
        pendingOperation: operation,
        data,
        tableName
      }
    }));

    // Only add to the UI state for create/update operations
    if (operation !== 'delete') {
      const featureKey = getFeatureKeyFromTable(tableName);
      if (featureKey && Array.isArray(state.currentData[featureKey])) {
        setState(prev => {
          const updatedData = { ...prev.currentData };
          // Use type assertion to tell TypeScript we know what we're doing
          const currentItems = [...(updatedData[featureKey] as unknown[])] as any[];
          
          if (operation === 'create') {
            // Add new item
            currentItems.push({ ...data, id: tempId });
          } else if (operation === 'update' && 'originalId' in data) {
            // Update existing item
            const originalId = (data as any).originalId;
            const index = currentItems.findIndex(item => item.id === originalId);
            if (index >= 0) {
              const { originalId: _, ...updateData } = data as any;
              currentItems[index] = { ...currentItems[index], ...updateData };
            }
          }
          
          // Type assertion to ensure compatibility
          (updatedData[featureKey] as unknown[]) = currentItems;
          return { ...prev, currentData: updatedData };
        });
      }
    } else if (operation === 'delete' && 'id' in (data as any)) {
      // Handle delete operation - remove from UI immediately
      const featureKey = getFeatureKeyFromTable(tableName);
      if (featureKey && Array.isArray(state.currentData[featureKey])) {
        setState(prev => {
          const updatedData = { ...prev.currentData };
          // Use type assertion to tell TypeScript we know what we're doing
          const currentItems = (updatedData[featureKey] as unknown[]) as any[];
          const filteredItems = currentItems.filter(
            item => item.id !== (data as any).id
          );
          
          // Type assertion to ensure compatibility
          (updatedData[featureKey] as unknown[]) = filteredItems;
          return { ...prev, currentData: updatedData };
        });
      }
    }
  }, [setState, setOptimisticItems, state.currentData]);

  const replaceOptimisticItem = useCallback(<T extends object>(tempId: string, realItem: T) => {
    // Get the optimistic item
    const optimisticItem = optimisticItems[tempId];
    if (!optimisticItem) return;

    // Remove from optimistic items
    setOptimisticItems(prev => {
      const { [tempId]: _, ...rest } = prev;
      return rest;
    });

    // Replace in UI state
    const featureKey = getFeatureKeyFromTable(optimisticItem.tableName);
    if (featureKey && Array.isArray(state.currentData[featureKey])) {
      setState(prev => {
        const updatedData = { ...prev.currentData };
        // Use type assertion to tell TypeScript we know what we're doing
        const currentItems = [...(updatedData[featureKey] as unknown[])] as any[];
        
        if (optimisticItem.pendingOperation === 'create') {
          // Replace temp item with real one
          const index = currentItems.findIndex(item => item.id === tempId);
          if (index >= 0) {
            currentItems[index] = realItem;
          }
        } else if (optimisticItem.pendingOperation === 'update') {
          // Update existing item with real data
          const originalId = optimisticItem.originalId;
          const index = currentItems.findIndex(item => 
            item.id === (originalId || tempId)
          );
          if (index >= 0) {
            currentItems[index] = realItem;
          }
        }
        
        // Type assertion to ensure compatibility
        (updatedData[featureKey] as unknown[]) = currentItems;
        return { ...prev, currentData: updatedData };
      });
    }
  }, [optimisticItems, setState, state.currentData, setOptimisticItems]);

  const removeOptimisticItem = useCallback((tempId: string) => {
    // Get the optimistic item
    const optimisticItem = optimisticItems[tempId];
    if (!optimisticItem) return;

    // Remove from optimistic items
    setOptimisticItems(prev => {
      const { [tempId]: _, ...rest } = prev;
      return rest;
    });

    // Revert UI state
    const featureKey = getFeatureKeyFromTable(optimisticItem.tableName);
    if (featureKey && Array.isArray(state.currentData[featureKey])) {
      setState(prev => {
        const updatedData = { ...prev.currentData };
        // Use type assertion to tell TypeScript we know what we're doing
        const currentItems = [...(updatedData[featureKey] as unknown[])] as any[];
        let updatedItems: any[] = currentItems;
        
        if (optimisticItem.pendingOperation === 'create') {
          // Remove the temporary item
          updatedItems = currentItems.filter(item => item.id !== tempId);
        } else if (optimisticItem.pendingOperation === 'update' && optimisticItem.originalId) {
          // Revert to original
          // For a proper implementation, you'd need to keep the original data
          // This is simplified and just removes the item with temp ID
          updatedItems = currentItems.filter(item => item.id !== tempId);
        } else if (optimisticItem.pendingOperation === 'delete') {
          // Restore deleted item if you have the original data
          // For now, just no-op since we're not storing the original data
        }
        
        // Type assertion to ensure compatibility
        (updatedData[featureKey] as unknown[]) = updatedItems;
        return { ...prev, currentData: updatedData };
      });
    }
  }, [optimisticItems, setState, state.currentData, setOptimisticItems]);

  const getOptimisticItems = useCallback(() => {
    return optimisticItems;
  }, [optimisticItems]);

  const isOptimisticItem = useCallback((id: string) => {
    return id in optimisticItems;
  }, [optimisticItems]);

  return {
    // State
    ...state,
    comparisonMode,
    diffMetadata,

    // Diff tracking
    calculateDiff,
    getItemChangeType,
    applySelectedChanges,
    discardSelectedChanges,

    // Optimistic update actions
    addOptimisticItem,
    replaceOptimisticItem,
    removeOptimisticItem,
    getOptimisticItems,
    isOptimisticItem,
    getFeatureKeyFromTable,

    // Core actions
    setCurrentData,
    setStagedData,
    setComparisonMode,
    commitStagedChanges,
    discardStagedChanges,

    // Project actions
    setProject: useCallback((project) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          project,
        },
      }));
    }, [setState]),

    updateProject: useCallback((updates) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          project: prev.currentData.project
            ? { ...prev.currentData.project, ...updates }
            : null,
        },
      }));
    }, [setState]),

    // Business Model Canvas actions
    setCanvasSections: useCallback((sections: CanvasSection[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasSections: sections,
        },
      }));
    }, [setState]),

    addCanvasSection: useCallback((section: CanvasSection) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasSections: [...prev.currentData.canvasSections, section],
        },
      }));
    }, [setState]),

    updateCanvasSection: useCallback((id: string, updates: Partial<CanvasSection>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasSections: updateArray(prev.currentData.canvasSections, id, updates),
        },
      }));
    }, [setState]),

    deleteCanvasSection: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasSections: prev.currentData.canvasSections.filter(
            (section) => section.id !== id
          ),
        },
      }));
    }, [setState]),

    setCanvasItems: useCallback((items: CanvasItem[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasItems: items,
        },
      }));
    }, [setState]),

    addCanvasItem: useCallback((item: CanvasItem) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasItems: [...prev.currentData.canvasItems, item],
        },
      }));
    }, [setState]),

    updateCanvasItem: useCallback((id: string, updates: Partial<CanvasItem>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasItems: updateArray(prev.currentData.canvasItems, id, updates),
        },
      }));
    }, [setState]),

    deleteCanvasItem: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          canvasItems: prev.currentData.canvasItems.filter(
            (item) => item.id !== id
          ),
        },
      }));
    }, [setState]),

    // GRP Model actions
    setGrpCategories: useCallback((categories: GrpCategory[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpCategories: categories,
        },
      }));
    }, [setState]),

    addGrpCategory: useCallback((category: GrpCategory) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpCategories: [...prev.currentData.grpCategories, category],
        },
      }));
    }, [setState]),

    updateGrpCategory: useCallback((id: string, updates: Partial<GrpCategory>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpCategories: updateArray(prev.currentData.grpCategories, id, updates),
        },
      }));
    }, [setState]),

    deleteGrpCategory: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpCategories: prev.currentData.grpCategories.filter(
            (category) => category.id !== id
          ),
        },
      }));
    }, [setState]),

    setGrpSections: useCallback((sections: GrpSection[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpSections: sections,
        },
      }));
    }, [setState]),

    addGrpSection: useCallback((section: GrpSection) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpSections: [...prev.currentData.grpSections, section],
        },
      }));
    }, [setState]),

    updateGrpSection: useCallback((id: string, updates: Partial<GrpSection>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpSections: updateArray(prev.currentData.grpSections, id, updates),
        },
      }));
    }, [setState]),

    deleteGrpSection: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpSections: prev.currentData.grpSections.filter(
            (section) => section.id !== id
          ),
        },
      }));
    }, [setState]),

    setGrpItems: useCallback((items: GrpItem[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpItems: items,
        },
      }));
    }, [setState]),

    addGrpItem: useCallback((item: GrpItem) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpItems: [...prev.currentData.grpItems, item],
        },
      }));
    }, [setState]),

    updateGrpItem: useCallback((id: string, updates: Partial<GrpItem>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpItems: updateArray(prev.currentData.grpItems, id, updates),
        },
      }));
    }, [setState]),

    deleteGrpItem: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          grpItems: prev.currentData.grpItems.filter(
            (item) => item.id !== id
          ),
        },
      }));
    }, [setState]),

    // Market Analysis actions
    setMarketPersonas: useCallback((personas: MarketPersona[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketPersonas: personas,
        },
      }));
    }, [setState]),

    addMarketPersona: useCallback((persona: MarketPersona) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketPersonas: [...prev.currentData.marketPersonas, persona],
        },
      }));
    }, [setState]),

    updateMarketPersona: useCallback((id: string, updates: Partial<MarketPersona>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketPersonas: updateArray(prev.currentData.marketPersonas, id, updates),
        },
      }));
    }, [setState]),

    deleteMarketPersona: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketPersonas: prev.currentData.marketPersonas.filter(
            (persona) => persona.id !== id
          ),
        },
      }));
    }, [setState]),

    setMarketInterviews: useCallback((interviews: MarketInterview[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketInterviews: interviews,
        },
      }));
    }, [setState]),

    addMarketInterview: useCallback((interview: MarketInterview) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketInterviews: [...prev.currentData.marketInterviews, interview],
        },
      }));
    }, [setState]),

    updateMarketInterview: useCallback((id: string, updates: Partial<MarketInterview>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketInterviews: updateArray(prev.currentData.marketInterviews, id, updates),
        },
      }));
    }, [setState]),

    deleteMarketInterview: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketInterviews: prev.currentData.marketInterviews.filter(
            (interview) => interview.id !== id
          ),
        },
      }));
    }, [setState]),

    setMarketCompetitors: useCallback((competitors: MarketCompetitor[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketCompetitors: competitors,
        },
      }));
    }, [setState]),

    addMarketCompetitor: useCallback((competitor: MarketCompetitor) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketCompetitors: [...prev.currentData.marketCompetitors, competitor],
        },
      }));
    }, [setState]),

    updateMarketCompetitor: useCallback((id: string, updates: Partial<MarketCompetitor>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketCompetitors: updateArray(prev.currentData.marketCompetitors, id, updates),
        },
      }));
    }, [setState]),

    deleteMarketCompetitor: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketCompetitors: prev.currentData.marketCompetitors.filter(
            (competitor) => competitor.id !== id
          ),
        },
      }));
    }, [setState]),

    setMarketTrends: useCallback((trends: MarketTrend[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketTrends: trends,
        },
      }));
    }, [setState]),

    addMarketTrend: useCallback((trend: MarketTrend) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketTrends: [...prev.currentData.marketTrends, trend],
        },
      }));
    }, [setState]),

    updateMarketTrend: useCallback((id: string, updates: Partial<MarketTrend>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketTrends: updateArray(prev.currentData.marketTrends, id, updates),
        },
      }));
    }, [setState]),

    deleteMarketTrend: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          marketTrends: prev.currentData.marketTrends.filter(
            (trend) => trend.id !== id
          ),
        },
      }));
    }, [setState]),

    // Product Design actions
    setProductWireframes: useCallback((wireframes: ProductWireframe[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productWireframes: wireframes,
        },
      }));
    }, [setState]),

    addProductWireframe: useCallback((wireframe: ProductWireframe) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productWireframes: [...prev.currentData.productWireframes, wireframe],
        },
      }));
    }, [setState]),

    updateProductWireframe: useCallback((id: string, updates: Partial<ProductWireframe>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productWireframes: updateArray(prev.currentData.productWireframes, id, updates),
        },
      }));
    }, [setState]),

    deleteProductWireframe: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productWireframes: prev.currentData.productWireframes.filter(
            (wireframe) => wireframe.id !== id
          ),
        },
      }));
    }, [setState]),

    setProductFeatures: useCallback((features: ProductFeature[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productFeatures: features,
        },
      }));
    }, [setState]),

    addProductFeature: useCallback((feature: ProductFeature) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productFeatures: [...prev.currentData.productFeatures, feature],
        },
      }));
    }, [setState]),

    updateProductFeature: useCallback((id: string, updates: Partial<ProductFeature>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productFeatures: updateArray(prev.currentData.productFeatures, id, updates),
        },
      }));
    }, [setState]),

    deleteProductFeature: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productFeatures: prev.currentData.productFeatures.filter(
            (feature) => feature.id !== id
          ),
        },
      }));
    }, [setState]),

    setProductJourneyStages: useCallback((stages: ProductJourneyStage[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyStages: stages,
        },
      }));
    }, [setState]),

    addProductJourneyStage: useCallback((stage: ProductJourneyStage) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyStages: [...prev.currentData.productJourneyStages, stage],
        },
      }));
    }, [setState]),

    updateProductJourneyStage: useCallback((id: string, updates: Partial<ProductJourneyStage>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyStages: updateArray(prev.currentData.productJourneyStages, id, updates),
        },
      }));
    }, [setState]),

    deleteProductJourneyStage: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyStages: prev.currentData.productJourneyStages.filter(
            (stage) => stage.id !== id
          ),
        },
      }));
    }, [setState]),

    setProductJourneyActions: useCallback((actions: ProductJourneyAction[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyActions: actions,
        },
      }));
    }, [setState]),

    addProductJourneyAction: useCallback((action: ProductJourneyAction) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyActions: [...prev.currentData.productJourneyActions, action],
        },
      }));
    }, [setState]),

    updateProductJourneyAction: useCallback((id: string, updates: Partial<ProductJourneyAction>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyActions: updateArray(prev.currentData.productJourneyActions, id, updates),
        },
      }));
    }, [setState]),

    deleteProductJourneyAction: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyActions: prev.currentData.productJourneyActions.filter(
            (action) => action.id !== id
          ),
        },
      }));
    }, [setState]),

    setProductJourneyPainPoints: useCallback((painPoints: ProductJourneyPainPoint[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyPainPoints: painPoints,
        },
      }));
    }, [setState]),

    addProductJourneyPainPoint: useCallback((painPoint: ProductJourneyPainPoint) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyPainPoints: [...prev.currentData.productJourneyPainPoints, painPoint],
        },
      }));
    }, [setState]),

    updateProductJourneyPainPoint: useCallback((id: string, updates: Partial<ProductJourneyPainPoint>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyPainPoints: updateArray(prev.currentData.productJourneyPainPoints, id, updates),
        },
      }));
    }, [setState]),

    deleteProductJourneyPainPoint: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          productJourneyPainPoints: prev.currentData.productJourneyPainPoints.filter(
            (painPoint) => painPoint.id !== id
          ),
        },
      }));
    }, [setState]),

    // Financial actions
    setFinancialRevenueStreams: useCallback((streams: FinancialRevenueStream[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialRevenueStreams: streams,
        },
      }));
    }, [setState]),

    addFinancialRevenueStream: useCallback((stream: FinancialRevenueStream) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialRevenueStreams: [...prev.currentData.financialRevenueStreams, stream],
        },
      }));
    }, [setState]),

    updateFinancialRevenueStream: useCallback((id: string, updates: Partial<FinancialRevenueStream>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialRevenueStreams: updateArray(prev.currentData.financialRevenueStreams, id, updates),
        },
      }));
    }, [setState]),

    deleteFinancialRevenueStream: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialRevenueStreams: prev.currentData.financialRevenueStreams.filter(
            (stream) => stream.id !== id
          ),
        },
      }));
    }, [setState]),

    setFinancialCostStructure: useCallback((costs: FinancialCostStructure[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialCostStructure: costs,
        },
      }));
    }, [setState]),

    addFinancialCostStructure: useCallback((cost: FinancialCostStructure) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialCostStructure: [...prev.currentData.financialCostStructure, cost],
        },
      }));
    }, [setState]),

    updateFinancialCostStructure: useCallback((id: string, updates: Partial<FinancialCostStructure>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialCostStructure: updateArray(prev.currentData.financialCostStructure, id, updates),
        },
      }));
    }, [setState]),

    deleteFinancialCostStructure: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialCostStructure: prev.currentData.financialCostStructure.filter(
            (cost) => cost.id !== id
          ),
        },
      }));
    }, [setState]),

    setFinancialPricingStrategies: useCallback((strategies: FinancialPricingStrategy[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialPricingStrategies: strategies,
        },
      }));
    }, [setState]),

    addFinancialPricingStrategy: useCallback((strategy: FinancialPricingStrategy) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialPricingStrategies: [...prev.currentData.financialPricingStrategies, strategy],
        },
      }));
    }, [setState]),

    updateFinancialPricingStrategy: useCallback((id: string, updates: Partial<FinancialPricingStrategy>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialPricingStrategies: updateArray(prev.currentData.financialPricingStrategies, id, updates),
        },
      }));
    }, [setState]),

    deleteFinancialPricingStrategy: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialPricingStrategies: prev.currentData.financialPricingStrategies.filter(
            (strategy) => strategy.id !== id
          ),
        },
      }));
    }, [setState]),

    setFinancialProjections: useCallback((projections: FinancialProjection[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialProjections: projections,
        },
      }));
    }, [setState]),

    addFinancialProjection: useCallback((projection: FinancialProjection) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialProjections: [...prev.currentData.financialProjections, projection],
        },
      }));
    }, [setState]),

    updateFinancialProjection: useCallback((id: string, updates: Partial<FinancialProjection>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialProjections: updateArray(prev.currentData.financialProjections, id, updates),
        },
      }));
    }, [setState]),

    deleteFinancialProjection: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          financialProjections: prev.currentData.financialProjections.filter(
            (projection) => projection.id !== id
          ),
        },
      }));
    }, [setState]),

    // Validation actions
    setValidationExperiments: useCallback((experiments: ValidationExperiment[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationExperiments: experiments,
        },
      }));
    }, [setState]),

    addValidationExperiment: useCallback((experiment: ValidationExperiment) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationExperiments: [...prev.currentData.validationExperiments, experiment],
        },
      }));
    }, [setState]),

    updateValidationExperiment: useCallback((id: string, updates: Partial<ValidationExperiment>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationExperiments: updateArray(prev.currentData.validationExperiments, id, updates),
        },
      }));
    }, [setState]),

    deleteValidationExperiment: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationExperiments: prev.currentData.validationExperiments.filter(
            (experiment) => experiment.id !== id
          ),
        },
      }));
    }, [setState]),

    setValidationABTests: useCallback((tests: ValidationABTest[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationABTests: tests,
        },
      }));
    }, [setState]),

    addValidationABTest: useCallback((test: ValidationABTest) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationABTests: [...prev.currentData.validationABTests, test],
        },
      }));
    }, [setState]),

    updateValidationABTest: useCallback((id: string, updates: Partial<ValidationABTest>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationABTests: updateArray(prev.currentData.validationABTests, id, updates),
        },
      }));
    }, [setState]),

    deleteValidationABTest: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationABTests: prev.currentData.validationABTests.filter(
            (test) => test.id !== id
          ),
        },
      }));
    }, [setState]),

    setValidationUserFeedback: useCallback((feedback: ValidationUserFeedback[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationUserFeedback: feedback,
        },
      }));
    }, [setState]),

    addValidationUserFeedback: useCallback((feedback: ValidationUserFeedback) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationUserFeedback: [...prev.currentData.validationUserFeedback, feedback],
        },
      }));
    }, [setState]),

    updateValidationUserFeedback: useCallback((id: string, updates: Partial<ValidationUserFeedback>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationUserFeedback: updateArray(prev.currentData.validationUserFeedback, id, updates),
        },
      }));
    }, [setState]),

    deleteValidationUserFeedback: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationUserFeedback: prev.currentData.validationUserFeedback.filter(
            (feedback) => feedback.id !== id
          ),
        },
      }));
    }, [setState]),

    setValidationHypotheses: useCallback((hypotheses: ValidationHypothesis[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationHypotheses: hypotheses,
        },
      }));
    }, [setState]),

    addValidationHypothesis: useCallback((hypothesis: ValidationHypothesis) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationHypotheses: [...prev.currentData.validationHypotheses, hypothesis],
        },
      }));
    }, [setState]),

    updateValidationHypothesis: useCallback((id: string, updates: Partial<ValidationHypothesis>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationHypotheses: updateArray(prev.currentData.validationHypotheses, id, updates),
        },
      }));
    }, [setState]),

    deleteValidationHypothesis: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          validationHypotheses: prev.currentData.validationHypotheses.filter(
            (hypothesis) => hypothesis.id !== id
          ),
        },
      }));
    }, [setState]),

    // Team actions
    setTeamMembers: useCallback((members: TeamMember[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamMembers: members,
        },
      }));
    }, [setState]),

    addTeamMember: useCallback((member: TeamMember) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamMembers: [...prev.currentData.teamMembers, member],
        },
      }));
    }, [setState]),

    updateTeamMember: useCallback((id: string, updates: Partial<TeamMember>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamMembers: updateArray(prev.currentData.teamMembers, id, updates),
        },
      }));
    }, [setState]),

    deleteTeamMember: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamMembers: prev.currentData.teamMembers.filter(
            (member) => member.id !== id
          ),
        },
      }));
    }, [setState]),

    setTeamTasks: useCallback((tasks: TeamTask[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamTasks: tasks,
        },
      }));
    }, [setState]),

    addTeamTask: useCallback((task: TeamTask) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamTasks: [...prev.currentData.teamTasks, task],
        },
      }));
    }, [setState]),

    updateTeamTask: useCallback((id: string, updates: Partial<TeamTask>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamTasks: updateArray(prev.currentData.teamTasks, id, updates),
        },
      }));
    }, [setState]),

    deleteTeamTask: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamTasks: prev.currentData.teamTasks.filter((task) => task.id !== id),
        },
      }));
    }, [setState]),

    // Team Responsibility Matrix actions
    setTeamResponsibilityMatrix: useCallback((matrix: TeamResponsibilityMatrix[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamResponsibilityMatrix: matrix,
        },
      }));
    }, [setState]),

    addTeamResponsibilityMatrix: useCallback((matrix: TeamResponsibilityMatrix) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamResponsibilityMatrix: [...prev.currentData.teamResponsibilityMatrix, matrix],
        },
      }));
    }, [setState]),

    updateTeamResponsibilityMatrix: useCallback((id: string, updates: Partial<TeamResponsibilityMatrix>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamResponsibilityMatrix: updateArray(prev.currentData.teamResponsibilityMatrix, id, updates),
        },
      }));
    }, [setState]),

    deleteTeamResponsibilityMatrix: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          teamResponsibilityMatrix: prev.currentData.teamResponsibilityMatrix.filter((matrix) => matrix.id !== id),
        },
      }));
    }, [setState]),

    // Document actions
    setDocuments: useCallback((documents: Document[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documents,
        },
      }));
    }, [setState]),

    addDocument: useCallback((document: Document) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documents: [...prev.currentData.documents, document],
        },
      }));
    }, [setState]),

    updateDocument: useCallback((id: string, updates: Partial<Document>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documents: updateArray(prev.currentData.documents, id, updates),
        },
      }));
    }, [setState]),

    deleteDocument: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documents: prev.currentData.documents.filter((doc) => doc.id !== id),
        },
      }));
    }, [setState]),

    // Document Collaborator actions
    setDocumentCollaborators: useCallback((collaborators: DocumentCollaborator[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documentCollaborators: collaborators,
        },
      }));
    }, [setState]),

    addDocumentCollaborator: useCallback((collaborator: DocumentCollaborator) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documentCollaborators: [...prev.currentData.documentCollaborators, collaborator],
        },
      }));
    }, [setState]),

    updateDocumentCollaborator: useCallback((id: string, updates: Partial<DocumentCollaborator>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documentCollaborators: updateArray(prev.currentData.documentCollaborators, id, updates),
        },
      }));
    }, [setState]),

    deleteDocumentCollaborator: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          documentCollaborators: prev.currentData.documentCollaborators.filter((collaborator) => collaborator.id !== id),
        },
      }));
    }, [setState]),

    // Cross-feature actions
    setNotifications: useCallback((notifications: ProjectNotification[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          notifications,
        },
      }));
    }, [setState]),

    addNotification: useCallback((notification: ProjectNotification) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          notifications: [...prev.currentData.notifications, notification],
        },
      }));
    }, [setState]),

    updateNotification: useCallback((id: string, updates: Partial<ProjectNotification>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          notifications: updateArray(prev.currentData.notifications, id, updates),
        },
      }));
    }, [setState]),

    deleteNotification: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          notifications: prev.currentData.notifications.filter((notification) => notification.id !== id),
        },
      }));
    }, [setState]),

    setRelatedItems: useCallback((items: RelatedItem[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          relatedItems: items,
        },
      }));
    }, [setState]),

    addRelatedItem: useCallback((item: RelatedItem) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          relatedItems: [...prev.currentData.relatedItems, item],
        },
      }));
    }, [setState]),

    updateRelatedItem: useCallback((id: string, updates: Partial<RelatedItem>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          relatedItems: updateArray(prev.currentData.relatedItems, id, updates),
        },
      }));
    }, [setState]),

    deleteRelatedItem: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          relatedItems: prev.currentData.relatedItems.filter((item) => item.id !== id),
        },
      }));
    }, [setState]),

    // Project Tags actions
    setProjectTags: useCallback((tags: ProjectTag[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectTags: tags,
        },
      }));
    }, [setState]),

    addProjectTag: useCallback((tag: ProjectTag) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectTags: [...prev.currentData.projectTags, tag],
        },
      }));
    }, [setState]),

    updateProjectTag: useCallback((id: string, updates: Partial<ProjectTag>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectTags: updateArray(prev.currentData.projectTags, id, updates),
        },
      }));
    }, [setState]),

    deleteProjectTag: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectTags: prev.currentData.projectTags.filter((tag) => tag.id !== id),
        },
      }));
    }, [setState]),

    // Feature Item Tags actions
    setFeatureItemTags: useCallback((tags: FeatureItemTag[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          featureItemTags: tags,
        },
      }));
    }, [setState]),

    addFeatureItemTag: useCallback((tag: FeatureItemTag) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          featureItemTags: [...prev.currentData.featureItemTags, tag],
        },
      }));
    }, [setState]),

    updateFeatureItemTag: useCallback((id: string, updates: Partial<FeatureItemTag>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          featureItemTags: updateArray(prev.currentData.featureItemTags, id, updates),
        },
      }));
    }, [setState]),

    deleteFeatureItemTag: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          featureItemTags: prev.currentData.featureItemTags.filter((tag) => tag.id !== id),
        },
      }));
    }, [setState]),

    // Version control actions
    stageChanges: useCallback(() => {
      setState((prev) => ({
        ...prev,
        stagedData: { ...prev.currentData },
      }));
    }, [setState]),

    commitChanges: useCallback(() => {
      setState((prev) => ({
        ...prev,
        stagedData: null,
        comparisonMode: false,
      }));
    }, [setState]),

    discardChanges: useCallback(() => {
      setState(prev => {
        if (prev.stagedData) {
          return {
            ...prev,
            currentData: { ...prev.stagedData },
            stagedData: null,
            comparisonMode: false,
          };
        }
        return prev;
      });
    }, [setState]),

    toggleComparisonMode: useCallback(() => {
      setComparisonMode((prev) => !prev);
    }, [setComparisonMode]),

    // Loading and error states
    setLoading: useCallback((isLoading: boolean) => {
      setState((prev) => ({
        ...prev,
        isLoading,
      }));
    }, [setState]),

    setError: useCallback((error: Error | null) => {
      setState((prev) => ({
        ...prev,
        error,
      }));
    }, [setState]),

    // Project Roles actions
    setProjectRoles: useCallback((roles: ProjectRole[]) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectRoles: roles
        }
      }));
    }, [setState]),

    addProjectRole: useCallback((role: ProjectRole) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectRoles: [...prev.currentData.projectRoles, role]
        }
      }));
    }, [setState]),

    updateProjectRole: useCallback((id: string, updates: Partial<ProjectRole>) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectRoles: updateArray(prev.currentData.projectRoles, id, updates)
        }
      }));
    }, [setState]),

    deleteProjectRole: useCallback((id: string) => {
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          projectRoles: prev.currentData.projectRoles.filter(r => r.id !== id)
        }
      }));
    }, [setState]),

  };
} 