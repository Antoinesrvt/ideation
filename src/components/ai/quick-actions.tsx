"use client"

import { useState } from "react"
import { Command } from "cmdk"
import { Command as CommandIcon } from "lucide-react";
import { Button } from "@/components/ui/button"
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { QuickAction, QuickActionGroup } from "@/types/ai"

interface QuickActionsProps {
  moduleId: string
  stepId: string
  onActionSelect: (action: QuickAction) => void
  contextualActions?: QuickActionGroup[]
}

export function QuickActions({
  moduleId,
  stepId,
  onActionSelect,
  contextualActions
}: QuickActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex-1"
      >
        <CommandIcon className="h-4 w-4 mr-2" />
        Quick Actions...
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search actions..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>

          {contextualActions?.map((group) => (
            <CommandGroup key={group.id} heading={group.label}>
              {group.actions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    onActionSelect(action);
                    setOpen(false);
                  }}
                >
                  {action.icon && (
                    <div className="h-4 w-4 mr-2">{action.icon}</div>
                  )}
                  {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
} 