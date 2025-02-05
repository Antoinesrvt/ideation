"use client"

import { LucideIcon, ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const IconComponent = Icon || ArrowRight

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 p-1.5 bg-primary text-primary-foreground rounded-full"
          >
            <CheckCircle className="h-4 w-4" />
          </motion.div>
        )}
        
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
            </motion.div>
            <div className="flex-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Textarea
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[200px] resize-none"
              disabled={isDisabled || isLoading}
            />
          </motion.div>
          
          <motion.div 
            className="flex justify-between items-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {showPrevious && (
              <Button
                variant={isModuleNavigation ? "default" : "outline"}
                onClick={onPrevious}
                disabled={!onPrevious || isDisabled || isLoading}
                className={cn(
                  "group",
                  isModuleNavigation &&
                    "bg-primary/10 hover:bg-primary/20 text-primary"
                )}
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                {previousButtonText}
              </Button>
            )}
            
            {showNext && (
              <Button
                onClick={onNext}
                disabled={!onNext || isDisabled || isLoading}
                className={cn(
                  "group ml-auto",
                  !showPrevious && "w-full",
                  isFinishing && "bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {nextButtonText}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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