"use client"

import { LucideIcon, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { memo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
  previousButtonText = "Previous"
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
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Icon className="h-6 w-6 text-primary" />
            <CardTitle>{title}</CardTitle>
          </motion.div>
          {description && (
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
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
                  isModuleNavigation && "bg-primary/10 hover:bg-primary/20 text-primary"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                {previousButtonText}
              </Button>
            ) : <div />}
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
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.nextButtonText === nextProps.nextButtonText &&
    prevProps.previousButtonText === nextProps.previousButtonText
  )
}) 