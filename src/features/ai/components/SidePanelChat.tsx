import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SidePanelChatProps {
  expanded: boolean;
  children: ReactNode;
  onClose: () => void;
  inWorkspaceMode?: boolean;
}

/**
 * SidePanelChat provides a side panel layout for the AI chat
 * It slides in from the right side of the screen
 * 
 * @param inWorkspaceMode - When true, panel is integrated into workspace layout instead of overlaying
 */
export const SidePanelChat: React.FC<SidePanelChatProps> = ({
  expanded,
  children,
  onClose,
  inWorkspaceMode = false
}) => {
  // Animation variants for the panel
  const panelVariants = {
    hidden: { 
      x: '100%',
      opacity: 0,
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)' 
    },
    visible: { 
      x: '0%',
      opacity: 1,
      boxShadow: '-5px 0 25px rgba(0, 0, 0, 0.15)',
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
        when: 'beforeChildren'
      }
    },
    exit: { 
      x: '100%',
      opacity: 0,
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
      transition: {
        type: 'spring',
        damping: 40,
        stiffness: 300
      }
    }
  };

  // Animation variants for the overlay (only used when not in workspace mode)
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // Animation variants for the content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // Handle clicks on the overlay
  const handleOverlayClick = () => {
    onClose();
  };

  // Determine the appropriate panel class and styles based on the mode
  const panelClass = inWorkspaceMode
    ? "sidepanel-in-workspace workspace-sidepanel"
    : "fixed bottom-0 right-0 h-[calc(100vh-57px)] w-full sm:w-[420px] z-50 bg-white shadow-2xl flex flex-col overflow-hidden";

  return (
    <>
      {/* Background overlay - only shown when not in workspace mode */}

      
      {/* Side panel */}
      <motion.div
        className={panelClass}
        initial="hidden"
        animate={expanded ? "visible" : "hidden"}
        exit="exit"
        variants={panelVariants}
      >
        {/* Panel gradient border */}
        <div className="sidepanel-gradient-border" />
        
        {/* Close button - positioned for easy access */}
        <button 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        {/* Content container */}
        <motion.div
          className="flex-1 flex flex-col sidepanel-content"
          variants={contentVariants}
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  );
};

export default SidePanelChat; 