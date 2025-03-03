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
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Beaker, 
  Calendar, 
  Clock, 
  Edit, 
  Info, 
  Lightbulb,
  List, 
  PlusCircle, 
  Target, 
  Trash2, 
  TrendingUp
} from 'lucide-react';
import { Experiment } from '@/types';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

interface ExperimentsListProps {
  experiments: Experiment[];
  onUpdate: (experiment: Experiment) => void;
  onDelete: (id: string) => void;
}

interface ExperimentFormValues {
  title: string;
  description: string;
  hypothesis: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  results: string;
  learnings: string;
}

interface MetricInput {
  id: string;
  key: string;
  target: string;
  actual: string;
}

export const ExperimentsList: React.FC<ExperimentsListProps> = ({ 
  experiments, 
  onUpdate,
  onDelete
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [metrics, setMetrics] = useState<MetricInput[]>([]);
  
  const form = useForm<ExperimentFormValues>({
    defaultValues: {
      title: '',
      description: '',
      hypothesis: '',
      status: 'planned',
      startDate: '',
      endDate: '',
      results: '',
      learnings: ''
    }
  });
  
  const handleEdit = (experiment: Experiment) => {
    setEditingExperiment(experiment);
    
    form.reset({
      title: experiment.title || '',
      description: experiment.description || '',
      hypothesis: experiment.hypothesis || '',
      status: experiment.status || 'planned',
      startDate: experiment.startDate || '',
      endDate: experiment.endDate || '',
      results: experiment.results || '',
      learnings: experiment.learnings || ''
    });
    
    // Set metrics
    setMetrics(
      experiment.metrics?.map(metric => ({
        id: uuidv4(),
        key: metric.key || '',
        target: metric.target || '',
        actual: metric.actual || ''
      })) || []
    );
    
    setIsDialogOpen(true);
  };
  
  const handleSave = (values: ExperimentFormValues) => {
    if (!editingExperiment) return;
    
    const updatedExperiment: Experiment = {
      ...editingExperiment,
      ...values,
      metrics: metrics.map(m => ({
        key: m.key,
        target: m.target,
        actual: m.actual
      }))
    };
    
    onUpdate(updatedExperiment);
    setIsDialogOpen(false);
    setEditingExperiment(null);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      onDelete(id);
    }
  };

  const addMetric = () => {
    setMetrics([
      ...metrics,
      { id: uuidv4(), key: '', target: '', actual: '' }
    ]);
  };

  const removeMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id));
  };

  const updateMetric = (id: string, field: 'key' | 'target' | 'actual', value: string) => {
    setMetrics(metrics.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };
  
  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {experiments.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
            <Beaker className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Experiments Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mb-4">
              Design experiments to test your business assumptions and reduce risk
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Experiment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.map(experiment => (
              <TableRow key={experiment.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{experiment.title || "Unnamed Experiment"}</span>
                    {experiment.hypothesis && (
                      <span className="text-sm text-gray-500 mt-1 flex items-center">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {experiment.hypothesis.length > 70 
                          ? `${experiment.hypothesis.substring(0, 70)}...` 
                          : experiment.hypothesis}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(experiment.status)}>
                    {experiment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    {experiment.startDate && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                        {formatDate(experiment.startDate)}
                      </span>
                    )}
                    {experiment.endDate && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-500" />
                        {formatDate(experiment.endDate)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(experiment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(experiment.id)}
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
              {editingExperiment?.title || 'New Experiment'}
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
                        <Input placeholder="Experiment title" {...field} />
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
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="hypothesis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hypothesis</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="We believe that..." 
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What is this experiment about?" 
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <FormLabel>Metrics</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addMetric}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-3 w-3" /> Add Metric
                  </Button>
                </div>
                
                {metrics.length === 0 ? (
                  <div className="text-sm text-gray-500 border rounded-md p-3 text-center bg-gray-50">
                    Add metrics to track the success of your experiment
                  </div>
                ) : (
                  <div className="space-y-2">
                    {metrics.map((metric, index) => (
                      <div key={metric.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Metric (e.g. Conversion rate)"
                            value={metric.key}
                            onChange={(e) => updateMetric(metric.id, 'key', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Target (e.g. 10%)"
                            value={metric.target}
                            onChange={(e) => updateMetric(metric.id, 'target', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Actual result"
                            value={metric.actual}
                            onChange={(e) => updateMetric(metric.id, 'actual', e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMetric(metric.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {(form.watch('status') === 'completed' || form.watch('status') === 'cancelled') && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="results"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Results</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What were the outcomes of this experiment?" 
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
                    name="learnings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learnings</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What did you learn from this experiment?" 
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
                <Button type="submit">Save Experiment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 