import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleSlash, Filter, Info, HelpCircle, Plus, Search, Settings, X, XCircle, MinusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Re-using the Competitor interface from the positioning matrix
export interface Competitor {
  id: string;
  name: string;
  website?: string | null;
  market_share?: string | null;
  customer_sentiment?: number | null;
  positioning?: string | null;
  // Include all the fields from our enhanced schema
  [key: string]: any;
}

// Feature interface
export interface Feature {
  id: string;
  name: string;
  description?: string;
  category?: string;
  importance?: 'critical' | 'high' | 'medium' | 'low';
}

// Feature status interface
interface FeatureStatus {
  competitorId: string;
  featureId: string;
  status: 'yes' | 'partial' | 'no' | 'planned' | 'unknown';
  notes?: string;
}

// Props for the component
interface FeatureComparisonTableProps {
  competitors: Competitor[];
  features: Feature[];
  featureStatuses: FeatureStatus[];
  onAddFeature?: (feature: Omit<Feature, 'id'>) => Promise<void>;
  onUpdateFeatureStatus?: (status: FeatureStatus) => Promise<void>;
  onDeleteFeature?: (featureId: string) => Promise<void>;
  yourCompanyId?: string;
  className?: string;
  readOnly?: boolean;
}

// Status component
const StatusIndicator = ({ 
  status, 
  compact = false,
  notes
}: { 
  status: FeatureStatus['status']; 
  compact?: boolean;
  notes?: string;
}) => {
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              {status === 'yes' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {status === 'partial' && <div className="h-5 w-5 rounded-full border-2 border-amber-400 bg-amber-100" />}
              {status === 'planned' && <div className="h-5 w-5 rounded-full border-2 border-blue-400 bg-blue-100" />}
              {status === 'no' && <XCircle className="h-5 w-5 text-red-500" />}
              {status === 'unknown' && <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-gray-100" />}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">
                {status === 'yes' && 'Feature available'}
                {status === 'partial' && 'Partially implemented'}
                {status === 'planned' && 'Planned for future release'}
                {status === 'no' && 'Feature not available'}
                {status === 'unknown' && 'Status unknown'}
              </p>
              {notes && <p className="text-xs text-muted-foreground">{notes}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center">
      {status === 'yes' && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Available
        </Badge>
      )}
      {status === 'partial' && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <div className="h-2 w-2 rounded-full bg-amber-500 mr-1" />
          Partial
        </Badge>
      )}
      {status === 'planned' && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <div className="h-2 w-2 rounded-full bg-blue-500 mr-1" />
          Planned
        </Badge>
      )}
      {status === 'no' && (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <MinusCircle className="h-3.5 w-3.5 mr-1" />
          No
        </Badge>
      )}
      {status === 'unknown' && (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <div className="h-2 w-2 rounded-full bg-gray-400 mr-1" />
          Unknown
        </Badge>
      )}
    </div>
  );
};

