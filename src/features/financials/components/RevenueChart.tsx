import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { PlusCircle, Table as TableIcon, Pencil, Trash2, DollarSign, BarChart as BarChartIcon, LineChart as LineChartIcon, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from "../utils/dataProcessing";
import { TableHeader, TableBody, TableRow, TableCell, TableHead, Table } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'

// Constants for dropdown options
const REVENUE_TYPES = [
  { value: 'subscription', label: 'Subscription' },
  { value: 'one-time', label: 'One-time Sale' },
  { value: 'usage-based', label: 'Usage-based' },
  { value: 'recurring', label: 'Recurring Payment' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'licensing', label: 'Licensing' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'other', label: 'Other' }
];

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'one-time', label: 'One-time' },
];

const PRICING_MODELS = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'tiered', label: 'Tiered Pricing' },
  { value: 'per-user', label: 'Per User' },
  { value: 'per-feature', label: 'Per Feature' },
  { value: 'metered', label: 'Metered Usage' },
  { value: 'value-based', label: 'Value-based' },
];

// Define the type for a revenue stream from the database
type RevenueStream = {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  pricing_model?: string | null;
  unit_price?: number | null;
  volume?: number | null;
  frequency?: string | null;
  growth_rate?: number | null;
  assumptions?: string | null;
  projections?: any | null;
  project_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
}

// Define form state type
interface FormState {
  id?: string;
  name: string;
  description: string;
  type: string;
  pricing_model: string;
  unit_price: number;
  volume: number;
  frequency: string;
  growth_rate: number;
  assumptions: string;
  project_id?: string | null;
}

// Default form values
const defaultFormValues: FormState = {
  name: '',
  description: '',
  type: 'subscription',
  pricing_model: 'fixed',
  unit_price: 0,
  volume: 0,
  frequency: 'monthly',
  growth_rate: 0,
  assumptions: ''
};

