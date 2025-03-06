import { useFeatureData } from './use-feature-data';
import { useCallback } from 'react';
import { Database } from '@/types/database';

// Database types for canvas tables
type CanvasSection = Database['public']['Tables']['canvas_sections']['Row'];
type CanvasItem = Database['public']['Tables']['canvas_items']['Row'];

// Combined type for all canvas data
type BusinessModelCanvas = {
  keyPartners: CanvasItem[];
  keyActivities: CanvasItem[];
  keyResources: CanvasItem[];
  valuePropositions: CanvasItem[];
  customerRelationships: CanvasItem[];
  channels: CanvasItem[];
  customerSegments: CanvasItem[];
  costStructure: CanvasItem[];
  revenueStreams: CanvasItem[];
};

// Base type for any canvas item
type BaseItem = {
  id: string;
  project_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type CanvasModelItem = BaseItem & Omit<CanvasItem, keyof BaseItem>;

/**
 * Hook for managing business model canvas data in a project
 * @param projectId - The ID of the current project
 */
export function useBusinessModel(projectId: string | undefined) {
  const featureData = useFeatureData<BusinessModelCanvas, CanvasModelItem>(
    projectId,
    'canvas',
    {
      defaultData: {
        keyPartners: [],
        keyActivities: [],
        keyResources: [],
        valuePropositions: [],
        customerRelationships: [],
        channels: [],
        customerSegments: [],
        costStructure: [],
        revenueStreams: []
      }
    }
  );

  // Add an item to a specific section of the canvas
  const addBlockItem = useCallback(async (
    section: keyof BusinessModelCanvas,
    item: Omit<CanvasItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'project_id'>
  ) => {
    if (!projectId) throw new Error('Project ID is required');
    
    // Convert section name to section_type format
    const sectionType = section.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    return featureData.addItem({
      ...item,
      project_id: projectId,
      created_by: null,
      created_at: null,
      updated_at: null
    }, section);
  }, [featureData, projectId]);

  // Update an item in a specific section of the canvas
  const updateBlockItem = useCallback((
    section: keyof BusinessModelCanvas,
    id: string,
    data: Partial<Omit<CanvasItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'project_id'>>
  ) => {
    return featureData.updateItem(id, data as Partial<CanvasModelItem>, section);
  }, [featureData]);

  // Delete an item from a specific section of the canvas
  const deleteBlockItem = useCallback((
    section: keyof BusinessModelCanvas,
    id: string
  ) => {
    return featureData.deleteItem(id, section);
  }, [featureData]);

  // Move an item between sections
  const moveBlockItem = useCallback(async (
    fromSection: keyof BusinessModelCanvas,
    toSection: keyof BusinessModelCanvas,
    itemId: string
  ) => {
    if (!projectId || !featureData.data) return null;
    
    // Find the block to move
    const blockToMove = featureData.data[fromSection]?.find(
      block => block.id === itemId
    );
    
    if (!blockToMove) return null;
    
    // Convert section name to section_type format
    const toSectionType = toSection.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // Create a new item in the target section
    const newItem = {
      ...blockToMove,
      project_id: projectId,
      created_by: null,
      created_at: null,
      updated_at: null
    };
    
    // Add to new section
    await featureData.addItem(newItem, toSection);
    
    // Remove from old section
    await featureData.deleteItem(itemId, fromSection);
    
    return newItem;
  }, [featureData, projectId]);

  // Get all items across the entire canvas
  const getAllCanvasItems = useCallback(() => {
    if (!featureData.data) return [];
    
    const allItems: CanvasItem[] = [];
    const canvas = featureData.data;
    
    Object.values(canvas).forEach(items => {
      if (Array.isArray(items)) {
        allItems.push(...items);
      }
    });
    
    return allItems;
  }, [featureData.data]);

  // Get counts for analytics
  const getCanvasAnalytics = useCallback(() => {
    if (!featureData.data) return null;
    
    const canvas = featureData.data;
    const sectionCounts: Record<string, number> = {};
    let totalItems = 0;
    
    Object.keys(canvas).forEach(key => {
      if (Array.isArray(canvas[key as keyof BusinessModelCanvas])) {
        const count = (canvas[key as keyof BusinessModelCanvas] as CanvasItem[]).length;
        sectionCounts[key] = count;
        totalItems += count;
      }
    });
    
    const sections = Object.keys(sectionCounts);
    const mostPopulatedSection = sections.reduce((a, b) => 
      sectionCounts[a] > sectionCounts[b] ? a : b, sections[0]);
    const leastPopulatedSection = sections.reduce((a, b) => 
      sectionCounts[a] < sectionCounts[b] ? a : b, sections[0]);
    
    const completedItems = getAllCanvasItems().filter(item => item.checked).length;
    const incompleteItems = totalItems - completedItems;
    
    return {
      totalItems,
      completedItems,
      incompleteItems,
      sectionCounts,
      mostPopulatedSection,
      leastPopulatedSection,
      completionPercentage: totalItems > 0 
        ? (completedItems / totalItems) * 100 
        : 0
    };
  }, [featureData.data, getAllCanvasItems]);

  return {
    data: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    addBlockItem,
    updateBlockItem,
    deleteBlockItem,
    moveBlockItem,
    getAllCanvasItems,
    getCanvasAnalytics
  };
} 