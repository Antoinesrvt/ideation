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
import { ValidationForm } from '../common/ValidationForm';
import { ValidationABTest as ABTest, Insert, Update } from '@/store/types';
import { HelpCircle, Info, SplitSquareVertical } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { formatDateForInput } from '../../utils/formUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ABTestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (test: Insert<"validation_ab_tests"> | Update<"validation_ab_tests">) => void;
  initialData?: ABTest;
  existingTests?: ABTest[];
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

export const EnhancedABTestForm: React.FC<ABTestFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  existingTests = []
}) => {
  const isEditing = !!initialData;
  const titleRef = useRef<HTMLInputElement>(null);
  const [showGuidance, setShowGuidance] = useState(!isEditing);

  const form = useForm<ABTestFormValues>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      variant_a: initialData?.variant_a || '',
      variant_b: initialData?.variant_b || '',
      metric: initialData?.metric || '',
      status: initialData?.status as any || 'planned',
      start_date: formatDateForInput(initialData?.start_date),
      end_date: formatDateForInput(initialData?.end_date),
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

  // Focus on title input when modal opens
  useEffect(() => {
    if (open && titleRef.current && !isEditing) {
      setTimeout(() => {
        titleRef.current?.focus();
      }, 100);
    }
  }, [open, isEditing]);

  const handleFormSubmit = (values: ABTestFormValues) => {
    const test: Insert<"validation_ab_tests"> | Update<"validation_ab_tests"> = {
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
    
    onSubmit(test);
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
          <Button 
            variant="ghost" 
            className="flex w-full justify-between p-2 text-sm border border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-800"
          >
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-purple-600" />
              <span className="font-medium">Effective A/B Testing Tips</span>
            </div>
            <span className="text-xs text-purple-700">
              {showGuidance ? "Hide Tips" : "Show Tips"}
            </span>
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

      <Card className="p-4 border border-purple-100 bg-purple-50/30 mb-4">
        <div className="flex items-start gap-3">
          <SplitSquareVertical className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-purple-900 mb-1">What is an A/B Test?</h3>
            <p className="text-xs text-purple-700">
              A/B tests compare two versions of a design or feature to see which performs better. They help you make decisions based on data rather than opinion.
            </p>
          </div>
        </div>
      </Card>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Test Name <Badge variant="outline" className="ml-1 text-xs font-normal">Required</Badge>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Homepage Hero Image Test" 
                {...field} 
                ref={titleRef}
              />
            </FormControl>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    <span>Use a clear, descriptive name</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">A good name should clearly identify what you're testing and help team members quickly understand the purpose of the test.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                placeholder="Describe what you're testing and why..."
                rows={3}
                {...field}
              />
            </FormControl>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Example: "Testing if a green CTA button increases conversion vs. the current blue one"</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Provide context about what you're testing, why, and what you hope to learn. Include details about your target audience.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
              <FormLabel>Variant A (Control)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Current design" {...field} />
              </FormControl>
              <FormDescription className="text-xs">The existing version</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="variant_b"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant B (Test)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New design" {...field} />
              </FormControl>
              <FormDescription className="text-xs">The alternative version</FormDescription>
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
            <FormLabel className="flex items-center gap-1">
              Primary Metric <Badge variant="outline" className="ml-1 text-xs font-normal">Required</Badge>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g., Click-through rate, Conversion rate" {...field} />
            </FormControl>
            <FormDescription className="text-xs">
              What will you measure to determine success?
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
                  <SelectItem value="planned">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Planned</Badge>
                      <span className="text-xs text-muted-foreground">Not yet started</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="running">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">Running</Badge>
                      <span className="text-xs text-muted-foreground">In progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Completed</Badge>
                      <span className="text-xs text-muted-foreground">Finished</span>
                    </div>
                  </SelectItem>
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
              <FormLabel>Target Sample Size</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="e.g., 1000"
                  min="0"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Number of users/visitors to test
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
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
                <Input
                  type="date"
                  {...field}
                  min={form.getValues('start_date') || undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {showResults && (
        <>
          <Separator className="my-4" />
          
          <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-4">
            <h3 className="text-sm font-medium text-green-800 mb-1">Test Results</h3>
            <p className="text-xs text-green-700">
              Record the outcome of your test to help inform future decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="conversion_a"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant A Conversion</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 5.2"
                      min="0"
                      max="100"
                      step="0.1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Percentage (%) of users who converted
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conversion_b"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant B Conversion</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 6.8"
                      min="0"
                      max="100"
                      step="0.1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Percentage (%) of users who converted
                  </FormDescription>
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
                  <FormLabel>Confidence Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 95"
                      min="0"
                      max="100"
                      step="0.1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Statistical confidence (%)
                  </FormDescription>
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
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Document insights and next steps
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