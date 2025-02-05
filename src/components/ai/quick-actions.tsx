"use client"

import { useState } from "react"
import { Command } from "cmdk"
import { 
  Command as CommandIcon, 
  Save, 
  Eye, 
  Download,
  FileText,
  ChartBar,
  Lightbulb,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import { QuickAction, QuickActionGroup } from "@/types/ai"

interface QuickActionsProps {
  moduleId: string
  stepId: string
  onActionSelect: (action: QuickAction) => void
  contextualActions?: QuickActionGroup[]
  onSave?: () => void
  onPreview?: () => void
  onExport?: () => void
}

const GLOBAL_ACTIONS: QuickAction[] = [
  {
    id: 'save-progress',
    type: 'action',
    label: 'Save Progress',
    content: '',
    icon: <Save className="h-4 w-4" />,
    shortcut: '⌘S'
  },
  {
    id: 'preview',
    type: 'action',
    label: 'Preview Project',
    content: '',
    icon: <Eye className="h-4 w-4" />,
    shortcut: '⌘P'
  },
  {
    id: 'export',
    type: 'action',
    label: 'Export Project',
    content: '',
    icon: <Download className="h-4 w-4" />,
    shortcut: '⌘E'
  }
]

export function QuickActions({
  moduleId,
  stepId,
  onActionSelect,
  contextualActions,
  onSave,
  onPreview,
  onExport
}: QuickActionsProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (actionId: string) => {
    switch (actionId) {
      case 'save-progress':
        onSave?.()
        break
      case 'preview':
        onPreview?.()
        break
      case 'export':
        onExport?.()
        break
      default:
        const action = contextualActions?.flatMap(g => g.actions).find(a => a.id === actionId)
        if (action) {
          onActionSelect(action)
        }
    }
    setOpen(false)
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <CommandIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Quick Actions</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 ml-2">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>

          <CommandGroup heading="Global Actions">
            {GLOBAL_ACTIONS.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={() => handleSelect(action.id)}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
                {action.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {contextualActions?.map((group) => (
            <CommandGroup key={group.id} heading={group.label}>
              {group.actions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => handleSelect(action.id)}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  )
} 