interface RevenueChartProps {
  streams: RevenueStream[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onAdd?: (data: any) => Promise<void>;
  onUpdate?: (id: string, data: any) => Promise<void>;
  projectId?: string;
}

export const RevenueCharts = ({ 
  streams, 
  onEdit,
  onDelete,
  onAdd,
  onUpdate,
  projectId = ''
}: RevenueChartProps) => {
  // View state
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const { toast } = useToast();
  
  // Chart data preparation
  const chartData = streams.map(stream => ({
    id: stream.id,
    name: stream.name,
    amount: (stream.unit_price || 0) * (stream.volume || 0),
    type: stream.type || 'other',
    growthRate: stream.growth_rate || 0
  }));
  
  // Calculate total revenue
  const totalMonthlyRevenue = chartData.reduce((sum, stream) => sum + stream.amount, 0);
  
  // Group streams by type
  const streamsByType: Record<string, RevenueStream[]> = {};
  streams.forEach(stream => {
    const type = stream.type || 'other';
    if (!streamsByType[type]) {
      streamsByType[type] = [];
    }
    streamsByType[type].push(stream);
  });
  
  // Dialog and form states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    ...defaultFormValues,
    project_id: projectId
  });
  
  // Current item being edited/deleted
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  
  // Form change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({...prev, [name]: value}));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    setFormState(prev => ({...prev, [name]: isNaN(numValue) ? 0 : numValue}));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({...prev, [name]: value}));
  };
  
  // Dialog handlers
  const handleOpenAddDialog = () => {
    setFormState({
      ...defaultFormValues,
      project_id: projectId
    });
    setAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  const handleOpenEditDialog = (stream: RevenueStream) => {
    setCurrentStreamId(stream.id);
    setFormState({
      id: stream.id,
      name: stream.name || '',
      description: stream.description || '',
      type: stream.type || 'subscription',
      pricing_model: stream.pricing_model || 'fixed',
      unit_price: stream.unit_price || 0,
      volume: stream.volume || 0,
      frequency: stream.frequency || 'monthly',
      growth_rate: stream.growth_rate || 0,
      assumptions: stream.assumptions || '',
      project_id: stream.project_id || projectId
    });
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };
  
  const handleOpenDeleteDialog = (stream: RevenueStream) => {
    setCurrentStreamId(stream.id);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Submit handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAdd || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Create a copy of form data to avoid mutations
      const formData = {...formState};
      await onAdd(formData);
      
      // Reset form and close dialog
      setFormState({...defaultFormValues, project_id: projectId});
      setAddDialogOpen(false);
      
      // Show success message
      toast({
        title: "Revenue stream added",
        description: "New revenue stream has been created successfully."
      });
    } catch (error) {
      // Show error message but keep dialog open
      toast({
        title: "Error adding stream",
        description: "An error occurred while adding the revenue stream.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate || !currentStreamId || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Create a copy of form data to avoid mutations
      const formData = {...formState};
      await onUpdate(currentStreamId, formData);
      
      // Reset form and close dialog
      setCurrentStreamId(null);
      setEditDialogOpen(false);
      
      // Show success message
      toast({
        title: "Revenue stream updated",
        description: "The revenue stream has been updated successfully."
      });
    } catch (error) {
      // Show error message but keep dialog open
      toast({
        title: "Error updating stream",
        description: "An error occurred while updating the revenue stream.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentStreamId || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(currentStreamId);
      
      // Reset state and close dialog
      setCurrentStreamId(null);
      setDeleteDialogOpen(false);
      
      // Show success message
      toast({
        title: "Revenue stream deleted",
        description: "The revenue stream has been deleted successfully."
      });
    } catch (error) {
      // Show error message but keep dialog open
      toast({
        title: "Error deleting stream",
        description: "An error occurred while deleting the revenue stream.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Get current stream for display in the delete dialog
  const currentStream = currentStreamId 
    ? streams.find(stream => stream.id === currentStreamId) 
    : null;
  
  // Monthly revenue calculation
  const monthlyRevenue = formState.unit_price * formState.volume;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage your revenue streams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView(activeView === 'chart' ? 'table' : 'chart')}
          >
            {activeView === 'chart' ? (
              <><TableIcon className="h-4 w-4 mr-2" /> Table View</>
            ) : (
              <><BarChartIcon className="h-4 w-4 mr-2" /> Chart View</>
            )}
          </Button>
          
          {onAdd && (
            <Button onClick={handleOpenAddDialog}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Stream
            </Button>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Monthly Revenue
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalMonthlyRevenue)}</h3>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Revenue Streams
                </p>
                <h3 className="text-2xl font-bold">{streams.length}</h3>
              </div>
              <LineChartIcon className="h-8 w-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Growth Rate
                </p>
                <h3 className="text-2xl font-bold">
                  {streams.length > 0 
                    ? `${(streams.reduce((sum, stream) => sum + (stream.growth_rate || 0), 0) / streams.length).toFixed(1)}%`
                    : '0%'
                  }
                </h3>
              </div>
              <BarChartIcon className="h-8 w-8 text-purple-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>
    
      {/* Main Content - Chart or Table */}
      {activeView === 'chart' ? (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Stream</CardTitle>
            <CardDescription>
              Monthly revenue breakdown by stream
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      formatCurrency(value).replace("$", "")
                    }
                  />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar
                    dataKey="amount"
                    name="Monthly Revenue"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Streams</CardTitle>
            <CardDescription>
              Detailed breakdown of all revenue streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">{stream.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {stream.type || 'Other'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(stream.unit_price || 0)}</TableCell>
                    <TableCell>{stream.volume || 0}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency((stream.unit_price || 0) * (stream.volume || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onUpdate && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenEditDialog(stream)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(stream)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {streams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No revenue streams found. Add a new stream to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Revenue by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Type</CardTitle>
          <CardDescription>
            Breakdown of revenue by stream type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-4">Revenue Distribution</h4>
              <div className="space-y-4">
                {Object.entries(streamsByType).map(([type, typeStreams]) => {
                  const typeRevenue = typeStreams.reduce((sum, stream) => 
                    sum + ((stream.unit_price || 0) * (stream.volume || 0)), 0);
                  const percentage = totalMonthlyRevenue > 0 
                    ? (typeRevenue / totalMonthlyRevenue) * 100 
                    : 0;
                    
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{type}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(typeRevenue)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(streamsByType).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Summary</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Streams</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(streamsByType).map(([type, typeStreams]) => {
                    const typeRevenue = typeStreams.reduce((sum, stream) => 
                      sum + ((stream.unit_price || 0) * (stream.volume || 0)), 0);
                      
                    return (
                      <TableRow key={type}>
                        <TableCell className="font-medium">{type}</TableCell>
                        <TableCell>{typeStreams.length}</TableCell>
                        <TableCell>{formatCurrency(typeRevenue)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Revenue Stream Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Revenue Stream</DialogTitle>
            <DialogDescription>
              Define a new revenue stream for your business model.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Revenue Stream Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Subscriptions"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  placeholder="Describe this revenue stream..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Revenue Type</Label>
                  <Select
                    value={formState.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_TYPES.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formState.frequency}
                    onValueChange={(value) => handleSelectChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricing_model">Pricing Model</Label>
                  <Select
                    value={formState.pricing_model}
                    onValueChange={(value) => handleSelectChange('pricing_model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_MODELS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="growth_rate">Growth Rate (%)</Label>
                  <Input
                    id="growth_rate"
                    name="growth_rate"
                    type="number"
                    value={formState.growth_rate}
                    onChange={handleNumberChange}
                    placeholder="0.0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price ($)</Label>
                  <Input
                    id="unit_price"
                    name="unit_price"
                    type="number"
                    value={formState.unit_price}
                    onChange={handleNumberChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume (Units)</Label>
                  <Input
                    id="volume"
                    name="volume"
                    type="number"
                    value={formState.volume}
                    onChange={handleNumberChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assumptions">Assumptions</Label>
                <Textarea
                  id="assumptions"
                  name="assumptions"
                  value={formState.assumptions}
                  onChange={handleInputChange}
                  placeholder="List your assumptions for this revenue stream..."
                  rows={3}
                />
              </div>
              
              <Card className="p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Monthly Revenue:</span>
                  <span className="text-lg font-bold">
                    ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Based on {formState.volume} units at ${formState.unit_price} each
                </div>
              </Card>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseAddDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Revenue Stream
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Revenue Stream Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Revenue Stream</DialogTitle>
            <DialogDescription>
              Update the details of your revenue stream.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Revenue Stream Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Subscriptions"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  placeholder="Describe this revenue stream..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Revenue Type</Label>
                  <Select
                    value={formState.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_TYPES.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-frequency">Frequency</Label>
                  <Select
                    value={formState.frequency}
                    onValueChange={(value) => handleSelectChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-pricing_model">Pricing Model</Label>
                  <Select
                    value={formState.pricing_model}
                    onValueChange={(value) => handleSelectChange('pricing_model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_MODELS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-growth_rate">Growth Rate (%)</Label>
                  <Input
                    id="edit-growth_rate"
                    name="growth_rate"
                    type="number"
                    value={formState.growth_rate}
                    onChange={handleNumberChange}
                    placeholder="0.0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit_price">Unit Price ($)</Label>
                  <Input
                    id="edit-unit_price"
                    name="unit_price"
                    type="number"
                    value={formState.unit_price}
                    onChange={handleNumberChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-volume">Volume (Units)</Label>
                  <Input
                    id="edit-volume"
                    name="volume"
                    type="number"
                    value={formState.volume}
                    onChange={handleNumberChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-assumptions">Assumptions</Label>
                <Textarea
                  id="edit-assumptions"
                  name="assumptions"
                  value={formState.assumptions}
                  onChange={handleInputChange}
                  placeholder="List your assumptions for this revenue stream..."
                  rows={3}
                />
              </div>
              
              <Card className="p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Monthly Revenue:</span>
                  <span className="text-lg font-bold">
                    ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Based on {formState.volume} units at ${formState.unit_price} each
                </div>
              </Card>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseEditDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Revenue Stream
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the revenue stream "{currentStream?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RevenueCharts;