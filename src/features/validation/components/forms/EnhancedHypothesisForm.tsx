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
  Beaker, 
  Target, 
  HelpCircle, 
  ChevronRight, 
  PenLine,
  MessageCircle
} from 'lucide-react';
import { ValidationForm } from '../common/ValidationForm';
import { ValidationHypothesis, Insert, Update } from '@/store/types';
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

interface HypothesisFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (hypothesis: Insert<"validation_hypotheses"> | Update<"validation_hypotheses">) => void;
  initialData?: ValidationHypothesis;
}

interface HypothesisFormValues {
  statement: string;
  status: 'unverified' | 'validated' | 'invalidated';
  validation_method?: string | null;
  confidence?: number | null;
}

interface Assumption {
  id: string;
  text: string;
}

interface Evidence {
  id: string;
  text: string;
  type: 'supporting' | 'contradicting';
}

interface SuccessCriteria {
  id: string;
  text: string;
}

export const EnhancedHypothesisForm: React.FC<HypothesisFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;
  
  // Parse assumptions from initialData
  const [assumptions, setAssumptions] = useState<Assumption[]>(() => {
    if (!initialData?.assumptions) return [];
    
    // Handle different formats of assumptions
    if (typeof initialData.assumptions === 'string') {
      try {
        return JSON.parse(initialData.assumptions).map((item: string | Assumption) => {
          if (typeof item === 'string') {
            return { id: uuidv4(), text: item };
          }
          return item;
        });
      } catch (e) {
        return [];
      }
    } else if (Array.isArray(initialData.assumptions)) {
      return initialData.assumptions.map((item: string | Assumption) => {
        if (typeof item === 'string') {
          return { id: uuidv4(), text: item };
        }
        return item;
      });
    }
    return [];
  });
  
  // Parse evidence from initialData
  const [evidence, setEvidence] = useState<Evidence[]>(() => {
    if (!initialData?.evidence) return [];
    
    // Handle different formats of evidence
    if (typeof initialData.evidence === 'string') {
      try {
        return JSON.parse(initialData.evidence).map((item: any) => {
          if (typeof item === 'string') {
            // Check if the string has a type encoded in it ([supporting] or [contradicting])
            const typeMatch = item.match(/^\[(supporting|contradicting)\]\s(.*)/);
            if (typeMatch) {
              return { 
                id: uuidv4(), 
                text: typeMatch[2], 
                type: typeMatch[1] as 'supporting' | 'contradicting'
              };
            }
            return { id: uuidv4(), text: item, type: 'supporting' };
          }
          return item;
        });
      } catch (e) {
        return [];
      }
    } else if (Array.isArray(initialData.evidence)) {
      return initialData.evidence.map((item: any) => {
        if (typeof item === 'string') {
          // Check if the string has a type encoded in it ([supporting] or [contradicting])
          const typeMatch = item.match(/^\[(supporting|contradicting)\]\s(.*)/);
          if (typeMatch) {
            return { 
              id: uuidv4(), 
              text: typeMatch[2], 
              type: typeMatch[1] as 'supporting' | 'contradicting'
            };
          }
          return { id: uuidv4(), text: item, type: 'supporting' };
        }
        return { 
          id: uuidv4(), 
          text: String(item), 
          type: 'supporting' 
        };
      });
    }
    return [];
  });

  // Parse success criteria from initialData
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriteria[]>(() => {
    if (!initialData?.success_criteria) return [];
    
    // Handle different formats of success_criteria
    if (typeof initialData.success_criteria === 'string') {
      try {
        const parsed = JSON.parse(initialData.success_criteria);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (typeof item === 'string') {
              return { id: uuidv4(), text: item };
            } else if (typeof item === 'object' && item !== null) {
              return { 
                id: item.id || uuidv4(), 
                text: item.text || String(item) 
              };
            }
            return { id: uuidv4(), text: String(item) };
          });
        }
        return [];
      } catch (e) {
        return [];
      }
    } else if (typeof initialData.success_criteria === 'object' && initialData.success_criteria !== null) {
      // If it's already an object (not a string)
      if (Array.isArray(initialData.success_criteria)) {
        return initialData.success_criteria.map((item: any) => {
          if (typeof item === 'string') {
            return { id: uuidv4(), text: item };
          } else if (typeof item === 'object' && item !== null) {
            return { 
              id: item.id || uuidv4(), 
              text: item.text || String(item) 
            };
          }
          return { id: uuidv4(), text: String(item) };
        });
      }
    }
    return [];
  });
  
  const [assumptionInput, setAssumptionInput] = useState('');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [evidenceType, setEvidenceType] = useState<'supporting' | 'contradicting'>('supporting');
  const [criteriaInput, setCriteriaInput] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const assumptionInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<HypothesisFormValues>({
    defaultValues: {
      statement: initialData?.statement || '',
      status: (initialData?.status as 'unverified' | 'validated' | 'invalidated') || 'unverified',
      validation_method: initialData?.validation_method || null,
      confidence: initialData?.confidence || null,
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
  const statement = watch('statement');

  const formIsValid = statement.trim() !== '';
  const hasEvidence = evidence.length > 0;
  const evidenceCount = {
    supporting: evidence.filter(e => e.type === 'supporting').length,
    contradicting: evidence.filter(e => e.type === 'contradicting').length
  };

  const handleFormSubmit = (values: HypothesisFormValues) => {
    // Prepare the data for the database
    const assumptionsForDb = assumptions.length > 0 
      ? assumptions.map(a => a.text) 
      : null;
      
    // For evidence, we need to convert to string[] as required by the database schema
    // Include the type in the text to preserve that information
    const evidenceForDb = evidence.length > 0 
      ? evidence.map(e => `[${e.type}] ${e.text}`) 
      : null;
      
    const successCriteriaForDb = successCriteria.length > 0 
      ? successCriteria.map(sc => sc.text) 
      : null;

    const hypothesis: Insert<"validation_hypotheses"> | Update<"validation_hypotheses"> = {
      id: initialData?.id || uuidv4(),
      project_id: initialData?.project_id || null,
      statement: values.statement,
      status: values.status,
      validation_method: values.validation_method || null,
      confidence: values.confidence || null,
      // Properly serialize for the database as string[] or JSON
      assumptions: assumptionsForDb,
      evidence: evidenceForDb,
      success_criteria: successCriteriaForDb ? JSON.stringify(successCriteriaForDb) : null,
      // Keep other properties as is
      entity_id: initialData?.entity_id || null,
      entity_type: initialData?.entity_type || null,
      created_by: initialData?.created_by || null,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    onSubmit(hypothesis);
    onOpenChange(false);
  };

  const handleAddAssumption = () => {
    if (assumptionInput.trim()) {
      const newAssumption: Assumption = {
        id: uuidv4(),
        text: assumptionInput.trim()
      };
      setAssumptions([...assumptions, newAssumption]);
      setAssumptionInput('');
      assumptionInputRef.current?.focus();
    }
  };

  const handleRemoveAssumption = (id: string) => {
    setAssumptions(assumptions.filter(a => a.id !== id));
  };

  const handleAddEvidence = () => {
    if (evidenceInput.trim()) {
      const newEvidence: Evidence = {
        id: uuidv4(),
        text: evidenceInput.trim(),
        type: evidenceType
      };
      setEvidence([...evidence, newEvidence]);
      setEvidenceInput('');
    }
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence(evidence.filter(e => e.id !== id));
  };
  
  const handleAddCriteria = () => {
    if (criteriaInput.trim()) {
      const newCriteria: SuccessCriteria = {
        id: uuidv4(),
        text: criteriaInput.trim()
      };
      setSuccessCriteria([...successCriteria, newCriteria]);
      setCriteriaInput('');
    }
  };
  
  const handleRemoveCriteria = (id: string) => {
    setSuccessCriteria(successCriteria.filter(sc => sc.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge variant="success">Validated</Badge>;
      case 'invalidated':
        return <Badge variant="destructive">Invalidated</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'validated':
        return "This hypothesis has been confirmed by evidence";
      case 'invalidated':
        return "This hypothesis has been disproven by evidence";
      default:
        return "This hypothesis has not yet been tested";
    }
  };

  return (
    <ValidationForm
      title={isEditing ? "Edit Hypothesis" : "Create Hypothesis"}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={handleFormSubmit}
      submitLabel={isEditing ? "Update" : "Save"}
    >
      <Card className="p-4 border border-blue-100 bg-blue-50/30 mb-4">
        <div className="flex items-start gap-3">
          <Beaker className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Crafting an Effective Hypothesis</h3>
            <p className="text-xs text-blue-700">
              A good hypothesis is specific, testable, and addresses a clear user or business need. It should state a relationship between variables that can be measured through experiments.
            </p>
          </div>
        </div>
      </Card>

      <FormField
        control={form.control}
        name="statement"
        rules={{ required: "Statement is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Hypothesis Statement <Badge variant="outline" className="ml-1 text-xs font-normal">Required</Badge>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., 'Users prefer minimal onboarding for simple tasks'" 
                {...field} 
                ref={titleRef}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Clear and specific statement of what you believe to be true
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Hypothesis Status
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Update the status based on the evidence you've collected. Only mark as validated or invalidated when you have sufficient evidence.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
            </FormControl>
              <SelectContent>
                <SelectItem value="unverified">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Unverified</Badge>
                    <span className="text-xs text-muted-foreground">Not yet tested</span>
                  </div>
                </SelectItem>
                <SelectItem value="validated">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Validated</Badge>
                    <span className="text-xs text-muted-foreground">Confirmed by evidence</span>
                  </div>
                </SelectItem>
                <SelectItem value="invalidated">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Invalidated</Badge>
                    <span className="text-xs text-muted-foreground">Disproven by evidence</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription className="text-xs">{getStatusDescription(status)}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Accordion type="single" collapsible className="w-full border rounded-md mb-4">
        <AccordionItem value="assumptions" className="border-none">
          <AccordionTrigger className="px-4 py-2 text-sm font-medium">
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              <span>Underlying Assumptions</span>
              <Badge variant="outline" className="ml-1">{assumptions.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              List the key assumptions that your hypothesis is based on. These are beliefs that, if proven wrong, would weaken your hypothesis.
            </p>
            
            <div className="flex items-center mb-2">
              <Input
                placeholder="e.g., Users value speed over completeness"
                value={assumptionInput}
                onChange={(e) => setAssumptionInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddAssumption)}
                className="flex-1 mr-2"
                ref={assumptionInputRef}
              />
              <Button type="button" variant="outline" onClick={handleAddAssumption}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-2 mt-2">
              {assumptions.map((assumption) => (
                <div key={assumption.id} className="flex items-start p-2 bg-gray-50 rounded-md">
                  <div className="flex-1 text-sm">{assumption.text}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => handleRemoveAssumption(assumption.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {assumptions.length === 0 && (
                <p className="text-xs text-muted-foreground">No assumptions added yet. Identifying key assumptions helps clarify thinking.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible className="w-full border rounded-md mb-4">
        <AccordionItem value="evidence" className="border-none">
          <AccordionTrigger className="px-4 py-2 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Evidence</span>
              <div className="flex gap-1 ml-1">
                {evidenceCount.supporting > 0 && <Badge variant="success">{evidenceCount.supporting} Supporting</Badge>}
                {evidenceCount.contradicting > 0 && <Badge variant="destructive">{evidenceCount.contradicting} Contradicting</Badge>}
                {evidence.length === 0 && <Badge variant="outline">None</Badge>}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              Record evidence that supports or contradicts your hypothesis. This could be from user research, analytics, or experiments.
            </p>
            
            <div className="space-y-2 mb-2">
              <div className="flex items-center gap-2">
                <Select 
                  value={evidenceType}
                  onValueChange={(value) => setEvidenceType(value as 'supporting' | 'contradicting')}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supporting">Supporting</SelectItem>
                    <SelectItem value="contradicting">Contradicting</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="e.g., 8/10 users completed task without help"
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleAddEvidence)}
                  className="flex-1"
                />
                
                <Button type="button" variant="outline" onClick={handleAddEvidence}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            {evidence.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium mb-2">Collected Evidence</h4>
                
                {evidence.filter(e => e.type === 'supporting').length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-xs font-medium text-green-700 mb-1">Supporting Evidence</h5>
                    {evidence.filter(e => e.type === 'supporting').map((item) => (
                      <div key={item.id} className="flex items-start p-2 bg-green-50 border border-green-100 rounded-md mb-1">
                        <div className="flex-1 text-sm">{item.text}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1"
                          onClick={() => handleRemoveEvidence(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {evidence.filter(e => e.type === 'contradicting').length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-red-700 mb-1">Contradicting Evidence</h5>
                    {evidence.filter(e => e.type === 'contradicting').map((item) => (
                      <div key={item.id} className="flex items-start p-2 bg-red-50 border border-red-100 rounded-md mb-1">
                        <div className="flex-1 text-sm">{item.text}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1"
                          onClick={() => handleRemoveEvidence(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {evidence.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No evidence added yet. Add evidence as you gather it from your research and experiments.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible className="w-full border rounded-md mb-4">
        <AccordionItem value="success_criteria" className="border-none">
          <AccordionTrigger className="px-4 py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              <span>Success Criteria</span>
              <Badge variant="outline" className="ml-1">{successCriteria.length}</Badge>
                  </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              Define the criteria for success for your hypothesis. These are the conditions that must be met for your hypothesis to be considered successful.
            </p>
            
            <div className="flex items-center mb-2">
              <Input
                placeholder="e.g., 'Users complete task within 5 minutes'"
                value={criteriaInput}
                onChange={(e) => setCriteriaInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddCriteria)}
                className="flex-1 mr-2"
              />
              <Button type="button" variant="outline" onClick={handleAddCriteria}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
                  </div>
            
            <div className="space-y-2 mt-2">
              {successCriteria.map((criteria) => (
                <div key={criteria.id} className="flex items-start p-2 bg-gray-50 rounded-md">
                  <div className="flex-1 text-sm">{criteria.text}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => handleRemoveCriteria(criteria.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  </div>
              ))}
              
              {successCriteria.length === 0 && (
                <p className="text-xs text-muted-foreground">No success criteria added yet. Defining success criteria helps ensure clarity and alignment.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Recommendation based on evidence and status */}
      {hasEvidence && status !== 'unverified' && (
        <Card className="p-3 mt-4 border border-blue-100 bg-blue-50/30">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Next Steps</h3>
              <p className="text-xs text-blue-700">
                {status === 'validated' 
                  ? "This hypothesis has been validated. Consider implementing the solution or moving forward with development based on these findings."
                  : "This hypothesis has been invalidated. Consider revisiting your assumptions and exploring alternative approaches."}
              </p>
            </div>
          </div>
        </Card>
      )}
    </ValidationForm>
  );
}; 