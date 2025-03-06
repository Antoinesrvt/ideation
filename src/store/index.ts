import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useProjectStore, diffMetadataAtom } from './project-store';
import type { 
  ProjectState, 
  ProjectStore, 
  DiffMetadata, 
  FeatureDiff, 
  ItemDiff, 
  ChangeType 
} from './types';

interface AppState {
  // Current project
  currentProject: string | null;
  setCurrentProject: (project: string | null) => void;
  
  // UI state
  activeSection: 'overview' | 'canvas' | 'grp' | 'market' | 'userflow' | 'documents' | 'external-tools';
  setActiveSection: (section: AppState['activeSection']) => void;
  
  // Expanded cell in GRP model
  expandedCell: string | null;
  setExpandedCell: (cell: string | null) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    // Current project
    currentProject: null,
    setCurrentProject: (project) => set((state) => {
      state.currentProject = project;
    }),
    
    // UI state
    activeSection: 'overview',
    setActiveSection: (section) => set((state) => {
      state.activeSection = section;
    }),
    
    // Expanded cell in GRP model
    expandedCell: null,
    setExpandedCell: (cell) => set((state) => {
      state.expandedCell = cell;
    }),
    
    // Loading states
    isLoading: false,
    setIsLoading: (isLoading) => set((state) => {
      state.isLoading = isLoading;
    }),
    
    // Error state
    error: null,
    setError: (error) => set((state) => {
      state.error = error;
    }),
  }))
);

export { useProjectStore, diffMetadataAtom };
export type { 
  ProjectState, 
  ProjectStore, 
  DiffMetadata, 
  FeatureDiff, 
  ItemDiff, 
  ChangeType 
};