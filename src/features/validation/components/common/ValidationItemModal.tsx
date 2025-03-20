import React, { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Trash2, Plus, ArrowRight, Share2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export type ValidationItemType = 'hypothesis' | 'experiment' | 'abTest' | 'userFeedback';

export interface ValidationItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: ValidationItemType;
  title: string;
  status: string;
  statusColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidationItemTabsProps {
  detailsContent: ReactNode;
  insightsContent: ReactNode;
  relatedContent: ReactNode;
}

export function ValidationItemModal({
  isOpen,
  onClose,
  itemType,
  title,
  status,
  statusColor,
  onEdit,
  onDelete,
  children,
  actions,
  createdAt,
  updatedAt
}: ValidationItemModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <Badge variant={statusColor as any} className="capitalize">
              {status}
            </Badge>
            {createdAt && (
              <span className="text-xs text-muted-foreground">
                Created: {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
            {updatedAt && (
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          {children}
        </div>
        
        {actions && (
          <>
            <Separator />
            <DialogFooter className="p-4">
              {actions}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ValidationItemTabs({ 
  detailsContent, 
  insightsContent, 
  relatedContent 
}: ValidationItemTabsProps) {
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
      <TabsList className="mb-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
        <TabsTrigger value="related">Related Items</TabsTrigger>
      </TabsList>
      
      <ScrollArea className="flex-grow">
        <TabsContent value="details" className="m-0 p-4">
          {detailsContent}
        </TabsContent>
        
        <TabsContent value="insights" className="m-0 p-4">
          {insightsContent}
        </TabsContent>
        
        <TabsContent value="related" className="m-0 p-4">
          {relatedContent}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}

export function ValidationItemActions({ 
  actions 
}: { 
  actions: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  }> 
}) {
  return (
    <div className="flex items-center gap-2 justify-end">
      {actions.map((action, index) => (
        <Button 
          key={index} 
          variant={action.variant || 'outline'} 
          size="sm" 
          onClick={action.onClick}
          className="flex items-center gap-2"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
} 