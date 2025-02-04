"use client"

import { motion } from "framer-motion"
import { TrendingUp, Building, LineChart, Link } from "lucide-react"
import { Card } from "@/components/ui/card"
import { AIResearchData } from "@/types/ai"

interface AIResearchResultsProps {
  data: AIResearchData
}

export function AIResearchResults({ data }: AIResearchResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Market Insights */}
      {data.marketInsights && data.marketInsights.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            Market Insights
          </h3>
          <ul className="space-y-2">
            {data.marketInsights.map((insight, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {insight}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Competitor Data */}
      {data.competitorData && data.competitorData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Building className="h-4 w-4 text-primary" />
            Competitor Analysis
          </h3>
          <ul className="space-y-2">
            {data.competitorData.map((competitor, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {competitor}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Industry Trends */}
      {data.industryTrends && data.industryTrends.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <LineChart className="h-4 w-4 text-primary" />
            Industry Trends
          </h3>
          <ul className="space-y-2">
            {data.industryTrends.map((trend, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {trend}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Sources */}
      {data.sources.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Link className="h-4 w-4 text-primary" />
            Sources
          </h3>
          <ul className="space-y-2">
            {data.sources.map((source, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {source}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  )
} 