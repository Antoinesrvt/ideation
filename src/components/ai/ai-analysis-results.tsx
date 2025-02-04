"use client"

import { motion } from "framer-motion"
import { Check, AlertCircle, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIAnalysis } from "@/types/ai"

interface AIAnalysisResultsProps {
  analysis: AIAnalysis
  onApplySuggestion: (suggestion: string) => void
}

export function AIAnalysisResults({ analysis, onApplySuggestion }: AIAnalysisResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* General Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            Suggestions
          </h3>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="mt-1"
                  onClick={() => onApplySuggestion(suggestion)}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Improvements */}
      {analysis.improvements && (
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Potential Improvements
          </h3>
          <div className="space-y-4">
            {analysis.improvements.clarity && (
              <div>
                <h4 className="text-sm font-medium mb-2">Clarity</h4>
                <ul className="space-y-2">
                  {analysis.improvements.clarity.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.improvements.completeness && (
              <div>
                <h4 className="text-sm font-medium mb-2">Completeness</h4>
                <ul className="space-y-2">
                  {analysis.improvements.completeness.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  )
} 