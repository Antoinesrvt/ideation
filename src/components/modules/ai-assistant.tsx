"use client"

import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AIAssistantProps {
  mode: "guided" | "expert"
  context: string
  suggestion: string | null
  onSuggest: () => void
  expertTips?: string[]
}

export function AIAssistant({ 
  mode, 
  context, 
  suggestion, 
  onSuggest,
  expertTips = [] 
}: AIAssistantProps) {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Assistant</CardTitle>
          <Button variant="ghost" size="icon" onClick={onSuggest}>
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {suggestion ? (
            <div className="bg-muted p-4 rounded-lg text-sm">
              {suggestion}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              Click the sparkles to get AI suggestions for your {context}
            </div>
          )}
          
          {mode === "expert" && expertTips.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Expert Tips</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                {expertTips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
} 