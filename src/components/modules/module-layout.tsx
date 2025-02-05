"use client"

import { useState } from "react"
import { ArrowLeft, MessageSquare, Lightbulb, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAssistant } from "./ai-assistant"
import { StepResponse } from "@/types/project"
import { QuickActions } from "@/components/ai/quick-actions"
import type { QuickActionGroup } from "@/types/ai"

interface ModuleLayoutProps {
  title: string
  description: string
  progress: number
  onBack: () => void
  children: React.ReactNode
  currentStep: string
  currentResponse?: StepResponse
  previousResponses?: Record<string, StepResponse>
  onSuggestionRequest: (context: string) => Promise<void>
  onSuggestionApply: (suggestion: string) => void
  isGeneratingSuggestion: boolean
  quickActionGroups?: QuickActionGroup[]
}

export function ModuleLayout({ 
  title, 
  description,
  progress, 
  onBack, 
  children,
  currentStep,
  currentResponse,
  previousResponses,
  onSuggestionRequest,
  onSuggestionApply,
  isGeneratingSuggestion,
  quickActionGroups = []
}: ModuleLayoutProps) {
  const [activeTab, setActiveTab] = useState<"content" | "ai" | "history">("content")

  const handleQuickActionSelect = (action: { content: string }) => {
    onSuggestionApply(action.content)
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Module Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <QuickActions
              moduleId={currentStep}
              stepId={currentStep}
              onActionSelect={handleQuickActionSelect}
              contextualActions={quickActionGroups}
            />
            <Progress value={progress} className="w-32" />
          </div>
        </div>

        {/* Module Content */}
        <ScrollArea className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </ScrollArea>
      </div>

      {/* Right Panel */}
      <Card className="w-[400px] flex flex-col">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex-1">
          <TabsList className="w-full p-0 bg-muted/50">
            <TabsTrigger 
              value="ai" 
              className="flex-1 data-[state=active]:bg-background"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 data-[state=active]:bg-background"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="flex-1 m-0">
            <AIAssistant
              currentResponse={currentResponse}
              onSuggestionRequest={onSuggestionRequest}
              onSuggestionApply={onSuggestionApply}
              isGenerating={isGeneratingSuggestion}
            />
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Previous Responses</h3>
                {previousResponses && Object.entries(previousResponses).map(([key, response]) => (
                  <Card key={key} className="p-4">
                    <h4 className="text-sm font-medium mb-2">{key}</h4>
                    <p className="text-sm text-muted-foreground">{response.content}</p>
                    {response.aiSuggestion && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground">AI Suggestion</p>
                        <p className="text-sm">{response.aiSuggestion}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 