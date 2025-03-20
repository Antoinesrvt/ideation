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
import { ValidationUserFeedback as UserFeedback, Insert, Update } from '@/store/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, HelpCircle, Info, MessageCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface UserFeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: Insert<"validation_user_feedback"> | Update<"validation_user_feedback">) => void;
  initialData?: UserFeedback;
}

interface UserFeedbackFormValues {
  source: string;
  date: string;
  type: 'feature-request' | 'bug-report' | 'testimonial' | 'criticism' | 'suggestion';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impact: 'high' | 'medium' | 'low';
  status: 'new' | 'in-review' | 'addressed' | 'implemented' | 'rejected';
  response: string;
}

export const EnhancedUserFeedbackForm: React.FC<UserFeedbackFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showGuidance, setShowGuidance] = useState(!isEditing);

  const form = useForm<UserFeedbackFormValues>({
    defaultValues: {
      source: initialData?.source || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      type: (initialData?.type || 'feature-request') as 'feature-request' | 'bug-report' | 'testimonial' | 'criticism' | 'suggestion',
      content: initialData?.content || '',
      sentiment: (initialData?.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative',
      impact: (initialData?.impact || 'medium') as 'high' | 'medium' | 'low',
      status: (initialData?.status || 'new') as 'new' | 'in-review' | 'addressed' | 'implemented' | 'rejected',
      response: initialData?.response || ''
    }
  });

  // Focus on content textarea when modal opens
  useEffect(() => {
    if (open && contentRef.current && !isEditing) {
      setTimeout(() => {
        contentRef.current?.focus();
      }, 100);
    }
  }, [open, isEditing]);

  const { watch } = form;
  const status = watch('status');
  const needsResponse = status === 'addressed' || status === 'implemented' || status === 'rejected';

  const handleFormSubmit = (values: UserFeedbackFormValues) => {
    const feedback: Insert<"validation_user_feedback"> | Update<"validation_user_feedback"> = {
      id: initialData?.id || uuidv4(),
      ...values,
      date: values.date || null,
      tags: tags.length > 0 ? tags : null
    };
    
    onSubmit(feedback);
    onOpenChange(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <ValidationForm
      title={isEditing ? "Edit User Feedback" : "Record User Feedback"}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={handleFormSubmit}
      submitLabel={isEditing ? "Update" : "Save"}
    >
      <Collapsible
        open={showGuidance}
        onOpenChange={setShowGuidance}
        className="mb-4"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex w-full justify-between p-2 text-sm border border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-800"
          >
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-amber-600" />
              <span className="font-medium">Effective Feedback Collection</span>
            </div>
            <span className="text-xs text-amber-700">
              {showGuidance ? "Hide Tips" : "Show Tips"}
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 border border-amber-100 border-t-0 bg-amber-50 rounded-b-md">
          <ul className="list-disc pl-4 space-y-1 text-sm text-amber-700">
            <li>Capture feedback verbatim when possible</li>
            <li>Categorize feedback to identify patterns</li>
            <li>Assess impact to prioritize implementation</li>
            <li>Record your responses to close the feedback loop</li>
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <Card className="p-4 border border-amber-100 bg-amber-50/30 mb-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-900 mb-1">Why User Feedback Matters</h3>
            <p className="text-xs text-amber-700">
              Direct user feedback provides invaluable insights into your product's strengths and weaknesses. It helps prioritize features, identify pain points, and validate your hypotheses.
            </p>
          </div>
        </div>
      </Card>

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Feedback Content <Badge variant="outline" className="ml-1 text-xs font-normal">Required</Badge>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="What did the user say or write? Try to capture their exact words."
                rows={4}
                {...field}
                ref={contentRef}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Capture the feedback verbatim when possible
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Smith, Support Ticket #1234" {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                Person or channel where feedback originated
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Received</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="bug-report">Bug Report</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="criticism">Criticism</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                The nature or purpose of the feedback
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sentiment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sentiment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="positive">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">Positive</span>
                      <span className="text-xs text-muted-foreground">Favorable feedback</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="neutral">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Neutral</span>
                      <span className="text-xs text-muted-foreground">Neither positive nor negative</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="negative">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">Negative</span>
                      <span className="text-xs text-muted-foreground">Critical or unfavorable</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">High</span>
                      <span className="text-xs text-muted-foreground">Critical for many users</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">Medium</span>
                      <span className="text-xs text-muted-foreground">Important but not critical</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">Low</span>
                      <span className="text-xs text-muted-foreground">Minimal impact on users</span>
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
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">New</Badge>
                      <span className="text-xs text-muted-foreground">Just received</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-review">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">In Review</Badge>
                      <span className="text-xs text-muted-foreground">Being evaluated</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="addressed">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Addressed</Badge>
                      <span className="text-xs text-muted-foreground">Response sent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="implemented">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Implemented</Badge>
                      <span className="text-xs text-muted-foreground">Action taken</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Rejected</Badge>
                      <span className="text-xs text-muted-foreground">Not implementing</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <FormLabel className="flex items-center">
            Tags
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Tags help you categorize and search for feedback. Use them to identify themes across different feedback items.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
        </div>
        <div className="flex items-center mb-2">
          <Input
            placeholder="e.g., mobile, pricing, UX"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 mr-2"
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {tags.length === 0 && (
            <p className="text-xs text-muted-foreground">No tags added yet. Tags help you categorize feedback.</p>
          )}
        </div>
      </div>

      {needsResponse && (
        <>
          <Separator className="my-4" />
          
          <FormField
            control={form.control}
            name="response"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Response
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Document how you responded to this feedback. Even if you decide not to implement the suggestion, explaining why helps close the feedback loop.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="How did you respond to this feedback?"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Closing the loop with users builds trust and encourages more feedback
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