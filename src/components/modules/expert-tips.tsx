"use client"

import { Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ExpertTipsProps {
  tips: string[]
}

export function ExpertTips({ tips }: ExpertTipsProps) {
  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm">Expert Tips</h4>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
} 