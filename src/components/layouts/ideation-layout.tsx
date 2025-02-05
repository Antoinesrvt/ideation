"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, X, ChevronUp, Download, Eye, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ModuleNavigation,
  ModuleStep,
} from "@/components/modules/module-navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ModuleType } from "@/types/project"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
  mode?: 'guided' | 'expert'
}

export function IdeationLayout({
  steps,
  currentStepId,
  onStepSelect,
  progress,
  moduleRecaps,
  children,
  mode = 'guided'
}: IdeationLayoutProps) {
  const [isRecapOpen, setIsRecapOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const Sidebar = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">
              Overall Progress
            </h2>
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progress)}% Complete
            </p>
          </div>
          <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* {mode === "guided" && (
          <Card className="p-3 bg-primary/5 border-primary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete each step to build your startup plan. We'll guide you
              through the process.
            </p>
          </Card>
        )} */}

        <ModuleNavigation
          steps={steps}
          currentStepId={currentStepId}
          onStepSelect={onStepSelect}
          className="mt-6"
        />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background">
      <div className="container flex-1 items-start lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10 p-4">
        {/* Mobile Menu */}
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden fixed bottom-4 left-4 z-50 rounded-full shadow-lg">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-6">
              <Sidebar />
            </SheetContent>
          </Sheet>
        ) : (
          <aside className="hidden lg:block sticky top-4">
            <Sidebar />
          </aside>
        )}

        {/* Main Content */}
        <main className="lg:px-8">
          <div className="mx-auto space-y-8 ">
            {children}
          </div>
        </main>
      </div>

      {/* Enhanced Recap Panel */}
      <motion.div
        initial={false}
        animate={{ 
          height: isRecapOpen ? "auto" : "48px",
          y: isRecapOpen ? 0 : "calc(100% - 48px)" 
        }}
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t shadow-lg z-40"
      >
        <div className="container max-w-screen-2xl">
          <div className="flex items-center justify-between h-12">
            <Button
              variant="ghost"
              onClick={() => setIsRecapOpen(!isRecapOpen)}
              className="flex-1 flex items-center justify-between px-4"
            >
              <span className="font-semibold">Progress Recap</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {steps.filter(s => s.completed).length} of {steps.length} completed
                </span>
                <motion.div 
                  animate={{ rotate: isRecapOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="h-4 w-4" />
                </motion.div>
              </div>
            </Button>
          </div>

          <AnimatePresence>
            {isRecapOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <Tabs defaultValue="summary" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {steps.map(step => (
                        <Card key={step.id} className={cn(
                          "p-4 transition-colors",
                          step.completed && "bg-primary/5 border-primary/10"
                        )}>
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold">{step.title}</h3>
                            {step.completed && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          {moduleRecaps.find(r => r.id === step.id)?.summary && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {moduleRecaps.find(r => r.id === step.id)?.summary}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes">
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Your notes will appear here...
                      </p>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai-insights">
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">
                        AI-generated insights will appear here...
                      </p>
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