import React from 'react';
import { AnimatePresence } from 'framer-motion';
import FloatingChatWrapper from './UIAssistantWrapper';
import "../styles/nucleus.css";

/**
 * FloatingAIChat is the main entry point for the AI assistant feature.
 * It wraps the FloatingChatWrapper with an AnimatePresence to handle
 * mount/unmount animations properly.
 */
export const FloatingAIChat: React.FC = () => {
  return (
    <AnimatePresence>
      <FloatingChatWrapper key="floating-chat"/>
    </AnimatePresence>
  );
};

export default FloatingAIChat;
