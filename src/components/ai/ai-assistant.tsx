"use client"

import { useState } from "react"
import { Sparkles, Search, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { AIAnalysis, AIResearchData } from "@/types/ai"
import { cn } from "@/lib/utils"

interface AIAssistantProps {
  currentText: string
  moduleId: string
  stepId: string
  previousResponses?: Record<string, string>
  onSuggestionApply: (suggestion: string) => void
}

export function AIAssistant({
  currentText,
  moduleId,
  stepId,
  previousResponses,
  onSuggestionApply
}: AIAssistantProps) {
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [researchData, setResearchData] = useState<AIResearchData | null>(null)

  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {}}
            disabled={isAnalyzing || !currentText.trim()}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Enhance Content
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {}}
            disabled={isAnalyzing}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Research Insights
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Analyzing your content...</p>
            </motion.div>
          ) : analysis ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Suggestions</h3>
                  {analysis.suggestions.map((suggestion, index) => (
                    <Card key={index} className="p-3 hover:bg-muted/50 transition-colors">
                      <p className="text-sm mb-2">{suggestion}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-full justify-start text-primary"
                        onClick={() => onSuggestionApply(suggestion)}
                      >
                        <ArrowRight className="h-3 w-3 mr-2" />
                        Apply Suggestion
                      </Button>
                    </Card>
                  ))}
                </div>
              )}

              {/* Improvements */}
              {analysis.improvements && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Improvements</h3>
                  {Object.entries(analysis.improvements).map(([key, items]) => (
                    <div key={key} className="space-y-2">
                      <h4 className="text-sm text-muted-foreground capitalize">{key}</h4>
                      {items.map((item, index) => (
                        <p key={index} className="text-sm pl-4 border-l-2 border-primary/20">
                          {item}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <Sparkles className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Click "Enhance Content" to get AI-powered suggestions and improvements
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
} 