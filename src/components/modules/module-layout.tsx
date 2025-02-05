"use client"

import { useState } from "react"
import { ArrowLeft, MessageSquare, Lightbulb, History, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAssistant } from "./ai-assistant"
import { ModuleResponse } from "@/types/module"
import { QuickActions } from "@/components/ai/quick-actions"
import type { QuickActionGroup } from "@/types/ai"
import { cn } from "@/lib/utils"

interface ModuleLayoutProps {
  title: string
  description: string
  progress: number
  onBack: () => void
  children: React.ReactNode
  currentStep: string
  currentResponse?: ModuleResponse
  previousResponses?: Record<string, ModuleResponse>
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
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)

  const handleQuickActionSelect = (action: { content: string }) => {
    onSuggestionApply(action.content)
  }

  return (
    <div className="flex gap-6">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Module Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <QuickActions
              moduleId={currentStep}
              stepId={currentStep}
              onActionSelect={handleQuickActionSelect}
              contextualActions={quickActionGroups}
            />
            <div className="flex flex-col gap-1 items-end">
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </motion.div>

        {/* Module Content */}
        <ScrollArea className="flex-1 pr-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </div>

      {/* Right Panel */}
      <motion.div
        initial={false}
        animate={{ 
          width: isRightPanelCollapsed ? "40px" : "400px",
          opacity: isRightPanelCollapsed ? 0.5 : 1
        }}
        className="relative"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background shadow-md border h-6 w-6"
        >
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            isRightPanelCollapsed && "rotate-180"
          )} />
        </Button>

        <Card className={cn(
          "h-full transition-opacity",
          isRightPanelCollapsed && "opacity-0 pointer-events-none"
        )}>
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as typeof activeTab)} 
            className="h-full flex flex-col"
          >
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
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  <h3 className="font-semibold">Previous Responses</h3>
                  <AnimatePresence>
                    {previousResponses && Object.entries(previousResponses).map(([key, response], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-4">
                          <h4 className="text-sm font-medium mb-2">{key}</h4>
                          <p className="text-sm text-muted-foreground">{response.content}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Last updated: {new Date(response.lastUpdated).toLocaleString()}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  )
} 