import React, { useState } from 'react';
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
import { ValidationForm } from '../common/ValidationForm';
import { X, Plus, HelpCircle, Info, CalendarIcon, ChevronDown } from 'lucide-react';
import { Experiment } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ExperimentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (experiment: Experiment) => void;
  initialData?: Experiment;
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
  key: string;
  target: string;
  actual: string;
}

export const ExperimentForm: React.FC<ExperimentFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;
  const [metrics, setMetrics] = useState<
    { key: string; target: string; actual: string }[]
  >(
    initialData?.metrics.map(m => ({
      key: m.key,
      target: m.target || '',
      actual: m.actual || ''
    })) || []
  );

  const form = useForm<ExperimentFormValues>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      hypothesis: initialData?.hypothesis || '',
      status: initialData?.status || 'planned',
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      results: initialData?.results || '',
      learnings: initialData?.learnings || ''
    }
  });

  const { watch } = form;
  const status = watch('status');
  const showResults = status === 'completed' || status === 'cancelled';

  const [showGuidance, setShowGuidance] = useState(true);

  const handleFormSubmit = (values: ExperimentFormValues) => {
    const experiment: Experiment = {
      id: initialData?.id || uuidv4(),
      ...values,
      metrics: metrics.map(m => ({
        key: m.key,
        target: m.target,
        actual: m.actual
      }))
    };
    
    onSubmit(experiment);
    onOpenChange(false);
  };

  const addMetric = () => {
    setMetrics([...metrics, { key: '', target: '', actual: '' }]);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: 'key' | 'target' | 'actual', value: string) => {
    const updatedMetrics = [...metrics];
    updatedMetrics[index][field] = value;
    setMetrics(updatedMetrics);
  };

  return (
    <ValidationForm
      title={isEditing ? "Edit Experiment" : "Design an Experiment"}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={handleFormSubmit}
      submitLabel={isEditing ? "Update" : "Create"}
    >
      <Collapsible
        open={showGuidance}
        onOpenChange={setShowGuidance}
        className="mb-4"
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-800">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">What makes a good experiment?</span>
            </div>
            <ChevronDown className={`h-4 w-4 transform transition-transform ${showGuidance ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 border border-blue-100 border-t-0 bg-blue-50 rounded-b-md">
          <ul className="list-disc pl-4 space-y-1 text-sm text-blue-700">
            <li>Clear, testable hypothesis that can be proven or disproven</li>
            <li>Specific, measurable success metrics</li>
            <li>Defined timeframe with start and end dates</li>
            <li>Focused on learning, not just proving you're right</li>
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Experiment Title
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">A short, descriptive name for your experiment. Make it specific enough that team members can understand what you're testing.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g., One-click checkout flow" {...field} />
            </FormControl>
            <FormDescription>
              Keep it concise and descriptive
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Description
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Provide context about what you're testing and why. Describe the experimental setup and approach.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what you're testing and how the experiment will work..."
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hypothesis"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Hypothesis
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">A good hypothesis follows this format: "We believe that [doing X] will result in [outcome Y] because [reason Z]."</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="We believe that..."
                rows={2}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Clearly state what you expect to happen and why
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <div className="flex justify-between items-center mb-2">
          <FormLabel className="flex items-center">
            Key Metrics
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">Define measurable metrics that will help you determine if your experiment succeeded or failed. Each metric should have a target value.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
          <Button type="button" variant="outline" size="sm" onClick={addMetric}>
            <Plus className="h-4 w-4 mr-1" />
            Add Metric
          </Button>
        </div>
        <FormDescription className="mb-2">
          Define metrics to measure the success of your experiment
        </FormDescription>
        
        {metrics.length === 0 ? (
          <div className="text-sm text-muted-foreground italic border rounded p-3 text-center">
            No metrics added yet. Add at least one metric to track your experiment.
          </div>
        ) : (
          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-2 border rounded p-3">
                <div className="flex-1">
                  <Input
                    placeholder="Metric name (e.g., Conversion rate)"
                    value={metric.key}
                    onChange={(e) => updateMetric(index, 'key', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Target (e.g., 15%)"
                    value={metric.target}
                    onChange={(e) => updateMetric(index, 'target', e.target.value)}
                  />
                </div>
                {(status === 'completed' || status === 'in-progress') && (
                  <div className="flex-1">
                    <Input
                      placeholder="Actual result"
                      value={metric.actual}
                      onChange={(e) => updateMetric(index, 'actual', e.target.value)}
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetric(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-4" />

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
      </div>

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

      {showResults && (
        <>
          <Separator className="my-4" />
          
          <FormField
            control={form.control}
            name="results"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Results
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Document the actual outcomes of your experiment. Be specific about the data collected and whether your hypothesis was validated or invalidated.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What were the outcomes of your experiment?"
                    rows={3}
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
                <FormLabel className="flex items-center">
                  Key Learnings
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Document the insights gained from this experiment, regardless of whether it succeeded or failed. What did you learn that can be applied to future experiments?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did you learn from this experiment?"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Focus on actionable insights, even if the experiment didn't succeed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </ValidationForm>
  );
}; 