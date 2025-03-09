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
import { ValidationForm } from '../common/ValidationForm';
import { ValidationABTest as ABTest } from '@/store/types';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ABTestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (test: ABTest) => void;
  initialData?: ABTest;
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
  sample_size: string;
  conversion_a: string;
  conversion_b: string;
  confidence: string;
  winner: 'A' | 'B' | 'inconclusive' | '';
  notes: string;
}

export const ABTestForm: React.FC<ABTestFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;

  const form = useForm<ABTestFormValues>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      variant_a: initialData?.variant_a || '',
      variant_b: initialData?.variant_b || '',
      metric: initialData?.metric || '',
      status: initialData?.status as any || 'planned',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      sample_size: initialData?.sample_size?.toString() || '',
      conversion_a: initialData?.conversion_a?.toString() || '',
      conversion_b: initialData?.conversion_b?.toString() || '',
      confidence: initialData?.confidence?.toString() || '',
      winner: initialData?.winner as any || '',
      notes: initialData?.notes || ''
    }
  });

  const { watch } = form;
  const status = watch('status');
  const showResults = status === 'completed';

  const [showGuidance, setShowGuidance] = useState(true);

  const handleFormSubmit = (values: ABTestFormValues) => {
    const test = {
      id: initialData?.id || uuidv4(),
      title: values.title,
      description: values.description,
      variant_a: values.variant_a,
      variant_b: values.variant_b,
      metric: values.metric,
      status: values.status,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      sample_size: values.sample_size ? parseInt(values.sample_size) : null,
      conversion_a: values.conversion_a ? parseFloat(values.conversion_a) : null,
      conversion_b: values.conversion_b ? parseFloat(values.conversion_b) : null,
      confidence: values.confidence ? parseFloat(values.confidence) : null,
      winner: values.winner === '' ? null : values.winner as 'A' | 'B' | 'inconclusive',
      notes: values.notes || null,
    };
    
    onSubmit(test as any);
    onOpenChange(false);
  };

  return (
    <ValidationForm
      title={isEditing ? "Edit A/B Test" : "Create A/B Test"}
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
          <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-800">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-purple-600" />
              <span className="font-medium">Effective A/B Testing</span>
            </div>
            <ChevronDown className={`h-4 w-4 transform transition-transform ${showGuidance ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 border border-purple-100 border-t-0 bg-purple-50 rounded-b-md">
          <ul className="list-disc pl-4 space-y-1 text-sm text-purple-700">
            <li>Test only one variable at a time for clear results</li>
            <li>Ensure your sample size is large enough to be statistically significant</li>
            <li>Run your test for a sufficient duration (at least one full business cycle)</li>
            <li>Focus on metrics that directly impact your business goals</li>
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Test Name
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">A clear, descriptive name for your A/B test that indicates what you're testing.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g., Homepage Hero Image Test" {...field} />
            </FormControl>
            <FormDescription>
              Name should clearly identify what you're testing
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
                    <p className="w-80">Provide context about what you're testing, why, and what you hope to learn. Include details about your target audience and any other relevant information.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what you're testing and why..."
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormField
          control={form.control}
          name="variant_a"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant A</FormLabel>
              <FormControl>
                <Input placeholder="Control variant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="variant_b"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant B</FormLabel>
              <FormControl>
                <Input placeholder="Test variant" {...field} />
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
            <FormLabel className="flex items-center">
              Primary Metric
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">The key performance indicator you're measuring. Choose a metric that directly relates to your business goals, such as conversion rate, click-through rate, average order value, etc.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g., Signup conversion rate" {...field} />
            </FormControl>
            <FormDescription>
              The main metric you'll use to determine success
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

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
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sample_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sample Size</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <FormField
          control={form.control}
          name="start_date"
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
          name="end_date"
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

      {showResults && (
        <>
          <Separator className="my-4" />
          <h3 className="text-sm font-medium mb-3">Test Results</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="conversion_a"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conversion Rate A (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conversion_b"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conversion Rate B (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="confidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Statistical Confidence
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">The statistical confidence level of your results (e.g., 95% means you're 95% confident the results are not due to random chance).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g., 95" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Confidence level percentage</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="winner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Winner</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select winner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Not determined</SelectItem>
                      <SelectItem value="A">Variant A (Control)</SelectItem>
                      <SelectItem value="B">Variant B (Test)</SelectItem>
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
                    rows={3} 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Document key insights and next steps based on test results
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