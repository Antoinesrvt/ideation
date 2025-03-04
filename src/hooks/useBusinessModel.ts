import { useFeatureData } from './use-feature-data';
import { useProject } from './useProject';
import { BusinessModelCanvas, CanvasItem } from '@/types';
import { useCallback } from 'react';

/**
 * Hook for managing business model canvas data in a project
 * @param projectId - The ID of the current project
 */
export function useBusinessModel(projectId: string | undefined) {
  // Use the enhanced useFeatureData hook with proper typing
  const featureData = useFeatureData<BusinessModelCanvas, CanvasItem>(
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
      },
      // Optional related data we might want to include
      relatedData: [
        {
          name: 'marketResearch',
          feature: 'marketAnalysis',
          property: 'customerInsights.personas',
          transform: (segments) => segments?.filter((s: any) => s.validated)
        }
      ]
    }
  );

  // Retrieve the useProject hook for directly updating the full canvas
  const { updateFeatureData } = useProject(projectId);

  // Add an item to a specific section of the canvas
  const addBlockItem = useCallback((
    section: keyof BusinessModelCanvas,
    item: Omit<CanvasItem, 'id'>
  ) => {
    return featureData.addItem(item, section as string);
  }, [featureData]);

  // Update an item in a specific section of the canvas
  const updateBlockItem = useCallback((
    section: keyof BusinessModelCanvas,
    id: string,
    data: Partial<CanvasItem>
  ) => {
    return featureData.updateItem(id, data, section as string);
  }, [featureData]);

  // Delete an item from a specific section of the canvas
  const deleteBlockItem = useCallback((
    section: keyof BusinessModelCanvas,
    id: string
  ) => {
    return featureData.deleteItem(id, section as string);
  }, [featureData]);

  // Move an item between sections
  const moveBlockItem = useCallback(async (
    fromSection: keyof BusinessModelCanvas,
    toSection: keyof BusinessModelCanvas,
    itemId: string
  ) => {
    if (!featureData.data) return null;
    
    // Find the block to move
    const blockToMove = featureData.data[fromSection]?.find(
      block => block.id === itemId
    );
    
    if (!blockToMove) return null;
    
    // Clone the item with updated section info
    const updatedBlock = {
      ...blockToMove,
      section: toSection
    };
    
    // Add to the new section
    await featureData.addItem(updatedBlock, toSection as string);
    
    // Remove from the old section
    await featureData.deleteItem(itemId, fromSection as string);
    
    return updatedBlock;
  }, [featureData]);

  // Update the entire canvas at once
  const updateEntireCanvas = useCallback(async (newCanvas: Partial<BusinessModelCanvas>) => {
    if (!projectId) return null;
    
    const updatedCanvas = {
      ...featureData.data,
      ...newCanvas
    };
    
    await updateFeatureData({
      id: projectId,
      feature: 'canvas',
      data: updatedCanvas
    });
    
    return updatedCanvas;
  }, [projectId, featureData.data, updateFeatureData]);

  // Get all items across the entire canvas
  const getAllCanvasItems = useCallback(() => {
    if (!featureData.data) return [];
    
    const allItems: CanvasItem[] = [];
    const canvas = featureData.data;
    
    // Collect all items from each section
    Object.keys(canvas).forEach(key => {
      if (Array.isArray(canvas[key as keyof BusinessModelCanvas])) {
        allItems.push(...(canvas[key as keyof BusinessModelCanvas] as CanvasItem[]));
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
    
    // Count items in each section
    Object.keys(canvas).forEach(key => {
      if (Array.isArray(canvas[key as keyof BusinessModelCanvas])) {
        const count = (canvas[key as keyof BusinessModelCanvas] as CanvasItem[]).length;
        sectionCounts[key] = count;
        totalItems += count;
      }
    });
    
    // Calculate section with most and least items
    const sections = Object.keys(sectionCounts);
    const mostPopulatedSection = sections.reduce((a, b) => 
      sectionCounts[a] > sectionCounts[b] ? a : b, sections[0]);
    const leastPopulatedSection = sections.reduce((a, b) => 
      sectionCounts[a] < sectionCounts[b] ? a : b, sections[0]);
    
    // Get counts by completion status
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
    // Raw data
    canvas: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    
    // Related data
    relatedMarketSegments: featureData.relatedData?.marketResearch || [],
    
    // Section data getters
    keyPartners: featureData.data?.keyPartners || [],
    keyActivities: featureData.data?.keyActivities || [],
    keyResources: featureData.data?.keyResources || [],
    valuePropositions: featureData.data?.valuePropositions || [],
    customerRelationships: featureData.data?.customerRelationships || [],
    channels: featureData.data?.channels || [],
    customerSegments: featureData.data?.customerSegments || [],
    costStructure: featureData.data?.costStructure || [],
    revenueStreams: featureData.data?.revenueStreams || [],
    
    // Operations
    addBlockItem,
    updateBlockItem,
    deleteBlockItem,
    moveBlockItem,
    updateEntireCanvas,
    
    // Analytics
    getAllCanvasItems,
    getCanvasAnalytics
  };
} 