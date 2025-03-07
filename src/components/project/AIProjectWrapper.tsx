'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAIStore } from '@/hooks/useAIStore';
import { AIComparisonControls, AIInstructionPrompt } from '@/components/ai/AIComparisonControls';

interface AIProjectWrapperProps {
  children: React.ReactNode;
}

export function AIProjectWrapper({ children }: AIProjectWrapperProps) {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : '';
  const { 
    proposeChanges, 
    acceptAIChanges, 
    rejectAIChanges, 
    isComparing,
    getDiffSummary,
    hasStagedChanges
  } = useAIStore(projectId);
  
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsSubmitting(true);
    try {
      await proposeChanges(prompt);
      setPrompt(''); // Clear prompt after successful submission
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-0 flex-1 relative">
      {children}
      
      {/* Show comparison controls when in comparison mode */}
      {isComparing && (
        <AIComparisonControls
          onApply={acceptAIChanges}
          onReject={rejectAIChanges}
          isComparingChanges={isComparing}
          showBanner={true}
          className="fixed bottom-0 left-0 right-0 z-50"
        />
      )}
      
     
    </div>
  );
} 