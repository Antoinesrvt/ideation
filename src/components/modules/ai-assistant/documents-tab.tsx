"use client"

import { useState } from "react"
import { FileText, Plus, Loader2, AlertTriangle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModuleType } from "@/types/project"
import { useDocuments } from "@/lib/hooks/use-documents"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

interface DocumentsTabProps {
  projectId: string
  moduleType: ModuleType
  onGenerateClick: () => void
  className?: string
}

export function DocumentsTab({
  projectId,
  moduleType,
  onGenerateClick,
  className
}: DocumentsTabProps) {
  const { documents, isLoading, error, isGenerating } = useDocuments({ 
    projectId, 
    moduleType 
  })

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full p-8 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground max-w-[240px]">
          Failed to load documents. Please try again.
        </p>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full p-8"
      >
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading documents...</p>
      </motion.div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Action Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end px-4 py-2"
      >
        <Button 
          size="sm" 
          onClick={onGenerateClick}
          disabled={isGenerating}
          className="gap-2 bg-background hover:bg-accent text-foreground group"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              New Document
            </>
          )}
        </Button>
      </motion.div>

      {/* Document List */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-2 space-y-2">
          <AnimatePresence mode="wait">
            {documents.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {documents.map((doc, index) => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Version {doc.version}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(doc.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium text-lg mb-2">No documents yet</h4>
                <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
                  Generate your first document to get started with this project
                </p>
                <Button onClick={onGenerateClick} className="gap-2 group">
                  <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Generate Document
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
} 