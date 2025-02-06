"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DbModuleResponse } from "@/types/module"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Database } from "@/types/database"

type AIInteraction = Database['public']['Tables']['ai_interactions']['Row']

interface ChatTabProps {
  currentResponse?: DbModuleResponse
  lastAIInteraction?: AIInteraction
  onSuggestionRequest: (context: string) => Promise<void>
  onSuggestionApply: (suggestion: string) => void
  isGenerating: boolean
  isDisabled?: boolean
  className?: string
}

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

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating || isDisabled) return
    await onSuggestionRequest(prompt)
    setPrompt("")
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {currentResponse?.content && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Current Response</p>
              <p className="text-sm text-muted-foreground">{currentResponse.content}</p>
            </div>
          )}

          {lastAIInteraction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 rounded-lg p-4"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <p className="text-sm font-medium">AI Suggestion</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const suggestion = typeof lastAIInteraction.response === 'string' 
                      ? lastAIInteraction.response 
                      : JSON.stringify(lastAIInteraction.response)
                    onSuggestionApply(suggestion)
                  }}
                  disabled={isDisabled}
                >
                  Apply
                </Button>
              </div>
              <p className="text-sm">
                {typeof lastAIInteraction.response === 'string' 
                  ? lastAIInteraction.response 
                  : JSON.stringify(lastAIInteraction.response)}
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-none p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 