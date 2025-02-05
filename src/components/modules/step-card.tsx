"use client"

import { LucideIcon, ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { memo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  nextButtonText?: string
  previousButtonText?: string
  isCompleted?: boolean
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
  isDisabled = false,
  nextButtonText = "Next",
  previousButtonText = "Previous",
  isCompleted = false
}: StepCardProps) {
  const isFinishing = nextButtonText.toLowerCase().includes('finish')
  const isModuleNavigation = previousButtonText.toLowerCase().includes('module')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="md:col-span-4 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/5 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {isCompleted && (
              <Badge variant="secondary" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Textarea
              placeholder={placeholder}
              className="min-h-[200px] resize-none transition-colors"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={isDisabled || isLoading}
            />
          </motion.div>
          <motion.div
            className="flex justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {showPrevious ? (
              <Button
                variant={isModuleNavigation ? "default" : "outline"}
                onClick={onPrevious}
                disabled={!onPrevious || isDisabled || isLoading}
                className={cn(
                  "gap-2",
                  isModuleNavigation &&
                    "bg-primary/10 hover:bg-primary/20 text-primary"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                {previousButtonText}
              </Button>
            ) : (
              <div />
            )}
            {showNext && (
              <Button
                onClick={onNext}
                disabled={!onNext || isDisabled || isLoading}
                className={cn(
                  "gap-2 transition-all",
                  isFinishing && "bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {nextButtonText}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.value === nextProps.value &&
    prevProps.showNext === nextProps.showNext &&
    prevProps.showPrevious === nextProps.showPrevious &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.nextButtonText === nextProps.nextButtonText &&
    prevProps.previousButtonText === nextProps.previousButtonText &&
    prevProps.isCompleted === nextProps.isCompleted
  )
}) 