"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, MessageSquare, Lightbulb, History, ChevronRight, FileText, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAssistant } from "./ai-assistant"
import { DbModuleResponse } from "@/types/module"
import { QuickActions } from "@/components/ai/quick-actions"
import type { QuickActionGroup } from "@/types/ai"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ModuleType } from "@/config/modules"
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
  currentResponse?: DbModuleResponse;
  previousResponses?: Record<string, DbModuleResponse>;
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
    <div className="grid h-screen grid-cols-[1fr_auto] divide-x divide-border">
      {/* Main Content Area */}
      <div className="flex flex-col min-h-0">
        {/* Header */}
        <header className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center px-8">
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
                <h1 className="text-xl font-semibold tracking-tight">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center space-x-6">
              {/* Progress Indicator */}
              {stepProgress && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">{stepProgress}</span>
                  <motion.div
                    className="w-32 h-1 bg-muted rounded-full overflow-hidden"
                    initial={false}
                  >
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
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto min-h-0">
          <div className="h-full p-8 space-y-8">
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

        {/* AI Assistant Content */}
        <div
          className={cn(
            "h-full transition-all",
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
    </div>
  );
} 