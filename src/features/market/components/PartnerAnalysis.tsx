import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, ExternalLink, Handshake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ExtendedMarketPartner, PartnerFormValues } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatRelativeDate } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

// Partner form schema
const partnerFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  type: z.enum(['supplier', 'distributor', 'technology', 'marketing', 'financial', 'other'], {
    required_error: 'Please select a partner type',
  }),
  description: z.string().min(1, { message: 'Description is required' }),
  potential_value: z.number().min(1).max(5),
  potential_challenges: z.array(z.string()).default([]),
  contact_info: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  notes: z.string().optional(),
});

interface PartnerAnalysisProps {
  partners: ExtendedMarketPartner[];
  onAddPartner?: (partner: PartnerFormValues) => Promise<void>;
  onUpdatePartner?: (id: string, data: Partial<PartnerFormValues>) => Promise<void>;
  onDeletePartner?: (id: string) => Promise<void>;
  readOnly?: boolean;
}

const partnerTypeLabels: Record<string, string> = {
  supplier: 'Supplier',
  distributor: 'Distributor',
  technology: 'Technology',
  marketing: 'Marketing',
  financial: 'Financial',
  other: 'Other',
};

const partnerTypeColors: Record<string, string> = {
  supplier: 'bg-blue-100 text-blue-800',
  distributor: 'bg-green-100 text-green-800',
  technology: 'bg-purple-100 text-purple-800',
  marketing: 'bg-orange-100 text-orange-800', 
  financial: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800',
};

export function PartnerAnalysis({ partners, onAddPartner, onUpdatePartner, onDeletePartner, readOnly = false }: PartnerAnalysisProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  
  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
  
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: '',
      type: 'supplier',
      description: '',
      potential_value: 3,
      potential_challenges: [],
      contact_info: '',
      website: '',
      notes: '',
    },
  });
  
  // Handle starting to edit a partner
  const handleEditClick = (id: string) => {
    const partner = partners.find(p => p.id === id);
    if (!partner) return;
    
    form.reset({
      name: partner.name,
      type: partner.type,
      description: partner.description,
      potential_value: partner.potential_value,
      potential_challenges: partner.potential_challenges || [],
      contact_info: partner.contact_info || '',
      website: partner.website || '',
      notes: partner.notes || '',
    });
    
    setSelectedPartnerId(id);
    setIsEditDialogOpen(true);
  };
  
  // Handle deleting a partner
  const handleDeleteClick = async (id: string) => {
    if (onDeletePartner) {
      await onDeletePartner(id);
    }
  };
  
  // Handle form submission for new partner
  const onSubmitNew = async (data: PartnerFormValues) => {
    if (onAddPartner) {
      await onAddPartner(data);
      form.reset();
      setIsAddDialogOpen(false);
    }
  };
  
  // Handle form submission for editing partner
  const onSubmitEdit = async (data: PartnerFormValues) => {
    if (onUpdatePartner && selectedPartnerId) {
      await onUpdatePartner(selectedPartnerId, data);
      form.reset();
      setIsEditDialogOpen(false);
      setSelectedPartnerId(null);
    }
  };
  
  // Group partners by type for better visualization
  const partnersByType = partners.reduce<Record<string, ExtendedMarketPartner[]>>((acc, partner) => {
    if (!acc[partner.type]) {
      acc[partner.type] = [];
    }
    acc[partner.type].push(partner);
    return acc;
  }, {});
  
  // Reset form when opening the add dialog
  const handleOpenAddDialog = () => {
    form.reset();
    setIsAddDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Partner overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Partner Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Partners:</span>
                <span className="font-medium">{partners.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(partnerTypeLabels).map(([key, label]) => (
                  <div key={key} className="text-sm flex items-center justify-between">
                    <span className="text-muted-foreground">{label}:</span>
                    <Badge variant="outline" className={partnerTypeColors[key]}>
                      {partnersByType[key]?.length || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {!readOnly && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleOpenAddDialog}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Partner
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Partner Ecosystem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[200px] p-4 bg-muted/20 rounded-md">
              {/* Center circle representing your business */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-sm font-medium text-center">
                Your Business
              </div>
              
              {/* Lines and circles for partners */}
              {partners.map((partner, index) => {
                // Calculate position in a circle around the center
                const angle = (index * (360 / partners.length)) * (Math.PI / 180);
                const radius = 80; // pixels
                const x = Math.cos(angle) * radius + 50; // percentage
                const y = Math.sin(angle) * radius + 50; // percentage
                
                return (
                  <React.Fragment key={partner.id}>
                    {/* Line from center to partner */}
                    <svg 
                      className="absolute inset-0 w-full h-full"
                      style={{ zIndex: 0 }}
                    >
                      <line 
                        x1="50%" 
                        y1="50%" 
                        x2={`${x}%`} 
                        y2={`${y}%`} 
                        stroke="#CBD5E1" 
                        strokeWidth="1"
                      />
                    </svg>
                    
                    {/* Partner circle */}
                    <div 
                      className={`absolute w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center cursor-pointer text-xs font-medium text-center
                        ${partner.status === 'new' ? 'border-green-500' : 
                          partner.status === 'modified' ? 'border-yellow-500' : 
                          partner.status === 'removed' ? 'border-red-500' : 'border-gray-300'}`}
                      style={{ 
                        left: `${x}%`, 
                        top: `${y}%`, 
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => handleEditClick(partner.id)}
                    >
                      <div className={partnerTypeColors[partner.type]}>
                        {partner.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Partner table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Partner Details</CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No partners added yet. Add your first partner to start building your ecosystem!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Website</TableHead>
                  {!readOnly && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map(partner => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Handshake className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {partner.description.length > 70 
                              ? `${partner.description.substring(0, 70)}...` 
                              : partner.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={partnerTypeColors[partner.type]}>
                        {partnerTypeLabels[partner.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < partner.potential_value ? 'bg-green-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.website ? (
                        <a 
                          href={partner.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                        >
                          Visit <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : null}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(partner.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(partner.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Partner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Partner</DialogTitle>
            <DialogDescription>
              Add a new partner to your business ecosystem.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNew)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter partner name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Type</FormLabel>
                    <Select 
                      defaultValue={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(partnerTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe this partner and their role in your ecosystem" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="potential_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potential Value (1-5)</FormLabel>
                    <FormControl>
                      <div className="pt-2">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="flex justify-between text-xs pt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input placeholder="Email or phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Partner</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Partner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter partner name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Type</FormLabel>
                    <Select 
                      defaultValue={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(partnerTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe this partner and their role in your ecosystem" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="potential_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potential Value (1-5)</FormLabel>
                    <FormControl>
                      <div className="pt-2">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="flex justify-between text-xs pt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input placeholder="Email or phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Update Partner</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 