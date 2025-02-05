"use client"

import { useState } from "react"
import { Bot, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StepResponse } from "@/types/project"
import { motion } from "framer-motion"

interface AIAssistantProps {
  currentResponse?: StepResponse
  onSuggestionRequest: (context: string) => Promise<void>
  onSuggestionApply: (suggestion: string) => void
  isGenerating: boolean
}

export function AIAssistant({
  currentResponse,
  onSuggestionRequest,
  onSuggestionApply,
  isGenerating
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState("")

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return
    await onSuggestionRequest(prompt)
    setPrompt("")
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5" />
        <h3 className="font-semibold">AI Assistant</h3>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {currentResponse?.content && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Current Response</p>
              <p className="text-sm text-muted-foreground">{currentResponse.content}</p>
            </div>
          )}

          {currentResponse?.aiSuggestion && (
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
                  onClick={() => onSuggestionApply(currentResponse.aiSuggestion!)}
                >
                  Apply
                </Button>
              </div>
              <p className="text-sm">{currentResponse.aiSuggestion}</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI for suggestions..."
          className="min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isGenerating || !prompt.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 