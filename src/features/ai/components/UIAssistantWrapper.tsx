import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import AIBubble from './AIBubble';
import ChatContent from './ChatContent';

interface Message {
  type: string;
  text: string;
  index?: number;
}

// Animation phase enum to simplify state management
type AnimationPhase = 'idle' | 'expanding' | 'expanded' | 'collapsing';

export const FloatingChatWrapper: React.FC = () => {
  // Animation phase state
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
  const [expanded, setExpanded] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: "Hi there! I'm your Kickoff Assistant. How can I help with your project today?",
    },
  ]);
  const [messagesCount, setMessagesCount] = useState(0);
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation controls
  const rippleControls = useAnimation();
  const borderControls = useAnimation();
  const shadowControls = useAnimation();

  // Toggle assistant state
  const toggleAssistant = () => {
    if (expanded) {
      setAnimationPhase('collapsing');
      
      // Reset animations
      borderControls.start({
        opacity: 0,
        scale: 0,
        transition: { duration: 0.3 }
      });
      
      shadowControls.start({
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.3 }
      });
      
      setTimeout(() => {
        setExpanded(false);
        setAnimationPhase('idle');
      }, 500);
    } else {
      setAnimationPhase('expanding');
      
      // Play ripple animation
      rippleControls.start({
        opacity: [0.7, 0.5, 0],
        scale: [1, 1.1, 1.3],
        transition: { duration: 0.5 }
      });
      
      setTimeout(() => {
        setExpanded(true);
        setAnimationPhase('expanded');
        
        // Play landing shadow animation
        shadowControls.start({
          opacity: 0.25,
          scale: 1,
          transition: { 
            duration: 0.4, 
            delay: 0.1,
            ease: [0.34, 1.56, 0.64, 1]
          }
        });
        
        // Start border animation
        borderControls.start({
          opacity: 1,
          scale: 1,
          transition: { 
            duration: 0.3,
            delay: 0.1
          }
        });
      }, 400);
    }
  };

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
        
        // Focus input field
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }, 1500);
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleAssistant();
  };

  // Handle click on the nucleus when not expanded
  const handleNucleusClick = () => {
    // Only toggle when in idle state and not expanded
    if (!expanded && animationPhase === 'idle') {
      toggleAssistant();
    }
  };

  return (
    <div className="ai-container" style={{ background: 'transparent' }}>
      {/* Unified container that handles the transformation */}
      <motion.div
        className={`nucleus ${expanded ? 'ai-expanded' : ''} ${animationPhase !== 'idle' && animationPhase !== 'expanded' ? 'ai-animating' : ''}`}
        animate={{
          width: expanded ? 'var(--assistant-width)' : 'var(--nucleus-size)',
          height: expanded ? 'var(--assistant-height)' : 'var(--nucleus-size)',
          borderRadius: expanded ? '20px' : '50%',
          boxShadow: expanded 
            ? '0 15px 50px rgba(18, 8, 90, 0.25), 0 5px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            : '0 8px 32px rgba(74, 35, 196, 0.3), 0 4px 8px rgba(0, 0, 80, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3)',
          scale: animationPhase === 'expanding' ? 1.05 : 1
        }}
        transition={{
          duration: 0.5,
          ease: expanded ? [0.34, 1.56, 0.64, 1] : [0.6, -0.28, 0.735, 0.045]
        }}
        onClick={handleNucleusClick}
        style={{ 
          cursor: !expanded && animationPhase === 'idle' ? 'pointer' : 'default',
          background: expanded ? 
            'linear-gradient(135deg, var(--primary-light), var(--primary-medium) 60%, var(--primary-dark) 100%)' : 
            'linear-gradient(135deg, var(--primary-light), var(--primary-medium) 60%, var(--primary-dark) 100%)'
        }}
      >
        {/* Transformation ripple for expanding/collapsing animations */}
        <motion.div 
          className="transformation-ripple"
          initial={{ opacity: 0, scale: 1 }}
          animate={rippleControls}
        />
        
        {/* Landing shadow */}
        <motion.div
          className="landing-shadow"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={shadowControls}
        />
        
        {/* Animated border */}
        <motion.div
          className="assistant-border"
          initial={{ opacity: 0, scale: 0 }}
          animate={borderControls}
        />
        
        {/* AI Bubble with particles and orbitals - only visible when collapsed */}
        <AIBubble
          expanded={expanded}
          animationPhase={animationPhase}
          onClick={toggleAssistant}
        />
        
        {/* Assistant content with chat - only visible when expanded */}
        <motion.div
          className="assistant"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: expanded ? 1 : 0,
            scale: expanded ? 1 : 0.9
          }}
          transition={{ 
            duration: 0.4, 
            delay: expanded ? 0.2 : 0
          }}
        >
          <motion.div
            className="assistant-content-wrapper"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: expanded ? 1 : 0
            }}
            transition={{ 
              duration: 0.3,
              delay: expanded ? 0.3 : 0
            }}
          >
            {expanded && (
              <ChatContent 
                messages={messages}
                typing={typing}
                onAddMessage={addNewMessage}
                onClose={handleCloseClick}
                contentRef={contentRef}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FloatingChatWrapper; 