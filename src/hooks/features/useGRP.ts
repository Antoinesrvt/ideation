import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { GRPService, GRPModel, GRPCategory } from '@/lib/services/features/grp-service';
import { useProjectStore } from '@/store';
import type { GrpItem, GrpCategory as StoreGrpCategory, GrpSection, ChangeType } from '@/store/types';

// Create service instance
const grpService = new GRPService(createClient());

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
  addItem: (category: GRPCategory, section: string, item: NewGRPItem) => Promise<GrpItem | null>;
  updateItem: (category: GRPCategory, section: string, id: string, data: Partial<NewGRPItem>) => Promise<GrpItem | null>;
  deleteItem: (category: GRPCategory, section: string, id: string) => Promise<boolean>;

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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

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

  // Query keys
  const queryKeys = {
    all: ['grp', projectId] as const,
    categories: ['grp', projectId, 'categories'] as const,
    sections: (categoryId: string) => ['grp', projectId, 'sections', categoryId] as const,
    items: (sectionId: string) => ['grp', projectId, 'items', sectionId] as const,
  };

  // Get data from the store based on comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      grpCategories: source.grpCategories || [],
      grpSections: source.grpSections || [],
      grpItems: (source.grpItems || []) as unknown as ExtendedGrpItem[]
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Transform store data into the expected GRPModel format
  const transformStoreDataToGRPModel = useCallback((): GRPModel => {
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
    
    // Create mapping of category types to their sections
    const categoryMap: Record<string, string[]> = {
      generation: ['porteurs', 'propositionValeur', 'fabricationValeur'],
      remuneration: ['sourcesRevenus', 'volumeRevenus', 'performance'],
      partage: ['partiesPrenantes', 'conventions', 'ecosysteme']
    };
    
    // Organize items by category and section
    storeData.grpItems.forEach(item => {
      const { categoryType, sectionName } = item;
      
      if (categoryType in model && sectionName in model[categoryType as keyof GRPModel]) {
        (model[categoryType as keyof GRPModel][sectionName as keyof typeof model[keyof GRPModel]] as GrpItem[]).push(item);
      }
    });
    
    return model;
  }, [storeData.grpItems]);

  // Core operations
  const addItem = useCallback(async (
    category: GRPCategory, 
    section: string, 
    item: NewGRPItem
  ): Promise<GrpItem | null> => {
    if (!projectId) return null;
      
      // Find section id from our store
      const sectionId = storeData.grpSections.find(s => 
      s.name === section && s.category_id === category
      )?.id;
      
      if (!sectionId) {
      setError(new Error(`Section ${section} not found in category ${category}`));
      return null;
      }
      
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
      const tempItem: ExtendedGrpItem = {
      id: tempId,
        section_id: sectionId,
        project_id: projectId,
      title: item.title,
      description: item.description,
      percentage: item.percentage,
      order_index: item.order_index || 0,
      created_by: item.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      categoryType: category,
      sectionName: section
    };
    
    // Track original store state for possible rollback
    const originalItems = [...store.currentData.grpItems];
    
    try {
      // 1. Update store optimistically
      store.addGrpItem(tempItem as unknown as GrpItem);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        grpService.addItem(projectId, category, section, item)
      );
      
      // 3. Remove temp item and add the real one
      store.deleteGrpItem(tempId);
        
        // Add the item with the real ID
        const realItem: ExtendedGrpItem = {
          ...(result),
        categoryType: category,
        sectionName: section
        };
        
        store.addGrpItem(realItem as unknown as GrpItem);
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.items(sectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return realItem as unknown as GrpItem;
    } catch (err) {
      console.error('Error adding GRP item:', err);
      
      // 5. Revert optimistic update on error
      store.setGrpItems(originalItems);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, storeData.grpSections, queryClient, queryKeys]);

  const updateItem = useCallback(async (
    category: GRPCategory, 
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
  }, [projectId, store, queryClient, queryKeys]);

  const deleteItem = useCallback(async (
    category: GRPCategory, 
    section: string, 
    id: string
  ): Promise<boolean> => {
    if (!projectId) return false;
    
    // Get the item before deleting for potential rollback
    const originalItems = [...store.currentData.grpItems];
    const itemToDelete = originalItems.find(item => item.id === id);
    
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
  }, [projectId, store, queryClient, queryKeys]);

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

  // Prepare data for return
  const transformedData = transformStoreDataToGRPModel();
  
  return {
    data: transformedData,
    isLoading: submitting || store.isLoading,
    error,

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