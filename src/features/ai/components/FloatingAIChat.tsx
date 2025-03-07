import React from 'react';
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
  return (
    <AnimatePresence>
      <FloatingChatWrapper key="floating-chat" type={type} />
    </AnimatePresence>
  );
};

export default FloatingAIChat;
