"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface ModuleLayoutProps {
  title: string
  progress: number
  onBack: () => void
  children: React.ReactNode
}

export function ModuleLayout({ 
  title, 
  progress, 
  onBack, 
  children,
}: ModuleLayoutProps) {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button> */}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Progress value={progress} className="w-32" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  )
} 