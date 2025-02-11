"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, X, ChevronUp, Download, Eye, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ModuleNavigation,
  ModuleNavigationItem,
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
  modules: ModuleNavigationItem[];
  currentModuleType: ModuleType;
  onModuleSelect: (moduleType: ModuleType) => void;
  progress: number;
  moduleRecaps: ModuleRecap[];
  children: React.ReactNode;
  mode?: "guided" | "expert";
}

export function IdeationLayout({
  modules,
  currentModuleType,
  onModuleSelect,
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
    <div className="flex flex-col h-full">
      {/* Header with Progress */}
      <header className="flex-none h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center px-4">
          <div className="w-full space-y-2">
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
        </div>
      </header>

      {/* Navigation Content */}
      <div className="flex-1 p-4">
        <ModuleNavigation
          modules={modules}
          currentModuleType={currentModuleType}
          onModuleSelect={onModuleSelect}
        />
      </div>
    </div>
  );

  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-[280px_1fr] overflow-hidden">
      {/* Sidebar Navigation */}
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden fixed bottom-4 left-4 z-50 rounded-full shadow-lg">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="hidden lg:block border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <Sidebar />
        </motion.aside>
      )}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative bg-background"
      >
        {children}
      </motion.main>

      {/* Progress Recap Panel */}
      <motion.div
        initial={false}
        animate={{ 
          height: isRecapOpen ? "auto" : "48px",
          y: isRecapOpen ? 0 : "calc(100% - 48px)" 
        }}
        transition={{ type: "spring", damping: 20 }}
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
                  {modules.filter(m => m.completed).length} of {modules.length} completed
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

          <AnimatePresence mode="wait">
            {isRecapOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 20 }}
                className="p-6"
              >
                <Tabs defaultValue="summary" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {modules.map((module, index) => (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={cn(
                            "p-4 transition-all duration-200 hover:shadow-md",
                            module.completed && "bg-primary/5 border-primary/10"
                          )}>
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold">{module.title}</h3>
                              {module.completed && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                >
                                  Completed
                                </motion.span>
                              )}
                            </div>
                            {moduleRecaps.find(r => r.id === module.id)?.summary && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {moduleRecaps.find(r => r.id === module.id)?.summary}
                              </p>
                            )}
                          </Card>
                        </motion.div>
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