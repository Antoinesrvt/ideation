"use client"

import { useState } from "react"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModuleType } from "@/types/project"
import { useDocuments } from "@/hooks/use-documents"
import { cn } from "@/lib/utils"

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
  const { documents, isLoading, error } = useDocuments({ projectId, moduleType })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load documents. Please try again.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-sm text-muted-foreground">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Action Bar */}
      <div className="flex justify-end px-4 py-2">
        <Button 
          size="sm" 
          onClick={onGenerateClick}
          className="gap-2 bg-background hover:bg-accent text-foreground"
        >
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {/* Document List */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-2 space-y-2">
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Version {doc.version}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-background"
                    asChild
                  >
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-lg mb-2">No documents yet</h4>
              <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
                Generate your first document to get started with this project
              </p>
              <Button onClick={onGenerateClick} className="gap-2">
                <Plus className="h-4 w-4" />
                Generate Document
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 