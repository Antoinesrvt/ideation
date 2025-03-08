import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { GRPService, GRPModel } from '@/lib/services/features/grp-service';
import { grpService } from '@/lib/services';
import { useProjectStore } from '@/store';
import type { 
  GrpCategory, 
  GrpSection, 
  GrpItem,
  ChangeType
} from '@/store/types';

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Type for new GRP items before they are added to the database
type NewGRPItem = {
  title: string;
  description: string | null;
  percentage: number | null;
  order_index: number | null;
  created_by: string | null;
};

// Extended GRP item type with category and section info for our UI
interface ExtendedGrpItem extends GrpItem {
  categoryType: string;
  sectionName: string;
}

export interface UseGRPReturn {
  data: GRPModel;
  isLoading: boolean;
  error: Error | null;

  // Core operations
  addItem: (category: string | GrpCategory, section: string, item: NewGRPItem) => Promise<GrpItem | null>;
  updateItem: (category: string | GrpCategory, section: string, id: string, data: Partial<NewGRPItem>) => Promise<GrpItem | null>;
  deleteItem: (category: string | GrpCategory, section: string, id: string) => Promise<boolean>;

  // Diff helpers
  getItemChangeType: (id: string) => ChangeType;
  getCategoryChangeType: (id: string) => ChangeType;
  getSectionChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;

  // Analytics
  getAllItems: () => ExtendedGrpItem[];
  getGRPMetrics: () => {
    totalItems: number;
    itemsWithPercentage: number;
    itemsWithoutPercentage: number;
    categoryCounts: Record<string, number>;
    mostPopulatedCategory: string;
    leastPopulatedCategory: string;
    completionPercentage: number;
  } | null;
}

/**
 * Executes a function with retry logic
 */
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
}

