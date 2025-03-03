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
import { Badge } from '@/components/ui/badge';
import { ValidationForm } from '../common/ValidationForm';
import { Button } from '@/components/ui/button';
import { X, Plus, HelpCircle, Info, ChevronDown } from 'lucide-react';
import { UserFeedback } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface UserFeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: UserFeedback) => void;
  initialData?: UserFeedback;
}

interface UserFeedbackFormValues {
  source: string;
  date: string;
  type: 'feature-request' | 'bug-report' | 'testimonial' | 'criticism' | 'suggestion';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impact: 'high' | 'medium' | 'low';
  status: 'new' | 'in-review' | 'accepted' | 'rejected' | 'implemented';
  response: string;
}

export const UserFeedbackForm: React.FC<UserFeedbackFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showGuidance, setShowGuidance] = useState(true);

  const form = useForm<UserFeedbackFormValues>({
    defaultValues: {
      source: initialData?.source || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      type: initialData?.type || 'feature-request',
      content: initialData?.content || '',
      sentiment: initialData?.sentiment || 'neutral',
      impact: initialData?.impact || 'medium',
      status: initialData?.status || 'new',
      response: initialData?.response || ''
    }
  });

  const handleFormSubmit = (values: UserFeedbackFormValues) => {
    const feedback: UserFeedback = {
      id: initialData?.id || uuidv4(),
      ...values,
      tags
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
          <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-800">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-amber-600" />
              <span className="font-medium">Effective User Feedback Collection</span>
            </div>
            <ChevronDown className={`h-4 w-4 transform transition-transform ${showGuidance ? 'rotate-180' : ''}`} />
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Source
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">Who provided this feedback? This could be a specific user, customer, or channel (e.g., support ticket, social media, user interview).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Smith or Support Ticket #1234" {...field} />
              </FormControl>
              <FormDescription>Person or channel where feedback originated</FormDescription>
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

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Feedback Type
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Categorize the feedback by its purpose or intent. This helps with organizing and prioritizing feedback.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
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
            <FormDescription>The nature or purpose of the feedback</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Feedback Content
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">The actual feedback provided. Try to capture the user's exact words when possible.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="What did the user say or write?"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Capture the feedback verbatim when possible
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

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
                  <p className="w-80">Add tags to help categorize and filter feedback. Tags can represent features, user segments, or themes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
        </div>
        <div className="flex items-center mb-2">
          <Input
            placeholder="Add a tag (e.g., mobile, dashboard, pricing)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 mr-2"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddTag}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-1"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {tags.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              No tags added yet
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="sentiment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Sentiment
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">The emotional tone of the feedback. This helps gauge user satisfaction.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Potential Impact
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">How significant is this feedback? This helps with prioritization.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Helps with prioritization</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Current action status</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="response"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Response to User
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">What response did you provide to the user? This helps track communication and close the feedback loop.</p>
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
            <FormDescription>
              Record how you addressed the feedback with the user
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </ValidationForm>
  );
}; 