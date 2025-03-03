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
import { Button } from '@/components/ui/button';
import { X, Plus, HelpCircle } from 'lucide-react';
import { Hypothesis } from '@/types';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface HypothesisFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (hypothesis: Hypothesis) => void;
  initialData?: Hypothesis;
}

interface HypothesisFormValues {
  statement: string;
  validationMethod: string;
  status: 'unvalidated' | 'validated' | 'invalidated';
  confidence: number;
}

export const HypothesisForm: React.FC<HypothesisFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;
  const [assumptions, setAssumptions] = useState<string[]>(initialData?.assumptions || []);
  const [assumptionInput, setAssumptionInput] = useState('');
  
  const [evidence, setEvidence] = useState<string[]>(initialData?.evidence || []);
  const [evidenceInput, setEvidenceInput] = useState('');

  const form = useForm<HypothesisFormValues>({
    defaultValues: {
      statement: initialData?.statement || '',
      validationMethod: initialData?.validationMethod || '',
      status: initialData?.status || 'unvalidated',
      confidence: initialData?.confidence || 0
    }
  });

  const { watch } = form;
  const currentStatus = watch('status');
  const showEvidence = currentStatus !== 'unvalidated';

  const handleFormSubmit = (values: HypothesisFormValues) => {
    const hypothesis: Hypothesis = {
      id: initialData?.id || uuidv4(),
      ...values,
      assumptions,
      evidence,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(hypothesis);
    onOpenChange(false);
  };

  const handleAddAssumption = () => {
    if (assumptionInput.trim() && !assumptions.includes(assumptionInput.trim())) {
      setAssumptions([...assumptions, assumptionInput.trim()]);
      setAssumptionInput('');
    }
  };

  const handleRemoveAssumption = (assumption: string) => {
    setAssumptions(assumptions.filter(a => a !== assumption));
  };

  const handleAddEvidence = () => {
    if (evidenceInput.trim() && !evidence.includes(evidenceInput.trim())) {
      setEvidence([...evidence, evidenceInput.trim()]);
      setEvidenceInput('');
    }
  };

  const handleRemoveEvidence = (item: string) => {
    setEvidence(evidence.filter(e => e !== item));
  };

  const handleKeyDown = (setter: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setter();
    }
  };

  return (
    <ValidationForm
      title={isEditing ? "Edit Hypothesis" : "Create Hypothesis"}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={handleFormSubmit}
      submitLabel={isEditing ? "Update" : "Create"}
    >
      <Card className="bg-blue-50 border-blue-200 mb-4">
        <CardContent className="pt-4 text-sm text-blue-700">
          <p className="font-medium mb-2">Effective Hypothesis Development</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Frame statements as testable predictions</li>
            <li>Identify underlying assumptions that must be true</li>
            <li>Define clear validation methods</li>
            <li>Collect evidence systematically to validate or invalidate</li>
          </ul>
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="statement"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Hypothesis Statement
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">A clear, testable statement. Good format: "We believe that [doing X] will result in [outcome Y] for [customer Z] because [reason]."</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="We believe that..." 
                rows={3} 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Make your hypothesis specific, measurable, and falsifiable
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <div className="flex justify-between items-center mb-2">
          <FormLabel className="flex items-center">
            Key Assumptions
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">Underlying beliefs that must be true for your hypothesis to be valid. These are the risky or uncertain elements you're testing.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddAssumption}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <FormDescription className="mb-2">
          What assumptions underlie your hypothesis?
        </FormDescription>
        <div className="flex items-center mb-2">
          <Input
            placeholder="e.g., Users find the current checkout process confusing"
            value={assumptionInput}
            onChange={(e) => setAssumptionInput(e.target.value)}
            onKeyDown={handleKeyDown(handleAddAssumption)}
            className="flex-1 mr-2"
          />
        </div>
        <div className="space-y-2 mt-2">
          {assumptions.length === 0 ? (
            <div className="text-sm text-muted-foreground italic border rounded p-3 text-center">
              No assumptions added yet. Identify what must be true for your hypothesis to be valid.
            </div>
          ) : (
            assumptions.map((assumption, index) => (
              <div key={index} className="flex items-center border rounded p-2">
                <span className="flex-1">{assumption}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveAssumption(assumption)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <FormField
        control={form.control}
        name="validationMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Validation Method
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">How will you test this hypothesis? Describe the experiment, user research, or data analysis you'll use to validate or invalidate it.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="How will you test this hypothesis?" 
                rows={2} 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Define clear, measurable steps to validate or invalidate
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="my-4" />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Status
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">The current state of your hypothesis. New hypotheses start as unvalidated. After testing, they become validated or invalidated.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
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
                <SelectItem value="unvalidated">Unvalidated</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="invalidated">Invalidated</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Update as you gather evidence for or against your hypothesis
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confidence"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Confidence Level: {field.value}%
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">How confident are you in the truth of this hypothesis? This should increase as you gather supporting evidence, or decrease as you find contradicting evidence.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Slider
                defaultValue={[field.value]}
                max={100}
                step={1}
                onValueChange={(values) => field.onChange(values[0])}
              />
            </FormControl>
            <FormDescription>
              0% = No confidence, 100% = Absolute certainty
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {showEvidence && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel className="flex items-center">
              Evidence
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Data, observations, or findings that support or contradict your hypothesis. Add specific, concrete evidence you've gathered.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddEvidence}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <FormDescription className="mb-2">
            Record data points that validate or invalidate your hypothesis
          </FormDescription>
          <div className="flex items-center mb-2">
            <Input
              placeholder="e.g., 75% of test users completed the simplified checkout process"
              value={evidenceInput}
              onChange={(e) => setEvidenceInput(e.target.value)}
              onKeyDown={handleKeyDown(handleAddEvidence)}
              className="flex-1 mr-2"
            />
          </div>
          <div className="space-y-2 mt-2">
            {evidence.length === 0 ? (
              <div className="text-sm text-muted-foreground italic border rounded p-3 text-center">
                No evidence added yet. Add data points as you gather them.
              </div>
            ) : (
              evidence.map((item, index) => (
                <div key={index} className="flex items-center border rounded p-2">
                  <span className="flex-1">{item}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveEvidence(item)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </ValidationForm>
  );
}; 