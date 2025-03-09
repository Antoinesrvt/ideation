import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { GRPService, GRPModel, GRPCategory } from '@/lib/services/features/grp-service';
import { grpService } from '@/lib/services';
import { useProjectStore } from '@/store';
import type { GrpCategory as GrpCategoryType, GrpSection, GrpItem, ChangeType, Insert, Update } from '@/store/types';
import { Database } from '@/types/database';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';


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
  addItem: (category: string | GRPCategory, section: string, item: Insert<'grp_items'>) => Promise<GrpItem | null>;
  updateItem: (category: string | GRPCategory, section: string, id: string, data: Update<'grp_items'>) => Promise<GrpItem | null>;
  deleteItem: (category: string | GRPCategory, section: string, id: string) => Promise<boolean>;

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
    items: ['grp', projectId, 'items'] as const,
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
        const sections = await grpService.getSections(projectId);
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
    grpCategories: GrpCategoryType[];
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

    // Helper function to map section IDs to model sections
    const getSectionMapping = (sectionId: string): { category: keyof GRPModel; section: string } | null => {
      const section = data.grpSections.find(s => s.id === sectionId);
      if (!section) return null;

      // Extract category and section from the section_type
      // Assume section_type format is "category_sectionName"
      const parts = section.section_type?.split('_');
      if (parts?.length !== 2) return null;

      return {
        category: parts[0] as keyof GRPModel,
        section: parts[1]
      };
    };

    // Populate model with items
    data.grpItems.forEach(item => {
      if (!item.section_id) return;

      const mapping = getSectionMapping(item.section_id);
      if (!mapping) return;

      const { category, section } = mapping;
      
      // Type assertion to access dynamic property
      (model[category] as any)[section].push(item);
    });

    return model;
  }

  // Compute loading and error states
  const isLoading = grpModelLoading || categoriesLoading || sectionsLoading;
  const queryError = grpModelError || categoriesError || sectionsError;

  // Create optimistic helpers base
  const addItemOptimistic = useOptimisticCreate<'grp_items'>({
    projectId,
    tableName: 'grp_items',
    store,
    service: grpService,
    queryClient,
    queryKey: [...queryKeys.items],
    setSubmitting
  });

  const updateItemOptimistic = useOptimisticUpdate<'grp_items'>({
    tableName: 'grp_items',
    store,
    service: grpService,
    queryClient,
    queryKey: [...queryKeys.items],
    setSubmitting
  });

  const deleteItemOptimistic = useOptimisticDelete({
    tableName: 'grp_items',
    store,
    service: grpService,
    queryClient,
    queryKey: [...queryKeys.items],
    setSubmitting
  });

  // === Core Operations with Category and Section Context ===
  const addItem = useCallback(async (
    category: string | GRPCategory, 
    section: string, 
    item: Insert<'grp_items'>
  ): Promise<GrpItem | null> => {
    if (!projectId || !sectionsData) return null;
    
    // Ensure category is a string
    const categoryKey = typeof category === 'string' 
      ? category 
      : (category as { category_type?: string }).category_type || 'generation';
    
    // Find the section ID that matches the category and section
    const sectionObj = sectionsData.find(s => 
      s.section_type === `${categoryKey}_${section}`
    );
    
    if (!sectionObj) {
      console.error(`Section ${section} in category ${categoryKey} not found`);
      return null;
    }
    
    // Add section_id to the item
    const itemWithSection = {
      ...item,
      section_id: sectionObj.id
    } as Insert<'grp_items'>;
    
    // Use the optimistic helper for the actual operation
    return addItemOptimistic(itemWithSection);
  }, [projectId, sectionsData, addItemOptimistic]);

  const updateItem = useCallback(async (
    category: string | GRPCategory, 
    section: string, 
    id: string, 
    data: Update<'grp_items'>
  ): Promise<GrpItem | null> => {
    // We don't need the category and section parameters for update operations
    // But we keep them for API consistency
    return updateItemOptimistic(id, data);
  }, [updateItemOptimistic]);

  const deleteItem = useCallback(async (
    category: string | GRPCategory, 
    section: string, 
    id: string
  ): Promise<boolean> => {
    // We don't need the category and section parameters for delete operations
    // But we keep them for API consistency
    return deleteItemOptimistic(id);
  }, [deleteItemOptimistic]);

  // === Diff Helpers ===
  const getItemChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('grpItems', id), [store]);

  const getCategoryChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('grpCategories', id), [store]);

  const getSectionChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('grpSections', id), [store]);

  // === Analytics ===
  const getAllItems = useCallback((): ExtendedGrpItem[] => {
    const allItems: ExtendedGrpItem[] = [];
    
    // Loop through the model to get all items with their category and section context
    Object.entries(model).forEach(([categoryName, categorySections]) => {
      Object.entries(categorySections).forEach(([sectionName, items]) => {
        // Add category and section information to each item
        allItems.push(...(items as GrpItem[]).map(item => ({
          ...item,
          categoryType: categoryName,
          sectionName: sectionName
        })));
      });
    });
    
    return allItems;
  }, [model]);

  const getGRPMetrics = useCallback(() => {
    const allItems = getAllItems();
    if (allItems.length === 0) return null;

    // Count items by category
    const categoryCounts: Record<string, number> = {
      generation: 0,
      remuneration: 0,
      partage: 0
    };
    
    allItems.forEach(item => {
      if (item.categoryType in categoryCounts) {
        categoryCounts[item.categoryType]++;
      }
    });

    // Find most and least populated categories
    const categories = Object.keys(categoryCounts);
    const mostPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, categories[0]);
    const leastPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] < categoryCounts[b] ? a : b, categories[0]);

    // Count items with percentage data
    const itemsWithPercentage = allItems.filter(item => item.percentage !== null).length;
    const itemsWithoutPercentage = allItems.length - itemsWithPercentage;

    // Calculate completion percentage
    const totalSections = 9; // 3 categories × 3 sections each
    const populatedSections = new Set(allItems.map(item => `${item.categoryType}_${item.sectionName}`)).size;
    const completionPercentage = Math.round((populatedSections / totalSections) * 100);

    return {
      totalItems: allItems.length,
      itemsWithPercentage,
      itemsWithoutPercentage,
      categoryCounts,
      mostPopulatedCategory,
      leastPopulatedCategory,
      completionPercentage
    };
  }, [getAllItems]);

  return {
    data: model,
    isLoading,
    error: error || queryError,

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