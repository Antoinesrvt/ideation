import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Send, Lightbulb, Plus } from 'lucide-react';
import { useAIChat } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
}

interface InterviewAIChatProps {
  projectId: string;
  templateName?: string;
  questions?: Question[];
  onSuggestion: (suggestion: string, questionId?: string) => void;
  className?: string;
}

export function InterviewAIChat({
  projectId,
  templateName = '',
  questions = [],
  onSuggestion,
  className
}: InterviewAIChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    chat,
    isLoading
  } = useAIChat(projectId, 'market-analysis');

  // Add initial system message when component mounts
  useEffect(() => {
    // Only add welcome message if no messages exist
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I can help you create effective interview questions for your customer research. What kind of information are you trying to gather from your interviews?'
        }
      ]);

      // Add some initial suggestions based on common interview needs
      setSuggestions([
        'Suggest questions to understand customer pain points',
        'Help me create questions about user workflows',
        'What questions should I ask to validate my solution?',
        'Generate questions to understand purchase decisions'
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Generate context for the AI based on current template
  const generateContext = () => {
    let context = `I'm creating an interview template`;
    
    if (templateName) {
      context += ` called "${templateName}"`;
    }
    
    if (questions.length > 0) {
      context += `. I already have ${questions.length} questions:`;
      questions.forEach((q, index) => {
        context += `\n${index + 1}. ${q.text}`;
      });
    }
    
    return context;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Prepare context about the current template
    const contextText = generateContext();
    
    try {
      // Send message to AI service
      chat({ 
        message: userMessage,
        context: {
          moduleType: 'market-analysis',
          projectId: projectId,
          contextData: {
            sources: [],
            enriched: false,
            lastUpdated: new Date().toISOString(),
            metadata: {
              interviewContext: contextText,
              feature: 'interview_template'
            }
          }
        }
      });
      
      // Since we don't have direct access to the response here,
      // we'll simulate an AI response for now
      // In a real implementation, use the onSuccess callback or subscribe to changes
      setTimeout(() => {
        const aiResponse = {
          message: "I've analyzed your request and here are some interview questions that might help with your template.",
          data: {
            suggestions: [
              "What challenges do you currently face in your workflow?",
              "How are you currently solving this problem?",
              "What would an ideal solution look like for you?",
              "How much would you be willing to pay for a solution that addresses this problem?",
              "Who makes the purchasing decisions for tools like this in your organization?"
            ]
          }
        };
        
        // Add AI response to chat
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse.message }]);
        
        // Set suggestions
        if (aiResponse.data?.suggestions) {
          setSuggestions(aiResponse.data.suggestions);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    // Add suggested question to the template
    onSuggestion(suggestion);
    
    // Clear suggestions
    setSuggestions([]);
    
    // Add message to chat log
    setMessages(prev => [
      ...prev, 
      { 
        role: 'user', 
        content: `I'll use this question: "${suggestion}"` 
      },
      {
        role: 'assistant',
        content: 'Great choice! The question has been added to your template. Need any more questions or adjustments?'
      }
    ]);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2 rounded-lg",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2 rounded-lg bg-muted">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="text-sm font-medium flex items-center mb-2">
            <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
            <span>Suggested Questions</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="group flex items-start"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleUseSuggestion(suggestion)}
                  title="Add this question"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <div
                  className="flex-grow ml-1 text-sm p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => handleUseSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t flex items-center gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask for help with interview questions..."
          className="flex-grow"
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="shrink-0"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 