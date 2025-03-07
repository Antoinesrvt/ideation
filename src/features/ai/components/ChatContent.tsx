import React, { useRef, useEffect, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  type: string;
  text: string;
  index?: number;
}

interface ChatContentProps {
  messages: Message[];
  typing: boolean;
  onAddMessage: () => void;
  onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
  contentRef: RefObject<HTMLDivElement>;
}

export const ChatContent: React.FC<ChatContentProps> = ({
  messages,
  typing,
  onAddMessage,
  onClose,
  contentRef
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input after animations complete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 800); // Delay to allow animations to complete
    
    return () => clearTimeout(timer);
  }, []);
  
  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages, typing, contentRef]);
  
  // Handle Enter key press to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddMessage();
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  
  // Animation variants for the header
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, delay: 0.1 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };
  
  // Animation variants for the messages container
  const messagesContainerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  };
  
  // Animation variants for individual messages
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  // Animation variants for input area
  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: 0.4
      }
    },
    exit: { 
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      {/* Header */}
      <motion.div 
        className="assistant-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="assistant-logo">K</div>
        <div className="assistant-title">Kickoff Assistant</div>
        <button className="close-btn" onClick={onClose}>×</button>
      </motion.div>
      
      {/* Messages area */}
      <motion.div 
        className="assistant-content"
        ref={contentRef}
        variants={messagesContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`message ${message.type}`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ 
                '--index': index,
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start'
              } as React.CSSProperties}
            >
              {message.text}
            </motion.div>
          ))}
          
          {typing && (
            <motion.div 
              className="message ai"
              variants={messageVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Input area */}
      <motion.div 
        className="assistant-input"
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <input
          ref={inputRef}
          type="text"
          className="input-field"
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" onClick={onAddMessage}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </motion.div>
    </>
  );
};

export default ChatContent; 