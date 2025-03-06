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
  DialogFooter,
  DialogTrigger
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
  Clock,
  Plus,
  Trash
} from 'lucide-react';
import { ValidationABTest } from '@/store/types';
import { useForm } from 'react-hook-form';

interface ABTestsListProps {
  tests: ValidationABTest[];
  onUpdate: (params: { id: string; data: Partial<Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete: (id: string) => void;
}

interface ABTestFormValues {
  title: string;
  description: string;
  variant_a: string;
  variant_b: string;
  metric: string;
  status: 'planned' | 'running' | 'completed';
  start_date: string;
  end_date: string;
  sample_size: number;
  conversion_a: number;
  conversion_b: number;
  confidence: number;
  winner: string | null;
  notes: string;
}

export function ABTestsList({ tests, onUpdate, onDelete }: ABTestsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ValidationABTest | null>(null);
  
  const form = useForm<ABTestFormValues>({
    defaultValues: {
      title: '',
      description: '',
      variant_a: '',
      variant_b: '',
      metric: '',
      status: 'planned',
      start_date: '',
      end_date: '',
      sample_size: 0,
      conversion_a: 0,
      conversion_b: 0,
      confidence: 0,
      winner: null,
      notes: ''
    }
  });
  
  const handleEdit = (test: ValidationABTest) => {
    setEditingTest(test);
    
    form.reset({
      title: test.title || '',
      description: test.description || '',
      variant_a: test.variant_a || '',
      variant_b: test.variant_b || '',
      metric: test.metric || '',
      status: (test.status as 'planned' | 'running' | 'completed') || 'planned',
      start_date: test.start_date || '',
      end_date: test.end_date || '',
      sample_size: test.sample_size || 0,
      conversion_a: test.conversion_a || 0,
      conversion_b: test.conversion_b || 0,
      confidence: test.confidence || 0,
      winner: test.winner as string | null,
      notes: test.notes || ''
    });
    
    setIsDialogOpen(true);
  };
  
  const handleSave = (values: ABTestFormValues) => {
    if (!editingTest) return;
    
    onUpdate({
      id: editingTest.id,
      data: {
        ...values,
        winner: values.winner || undefined
      }
    });

    setIsDialogOpen(false);
    setEditingTest(null);
    form.reset();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this A/B test?')) {
      onDelete(id);
    }
  };
  
  const getStatusColor = (status: ValidationABTest['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getWinnerColor = (winner: ValidationABTest['winner']) => {
    switch (winner) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'inconclusive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getImprovement = (test: ValidationABTest) => {
    if (
      !test.conversion_a ||
      !test.conversion_b ||
      test.conversion_a === 0
    ) {
      return null;
    }
    
    const improvement = ((test.conversion_b - test.conversion_a) / test.conversion_a) * 100;
    return improvement.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Button onClick={() => handleEdit({
          id: '',
          title: '',
          description: '',
          variant_a: '',
          variant_b: '',
          metric: '',
          status: 'planned',
          start_date: '',
          end_date: '',
          sample_size: 0,
          conversion_a: 0,
          conversion_b: 0,
          confidence: 0,
          winner: null,
          notes: '',
          project_id: '',
          created_at: null,
          updated_at: null,
          created_by: null
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Add A/B Test
        </Button>
      </div>

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
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Metrics</TableHead>
              <TableHead>Results</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{test.title}</div>
                    <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(test.start_date ?? undefined) || "Not scheduled"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="text-sm">{test.metric || "-"}</span>
                    <div className="text-xs text-gray-500 mt-1 flex items-start gap-2">
                      <span className="flex-1">A: {test.variant_a || "Variant A"}</span>
                      <span className="flex-1">B: {test.variant_b || "Variant B"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {test.status === 'completed' ? (
                    <div>
                      <Badge className={getWinnerColor(test.winner)}>
                        {test.winner === 'A' ? 'Variant A Wins' :
                         test.winner === 'B' ? 'Variant B Wins' :
                         test.winner === 'inconclusive' ? 'Inconclusive' : 'No Result'}
                      </Badge>
                      {test.confidence && test.confidence > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {test.confidence}% confidence
                        </div>
                      )}
                      {getImprovement(test) && (
                        <div className="text-xs text-gray-500">
                          {getImprovement(test)}% improvement
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(test)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(test.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTest?.id ? 'Edit A/B Test' : 'Add A/B Test'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input {...form.register('title')} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea {...form.register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Variant A</label>
                  <Input {...form.register('variant_a')} />
                </div>
                <div>
                  <label className="text-sm font-medium">Variant B</label>
                  <Input {...form.register('variant_b')} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Metric</label>
                <Input {...form.register('metric')} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value as ABTestFormValues['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" {...form.register('start_date')} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input type="date" {...form.register('end_date')} />
                </div>
              </div>
              {form.watch('status') === 'completed' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Sample Size</label>
                    <Input
                      type="number"
                      {...form.register('sample_size', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Conversion A (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register('conversion_a', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Conversion B (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register('conversion_b', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Confidence (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register('confidence', { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Winner</label>
                    <Select
                      value={form.watch('winner') || ''}
                      onValueChange={(value: string) => form.setValue('winner', value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Result</SelectItem>
                        <SelectItem value="A">Variant A</SelectItem>
                        <SelectItem value="B">Variant B</SelectItem>
                        <SelectItem value="inconclusive">Inconclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea {...form.register('notes')} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 