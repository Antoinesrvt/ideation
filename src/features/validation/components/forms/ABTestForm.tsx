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
      variantA: initialData?.variantA || '',
      variantB: initialData?.variantB || '',
      metric: initialData?.metric || '',
      status: initialData?.status || 'planned',
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      sampleSize: initialData?.sampleSize?.toString() || '',
      conversionA: initialData?.conversionA?.toString() || '',
      conversionB: initialData?.conversionB?.toString() || '',
      confidence: initialData?.confidence?.toString() || '',
      winner: initialData?.winner || '',
      notes: initialData?.notes || ''
    }
  });

  const { watch } = form;
  const status = watch('status');
  const showResults = status === 'completed';

  const [showGuidance, setShowGuidance] = useState(true);

  const handleFormSubmit = (values: ABTestFormValues) => {
    const test: ABTest = {
      id: initialData?.id || uuidv4(),
      title: values.title,
      description: values.description,
      variantA: values.variantA,
      variantB: values.variantB,
      metric: values.metric,
      status: values.status,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      sampleSize: values.sampleSize ? parseInt(values.sampleSize) : undefined,
      conversionA: values.conversionA ? parseFloat(values.conversionA) : undefined,
      conversionB: values.conversionB ? parseFloat(values.conversionB) : undefined,
      confidence: values.confidence ? parseFloat(values.confidence) : undefined,
      winner: values.winner === '' ? undefined : values.winner as 'A' | 'B' | 'inconclusive' | undefined,
      notes: values.notes || undefined
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="variantA"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Variant A (Control)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">The current version or baseline. This is what you're comparing against.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input placeholder="Describe variant A..." {...field} />
              </FormControl>
              <FormDescription>The current version</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="variantB"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Variant B (Test)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">The new version you're testing. This should differ from variant A in only one key aspect for clear results.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input placeholder="Describe variant B..." {...field} />
              </FormControl>
              <FormDescription>The new version being tested</FormDescription>
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
          name="sampleSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Sample Size
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">The total number of users or sessions included in your test. Larger sample sizes provide more reliable results.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      {showResults && (
        <>
          <Separator className="my-4" />
          <h3 className="text-sm font-medium mb-3">Test Results</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="conversionA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant A Conversion</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g., 5.2" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Results for control variant (%)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conversionB"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant B Conversion</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g., 6.8" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Results for test variant (%)</FormDescription>
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