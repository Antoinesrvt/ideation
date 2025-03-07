'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import '../styles/ai-chat.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isExpanded: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isExpanded, onClose }) => {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "I'm your Kickoff AI assistant. How can I help with your project today?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = React.useState('');
  const [isThinking, setIsThinking] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'd be happy to help with that. Could you provide more details about what you're looking to achieve?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsThinking(false);
    }, 2000);
  };

  return (
    <div className="assistant-content">
      <div className="assistant-header">
        <div className="assistant-title">
          <div className="assistant-title-icon">
            <div className="title-icon-glow" />
            <div className="assistant-symbol">
              <div className="assistant-symbol-line assistant-symbol-line-1" />
              <div className="assistant-symbol-line assistant-symbol-line-2" />
              <div className="assistant-symbol-line assistant-symbol-line-3" />
            </div>
          </div>
          <span>Kickoff AI Assistant</span>
        </div>
        <div className="assistant-actions">
          <button 
            className="assistant-action"
            onClick={onClose}
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="assistant-body">
        <div className="conversation-container">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {message.content}
              </motion.div>
            ))}
            {isThinking && (
              <motion.div
                className="ai-thinking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="thinking-dot" style={{ animation: 'dot-bounce 1.4s -0.32s infinite ease-in-out both' }} />
                <div className="thinking-dot" style={{ animation: 'dot-bounce 1.4s -0.16s infinite ease-in-out both' }} />
                <div className="thinking-dot" style={{ animation: 'dot-bounce 1.4s 0s infinite ease-in-out both' }} />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="assistant-footer">
        <form onSubmit={handleSubmit} className="message-input-container">
          <div className="message-input-icon">
            <div className="message-input-symbol">
              <div className="message-input-symbol-line message-input-symbol-line-1" />
              <div className="message-input-symbol-line message-input-symbol-line-2" />
              <div className="message-input-symbol-line message-input-symbol-line-3" />
            </div>
          </div>
          <input
            type="text"
            className="message-input"
            placeholder="Ask me anything about your project..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};