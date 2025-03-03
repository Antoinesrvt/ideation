import React, { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Bot, Paperclip, Mic, CornerDownLeft, Sparkles } from 'lucide-react';
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

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your startup assistant. How can I help you with your business idea today?",
      sender: "ai",
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
        <p className="text-gray-600">Get intelligent guidance for your startup journey</p>
      </div>
      
      <div className="flex flex-1 gap-6">
        <div className="flex-1">
          <ExpandableChat
            size="lg"
            position="bottom-right"
            icon={<Bot className="h-6 w-6" />}
            className="relative static sm:static w-full h-full"
          >
            <ExpandableChatHeader className="flex-col text-center justify-center">
              <h1 className="text-xl font-semibold">Chat with AI ✨</h1>
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
        </div>
        
        <div className="w-64">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                Suggested Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedPrompts.map((prompt, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};