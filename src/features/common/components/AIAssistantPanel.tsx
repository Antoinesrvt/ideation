import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Send, User, ChevronRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ToolPrompt {
  text: string;
  category?: string;
}

export interface AIAssistantPanelProps {
  projectId: string;
  currentSection: string;
  title?: string;
  description?: string;
  prompts?: Record<string, ToolPrompt[]>;
  initialMessages?: Message[];
  className?: string;
  onSendMessage?: (message: string) => Promise<Message>;
}

export function AIAssistantPanel({ 
  projectId, 
  currentSection,
  title = "AI Assistant",
  description = "Ask me anything about your project",
  prompts = {},
  initialMessages = [],
  className,
  onSendMessage
}: AIAssistantPanelProps) {
  const defaultInitialMessage = {
    role: 'assistant' as const,
    content: "Hello! I'm your AI Assistant. I can help you with your project. What would you like help with today?",
    timestamp: new Date().toISOString()
  };

  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : [defaultInitialMessage]
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get contextual prompts based on current section
  const sectionPrompts = prompts[currentSection] || [];
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to the conversation
    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // If there's a custom handler, use it
      if (onSendMessage) {
        const response = await onSendMessage(inputValue);
        setMessages(prev => [...prev, response]);
      } else {
        // Default fallback behavior with simulated response
        setTimeout(() => {
          const assistantMessage = {
            role: 'assistant' as const,
            content: "I'm a simulated AI assistant. In a real implementation, I would provide a real response based on your question.",
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      // Handle error
      const errorMessage = {
        role: 'assistant' as const,
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };
  
  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Message area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-start gap-3",
                message.role === 'assistant' ? "justify-start" : "justify-end"
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </Avatar>
              )}
              
              <div className={cn(
                "rounded-lg p-3 max-w-[80%]",
                message.role === 'assistant' 
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="mt-1 text-xs opacity-50 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 bg-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </Avatar>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex items-center justify-start gap-3">
              <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Suggested prompts */}
      {sectionPrompts.length > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Lightbulb className="h-3 w-3" /> 
            Suggested questions for {currentSection}:
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionPrompts.map((prompt, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/5"
                onClick={() => handlePromptClick(prompt.text)}
              >
                {prompt.text} <ChevronRight className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Input area */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 