'use client';

import React from 'react';
import { useAIStore } from '@/hooks/useAIStore';
import { ProjectComparison } from './ProjectComparison';
import { Button } from '@/components/ui/button';

interface AIProjectWrapperProps {
  children: React.ReactNode;
}

export function AIProjectWrapper({ children }: AIProjectWrapperProps) {
  const {
    hasStagedChanges,
    stagedChangesDescription,
    acceptAIChanges,
    rejectAIChanges,
    toggleComparisonMode
  } = useAIStore();
  
  // If there are no staged changes, just render the children
  if (!hasStagedChanges()) {
    return <>{children}</>;
  }
  
  // If there are staged changes, show a UI for comparing and applying/discarding
  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-50 p-4 border-b border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-blue-800">AI Suggested Changes</h3>
            <p className="text-sm text-blue-600">{stagedChangesDescription || 'Review the suggested changes below'}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={rejectAIChanges}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Discard Changes
            </Button>
            <Button 
              onClick={acceptAIChanges}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <ProjectComparison
          onAccept={acceptAIChanges}
          onReject={rejectAIChanges}
        />
      </div>
    </div>
  );
} 