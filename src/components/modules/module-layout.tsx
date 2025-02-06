"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, MessageSquare, Lightbulb, History, ChevronRight, FileText, Download, Sparkles, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAssistant } from "./ai-assistant"
import { DbStepResponse } from "@/types/module"
import { QuickActions } from "@/components/ai/quick-actions"
import type { QuickActionGroup } from "@/types/ai"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ModuleType } from "@/types/project"
import { Database } from "@/types/database"

type AIInteraction = Database['public']['Tables']['ai_interactions']['Row']

interface DocumentVersion {
  id: string
  version: number
  created_at: string
  url: string
}

interface ModuleLayoutProps {
  title: string;
  description: string;
  stepProgress?: string;
  onBack: () => void;
  children: React.ReactNode;
  currentStep: string;
  currentResponse?: DbStepResponse;
  previousResponses?: Record<string, DbStepResponse>;
  onSuggestionRequest: (context: string) => Promise<void>;
  onSuggestionApply: (suggestion: string) => void;
  isGeneratingSuggestion: boolean;
  isLoading?: boolean;
  error?: Error | null;
  documents?: DocumentVersion[];
  onGenerateDocument?: () => Promise<void>;
  moduleType: ModuleType;
  projectId: string;
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
  isLoading = false,
  error = null,
  documents = [],
  onGenerateDocument,
  moduleType,
  projectId,
}: ModuleLayoutProps) {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)

  // Calculate progress value
  const progress = useMemo(() => {
    if (!stepProgress) return 0
    const [_, current, __, total] = stepProgress.split(' ')
    return (Number(current) / Number(total)) * 100
  }, [stepProgress])

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex items-center justify-center p-6"
      >
        <Card className="max-w-md w-full">
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-destructive">Error Occurred</h3>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button 
              variant="outline" 
              onClick={onBack}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid h-screen grid-cols-[1fr_auto] divide-x divide-border"
    >
      {/* Main Content Area */}
      <div className="flex flex-col min-h-0">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex h-20 items-center px-8">
            <div className="flex items-center space-x-4 md:space-x-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 transition-transform hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="hidden md:block"
              >
                <h1 className="text-xl font-semibold tracking-tight">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              </motion.div>
            </div>

            <div className="ml-auto flex items-center space-x-6">
              {/* Progress Indicator */}
              {stepProgress && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <span className="text-sm font-medium">{stepProgress}</span>
                  <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: progress / 100 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto min-h-0">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* AI Assistant Panel */}
      <motion.div
        initial={false}
        animate={{
          width: isRightPanelCollapsed ? "40px" : "320px",
          opacity: isRightPanelCollapsed ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        {/* Collapse Toggle Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background shadow-md border h-6 w-6 transition-transform hover:scale-110"
            disabled={isLoading}
          >
            <motion.div
              animate={{ rotate: isRightPanelCollapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>

        {/* AI Assistant Content */}
        <div
          className={cn(
            "h-full transition-all duration-300",
            isRightPanelCollapsed && "opacity-0 pointer-events-none"
          )}
        >
          <AIAssistant
            currentResponse={currentResponse}
            onSuggestionRequest={onSuggestionRequest}
            onSuggestionApply={onSuggestionApply}
            isGenerating={isGeneratingSuggestion}
            isDisabled={isLoading}
            moduleType={moduleType}
            projectId={projectId}
          />
        </div>
      </motion.div>
    </motion.div>
  );
} 