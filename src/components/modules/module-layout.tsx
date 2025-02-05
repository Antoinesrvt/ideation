"use client"

import { useState, useMemo } from "react"
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
  stepProgress?: string
  onBack: () => void
  children: React.ReactNode
  currentStep: string
  currentResponse?: ModuleResponse
  previousResponses?: Record<string, ModuleResponse>
  onSuggestionRequest: (context: string) => Promise<void>
  onSuggestionApply: (suggestion: string) => void
  isGeneratingSuggestion: boolean
  quickActionGroups?: QuickActionGroup[]
  isLoading?: boolean
  error?: Error | null
}

export function ModuleLayout({ 
  title, 
  description,
  stepProgress, 
  onBack, 
  children,
  currentStep,
  currentResponse,
  previousResponses,
  onSuggestionRequest,
  onSuggestionApply,
  isGeneratingSuggestion,
  quickActionGroups = [],
  isLoading = false,
  error = null
}: ModuleLayoutProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "history">("ai")
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)

  // Calculate progress value
  const progress = useMemo(() => {
    if (!stepProgress) return 0
    const [_, current, __, total] = stepProgress.split(' ')
    return (Number(current) / Number(total)) * 100
  }, [stepProgress])

  const handleQuickActionSelect = (action: { content: string }) => {
    onSuggestionApply(action.content)
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-destructive">Error</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={onBack}>Go Back</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex gap-6 min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="flex items-center space-x-4 md:space-x-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {stepProgress && (
              <div className="ml-auto flex items-center space-x-4">
                <span className="text-sm font-medium">{stepProgress}</span>
                <motion.div 
                  className="w-32 h-1 bg-muted rounded-full overflow-hidden"
                  initial={false}
                >
                  <motion.div
                    className="h-full bg-primary origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </motion.div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 container py-6">
          <div className="mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Right Panel */}
      <motion.div
        initial={false}
        animate={{ 
          width: isRightPanelCollapsed ? "40px" : "400px",
          opacity: isRightPanelCollapsed ? 0.5 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative top-0 h-screen"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background shadow-md border h-6 w-6"
          disabled={isLoading}
        >
          <motion.div
            animate={{ rotate: isRightPanelCollapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </Button>

        <Card className={cn(
          "h-full transition-all",
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
                disabled={isLoading}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex-1 data-[state=active]:bg-background"
                disabled={isLoading}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="ai" className="flex-1 m-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AIAssistant
                    currentResponse={currentResponse}
                    onSuggestionRequest={onSuggestionRequest}
                    onSuggestionApply={onSuggestionApply}
                    isGenerating={isGeneratingSuggestion}
                    isDisabled={isLoading}
                  />
                </motion.div>
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
            </AnimatePresence>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  )
} 