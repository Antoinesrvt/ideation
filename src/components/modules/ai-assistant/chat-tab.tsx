"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DbStepResponse } from "@/types/module"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Database } from "@/types/database"


type AIInteraction = Database['public']['Tables']['ai_interactions']['Row']

interface ChatTabProps {
  currentResponse?: DbStepResponse
  lastAIInteraction?: AIInteraction
  onSuggestionRequest: (context: string) => Promise<void>
  onSuggestionApply: (suggestion: string) => void
  isGenerating: boolean
  isDisabled?: boolean
  className?: string
}

const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex space-x-1 items-center p-2"
  >
    {[1, 2, 3].map((dot) => (
      <motion.div
        key={dot}
        className="w-1.5 h-1.5 bg-primary/50 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: dot * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </motion.div>
)

const MessageBubble = ({ 
  isUser, 
  content, 
  onApply,
  isDisabled 
}: { 
  isUser: boolean
  content: string
  onApply?: () => void
  isDisabled?: boolean 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3"
  >
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
      {isUser ? (
        <User className="h-4 w-4 text-primary" />
      ) : (
        <Bot className="h-4 w-4 text-primary" />
      )}
    </div>
    <div className="flex-1">
      <div className={cn(
        "rounded-lg p-4",
        isUser ? "bg-muted" : "bg-primary/10"
      )}>
        {onApply && (
          <div className="flex justify-between items-start gap-4 mb-2">
            <p className="text-sm font-medium">AI Suggestion</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onApply}
              disabled={isDisabled}
              className="hover:scale-105 transition-transform"
            >
              Apply
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
    </div>
  </motion.div>
)

export function ChatTab({
  currentResponse,
  lastAIInteraction,
  onSuggestionRequest,
  onSuggestionApply,
  isGenerating,
  isDisabled = false,
  className
}: ChatTabProps) {
  const [prompt, setPrompt] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating || isDisabled) return
    await onSuggestionRequest(prompt)
    setPrompt("")
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [currentResponse, lastAIInteraction])

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Content */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 pr-4"
      >
        <div className="p-4 space-y-4">
          {currentResponse?.content && (
            <MessageBubble
              isUser={true}
              content={currentResponse.content}
            />
          )}

          {lastAIInteraction && (
            <MessageBubble
              isUser={false}
              content={typeof lastAIInteraction.response === 'string' 
                ? lastAIInteraction.response 
                : JSON.stringify(lastAIInteraction.response)}
              onApply={() => {
                const suggestion = typeof lastAIInteraction.response === 'string' 
                  ? lastAIInteraction.response 
                  : JSON.stringify(lastAIInteraction.response)
                onSuggestionApply(suggestion)
              }}
              isDisabled={isDisabled}
            />
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="bg-primary/10 rounded-lg p-4">
                  <TypingIndicator />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-none p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI for suggestions..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={isDisabled || isGenerating}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isGenerating || !prompt.trim() || isDisabled}
            className="transition-transform hover:scale-105"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 