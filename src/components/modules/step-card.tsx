"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { memo } from "react"
import { Loader2 } from "lucide-react"

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
  isLoading?: boolean
  isDisabled?: boolean
}

export const StepCard = memo(function StepCard({
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
  isLoading = false,
  isDisabled = false
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
          disabled={isDisabled || isLoading}
        />
        <div className="flex justify-between">
          {showPrevious ? (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!onPrevious || isDisabled || isLoading}
            >
              Previous
            </Button>
          ) : <div />}
          {showNext && (
            <Button
              onClick={onNext}
              disabled={!onNext || isDisabled || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.value === nextProps.value &&
    prevProps.showNext === nextProps.showNext &&
    prevProps.showPrevious === nextProps.showPrevious &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isDisabled === nextProps.isDisabled
  )
}) 