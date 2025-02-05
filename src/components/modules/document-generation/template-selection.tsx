"use client"

import { useState, useEffect } from "react"
import { FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModuleType } from "@/types/project"
import { useTemplates } from "@/hooks/use-templates"
import { cn } from "@/lib/utils"
import MarkdownPreview from '@uiw/react-markdown-preview'
import { useSupabase } from "@/context/supabase-context"

interface TemplateSelectionProps {
  moduleType: ModuleType
  onSelect: (templateId: string) => void
}

export function TemplateSelection({
  moduleType,
  onSelect
}: TemplateSelectionProps) {
  const { templates, isLoading, error } = useTemplates(moduleType)
  const [selectedId, setSelectedId] = useState<string>()
  const [previewId, setPreviewId] = useState<string>()
  const [previewContent, setPreviewContent] = useState<string>()
  const { supabase } = useSupabase()

  // Fetch template content when template is selected or hovered
  useEffect(() => {
    async function fetchTemplateContent(templateId: string) {
      const template = templates.find(t => t.id === templateId)
      if (!template) return

      try {
        console.log('Template found:', template)
        console.log('Attempting to download from path:', template.template_path)
        
        const { data, error } = await supabase.storage
          .from('templates')
          .download(template.template_path)

        if (error) {
          console.error('Storage error:', error)
          throw error
        }
        if (!data) return

        const content = await data.text()
        setPreviewContent(content)
      } catch (err) {
        console.error('Error loading template content:', err)
        setPreviewContent('Failed to load template content')
      }
    }

    const activeTemplateId = selectedId || previewId
    if (activeTemplateId) {
      fetchTemplateContent(activeTemplateId)
    } else {
      setPreviewContent(undefined)
    }
  }, [selectedId, previewId, templates, supabase])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load templates. Please try again.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-sm text-muted-foreground">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-lg font-semibold">Select Template</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a template to generate your document
          </p>
        </div>
        <Button
          onClick={() => selectedId && onSelect(selectedId)}
          disabled={!selectedId}
        >
          Generate Document
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-[300px_1fr] divide-x">
        {/* Template List */}
        <ScrollArea className="h-[60vh]">
          <div className="p-4 space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedId === template.id && "border-primary bg-primary/5",
                  !selectedId && previewId === template.id && "border-primary/50"
                )}
                onClick={() => setSelectedId(template.id)}
                onMouseEnter={() => setPreviewId(template.id)}
                onMouseLeave={() => setPreviewId(undefined)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedId === template.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Preview */}
        <ScrollArea className="h-[60vh]">
          <div className="p-6">
            {(selectedId || previewId) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      This is how your document will look after generation
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Document Preview</span>
                  </div>
                  <div className="p-6">
                    {previewContent ? (
                      <MarkdownPreview 
                        source={previewContent} 
                        className="bg-transparent"
                        style={{ 
                          backgroundColor: 'transparent',
                          fontSize: '0.875rem',
                          lineHeight: '1.5'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Loading preview...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-muted/30 p-4 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold mb-2">No template selected</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Select a template from the list to preview its content and structure
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 