import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import FloatingChatWrapper from './UIAssistantWrapper';
import "../styles/nucleus.css";

interface FloatingAIChatProps {
  type?: 'sidepanel' | 'floating';
}

/**
 * FloatingAIChat is the main entry point for the AI assistant feature.
 * It wraps the FloatingChatWrapper with an AnimatePresence to handle
 * mount/unmount animations properly.
 * 
 * @param type - The type of chat UI to display ('sidepanel' or 'floating')
 */
export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({ type = 'floating' }) => {
  // Preload animation frames to prevent initial rendering delay
  useEffect(() => {
    // Force a layout calculation to ensure animations are prepared
    if (type === 'floating') {
      // Create and remove a dummy element to force browser to calculate layout
      const dummy = document.createElement('div');
      dummy.style.position = 'absolute';
      dummy.style.visibility = 'hidden';
      dummy.className = 'nucleus-preload';
      document.body.appendChild(dummy);
      
      // Force a layout calculation
      void dummy.offsetHeight;
      
      // Remove the dummy element
      document.body.removeChild(dummy);
    }
  }, [type]);

  return (
    <AnimatePresence>
      <FloatingChatWrapper key="floating-chat" type={type} />
    </AnimatePresence>
  );
};

export default FloatingAIChat;
