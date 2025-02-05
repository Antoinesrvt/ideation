"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, X, ChevronUp, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ModuleNavigation,
  ModuleStep,
} from "@/components/modules/module-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ModuleType } from "@/types/project"

interface ModuleRecap {
  id: string
  title: string
  completed: boolean
  summary?: string
}

interface IdeationLayoutProps {
  steps: ModuleStep[]
  currentStepId: ModuleType
  onStepSelect: (stepId: ModuleType) => void
  progress: number
  moduleRecaps: ModuleRecap[]
  children: React.ReactNode
}

export function IdeationLayout({
  steps,
  currentStepId,
  onStepSelect,
  progress,
  moduleRecaps,
  children
}: IdeationLayoutProps) {
  const [isRecapOpen, setIsRecapOpen] = useState(false)

  return (
    <div className="relative min-h-screen p-4 w-full">
      {/* Header with Save/Preview Controls */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-semibold">Startup Ideation</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => console.log("Save")}>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log("Preview")}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log("Export")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container grid grid-cols-[280px,1fr] gap-6 py-6">
        {/* Left Sidebar - Global Navigation */}
        <aside className="space-y-6">
          <div className="sticky top-6">
            <div className="mb-4">
              <h2 className="text-sm font-semibold mb-2">Overall Progress</h2>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <ModuleNavigation
              steps={steps}
              currentStepId={currentStepId}
              onStepSelect={onStepSelect}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="space-y-6 pb-[200px]">
          {children}
        </main>
      </div>

      {/* Enhanced Recap Panel */}
      <motion.div
        initial={false}
        animate={{ 
          height: isRecapOpen ? "auto" : "48px",
          y: isRecapOpen ? 0 : "calc(100% - 48px)" 
        }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg"
      >
        <div className="container">
          <div className="flex items-center justify-between h-12">
            <Button
              variant="ghost"
              onClick={() => setIsRecapOpen(!isRecapOpen)}
              className="flex-1 flex items-center justify-between px-4"
            >
              <span className="font-semibold">Progress Recap</span>
              <motion.div animate={{ rotate: isRecapOpen ? 180 : 0 }}>
                <ChevronUp className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          <AnimatePresence>
            {isRecapOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                <Tabs defaultValue="summary">
                  <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {steps.map(step => (
                        <Card key={step.id} className="p-4">
                          <h3 className="font-semibold">{step.title}</h3>
                          {/* Add module-specific recap content */}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  {/* Add other tab contents */}
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
} 