"use client"

import { useState } from "react"
import { Bot, MessageSquare, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModuleResponse } from "@/types/module"
import { ModuleType } from "@/types/project"
import { ChatTab } from "./ai-assistant/chat-tab"
import { DocumentsTab } from "./ai-assistant/documents-tab"
import { DocumentGenerationModal } from "./document-generation/modal"

interface AIAssistantProps {
  currentResponse?: ModuleResponse
  moduleType: ModuleType
  projectId: string
  onSuggestionRequest: (context: string) => Promise<void>
  onSuggestionApply: (suggestion: string) => void
  isGenerating: boolean
  isDisabled?: boolean
}

type AssistantView = "chat" | "documents"

export function AIAssistant({
  currentResponse,
  moduleType,
  projectId,
  onSuggestionRequest,
  onSuggestionApply,
  isGenerating,
  isDisabled = false
}: AIAssistantProps) {
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<AssistantView>("chat")

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex-none h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center px-4">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Assistant</h3>
          </div>
          <div className="ml-auto">
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
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1">
        {currentView === "chat" ? (
          <ChatTab
            currentResponse={currentResponse}
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