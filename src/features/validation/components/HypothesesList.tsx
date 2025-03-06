import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Lightbulb, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  PlusCircle,
  Percent
} from 'lucide-react';
import { ValidationHypothesis as Hypothesis } from '@/store/types';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

interface HypothesesListProps {
  hypotheses: Hypothesis[];
  onUpdate: (hypothesis: Hypothesis) => void;
  onDelete: (id: string) => void;
}

interface HypothesisFormValues {
  statement: string;
  assumptions: string[];
  validationMethod: string;
  status: 'unvalidated' | 'validated' | 'invalidated';
  confidence: number;
  evidence: string[];
}

export const HypothesesList: React.FC<HypothesesListProps> = ({ 
  hypotheses, 
  onUpdate,
  onDelete
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<Hypothesis | null>(null);
  const [newAssumption, setNewAssumption] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  
  const form = useForm<HypothesisFormValues>({
    defaultValues: {
      statement: '',
      assumptions: [],
      validationMethod: '',
      status: 'unvalidated',
      confidence: 0,
      evidence: []
    }
  });
  
  const handleEdit = (hypothesis: Hypothesis) => {
    setEditingHypothesis(hypothesis);
    
    form.reset({
      statement: hypothesis.statement || '',
      assumptions: hypothesis.assumptions || [],
      validationMethod: hypothesis.validation_method || '',
      status: (hypothesis.status as 'validated' | 'invalidated' | 'unvalidated') || 'unvalidated',
      confidence: hypothesis.confidence || 0,
      evidence: hypothesis.evidence || []
    });
    
    setIsDialogOpen(true);
  };
  
  const handleSave = (values: HypothesisFormValues) => {
    if (!editingHypothesis) return;
    
    const now = new Date().toISOString();
    
    const updatedHypothesis: Hypothesis = {
      ...editingHypothesis,
      ...values,
      updated_at: now
    };
    
    onUpdate(updatedHypothesis);
    setIsDialogOpen(false);
    setEditingHypothesis(null);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this hypothesis?')) {
      onDelete(id);
    }
  };
  
  const getStatusColor = (status: Hypothesis['status']) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'invalidated':
        return 'bg-red-100 text-red-800';
      case 'unvalidated':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: Hypothesis['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'invalidated':
        return <XCircle className="h-3 w-3" />;
      case 'unvalidated':
      default:
        return <HelpCircle className="h-3 w-3" />;
    }
  };
  
  const getConfidenceLevel = (confidence: number) => {
    if (confidence < 30) return 'Low';
    if (confidence < 70) return 'Medium';
    return 'High';
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence < 30) return 'text-red-600';
    if (confidence < 70) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const handleAddAssumption = () => {
    if (!newAssumption.trim()) return;
    
    const currentAssumptions = form.getValues().assumptions || [];
    form.setValue('assumptions', [...currentAssumptions, newAssumption.trim()]);
    setNewAssumption('');
  };
  
  const handleRemoveAssumption = (assumption: string) => {
    const currentAssumptions = form.getValues().assumptions || [];
    form.setValue('assumptions', currentAssumptions.filter(a => a !== assumption));
  };
  
  const handleAddEvidence = () => {
    if (!newEvidence.trim()) return;
    
    const currentEvidence = form.getValues().evidence || [];
    form.setValue('evidence', [...currentEvidence, newEvidence.trim()]);
    setNewEvidence('');
  };
  
  const handleRemoveEvidence = (evidence: string) => {
    const currentEvidence = form.getValues().evidence || [];
    form.setValue('evidence', currentEvidence.filter(e => e !== evidence));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {hypotheses.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Hypotheses Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mb-4">
              Formulate and track your key business hypotheses and their validation status
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Hypothesis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Validation Method</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hypotheses.map((hypothesis: Hypothesis) => (
              <TableRow key={hypothesis.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{hypothesis.statement || "Unnamed hypothesis"}</span>
                    {hypothesis.assumptions && hypothesis.assumptions.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500 mb-1">Key assumptions:</span>
                        <ul className="list-disc list-inside text-xs text-gray-600 ml-1 space-y-0.5">
                          {hypothesis.assumptions.slice(0, 2).map((assumption: string, i: number) => (
                            <li key={i} className="line-clamp-1">{assumption}</li>
                          ))}
                          {hypothesis.assumptions.length > 2 && (
                            <li className="text-gray-500">
                              +{hypothesis.assumptions.length - 2} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 mt-1">
                      Updated {formatDate(hypothesis.updated_at ?? undefined)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(hypothesis.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(hypothesis.status)}
                      {hypothesis.status}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          (hypothesis.confidence ?? 0) < 30 ? 'bg-red-500' :
                          (hypothesis.confidence ?? 0) < 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${hypothesis.confidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs mt-1 ${getConfidenceColor(hypothesis.confidence ?? 0)}`}>
                      {hypothesis.confidence}% - {getConfidenceLevel(hypothesis.confidence ?? 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {hypothesis.validation_method || "Not specified"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(hypothesis)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(hypothesis.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingHypothesis?.statement ? 
                `Edit Hypothesis: ${editingHypothesis.statement.substring(0, 40)}${editingHypothesis.statement.length > 40 ? '...' : ''}` : 
                'New Hypothesis'
              }
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="statement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Lightbulb className="h-4 w-4 text-yellow-500" /> 
                      Hypothesis Statement
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="We believe that..." 
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-blue-500" /> 
                  Key Assumptions
                </FormLabel>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add assumption"
                    value={newAssumption}
                    onChange={(e) => setNewAssumption(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAssumption();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddAssumption}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                
                <div className="max-h-32 overflow-y-auto">
                  <ul className="space-y-1">
                    {form.watch('assumptions')?.map((assumption, index) => (
                      <li key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                        <span className="text-sm flex-1">{assumption}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveAssumption(assumption)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="validationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validation Method</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How will you test this hypothesis?" 
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-1">
                  <Percent className="h-4 w-4 text-gray-500" />
                  Confidence Level: {form.watch('confidence')}%
                </FormLabel>
                <FormField
                  control={form.control}
                  name="confidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          max={100}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className={`${
                            field.value < 30 ? 'accent-red-500' :
                            field.value < 70 ? 'accent-yellow-500' :
                            'accent-green-500'
                          }`}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Low confidence</span>
                        <span>High confidence</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(form.watch('status') === 'validated' || form.watch('status') === 'invalidated') && (
                <div className="space-y-2">
                  <FormLabel className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-green-500" /> 
                    Supporting Evidence
                  </FormLabel>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add evidence"
                      value={newEvidence}
                      onChange={(e) => setNewEvidence(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEvidence();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddEvidence}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="space-y-1">
                      {form.watch('evidence')?.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                          <span className="text-sm flex-1">{item}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveEvidence(item)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button type="submit">Save Hypothesis</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 