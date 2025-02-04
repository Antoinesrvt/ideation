"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, X, ChevronUp, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModuleNavigation, ModuleStep } from "@/components/modules/module-navigation"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ModuleRecap {
  id: string
  title: string
  content: Record<string, string>
  completed: boolean
}

interface IdeationLayoutProps {
  children: React.ReactNode
  steps: ModuleStep[]
  currentStepId: string
  onStepSelect: (stepId: string) => void
  progress: number
  moduleRecaps: ModuleRecap[]
}

export function IdeationLayout({
  children,
  steps,
  currentStepId,
  onStepSelect,
  progress,
  moduleRecaps
}: IdeationLayoutProps) {
  const [isRecapOpen, setIsRecapOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Top Bar */}
      <header className="border-b">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/dashboard">
                <X className="h-4 w-4" />
              </a>
            </Button>
            <Progress value={progress} className="w-[200px]" />
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="default" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </div>
      </header>

      <div className="container grid grid-cols-[280px,1fr] gap-6 py-6 w-full">
        {/* Left Sidebar */}
        <aside className="space-y-6">
          <ModuleNavigation
            steps={steps}
            currentStepId={currentStepId}
            onStepSelect={onStepSelect}
            className="sticky top-6"
          />
        </aside>

        {/* Main Content */}
        <main className="space-y-6 pb-[200px] w-full">
          {children}
        </main>
      </div>

      {/* Recap Panel */}
      <motion.div
        initial={false}
        animate={{ 
          height: isRecapOpen ? "auto" : "48px",
          y: isRecapOpen ? 0 : "calc(100% - 48px)" 
        }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg w-full"
      >
        <div className="container">
          <Button
            variant="ghost"
            onClick={() => setIsRecapOpen(!isRecapOpen)}
            className="w-full text-left justify-between h-12"
          >
            <span className="font-semibold">Progress Recap</span>
            <motion.div
              animate={{ rotate: isRecapOpen ? 180 : 0 }}
            >
              <ChevronUp className="h-4 w-4" />
            </motion.div>
          </Button>
          
          <AnimatePresence>
            {isRecapOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pb-6"
              >
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Module Details</TabsTrigger>
                    <TabsTrigger value="export">Export Options</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-4 gap-4">
                          {moduleRecaps.map(module => (
                            <div key={module.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-2 w-2 rounded-full",
                                  module.completed ? "bg-green-500" : "bg-gray-300"
                                )} />
                                <h3 className="font-medium">{module.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {Object.keys(module.content).length} items completed
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-4">
                      {moduleRecaps.map(module => (
                        <Card key={module.id}>
                          <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4">{module.title}</h3>
                            <div className="space-y-2">
                              {Object.entries(module.content).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium">{key}:</span>
                                  <p className="text-muted-foreground">{value}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="export" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">
                          <Button variant="outline" className="w-full">
                            Export as PDF
                          </Button>
                          <Button variant="outline" className="w-full">
                            Export as Word
                          </Button>
                          <Button variant="outline" className="w-full">
                            Export Pitch Deck
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
} 