export function useGRP(projectId: string | undefined): UseGRPReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create stable, memoized query keys to prevent unnecessary refetching
  const queryKeys = useMemo(() => ({
    all: ['grp', projectId] as const,
    categories: ['grp', projectId, 'categories'] as const,
    sections: ['grp', projectId, 'sections'] as const,
    model: ['grp', projectId, 'model'] as const,
  }), [projectId]);

  // Use React Query to fetch GRP data
  const { 
    data: grpModelData, 
    isLoading: grpModelLoading, 
    error: grpModelError 
  } = useQuery({
    queryKey: queryKeys.model,
    queryFn: () => grpService.getAllGRPData(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use React Query to fetch categories
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => grpService.getCategories(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use React Query to fetch sections
  const { 
    data: sectionsData, 
    isLoading: sectionsLoading, 
    error: sectionsError 
  } = useQuery({
    queryKey: queryKeys.sections,
    queryFn: async () => {
      if (!projectId || !categoriesData) return [];
      
      // Collect sections from all categories
      const allSections: GrpSection[] = [];
      for (const category of categoriesData) {
        const sections = await grpService.getSections(projectId, category.id);
        allSections.push(...sections);
      }
      return allSections;
    },
    enabled: !!projectId && !!categoriesData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to check array equality
  function arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    
    // Check if arrays have same items (not concerned with order for this use case)
    const sortedA = [...a].sort((x, y) => 
      (x.id && y.id) ? x.id.localeCompare(y.id) : 0
    );
    const sortedB = [...b].sort((x, y) => 
      (x.id && y.id) ? x.id.localeCompare(y.id) : 0
    );
    
    // Simple comparison of stringified arrays (works for our case of objects with IDs)
    return JSON.stringify(sortedA) === JSON.stringify(sortedB);
  }

  // Update store when query data changes, but only if data has actually changed
  useEffect(() => {
    if (categoriesData && !arraysEqual(categoriesData, store.currentData.grpCategories)) {
      store.setGrpCategories(categoriesData);
    }
  }, [categoriesData, store]);

  useEffect(() => {
    if (sectionsData && !arraysEqual(sectionsData, store.currentData.grpSections)) {
      store.setGrpSections(sectionsData);
    }
  }, [sectionsData, store]);

  useEffect(() => {
    if (grpModelData) {
      // Extract all items from all categories and sections
      const allItems: GrpItem[] = [];
      Object.values(grpModelData).forEach(category => {
        Object.values(category).forEach(sectionItems => {
          // Add type assertion to handle the unknown type
          if (Array.isArray(sectionItems)) {
            allItems.push(...sectionItems);
          }
        });
      });
      
      // Update only if different
      if (!arraysEqual(allItems, store.currentData.grpItems)) {
        store.setGrpItems(allItems);
      }
    }
  }, [grpModelData, store]);

  // Get data from the store based on comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      grpCategories: source.grpCategories || [],
      grpSections: source.grpSections || [],
      grpItems: (source.grpItems || []) as unknown as ExtendedGrpItem[]
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // If in comparison mode, use store data, otherwise use React Query data
  const model = useMemo(() => {
    if (store.comparisonMode) {
      // In comparison mode, return model built from store data
      // This requires transforming the store data into the GRP model structure
      return buildGRPModelFromStoreData(storeData);
    } else {
      // In normal mode, use React Query data
      return grpModelData || {
        generation: {
          porteurs: [],
          propositionValeur: [],
          fabricationValeur: []
        },
        remuneration: {
          sourcesRevenus: [],
          volumeRevenus: [],
          performance: []
        },
        partage: {
          partiesPrenantes: [],
          conventions: [],
          ecosysteme: []
        }
      };
    }
  }, [store.comparisonMode, storeData, grpModelData]);

  // Helper function to transform the store data into a GRP model
  function buildGRPModelFromStoreData(data: {
    grpCategories: GrpCategory[];
    grpSections: GrpSection[];
    grpItems: ExtendedGrpItem[];
  }): GRPModel {
    // Create empty model structure
    const model: GRPModel = {
      generation: {
        porteurs: [],
        propositionValeur: [],
        fabricationValeur: []
      },
      remuneration: {
        sourcesRevenus: [],
        volumeRevenus: [],
        performance: []
      },
      partage: {
        partiesPrenantes: [],
        conventions: [],
        ecosysteme: []
      }
    };
    
    // Map sections to their respective categories
    const sectionToCategory = new Map<string, string>();
    data.grpSections.forEach(section => {
      const category = data.grpCategories.find(c => c.id === section.category_id);
      if (category && category.category_type) {
        sectionToCategory.set(section.id, category.category_type);
      }
    });
    
    // Organize items into their respective categories and sections
    data.grpItems.forEach(item => {
      const sectionId = item.section_id;
      if (!sectionId) return;
      
      const categoryType = sectionToCategory.get(sectionId);
      if (!categoryType) return;
      
      const section = data.grpSections.find(s => s.id === sectionId);
      if (!section || !section.name) return;
      
      // Map section names to the appropriate model key
      // Convert section name (e.g., "Proposition Valeur") to camelCase (e.g., "propositionValeur")
      const sectionKey = section.name.replace(/\s+(.)/g, (_, c) => c.toLowerCase());
      
      // Place the item in the appropriate section of the model
      if (categoryType in model && sectionKey in model[categoryType as keyof GRPModel]) {
        (model[categoryType as keyof GRPModel] as any)[sectionKey].push(item);
      }
    });
    
    return model;
  }

  // Compute loading and error states
  const isLoading = grpModelLoading || categoriesLoading || sectionsLoading;
  const queryError = grpModelError || categoriesError || sectionsError;

  // === Core Operations ===
  const addItem = useCallback(async (
    category: string | GrpCategory, 
    section: string, 
    item: NewGRPItem
  ): Promise<GrpItem | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeItem: GrpItem = {
      ...item,
      id: tempId,
      project_id: projectId,
      section_id: '', // Will be set by the service
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalItems = [...store.currentData.grpItems];
    
    try {
      // 1. Update store optimistically
      store.addGrpItem(completeItem);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => {
        // Need to convert from GrpCategory (database row) to GRPCategory (string enum)
        // GRPCategory is one of: 'generation', 'remuneration', 'partage'
        let categoryKey: string;
        
        if (typeof category === 'string') {
          // If it's already a string, use it directly
          categoryKey = category;
        } else if (typeof category === 'object' && category !== null) {
          // If it's a GrpCategory object from the database, extract the category_type
          categoryKey = category.category_type || 'generation';
        } else {
          // Default fallback
          categoryKey = 'generation';
        }
        
        // Make sure it's one of the valid GRPCategory values
        const validCategoryKey = ['generation', 'remuneration', 'partage'].includes(categoryKey)
          ? categoryKey as 'generation' | 'remuneration' | 'partage'
          : 'generation';
          
        return grpService.addItem(projectId, validCategoryKey, section, item);
      });
      
      // 3. Update store with real ID
      store.updateGrpItem(tempId, { 
        id: result.id,
        section_id: result.section_id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding GRP item:', err);
      
      // 5. Revert optimistic update on error
      store.setGrpItems(originalItems);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.all]);

  const updateItem = useCallback(async (
    category: string | GrpCategory, 
    section: string, 
    id: string, 
    data: Partial<NewGRPItem>
  ): Promise<GrpItem | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalItem = store.currentData.grpItems.find(i => i.id === id);
    if (!originalItem) return null;
    
    try {
      // 1. Update store optimistically
      store.updateGrpItem(id, data);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        grpService.updateItem(id, data)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating GRP item:', err);
      
      // 4. Revert optimistic update on error
      if (originalItem) {
        store.updateGrpItem(id, originalItem);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.all]);

  const deleteItem = useCallback(async (
    category: string | GrpCategory, 
    section: string, 
    id: string
  ): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalItems = [...store.currentData.grpItems];
    const itemToDelete = originalItems.find(i => i.id === id);
    if (!itemToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteGrpItem(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        grpService.deleteItem(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting GRP item:', err);
      
      // 4. Revert optimistic update on error
      store.setGrpItems(originalItems);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.all]);

  // === Helper Functions ===
  const getAllItems = useCallback((): ExtendedGrpItem[] => {
    return storeData.grpItems;
  }, [storeData.grpItems]);

  const getGRPMetrics = useCallback(() => {
    const items = getAllItems();
    if (items.length === 0) return null;
    
    const categoryCounts: Record<string, number> = {};
    
    items.forEach(item => {
      const categoryType = item.categoryType;
      if (!categoryCounts[categoryType]) {
        categoryCounts[categoryType] = 0;
      }
      categoryCounts[categoryType]++;
    });
    
    const categories = Object.keys(categoryCounts);
    const mostPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, categories[0]);
    const leastPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] < categoryCounts[b] ? a : b, categories[0]);
    
    const totalItems = items.length;
    const itemsWithPercentage = items.filter(item => item.percentage !== null).length;
    const itemsWithoutPercentage = totalItems - itemsWithPercentage;
    
    return {
      totalItems,
      itemsWithPercentage,
      itemsWithoutPercentage,
      categoryCounts,
      mostPopulatedCategory,
      leastPopulatedCategory,
      completionPercentage: totalItems > 0 
        ? (itemsWithPercentage / totalItems) * 100 
        : 0
    };
  }, [getAllItems]);

  // Diff helpers
  const getItemChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('grpItems', id), [store]);
  
  const getCategoryChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('grpCategories', id), [store]);
  
  const getSectionChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('grpSections', id), [store]);

  return {
    data: model,
    isLoading,
    error: queryError,

    // Core operations
    addItem,
    updateItem,
    deleteItem,

    // Diff helpers
    getItemChangeType,
    getCategoryChangeType,
    getSectionChangeType,
    isDiffMode: store.comparisonMode,

    // Analytics
    getAllItems,
    getGRPMetrics
  };
}