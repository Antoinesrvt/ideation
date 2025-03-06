import { useCallback, useState } from 'react';
import { useProjectStore } from '@/store';
import type { ProjectState, DiffMetadata, ChangeType } from '@/store/types';
import * as enhancementService from '@/lib/services/ai/enhancement-service';

export interface AIStoreActions {
  // Get AI suggestions and stage them
  proposeChanges: (instruction: string, context?: string) => Promise<boolean>;
  
  // Stage changes proposed by AI
  stageAIChanges: (changes: Partial<ProjectState['currentData']>, description: string) => void;
  
  // Accept or reject AI changes
  acceptAIChanges: () => void;
  rejectAIChanges: () => void;
  
  // Toggle comparison mode
  toggleComparisonMode: () => void;
  
  // Check if there are staged changes
  hasStagedChanges: () => boolean;
  
  // Get the description of staged changes
  stagedChangesDescription: string;
  
  // Get diff metadata
  diffMetadata: DiffMetadata;
  
  // Get a summary of all changes
  getDiffSummary: () => {
    total: number;
    added: number;
    modified: number;
    deleted: number;
    featureBreakdown: Record<string, { added: number; modified: number; deleted: number; }>;
  };
  
  // Check if comparison mode is active
  isComparing: boolean;
}

export const useAIStore = (projectId?: string): AIStoreActions => {
  const {
    currentData,
    stagedData,
    comparisonMode,
    setStagedData,
    setComparisonMode,
    commitStagedChanges,
    discardStagedChanges,
    calculateDiff,
    diffMetadata
  } = useProjectStore();
  
  // Store the description of the changes
  const [stagedChangesDescription, setStagedChangesDescription] = useState<string>('AI suggested changes');

  // Propose changes using the AI service
  const proposeChanges = useCallback(async (
    instruction: string,
    context: string = 'project'
  ): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      // Get suggestions from the AI service
      const aiResponse = await enhancementService.getProjectEnhancements(
        projectId,
        instruction,
        context
      );
      
      // Stage the changes
      const changes = convertAIResponseToStoreFormat(aiResponse);
      stageAIChanges(changes, instruction);
      
      return true;
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      return false;
    }
  }, [projectId]);
  
  // Helper to convert AI response to store format
  const convertAIResponseToStoreFormat = (aiResponse: any): Partial<ProjectState['currentData']> => {
    // This implementation depends on the specific format returned by your AI service
    // This is a simplified example that assumes the AI response matches the store structure
    return aiResponse;
  };

  const stageAIChanges = useCallback(
    (changes: Partial<ProjectState['currentData']>, description: string) => {
      // Create a full copy of the current data as the base for staged changes
      const newStagedData = { ...currentData };
      
      // Apply the AI changes to the staged data
      Object.keys(changes).forEach(key => {
        const featureKey = key as keyof typeof changes;
        if (changes[featureKey]) {
          // @ts-ignore - This is safe because we're checking if the key exists
          newStagedData[featureKey] = changes[featureKey];
        }
      });
      
      // Set the staged data and enable comparison mode
      setStagedData(newStagedData);
      setComparisonMode(true);
      setStagedChangesDescription(description);
      
      // Calculate diffs between current and staged data
      calculateDiff();
    },
    [currentData, setStagedData, setComparisonMode, calculateDiff]
  );

  const acceptAIChanges = useCallback(() => {
    commitStagedChanges();
    setStagedChangesDescription('');
  }, [commitStagedChanges]);

  const rejectAIChanges = useCallback(() => {
    discardStagedChanges();
    setStagedChangesDescription('');
  }, [discardStagedChanges]);

  const toggleComparisonMode = useCallback(() => {
    setComparisonMode(!comparisonMode);
  }, [comparisonMode, setComparisonMode]);

  const hasStagedChanges = useCallback(() => {
    return stagedData !== null;
  }, [stagedData]);
  
  // Get a summary of all changes
  const getDiffSummary = useCallback(() => {
    let totalAdded = 0;
    let totalModified = 0;
    let totalDeleted = 0;
    const featureBreakdown: Record<string, { added: number; modified: number; deleted: number; }> = {};
    
    Object.entries(diffMetadata).forEach(([feature, diff]) => {
      if (!diff) return;
      
      const added = diff.additions.length;
      const modified = diff.modifications.length;
      const deleted = diff.deletions.length;
      
      totalAdded += added;
      totalModified += modified;
      totalDeleted += deleted;
      
      if (added > 0 || modified > 0 || deleted > 0) {
        featureBreakdown[feature] = { added, modified, deleted };
      }
    });
    
    return {
      total: totalAdded + totalModified + totalDeleted,
      added: totalAdded,
      modified: totalModified,
      deleted: totalDeleted,
      featureBreakdown
    };
  }, [diffMetadata]);

  return {
    proposeChanges,
    stageAIChanges,
    acceptAIChanges,
    rejectAIChanges,
    toggleComparisonMode,
    hasStagedChanges,
    stagedChangesDescription,
    diffMetadata,
    getDiffSummary,
    isComparing: comparisonMode
  };
}; 