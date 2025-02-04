"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface StepCardProps {
  icon: LucideIcon
  title: string
  description?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onPrevious?: () => void
  onNext?: () => void
  showPrevious?: boolean
  showNext?: boolean
}

export function StepCard({
  icon: Icon,
  title,
  description,
  placeholder,
  value,
  onChange,
  onPrevious,
  onNext,
  showPrevious = true,
  showNext = true,
}: StepCardProps) {
  return (
    <Card className="md:col-span-4">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Icon className="h-6 w-6 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={placeholder}
          className="min-h-[200px] resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex justify-between">
          {showPrevious && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              Previous
            </Button>
          )}
          {showNext && (
            <Button
              onClick={onNext}
              disabled={!onNext}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 