import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  Calendar, 
  LineChart,
  ArrowUpDown,
  Award,
  Percent,
  Scale,
  UserCheck,
  Clock
} from 'lucide-react';
import { ABTest } from '@/types';
import { useForm } from 'react-hook-form';

interface ABTestsListProps {
  tests: ABTest[];
  onUpdate: (test: ABTest) => void;
  onDelete: (id: string) => void;
}

interface ABTestFormValues {
  title: string;
  description: string;
  variantA: string;
  variantB: string;
  metric: string;
  status: 'planned' | 'running' | 'completed';
  startDate: string;
  endDate: string;
  sampleSize: string;
  conversionA: string;
  conversionB: string;
  confidence: string;
  winner: 'A' | 'B' | 'inconclusive' | '';
  notes: string;
}

export const ABTestsList: React.FC<ABTestsListProps> = ({ 
  tests, 
  onUpdate,
  onDelete
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  
  const form = useForm<ABTestFormValues>({
    defaultValues: {
      title: '',
      description: '',
      variantA: '',
      variantB: '',
      metric: '',
      status: 'planned',
      startDate: '',
      endDate: '',
      sampleSize: '',
      conversionA: '',
      conversionB: '',
      confidence: '',
      winner: '',
      notes: ''
    }
  });
  
  const handleEdit = (test: ABTest) => {
    setEditingTest(test);
    
    form.reset({
      title: test.title || '',
      description: test.description || '',
      variantA: test.variantA || '',
      variantB: test.variantB || '',
      metric: test.metric || '',
      status: test.status || 'planned',
      startDate: test.startDate || '',
      endDate: test.endDate || '',
      sampleSize: test.sampleSize?.toString() || '',
      conversionA: test.conversionA?.toString() || '',
      conversionB: test.conversionB?.toString() || '',
      confidence: test.confidence?.toString() || '',
      winner: test.winner || '',
      notes: test.notes || ''
    });
    
    setIsDialogOpen(true);
  };
  
  const handleSave = (values: ABTestFormValues) => {
    if (!editingTest) return;
    
    const updatedTest: ABTest = {
      ...editingTest,
      ...values,
      sampleSize: values.sampleSize ? parseInt(values.sampleSize, 10) : undefined,
      conversionA: values.conversionA ? parseFloat(values.conversionA) : undefined,
      conversionB: values.conversionB ? parseFloat(values.conversionB) : undefined,
      confidence: values.confidence ? parseFloat(values.confidence) : undefined,
      winner: values.winner === '' ? undefined : values.winner as 'A' | 'B' | 'inconclusive' | undefined
    };
    
    onUpdate(updatedTest);
    setIsDialogOpen(false);
    setEditingTest(null);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this A/B test?')) {
      onDelete(id);
    }
  };
  
  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'running':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getWinnerColor = (winner?: ABTest['winner']) => {
    if (!winner) return '';
    
    switch (winner) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'inconclusive':
        return 'text-gray-600';
      default:
        return '';
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getImprovement = (test: ABTest) => {
    if (
      test.conversionA === undefined || 
      test.conversionB === undefined || 
      test.conversionA === 0
    ) {
      return null;
    }
    
    const improvement = ((test.conversionB - test.conversionA) / test.conversionA) * 100;
    return improvement.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {tests.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
            <LineChart className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No A/B Tests Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mb-4">
              Compare alternative solutions with real users to optimize your product
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Results</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map(test => (
              <TableRow key={test.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{test.title || "Unnamed Test"}</span>
                    <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(test.startDate) || "Not scheduled"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{test.metric || "-"}</span>
                    <div className="text-xs text-gray-500 mt-1 flex items-start gap-2">
                      <span className="flex-1">A: {test.variantA || "Variant A"}</span>
                      <span className="flex-1">B: {test.variantB || "Variant B"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {test.status === 'completed' ? (
                      <>
                        {test.winner && (
                          <span className={`text-sm font-medium flex items-center gap-1 ${getWinnerColor(test.winner)}`}>
                            <Award className="h-3 w-3" />
                            Winner: {test.winner === 'inconclusive' ? 'Inconclusive' : `Variant ${test.winner}`}
                          </span>
                        )}
                        {test.conversionA !== undefined && test.conversionB !== undefined && (
                          <div className="flex gap-2 text-xs text-gray-600">
                            <span>A: {test.conversionA}%</span>
                            <span>B: {test.conversionB}%</span>
                            {getImprovement(test) && (
                              <span className={parseFloat(getImprovement(test) || '0') > 0 ? 'text-green-600' : 'text-red-600'}>
                                ({parseFloat(getImprovement(test) || '0') > 0 ? '+' : ''}{getImprovement(test)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {test.sampleSize ? `${test.sampleSize} participants` : "No data yet"}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(test)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTest?.title || 'New A/B Test'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Test title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What are you testing?" 
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-gray-50 rounded-md border space-y-4">
                <div className="flex items-center">
                  <Scale className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Test Setup</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="variantA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant A (Control)</FormLabel>
                        <FormControl>
                          <Input placeholder="Original version" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="variantB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant B (Test)</FormLabel>
                        <FormControl>
                          <Input placeholder="New version" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="metric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Success Metric</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Conversion rate, Click-through rate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="sampleSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4 text-gray-500" />
                      Sample Size
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Number of participants" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('status') === 'completed' && (
                <div className="p-4 bg-gray-50 rounded-md border space-y-4">
                  <div className="flex items-center">
                    <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">Test Results</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="conversionA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variant A Result (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="e.g. 5.2" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="conversionB"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variant B Result (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="e.g. 6.8" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="confidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Percent className="h-4 w-4 text-gray-500" /> 
                            Confidence (%)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="e.g. 95" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="winner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-gray-500" /> 
                            Winner
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select winner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">Variant A</SelectItem>
                              <SelectItem value="B">Variant B</SelectItem>
                              <SelectItem value="inconclusive">Inconclusive</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <FormLabel>Notes & Learnings</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What did you learn from this test?" 
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button type="submit">Save A/B Test</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 