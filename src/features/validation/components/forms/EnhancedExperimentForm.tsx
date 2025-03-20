import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Plus, 
  Lightbulb,
  BarChart, 
  HelpCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { ValidationForm } from '../common/ValidationForm';
import { ValidationExperiment as Experiment, ValidationExperiment, Insert, Update } from '@/store/types';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ExperimentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (experiment: Insert<"validation_experiments"> | Update<"validation_experiments">) => void;
  initialData?: ValidationExperiment;
}

interface ExperimentFormValues {
  title: string;
  description: string;
  hypothesis: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  results: string;
  learnings: string;
}

export interface MetricItem {
  id: string;
  name: string;
  target: string;
  actual?: string;
}

export const EnhancedExperimentForm: React.FC<ExperimentFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;
  const titleRef = useRef<HTMLInputElement>(null);
  
  // Parse metrics from JSON if needed
  const [metrics, setMetrics] = useState<MetricItem[]>(
    initialData?.metrics 
      ? Array.isArray(initialData.metrics) 
        ? initialData.metrics 
        : JSON.parse(initialData.metrics as string)
      : []
  );
  
  const [metricName, setMetricName] = useState('');
  const [metricTarget, setMetricTarget] = useState('');
  const [metricActual, setMetricActual] = useState('');

  const form = useForm<ExperimentFormValues>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      hypothesis: initialData?.hypothesis || '',
      status: (initialData?.status || 'planned') as 'planned' | 'in-progress' | 'completed' | 'cancelled',
      start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
      end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
      results: initialData?.results || '',
      learnings: initialData?.learnings || ''
    }
  });

  // Focus on title input when modal opens
  useEffect(() => {
    if (open && titleRef.current && !isEditing) {
      setTimeout(() => {
        titleRef.current?.focus();
      }, 100);
    }
  }, [open, isEditing]);

  const { watch } = form;
  const status = watch('status');
  const showResultsFields = status === 'completed';

  const handleFormSubmit = (values: ExperimentFormValues) => {
    // Prepare metrics for database
    const metricsForDb = metrics.length > 0 ? JSON.stringify(metrics) : null;

    const experiment: Insert<"validation_experiments"> | Update<"validation_experiments"> = {
      id: initialData?.id || uuidv4(),
      ...values,
      // Convert empty strings to null for dates
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      // Set metrics
      metrics: metricsForDb,
    };
    
    onSubmit(experiment);
    onOpenChange(false);
  };

  const handleAddMetric = () => {
    if (metricName.trim() && metricTarget.trim()) {
      const newMetric: MetricItem = {
        id: uuidv4(),
        name: metricName.trim(),
        target: metricTarget.trim(),
        actual: metricActual.trim() || undefined
      };
      setMetrics([...metrics, newMetric]);
      setMetricName('');
      setMetricTarget('');
      setMetricActual('');
    }
  };

  const handleRemoveMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMetric();
    }
  };

  const updateMetricActual = (id: string, actual: string) => {
    setMetrics(metrics.map(m => 
      m.id === id ? { ...m, actual } : m
    ));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  return (
    <ValidationForm
      title={isEditing ? "Edit Experiment" : "Create Experiment"}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={handleFormSubmit}
      submitLabel={isEditing ? "Update" : "Save"}
    >
      <Card className="p-4 border border-purple-100 bg-purple-50/30 mb-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-purple-900 mb-1">Designing Effective Experiments</h3>
            <p className="text-xs text-purple-700">
              A well-designed experiment has clear success metrics, a specific hypothesis to test, and a defined timeline. Focus on learning, not just validating your ideas.
            </p>
          </div>
        </div>
      </Card>

      <FormField
        control={form.control}
        name="title"
        rules={{ required: "Title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Experiment Title <Badge variant="outline" className="ml-1 text-xs font-normal">Required</Badge>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., 'Simplified Onboarding Flow Test'" 
                {...field} 
                ref={titleRef}
              />
            </FormControl>
            <FormDescription className="text-xs">
              A clear, descriptive name for your experiment
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        rules={{ required: "Description is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Description <Badge variant="outline" className="ml-1 text-xs font-normal">Required</Badge>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what this experiment will test and how it will be conducted..."
                rows={3}
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Outline the experiment approach and methodology
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hypothesis"
        rules={{ required: "Hypothesis is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Hypothesis <Badge variant="outline" className="ml-1 text-xs font-normal">Required</Badge>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="We believe that... [hypothesis statement]"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs">
              A clear statement of what you expect to learn or confirm
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="planned">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Planned</Badge>
                      <span className="text-xs text-muted-foreground">Not started yet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">In Progress</Badge>
                      <span className="text-xs text-muted-foreground">Currently running</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Completed</Badge>
                      <span className="text-xs text-muted-foreground">Finished with results</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Cancelled</Badge>
                      <span className="text-xs text-muted-foreground">Stopped before completion</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  Start Date
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">When will this experiment begin?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(status === 'in-progress' || status === 'completed' || status === 'cancelled') && (
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    End Date
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">When did (or will) this experiment end?</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full border rounded-md mb-4">
        <AccordionItem value="metrics" className="border-none">
          <AccordionTrigger className="px-4 py-2 text-sm font-medium">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Success Metrics</span>
              <Badge variant="outline" className="ml-1">{metrics.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              Define clear, measurable metrics that will determine if this experiment is successful. Be specific with targets.
            </p>
            
            <div className="space-y-2 mb-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Metric name"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="col-span-1"
                />
                <Input
                  placeholder="Target value"
                  value={metricTarget}
                  onChange={(e) => setMetricTarget(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="col-span-1"
                />
                {showResultsFields && (
                  <Input
                    placeholder="Actual value"
                    value={metricActual}
                    onChange={(e) => setMetricActual(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="col-span-1"
                  />
                )}
              </div>
              
              <Button type="button" variant="outline" onClick={handleAddMetric} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Metric
              </Button>
            </div>
            
            {metrics.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="grid grid-cols-3 gap-2 px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                  <div>Metric</div>
                  <div>Target</div>
                  {showResultsFields && <div>Actual</div>}
                </div>
                
                {metrics.map((metric) => (
                  <div key={metric.id} className="grid grid-cols-3 gap-2 items-center px-2 py-2 bg-gray-50 rounded-md">
                    <div className="text-sm font-medium">{metric.name}</div>
                    <div className="text-sm">{metric.target}</div>
                    
                    {showResultsFields && (
                      <div className="flex items-center gap-1">
                        <Input
                          placeholder="Actual value"
                          value={metric.actual || ''}
                          onChange={(e) => updateMetricActual(metric.id, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 absolute right-6"
                      onClick={() => handleRemoveMetric(metric.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {metrics.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No metrics added yet. Define what success looks like for this experiment.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {showResultsFields && (
        <>
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="results"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Results
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Summarize what happened during the experiment and whether it validated your hypothesis.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What were the outcomes of this experiment?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Document the results objectively, whether they matched expectations or not
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="learnings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Key Learnings
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Sparkles className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">What did you learn from this experiment? Include both expected and unexpected insights.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you learn? How will this inform future decisions?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Describe the insights gained and how they'll influence future work
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </ValidationForm>
  );
}; 