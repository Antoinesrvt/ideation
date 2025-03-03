import React, { useState, FormEvent } from 'react';
import { Send, Bot, Paperclip, Mic, CornerDownLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/expandable-chat';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat-bubble';
import { ChatInput } from '@/components/ui/chat-input';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FloatingAIChat: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your startup assistant. How can I help you with your business idea today?",
      sender: "ai",
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: input,
        sender: "user",
      },
    ]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "Thanks for your message! This is a placeholder response. In the full implementation, I would provide intelligent assistance based on your startup needs.",
          sender: "ai",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleAttachFile = () => {
    // Placeholder for file attachment functionality
  };
  
  const handleMicrophoneClick = () => {
    // Placeholder for voice input functionality
  };
  
  const suggestedPrompts = [
    "Help me refine my value proposition",
    "Analyze my competitor research",
    "Suggest revenue streams for my business model",
    "How can I validate my startup idea?"
  ];
  
  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    setShowSuggestions(false);
  };
  
  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <h1 className="text-xl font-semibold">Startup AI Assistant ✨</h1>
        <p className="text-sm text-muted-foreground">
          Ask me anything about your startup
        </p>
      </ExpandableChatHeader>
      
      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                fallback={message.sender === "user" ? "You" : "AI"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
          
          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                fallback="AI"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
          
          {showSuggestions && messages.length === 1 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Try asking about:</p>
              <div className="grid grid-cols-1 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChatMessageList>
      </ExpandableChatBody>
      
      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
              >
                <Paperclip className="size-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" className="ml-auto gap-1.5">
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
};