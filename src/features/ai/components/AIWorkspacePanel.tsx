import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatContent from './ChatContent';
import SidePanelChat from './SidePanelChat';

interface Message {
  type: string;
  text: string;
  index?: number;
}

/**
 * AIWorkspacePanel integrates the AI assistant directly into the workspace layout
 * It's designed to be used as a main content panel in the workspace
 */
export const AIWorkspacePanel: React.FC = () => {
  // State
  const [expanded, setExpanded] = useState(true); // Start expanded in workspace mode
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: "Welcome to the AI Workspace. I'm your Kickoff Assistant. How can I help with your project today?",
    },
  ]);
  const [messagesCount, setMessagesCount] = useState(0);
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Add new message
  const addNewMessage = () => {
    if (typing) return;
    
    // Add user message
    const newUserMessage = {
      type: 'user',
      text: `Message ${messagesCount + 1}`,
      index: messages.length
    };
    
    setMessages(current => [...current, newUserMessage]);
    setMessagesCount(prev => prev + 1);
    
    // Show typing indicator
    setTyping(true);
    
    // Add AI message after delay
    setTimeout(() => {
      const newAIMessage = {
        type: 'ai',
        text: `This is a response to message ${messagesCount + 1}. I'm your AI assistant, here to help with your creative process.`,
        index: messages.length + 1
      };
      
      setMessages(current => [...current, newAIMessage]);
      setTyping(false);
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);
    }, 1500);
  };

  // Handle close button click
  const handleCloseClick = () => {
    setExpanded(false);
  };
  
  // Shared chat content component
  const chatContent = (
    <ChatContent 
      messages={messages}
      typing={typing}
      onAddMessage={addNewMessage}
      onClose={handleCloseClick}
      contentRef={contentRef}
      layout="sidepanel"
    />
  );
  
  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Main workspace content */}
      <div className={`flex-1 transition-all duration-300 ${expanded ? 'mr-[380px]' : ''}`}>
        <div className="p-6 h-full overflow-auto">
          <h2 className="text-2xl font-semibold mb-4">AI Assistant</h2>
          <p className="text-gray-600 mb-6">
            Use the AI assistant to help with your project. You can ask for ideas, get feedback, or generate content.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-3">How the AI can help you</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Generate creative ideas for your project</li>
              <li>• Help you analyze market trends and opportunities</li>
              <li>• Create marketing content or product descriptions</li>
              <li>• Build financial projections and business models</li>
              <li>• Draft emails, pitches, or presentations</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-3">Recent AI Activities</h3>
            <div className="text-gray-500 italic">
              No recent activities to show.
            </div>
          </div>
        </div>
      </div>
      
      {/* Side panel integrated into workspace - positioned below header */}
      <div className="absolute top-0 right-0 h-full" style={{ marginTop: '0px' }}>
        <AnimatePresence>
          {expanded && (
            <SidePanelChat 
              expanded={expanded} 
              onClose={handleCloseClick}
              inWorkspaceMode={true}
            >
              {chatContent}
            </SidePanelChat>
          )}
        </AnimatePresence>
      </div>
      
      {/* Toggle button to reopen panel if closed */}
      {!expanded && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 bg-primary-500 text-white rounded-full p-3 shadow-lg hover:bg-primary-600 transition-all"
          onClick={() => setExpanded(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12L13 12M13 12L16 9M13 12L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 8V16C3 17.6569 4.34315 19 6 19H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 19C4.34315 19 3 17.6569 3 16V8C3 6.34315 4.34315 5 6 5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default AIWorkspacePanel; 