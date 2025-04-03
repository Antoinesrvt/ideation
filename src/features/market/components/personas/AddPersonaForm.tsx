import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronDownIcon, 
  InfoIcon,
  PlusIcon,
  XIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Insert } from '@/store/types';

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  demographics: z.string().optional(),
  goals: z.array(z.string()).optional(),
  pain_points: z.array(z.string()).optional(),
  influence_score: z.number().min(1).max(10).optional().nullable(),
  priority: z.enum(['primary', 'secondary', 'tertiary']).optional().nullable(),
  persona_segments: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPersonaFormProps {
  defaultValues: Insert<'market_personas'>;
  onSubmit: (data: Insert<'market_personas'>) => Promise<void>;
  onCancel: () => void;
}

export const AddPersonaForm: React.FC<AddPersonaFormProps> = ({ 
  defaultValues, 
  onSubmit, 
  onCancel 
}) => {
  // Initialize form with validation schema and default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues.name || '',
      role: defaultValues.role || '',
      demographics: defaultValues.demographics || '',
      goals: defaultValues.goals || [],
      pain_points: defaultValues.pain_points || [],
      influence_score: defaultValues.influence_score || null,
      priority: defaultValues.priority as 'primary' | 'secondary' | 'tertiary' | null,
      persona_segments: defaultValues.persona_segments || [],
    },
  });
  
  // State for new item input (for goals, pain points, and segments)
  const [newGoal, setNewGoal] = React.useState('');
  const [newPainPoint, setNewPainPoint] = React.useState('');
  const [newSegment, setNewSegment] = React.useState('');
  
  // Add item to an array field
  const addItem = (field: 'goals' | 'pain_points' | 'persona_segments', value: string) => {
    if (!value.trim()) return;
    
    const currentValues = form.getValues(field) || [];
    if (!currentValues.includes(value)) {
      form.setValue(field, [...currentValues, value]);
    }
    
    // Reset the input
    if (field === 'goals') setNewGoal('');
    if (field === 'pain_points') setNewPainPoint('');
    if (field === 'persona_segments') setNewSegment('');
  };
  
  // Remove item from an array field
  const removeItem = (field: 'goals' | 'pain_points' | 'persona_segments', index: number) => {
    const currentValues = form.getValues(field) || [];
    form.setValue(
      field,
      currentValues.filter((_, i) => i !== index)
    );
  };
  
  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      project_id: defaultValues.project_id,
      empathy_map: null, // Empathy map is edited separately
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Tech-Savvy Marketing Manager" {...field} />
                </FormControl>
                <FormDescription>
                  A memorable and descriptive name for this persona
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Marketing Director" {...field} />
                </FormControl>
                <FormDescription>
                  The job title or role of this persona
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Demographics */}
        <FormField
          control={form.control}
          name="demographics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demographics</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g., 30-45 years old, urban professional, tech-literate, $75-120k income" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Key demographic characteristics that define this persona
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Priority
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Primary: Key decision maker or target<br />
                          Secondary: Influencer or important stakeholder<br />
                          Tertiary: Peripheral but still relevant
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value || null)} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="tertiary">Tertiary</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How important is this persona to your business?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Influence Score */}
          <FormField
            control={form.control}
            name="influence_score"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Decision Influence (1-10)</span>
                  <span className="text-sm font-normal">
                    {field.value !== null ? field.value : 'Not set'}
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={field.value !== null ? [field.value ?? 5] : [5]}
                    onValueChange={(values) => field.onChange(values[0])}
                    className="py-4"
                  />
                </FormControl>
                <FormDescription>
                  How much influence does this persona have in purchasing decisions?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Goals */}
        <FormField
          control={form.control}
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goals & Motivations</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g., Increase team productivity"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('goals', newGoal);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addItem('goals', newGoal)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Display added goals */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((goal, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {goal}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeItem('goals', index)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              <FormDescription>
                What are this persona's main goals and motivations?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Pain Points */}
        <FormField
          control={form.control}
          name="pain_points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pain Points & Challenges</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g., Lacks visibility into project status"
                    value={newPainPoint}
                    onChange={(e) => setNewPainPoint(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('pain_points', newPainPoint);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addItem('pain_points', newPainPoint)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Display added pain points */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((pain, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {pain}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeItem('pain_points', index)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              <FormDescription>
                What challenges and pain points does this persona face?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Market Segments */}
        <FormField
          control={form.control}
          name="persona_segments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Market Segments</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g., Enterprise, B2B, Healthcare"
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('persona_segments', newSegment);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addItem('persona_segments', newSegment)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Display added segments */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((segment, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {segment}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeItem('persona_segments', index)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              <FormDescription>
                Which market segments does this persona belong to?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel type="button" onClick={onCancel}>Cancel</AlertDialogCancel>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Persona'}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}; 