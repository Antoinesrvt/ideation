import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Edit, HelpCircle, Lightbulb, PlusCircle, Trash2, Smartphone, Laptop, Loader2, AlertCircle } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { useBusinessModel } from '@/hooks/features/useBusinessModel';
import { useProjectStore } from '@/store';
import { Database } from '@/types/database';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';
import { BusinessModelCanvas as BusinessModelCanvasType, CanvasSectionKey } from '@/lib/services/features/business-model-service';

// Import types from database
type CanvasItem = Database['public']['Tables']['canvas_items']['Row'];

// Extend the CanvasItem interface for our internal use
interface ExtendedCanvasItem extends CanvasItem {
  details?: string;
  priority?: string;
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

// Define type for new items that can be added
type NewCanvasItem = Omit<CanvasItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'project_id'> & { created_by: string | null };

// Define the form values interface
interface FormValues {
  text: string;
  details: string;
}

// Guidance information for each section
const sectionGuidance = {
  keyPartners: {
    title: 'Key Partners',
    description: 'Who are our key partners and suppliers? What resources are we acquiring from them? What activities do they perform?',
    examples: [
      'Strategic alliances with non-competitors',
      'Supplier relationships',
      'Joint ventures for new businesses'
    ]
  },
  keyActivities: {
    title: 'Key Activities',
    description: 'What key activities does our value proposition require? What activities are most important for our distribution channels, customer relationships, and revenue streams?',
    examples: [
      'Production',
      'Problem solving',
      'Platform/network management'
    ]
  },
  keyResources: {
    title: 'Key Resources',
    description: 'What key resources does our value proposition require? What resources are most important for our distribution channels, customer relationships, and revenue streams?',
    examples: [
      'Physical (facilities, vehicles)',
      'Intellectual (brands, patents)',
      'Human (expertise, creativity)',
      'Financial (cash, credit)'
    ]
  },
  valuePropositions: {
    title: 'Value Propositions',
    description: 'What value do we deliver to the customer? Which customer needs are we satisfying?',
    examples: [
      'Newness',
      'Performance',
      'Customization',
      'Design',
      'Price',
      'Accessibility'
    ]
  },
  customerRelationships: {
    title: 'Customer Relationships',
    description: 'What type of relationship does each of our customer segments expect us to establish and maintain?',
    examples: [
      'Personal assistance',
      'Self-service',
      'Automated services',
      'Communities',
      'Co-creation'
    ]
  },
  channels: {
    title: 'Channels',
    description: 'Through which channels do our customer segments want to be reached? How are we reaching them now? How are our channels integrated?',
    examples: [
      'Direct (sales team, web)',
      'Indirect (partner stores)',
      'Owned vs partner channels'
    ]
  },
  customerSegments: {
    title: 'Customer Segments',
    description: 'For whom are we creating value? Who are our most important customers?',
    examples: [
      'Mass market',
      'Niche market',
      'Segmented',
      'Multi-sided platform'
    ]
  },
  costStructure: {
    title: 'Cost Structure',
    description: 'What are the most important costs inherent in our business model? Which key resources and activities are most expensive?',
    examples: [
      'Fixed costs (salaries, rent)',
      'Variable costs',
      'Economies of scale',
      'Economies of scope'
    ]
  },
  revenueStreams: {
    title: 'Revenue Streams',
    description: 'For what value are our customers really willing to pay? How are they currently paying? How would they prefer to pay?',
    examples: [
      'Asset sale',
      'Usage fee',
      'Subscription fee',
      'Lending/Renting/Leasing',
      'Licensing'
    ]
  }
};

export const BusinessModelCanvas: React.FC = () => {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : undefined;
  const { toast } = useToast();
  
  const { 
    data,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    getItemChangeType,
    isDiffMode
  } = useBusinessModel(projectId);
  
  const { comparisonMode, stagedData } = useProjectStore();
  
  // State to track which item is being edited
  const [editingItem, setEditingItem] = useState<{ 
    section: CanvasSectionKey; 
    item: ExtendedCanvasItem 
  } | null>(null);
  
  // Create form instance using react-hook-form
  const form = useForm<FormValues>({
    defaultValues: {
      text: '',
      details: ''
    }
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingState message="Loading business model canvas data..." />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState 
            error={error} 
            onRetry={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for rendering, ensuring all properties exist for safety
  const safeData = {
    keyPartners: data?.keyPartners || [],
    keyActivities: data?.keyActivities || [],
    keyResources: data?.keyResources || [],
    valuePropositions: data?.valuePropositions || [],
    customerRelationships: data?.customerRelationships || [],
    channels: data?.channels || [],
    customerSegments: data?.customerSegments || [],
    costStructure: data?.costStructure || [],
    revenueStreams: data?.revenueStreams || []
  };
  
  // If we're editing an item, populate the form with its values
  if (editingItem) {
    form.reset({
      text: editingItem.item.text,
      details: editingItem.item.details || ''
    });
  }
  
  // Helper to convert canvas items for display
  const mapCanvasItemsToDisplay = (section: CanvasSectionKey): ExtendedCanvasItem[] => {
    // Get the items for this section
    const items = safeData[section];
    
    // For each item, check if it's modified in comparison mode
    return items.map(item => {
      // Default status is unchanged
      let status: 'new' | 'modified' | 'unchanged' | 'removed' = 'unchanged';
      
      // In comparison mode, determine if item is new or modified
      if (isDiffMode) {
        status = getItemChangeType(item.id) as 'new' | 'modified' | 'unchanged' | 'removed';
      }
      
      return {
        ...item,
        status,
      };
    });
  };
  
  const handleAddItem = async (section: CanvasSectionKey) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive"
      });
      return;
    }
    
    const newItem: NewCanvasItem = {
      text: '',
      checked: false,
      color: null,
      tags: null,
      order_index: null,
      section_id: null,
      created_by: null,
    };

    try {
      // Add the item to the section
      const result = await addItem(section, newItem);
      
      if (result) {
        // Create a temporary item for editing
        const tempItem: ExtendedCanvasItem = {
          ...result,
          details: ''
        };
        
        setEditingItem({ 
          section, 
          item: tempItem
        });
        
        toast({
          title: "Success",
          description: "Item added successfully",
          variant: "default"
        });
      } else {
        throw new Error("Failed to add item");
      }
    } catch (err) {
      toast({
        title: "Error adding item",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateItem = async (
    section: CanvasSectionKey,
    itemId: string,
    updates: Partial<NewCanvasItem>
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await updateItem(section, itemId, updates);
      
      if (result) {
        toast({
          title: "Success",
          description: "Item updated successfully",
          variant: "default"
        });
      } else {
        throw new Error("Failed to update item");
      }
    } catch (err) {
      toast({
        title: "Error updating item",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveItem = async (section: CanvasSectionKey, itemId: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await deleteItem(section, itemId);
      
      if (result) {
        toast({
          title: "Success",
          description: "Item deleted successfully",
          variant: "default"
        });
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (err) {
      toast({
        title: "Error deleting item",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const saveItemChanges = async (values: FormValues) => {
    if (!editingItem || !projectId) return;
    
    try {
      // Only update supported properties from the database type
      await handleUpdateItem(
        editingItem.section,
        editingItem.item.id,
        { 
          text: values.text,
        }
      );
      
      setEditingItem(null);
    } catch (err) {
      toast({
        title: "Error saving changes",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const renderCanvasItems = (section: CanvasSectionKey) => {
    const items = mapCanvasItemsToDisplay(section);
    
    return (
      <>
        <div className="space-y-2 mb-2">
          {items.map(item => {
            // Get status classes for comparison mode
            let statusClass = '';
            if (isDiffMode) {
              if (item.status === 'new') {
                statusClass = 'bg-green-50 border-green-200';
              } else if (item.status === 'modified') {
                statusClass = 'bg-yellow-50 border-yellow-200';
              }
            }
            
            return (
              <div 
                key={item.id}
                className={`p-2 ${item.checked ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'} ${statusClass} rounded-md flex items-start group hover:shadow-sm transition-all duration-200`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 break-words">{item.text}</p>
                </div>
                <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                        onClick={() => setEditingItem({ section, item })}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit item</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => handleRemoveItem(section, item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete item</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto w-full flex items-center justify-center"
          onClick={() => handleAddItem(section)}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add Item</span>
        </Button>
      </>
    );
  };
  
  // Render a section with a tooltip containing guidance
  const renderSection = (section: CanvasSectionKey, className: string = "") => {
    const guidance = sectionGuidance[section];
    
    return (
      <Card className={`h-full min-h-[100px] ${className}`}>
        <CardHeader className="pb-2 space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md">{guidance.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-normal text-sm">{guidance.description}</p>
                  <ul className="list-disc pl-5 mt-2 text-xs">
                    {guidance.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
          <CardDescription className="text-xs hidden lg:block">
            {guidance.description.split("?")[0]}?
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {renderCanvasItems(section)}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="">
      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${sectionGuidance[editingItem.section].title} Item` : "Edit Item"}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(saveItemChanges)}>
                <div className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="text"
                    defaultValue={editingItem.item.text}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Enter ${sectionGuidance[editingItem.section].title.toLowerCase()} item...`} 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="details"
                    defaultValue={editingItem.item.details || ''}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details (For Display Only)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add more details about this item (note: not saved permanently)" 
                            className="resize-none" 
                            rows={3} 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          )}
        </DialogContent>
      </Dialog>

      
      {/* First-time user guidance if no content exists */}
      {/* {!hasContent && (
        <div className="mb-6 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <Lightbulb className="h-6 w-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800">Getting Started with Your Business Model Canvas</h3>
              <p className="text-blue-800 mt-1 mb-2">The Business Model Canvas helps you visualize the key components of your business model in one place.</p>
              <ol className="list-decimal pl-5 text-sm text-blue-800">
                <li>Click on any section to add your first item</li>
                <li>Start with your <strong>Customer Segments</strong> and <strong>Value Propositions</strong></li>
                <li>Use the Canvas Guide button for more detailed instructions</li>
              </ol>
            </div>
          </div>
        </div>
      )} */}
      
      {/* Desktop Layout - Standard BMC Grid */}
      <div className="hidden lg:grid lg:grid-cols-10 lg:gap-4 lg:auto-rows-fr lg:min-h-[600px]">
        {/* Row 1: Top section with 5 areas */}
        {renderSection('keyPartners', 'col-span-2 row-span-2')}
        {renderSection('keyActivities', 'col-span-2')}
        {renderSection('valuePropositions', 'col-span-2 row-span-2')}
        {renderSection('customerRelationships', 'col-span-2')}
        {renderSection('customerSegments', 'col-span-2 row-span-2')}
        
        {/* Row 2: Middle section with 2 areas */}
        {renderSection('keyResources', 'col-span-2')}
        {renderSection('channels', 'col-span-2')}
        
        {/* Row 3: Bottom section with 2 areas */}
        {renderSection('costStructure', 'col-span-5')}
        {renderSection('revenueStreams', 'col-span-5')}
      </div>
      
      {/* Mobile/Tablet Layout - Tabs based */}
      <div className="block lg:hidden min-h-[500px]">
        <Tabs defaultValue="valuePropositions" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="left">Left Side</TabsTrigger>
            <TabsTrigger value="center">Center</TabsTrigger>
            <TabsTrigger value="right">Right Side</TabsTrigger>
          </TabsList>
          
          <TabsContent value="left" className="space-y-4">
            {renderSection('keyPartners')}
            {renderSection('keyActivities')}
            {renderSection('keyResources')}
          </TabsContent>
          
          <TabsContent value="center">
            {renderSection('valuePropositions')}
          </TabsContent>
          
          <TabsContent value="right" className="space-y-4">
            {renderSection('customerSegments')}
            {renderSection('customerRelationships')}
            {renderSection('channels')}
          </TabsContent>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSection('costStructure')}
            {renderSection('revenueStreams')}
          </div>
        </Tabs>
      </div>
    </div>
  );
};