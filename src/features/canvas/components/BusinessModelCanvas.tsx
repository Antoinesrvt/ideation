import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Edit, HelpCircle, Lightbulb, PlusCircle, Trash2, Smartphone, Laptop } from 'lucide-react';
import { BusinessModelCanvas as BusinessModelCanvasType, CanvasItem } from '@/types';
import { useForm, FormProvider } from 'react-hook-form';

// Extend the CanvasItem interface for our internal use
interface ExtendedCanvasItem extends CanvasItem {
  details?: string;
  priority?: string;
}

// Define the form values interface
interface FormValues {
  text: string;
  details: string;
}

interface BusinessModelCanvasProps {
  data?: BusinessModelCanvasType;
  onUpdate: (data: Partial<BusinessModelCanvasType>) => void;
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

export const BusinessModelCanvas: React.FC<BusinessModelCanvasProps> = ({ 
  data,
  onUpdate
}) => {
  const [activeSection, setActiveSection] = useState<keyof BusinessModelCanvasType | null>(null);
  const [editingItem, setEditingItem] = useState<{ section: keyof BusinessModelCanvasType; item: ExtendedCanvasItem } | null>(null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      text: '',
      details: '',
    }
  });
  
  const safeData = data || {
    keyPartners: [],
    keyActivities: [],
    keyResources: [],
    valuePropositions: [],
    customerRelationships: [],
    channels: [],
    customerSegments: [],
    costStructure: [],
    revenueStreams: []
  };
  
  // Check if any content exists in the canvas
  const hasContent = Object.values(safeData).some(section => section && section.length > 0);
  
  const handleAddItem = (section: keyof BusinessModelCanvasType) => {
    const newItem: CanvasItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: '',
      checked: false
    };
    
    onUpdate({
      [section]: [...(safeData[section] || []), newItem]
    });
    
    // Start editing the new item
    setEditingItem({ section, item: newItem as ExtendedCanvasItem });
  };
  
  const handleUpdateItem = (
    section: keyof BusinessModelCanvasType,
    itemId: string,
    updates: Partial<CanvasItem>
  ) => {
    const sectionItems = safeData[section] || [];
    
    onUpdate({
      [section]: sectionItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  };
  
  const handleRemoveItem = (section: keyof BusinessModelCanvasType, itemId: string) => {
    const sectionItems = safeData[section] || [];
    
    onUpdate({
      [section]: sectionItems.filter(item => item.id !== itemId)
    });
  };
  
  const saveItemChanges = (values: FormValues) => {
    if (!editingItem) return;
    
    // Only update the text property in the official CanvasItem
    handleUpdateItem(
      editingItem.section,
      editingItem.item.id,
      { 
        text: values.text,
      }
    );
    
    // We'll need to maintain details separately in the future
    // if we want to persist them
    
    setEditingItem(null);
  };
  
  const renderCanvasItems = (section: keyof BusinessModelCanvasType) => {
    const items = safeData[section] || [];
    
    return (
      <>
        <div className="space-y-2 mb-2">
          {items.map(item => {
            // Cast to extended item for UI purposes only
            const extendedItem = item as ExtendedCanvasItem;
            
            return (
              <div 
                key={item.id}
                className={`p-2 ${item.checked ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'} rounded-md flex items-start group hover:shadow-sm transition-all duration-200`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!item.text && 'text-gray-500 italic'}`}>
                    {item.text || `Add ${section.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                  </p>
                  {extendedItem.details && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{extendedItem.details}</p>
                  )}
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => setEditingItem({ section, item: extendedItem })}
                  >
                    <Edit className="h-3 w-3 text-gray-500" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => handleUpdateItem(section, item.id, { checked: !item.checked })}
                  >
                    <Check className="h-3 w-3 text-green-500" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => handleRemoveItem(section, item.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center text-gray-500"
          onClick={() => handleAddItem(section)}
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          <span className="text-xs">Add {section.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
        </Button>
      </>
    );
  };
  
  // Render a section with a tooltip containing guidance
  const renderSection = (section: keyof BusinessModelCanvasType, className: string = "") => {
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
    <div className="p-6">
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
      
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Model Canvas</h2>
          <p className="text-gray-600">Map out all the essential components of your business model</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Lightbulb className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Canvas Guide</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm p-4">
              <h4 className="font-bold mb-2">How to Use the Business Model Canvas</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Start with <strong>Customer Segments</strong> to identify who you're creating value for</li>
                <li>Define your <strong>Value Propositions</strong> - what problems you're solving</li>
                <li>Determine <strong>Channels</strong> to reach your customers</li>
                <li>Establish <strong>Customer Relationships</strong> to maintain</li>
                <li>Identify <strong>Revenue Streams</strong> from each segment</li>
                <li>List <strong>Key Resources</strong> required for your business</li>
                <li>Define <strong>Key Activities</strong> you must perform</li>
                <li>Establish <strong>Key Partners</strong> who will help you</li>
                <li>Calculate <strong>Cost Structure</strong> based on your activities and resources</li>
              </ol>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
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