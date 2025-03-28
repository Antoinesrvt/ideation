'use client';

import React, { useState } from 'react';
import { AppDashboard } from './AppDashboard';
import { ToolRouter, AppType } from './ToolRouter';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelType } from '@/features/common/components/CyclingSidebar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface AppCanvasProps {
  projectId: string;
  initialApp?: AppType | null;
}

const AppCanvas: React.FC<AppCanvasProps> = ({
  projectId,
  initialApp = null
}) => {
  // State for tracking the current focus and navigation
  const [currentFocus, setCurrentFocus] = useState<'dashboard' | AppType>(
    initialApp ? initialApp : 'dashboard'
  );
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  // State for unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<'dashboard' | AppType | null>(null);

  // Handler for app selection from dashboard
  const handleAppSelect = (app: AppType) => {
    if (isDirty) {
      setPendingNavigation(app);
      setShowUnsavedDialog(true);
      return;
    }
    
    setSlideDirection('right');
    setCurrentFocus(app);
  };
  
  // Handler for returning to dashboard
  const handleBackToDashboard = () => {
    if (isDirty) {
      setPendingNavigation('dashboard');
      setShowUnsavedDialog(true);
      return;
    }
    
    setSlideDirection('left');
    setCurrentFocus('dashboard');
  };
  
  // Handle content change tracking
  const handleContentChange = (hasChanges: boolean) => {
    setIsDirty(hasChanges);
  };
  
  // Handle proceed with navigation
  const handleProceedNavigation = () => {
    if (pendingNavigation === 'dashboard') {
      setSlideDirection('left');
    } else {
      setSlideDirection('right');
    }
    
    if (pendingNavigation) {
      setCurrentFocus(pendingNavigation);
    }
    
    setPendingNavigation(null);
    setShowUnsavedDialog(false);
    setIsDirty(false);
  };
  
  // Handle cancel navigation
  const handleCancelNavigation = () => {
    setPendingNavigation(null);
    setShowUnsavedDialog(false);
  };
  
  // Animation variants
  const variants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? -1000 : 1000,
      opacity: 0
    })
  };
  
  // Render dashboard or app tools
  const renderContent = () => {
    if (currentFocus === 'dashboard') {
      return (
        <AppDashboard 
          projectId={projectId}
          onAppSelect={(appId: string) => handleAppSelect(appId as AppType)}
        />
      );
    }
    
    return (
      <div className="flex h-full">
        {/* Main content */}
        <div className={`flex-1 transition-all duration-300`}>
          <ToolRouter
            activeApp={currentFocus}
            projectId={projectId}
            onBackToDashboard={handleBackToDashboard}
            onContentChange={handleContentChange}
          />
        </div>
        
      </div>
    );
  };
  
  return (
    <div className="relative h-full overflow-scroll">
      <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
        <motion.div
          key={currentFocus}
          custom={slideDirection}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: 'tween',
            duration: 0.3
          }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      
      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your current work. Do you want to discard these changes and continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProceedNavigation}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppCanvas; 