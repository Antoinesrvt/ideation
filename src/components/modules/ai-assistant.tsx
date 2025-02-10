"use client"

import { useState } from "react"
import { Bot, MessageSquare, FileText, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModuleType } from "@/types/project"
import { ChatTab } from "./ai-assistant/chat-tab"
import { DocumentsTab } from "./ai-assistant/documents-tab"
import { DocumentGenerationModal } from "./document-generation/modal"
import { Database } from "@/types/database"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { DbStepResponse } from "@/types/module"

type AIInteraction = Database['public']['Tables']['ai_interactions']['Row']

interface AIAssistantProps {
  currentResponse?: DbStepResponse,
  moduleType: ModuleType
  projectId: string
  onSuggestionRequest: (context: string) => Promise<void>
  onSuggestionApply: (suggestion: string) => void
  isGenerating: boolean
  isDisabled?: boolean
  lastAIInteraction?: AIInteraction
}

type AssistantView = "chat" | "documents"

export function AIAssistant({
  currentResponse,
  moduleType,
  projectId,
  onSuggestionRequest,
  onSuggestionApply,
  isGenerating,
  isDisabled = false,
  lastAIInteraction
}: AIAssistantProps) {
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<AssistantView>("chat")

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-full items-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Bot className="h-5 w-5 text-primary" />
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                </motion.div>
              )}
            </div>
            <h3 className="text-lg font-semibold">Assistant</h3>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="ml-auto"
          >
            <Select
              value={currentView}
              onValueChange={(value: AssistantView) => setCurrentView(value)}
            >
              <SelectTrigger className="w-[140px] h-8 px-3 py-1 text-sm font-medium bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  value="chat"
                  className="text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>AI Chat</span>
                  </div>
                </SelectItem>
                <SelectItem 
                  value="documents"
                  className="text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Documents</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentView === "chat" ? (
              <ChatTab
                currentResponse={currentResponse}
                lastAIInteraction={lastAIInteraction}
                onSuggestionRequest={onSuggestionRequest}
                onSuggestionApply={onSuggestionApply}
                isGenerating={isGenerating}
                isDisabled={isDisabled}
              />
            ) : (
              <DocumentsTab
                projectId={projectId}
                moduleType={moduleType}
                onGenerateClick={() => setIsGenerationModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Document Generation Modal */}
      <DocumentGenerationModal
        moduleType={moduleType}
        projectId={projectId}
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
      />
    </div>
  )
} 