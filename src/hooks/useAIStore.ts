import { useCallback, useState } from 'react';
import { useProjectStore } from '@/store';
import type { ProjectState } from '@/store/types';

export interface AIStoreActions {
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
}

export const useAIStore = (): AIStoreActions => {
  const {
    currentData,
    stagedData,
    comparisonMode,
    setStagedData,
    setComparisonMode,
    commitStagedChanges,
    discardStagedChanges
  } = useProjectStore();
  
  // Store the description of the changes
  const [stagedChangesDescription, setStagedChangesDescription] = useState<string>('AI suggested changes');

  const stageAIChanges = useCallback(
    (changes: Partial<ProjectState['currentData']>, description: string) => {
      const newStagedData = {
        ...currentData,
        ...changes
      };
      setStagedData(newStagedData);
      setStagedChangesDescription(description);
      setComparisonMode(true);
    },
    [currentData, setStagedData, setComparisonMode]
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

  return {
    stageAIChanges,
    acceptAIChanges,
    rejectAIChanges,
    toggleComparisonMode,
    hasStagedChanges,
    stagedChangesDescription
  };
}; 