// Feature status selector
const FeatureStatusSelector = ({
  value,
  onChange,
  onNotesChange,
  notes
}: {
  value: FeatureStatus['status'];
  onChange: (value: FeatureStatus['status']) => void;
  onNotesChange?: (notes: string) => void;
  notes?: string;
}) => {
  return (
    <div className="space-y-2">
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as FeatureStatus['status'])}
        className="flex flex-col space-y-1.5"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="yes" />
          <Label htmlFor="yes" className="flex items-center cursor-pointer">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
            <span>Available</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="partial" id="partial" />
          <Label htmlFor="partial" className="flex items-center cursor-pointer">
            <div className="h-4 w-4 rounded-full border-2 border-amber-400 bg-amber-100 mr-1.5" />
            <span>Partial</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="planned" id="planned" />
          <Label htmlFor="planned" className="flex items-center cursor-pointer">
            <div className="h-4 w-4 rounded-full border-2 border-blue-400 bg-blue-100 mr-1.5" />
            <span>Planned</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="no" />
          <Label htmlFor="no" className="flex items-center cursor-pointer">
            <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
            <span>Not available</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="unknown" id="unknown" />
          <Label htmlFor="unknown" className="flex items-center cursor-pointer">
            <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-gray-100 mr-1.5" />
            <span>Unknown</span>
          </Label>
        </div>
      </RadioGroup>
      
      {onNotesChange && (
        <div className="space-y-1">
          <Label htmlFor="notes" className="text-xs font-medium">Notes (optional)</Label>
          <Input 
            id="notes" 
            value={notes || ''} 
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add additional details..."
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};

// Category badge
const CategoryBadge = ({ category }: { category?: string }) => {
  if (!category) return null;
  
  const colorMap: Record<string, string> = {
    'Core': 'bg-blue-50 text-blue-700 border-blue-200',
    'UI/UX': 'bg-purple-50 text-purple-700 border-purple-200',
    'Security': 'bg-red-50 text-red-700 border-red-200',
    'Integration': 'bg-green-50 text-green-700 border-green-200',
    'Analytics': 'bg-amber-50 text-amber-700 border-amber-200',
    'Advanced': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  
  const color = colorMap[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  
  return (
    <Badge variant="outline" className={cn("text-xs py-0 px-1.5", color)}>
      {category}
    </Badge>
  );
};

// Importance indicator
const ImportanceIndicator = ({ importance }: { importance?: string }) => {
  if (!importance) return null;
  
  const dotMap: Record<string, React.ReactNode> = {
    'critical': (
      <div className="flex">
        <div className="h-2 w-2 rounded-full bg-red-500 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-red-500 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-red-500 mx-0.5"></div>
      </div>
    ),
    'high': (
      <div className="flex">
        <div className="h-2 w-2 rounded-full bg-amber-500 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-amber-500 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-gray-300 mx-0.5"></div>
      </div>
    ),
    'medium': (
      <div className="flex">
        <div className="h-2 w-2 rounded-full bg-blue-500 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-gray-300 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-gray-300 mx-0.5"></div>
      </div>
    ),
    'low': (
      <div className="flex">
        <div className="h-2 w-2 rounded-full bg-gray-400 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-gray-300 mx-0.5"></div>
        <div className="h-2 w-2 rounded-full bg-gray-300 mx-0.5"></div>
      </div>
    )
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex">
          {dotMap[importance]}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium capitalize">{importance} importance</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// New feature dialog
const NewFeatureDialog = ({
  onAdd,
  open,
  onOpenChange
}: {
  onAdd: (feature: Omit<Feature, 'id'>) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [importance, setImportance] = useState<Feature['importance']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Feature name required",
        description: "Please enter a name for the feature",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onAdd({
        name,
        description: description || undefined,
        category: category || undefined,
        importance
      });
      
      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setImportance('medium');
      
      // Close dialog
      onOpenChange(false);
      
      toast({
        title: "Feature added",
        description: "The feature has been added to the comparison table"
      });
    } catch (error) {
      toast({
        title: "Error adding feature",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
          <DialogDescription>
            Add a new feature to compare across competitors
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="feature-name">Feature Name</Label>
            <Input
              id="feature-name"
              placeholder="Enter feature name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feature-description">Description (optional)</Label>
            <Input
              id="feature-description"
              placeholder="Brief description of the feature"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feature-category">Category (optional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="feature-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feature-importance">Importance</Label>
              <Select value={importance || 'medium'} onValueChange={(value) => setImportance(value as Feature['importance'])}>
                <SelectTrigger id="feature-importance">
                  <SelectValue placeholder="Select importance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Feature'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Status update dialog
const StatusUpdateDialog = ({
  open,
  onOpenChange,
  currentStatus,
  featureId,
  competitorId,
  featureName,
  competitorName,
  onUpdate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: FeatureStatus;
  featureId: string;
  competitorId: string;
  featureName: string;
  competitorName: string;
  onUpdate: (status: FeatureStatus) => Promise<void>;
}) => {
  const [status, setStatus] = useState<FeatureStatus['status']>(currentStatus?.status || 'unknown');
  const [notes, setNotes] = useState(currentStatus?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await onUpdate({
        competitorId,
        featureId,
        status,
        notes: notes || undefined
      });
      
      // Close dialog
      onOpenChange(false);
      
      toast({
        title: "Status updated",
        description: "The feature status has been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Feature Status</DialogTitle>
          <DialogDescription>
            Update the status of "{featureName}" for {competitorName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <FeatureStatusSelector
            value={status}
            onChange={setStatus}
            onNotesChange={setNotes}
            notes={notes}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
export function FeatureComparisonTable({
  competitors,
  features,
  featureStatuses,
  onAddFeature,
  onUpdateFeatureStatus,
  onDeleteFeature,
  yourCompanyId,
  className,
  readOnly = false
}: FeatureComparisonTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImportance, setSelectedImportance] = useState<Feature['importance'] | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    featureId: string;
    competitorId: string;
    currentStatus: FeatureStatus;
    featureName: string;
    competitorName: string;
  } | null>(null);
  const [newFeatureDialogOpen, setNewFeatureDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Get all unique categories
  const categories = Array.from(new Set(features.map(f => f.category).filter(Boolean))) as string[];
  
  // Filter features based on search and filters
  const filteredFeatures = features.filter(feature => {
    // Search filter
    if (searchQuery && !feature.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && feature.category !== selectedCategory) {
      return false;
    }
    
    // Importance filter
    if (selectedImportance && feature.importance !== selectedImportance) {
      return false;
    }
    
    return true;
  });
  
  // Get feature status for a specific competitor
  const getFeatureStatus = (featureId: string, competitorId: string): FeatureStatus | null => {
    return featureStatuses.find(
      status => status.featureId === featureId && status.competitorId === competitorId
    ) || null;
  };
  
  // Handle status cell click
  const handleStatusCellClick = (featureId: string, competitorId: string) => {
    if (readOnly) return;
    
    const status = getFeatureStatus(featureId, competitorId);
    const feature = features.find(f => f.id === featureId);
    const competitor = competitors.find(c => c.id === competitorId);
    
    if (!feature || !competitor) return;
    
    setSelectedStatus({
      featureId,
      competitorId,
      currentStatus: status || {
        featureId,
        competitorId,
        status: 'unknown'
      },
      featureName: feature.name,
      competitorName: competitor.name
    });
    
    setStatusDialogOpen(true);
  };
  
  // Handle feature delete
  const handleDeleteFeature = async (featureId: string) => {
    if (!onDeleteFeature) return;
    
    try {
      await onDeleteFeature(featureId);
      toast({
        title: "Feature deleted",
        description: "The feature has been removed from the comparison table"
      });
    } catch (error) {
      toast({
        title: "Error deleting feature",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedImportance(null);
  };
  
  const hasActiveFilters = searchQuery || selectedCategory || selectedImportance;
  
  // Helper to get display value for Select triggers
  const getCategoryDisplayValue = () => selectedCategory || 'Category';
  const getImportanceDisplayValue = () => {
    if (!selectedImportance) return 'Importance';
    return `${selectedImportance.charAt(0).toUpperCase()}${selectedImportance.slice(1)}`;
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg font-medium">Feature Comparison</CardTitle>
          <CardDescription>
            Compare features across competitors
          </CardDescription>
        </div>
        
        <div className="flex items-center space-x-2">
          {!readOnly && onAddFeature && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewFeatureDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </Button>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">Feature Comparison</p>
                <p className="text-xs text-muted-foreground">
                  This table compares features across competitors. 
                  {!readOnly && " Click on any cell to update the feature status for a competitor."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={selectedCategory ? selectedCategory : "all"} 
                onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    {getCategoryDisplayValue()}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedImportance ? selectedImportance : "all"} 
                onValueChange={(value) => setSelectedImportance(value === "all" ? null : value as Feature['importance'])}
              >
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    {getImportanceDisplayValue()}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Importance</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[550px]">
          <div className="relative">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-[250px]">Feature</TableHead>
                  <TableHead className="w-[120px] text-center bg-primary/5">
                    {competitors.find(c => c.id === yourCompanyId)?.name || 'Your Product'}
                  </TableHead>
                  {competitors
                    .filter(comp => comp.id !== yourCompanyId)
                    .map(competitor => (
                      <TableHead key={competitor.id} className="w-[100px] text-center">
                        {competitor.name}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={competitors.length + 1} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Info className="h-10 w-10 mb-2 opacity-20" />
                        <p>No features to display</p>
                        {hasActiveFilters && (
                          <p className="text-sm mt-1">Try adjusting your search or filters</p>
                        )}
                        {!readOnly && onAddFeature && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => setNewFeatureDialogOpen(true)}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Feature
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeatures.map(feature => (
                    <TableRow key={feature.id}>
                      <TableCell className="font-medium">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span>{feature.name}</span>
                              <ImportanceIndicator importance={feature.importance} />
                            </div>
                            {feature.category && (
                              <CategoryBadge category={feature.category} />
                            )}
                            {feature.description && (
                              <p className="text-xs text-muted-foreground">{feature.description}</p>
                            )}
                          </div>
                          
                          {!readOnly && onDeleteFeature && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-30 hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                                    onClick={() => handleDeleteFeature(feature.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Delete feature</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Your product column */}
                      <TableCell 
                        className={cn(
                          "text-center bg-primary/5",
                          !readOnly && onUpdateFeatureStatus && "cursor-pointer hover:bg-primary/10"
                        )}
                        onClick={() => {
                          if (yourCompanyId) {
                            handleStatusCellClick(feature.id, yourCompanyId);
                          }
                        }}
                      >
                        <StatusIndicator 
                          status={getFeatureStatus(feature.id, yourCompanyId || '')?.status || 'unknown'}
                          notes={getFeatureStatus(feature.id, yourCompanyId || '')?.notes}
                        />
                      </TableCell>
                      
                      {/* Competitor columns */}
                      {competitors
                        .filter(comp => comp.id !== yourCompanyId)
                        .map(competitor => (
                          <TableCell 
                            key={competitor.id} 
                            className={cn(
                              "text-center p-0",
                              !readOnly && onUpdateFeatureStatus && "cursor-pointer hover:bg-gray-50"
                            )}
                            onClick={() => handleStatusCellClick(feature.id, competitor.id)}
                          >
                            <div className="p-3">
                              <StatusIndicator 
                                status={getFeatureStatus(feature.id, competitor.id)?.status || 'unknown'} 
                                compact
                                notes={getFeatureStatus(feature.id, competitor.id)?.notes}
                              />
                            </div>
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full border-2 border-amber-400 bg-amber-100" />
              <span className="text-sm">Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full border-2 border-blue-400 bg-blue-100" />
              <span className="text-sm">Planned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Not available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-gray-100" />
              <span className="text-sm">Unknown</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* New feature dialog */}
      {onAddFeature && (
        <NewFeatureDialog 
          open={newFeatureDialogOpen}
          onOpenChange={setNewFeatureDialogOpen}
          onAdd={onAddFeature}
        />
      )}
      
      {/* Status update dialog */}
      {onUpdateFeatureStatus && selectedStatus && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          currentStatus={selectedStatus.currentStatus}
          featureId={selectedStatus.featureId}
          competitorId={selectedStatus.competitorId}
          featureName={selectedStatus.featureName}
          competitorName={selectedStatus.competitorName}
          onUpdate={onUpdateFeatureStatus}
        />
      )}
    </Card>
  );
} 