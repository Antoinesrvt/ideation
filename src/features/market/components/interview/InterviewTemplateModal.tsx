import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Insert } from '@/store/types';
import { useInterviewService } from '@/lib/hooks';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  X, 
  Trash2, 
  PlusCircle, 
  GripVertical,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  FileEdit,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InterviewAIChat } from './InterviewAIChat';
import {
  Question,
  RuntimeTemplate,
  validateQuestion,
  sanitizeQuestions
} from '@/lib/utils/interview-utils';

interface InterviewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  templateId?: string; // If provided, we're editing an existing template
}

export function InterviewTemplateModal({
  isOpen,
  onClose,
  projectId,
  templateId
}: InterviewTemplateModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'basic' | 'editor'>('basic');
  const [template, setTemplate] = useState<{
    id?: string;
    name: string;
    description: string;
    category?: string;
    estimated_duration?: number;
    questions: Question[];
  }>({
    name: '',
    description: '',
    category: 'general',
    estimated_duration: 30,
    questions: []
  });

  const { 
    data,
    isLoading: serviceLoading,
    error: serviceError,
    createTemplate, 
    updateTemplate, 
    fetchTemplates,
    fetchAllData
  } = useInterviewService(projectId);

  // If editing an existing template, fetch it
  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId && isOpen) {
        setIsLoading(true);
        try {
          const templates = await fetchTemplates(projectId) || [];
          const existingTemplate = templates.find(t => t.id === templateId);
          
          if (existingTemplate) {
            // Runtime templates already have questions as an array
            setTemplate({
              id: existingTemplate.id,
              name: existingTemplate.name || '',
              description: existingTemplate.description || '',
              category: existingTemplate.category || 'general',
              estimated_duration: existingTemplate.estimated_duration || 30,
              questions: existingTemplate.questions || []
            });
            
            // If editing, skip to editor step
            setCurrentStep('editor');
          }
        } catch (error) {
          console.error('Error fetching template:', error);
          toast({
            title: 'Error',
            description: 'Failed to load the interview template',
            variant: 'destructive'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [templateId, isOpen, projectId, fetchTemplates, toast]);

  // Reset form when modal is opened
  useEffect(() => {
    if (!isOpen && !templateId) {
      setTemplate({
        name: '',
        description: '',
        category: 'general',
        estimated_duration: 30,
        questions: []
      });
      setCurrentStep('basic');
    }
  }, [isOpen, templateId]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      text: '',
      type: 'open',
      required: true,
      order: template.questions.length
    };
    
    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleRemoveQuestion = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id).map((q, index) => ({
        ...q,
        order: index
      }))
    }));
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === id) {
          return { ...q, [field]: value };
        }
        return q;
      })
    }));
  };

  const handleMoveQuestion = (id: string, direction: 'up' | 'down') => {
    const questionIndex = template.questions.findIndex(q => q.id === id);
    if (questionIndex === -1) return;
    
    const newQuestions = [...template.questions];
    
    if (direction === 'up' && questionIndex > 0) {
      // Swap with the question above
      [newQuestions[questionIndex], newQuestions[questionIndex - 1]] = 
      [newQuestions[questionIndex - 1], newQuestions[questionIndex]];
    } else if (direction === 'down' && questionIndex < newQuestions.length - 1) {
      // Swap with the question below
      [newQuestions[questionIndex], newQuestions[questionIndex + 1]] = 
      [newQuestions[questionIndex + 1], newQuestions[questionIndex]];
    }
    
    // Update order values
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index
    }));
    
    setTemplate(prev => ({
      ...prev,
      questions: reorderedQuestions
    }));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const options = [...(q.options || [])];
          options[optionIndex] = value;
          return { ...q, options };
        }
        return q;
      })
    }));
  };

  const handleAddOption = (questionId: string) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const options = [...(q.options || []), ''];
          return { ...q, options };
        }
        return q;
      })
    }));
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const options = [...(q.options || [])];
          options.splice(optionIndex, 1);
          return { ...q, options };
        }
        return q;
      })
    }));
  };

  const handleSaveTemplate = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project ID provided",
        variant: "destructive",
      });
      return;
    }

    if (!template.name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    const validQuestions = sanitizeQuestions(template.questions);
    
    if (validQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one question with text",
        variant: "destructive",
      });
      return;
    }

    // Check for invalid multiple choice questions
    const invalidMultipleChoice = validQuestions.some(q => 
      q.type === 'multiple_choice' && (!q.options || q.options.length < 2)
    );
    
    if (invalidMultipleChoice) {
      toast({
        title: "Error",
        description: "Multiple choice questions must have at least 2 options",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare the template data using our clean template object
      const templateData: Partial<RuntimeTemplate> = {
        project_id: projectId,
        name: template.name,
        description: template.description || '',
        category: template.category || 'general', 
        estimated_duration: template.estimated_duration || 30,
        questions: validQuestions, // Using our sanitized questions
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving template with data:', JSON.stringify(templateData));
      
      // Add additional debugging info about project context
      console.log('Project context:', {
        projectId,
        templateId: template.id,
        action: template.id ? 'update' : 'create'
      });
      
      let savedTemplate;
      
      if (template.id) {
        // Update existing template
        savedTemplate = await updateTemplate(template.id, templateData);
      } else {
        // Create new template
        savedTemplate = await createTemplate(projectId, templateData);
      }
      
      if (!savedTemplate) {
        throw new Error('Failed to save template - no response returned');
      }
      
      console.log('Template saved successfully:', savedTemplate.id);
      
      toast({
        title: `Template ${template.id ? "updated" : "created"}`,
        description: "Your interview template has been saved",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error saving template:", error);
      
      // More detailed error analysis
      const errorStr = error.toString();
      let errorMessage = "Failed to save template";
      let errorDetails = '';
      
      if (errorStr.includes("42501") || errorStr.includes("row-level security policy")) {
        errorMessage = "Permission denied. Please check your access rights.";
        errorDetails = 'This could be due to:';
        errorDetails += '\n- Your user session might have expired';
        errorDetails += '\n- You might not have access to this project';
        errorDetails += '\n- Database RLS policies are blocking this operation';
      } else if (errorStr.includes("authentication")) {
        errorMessage = "Authentication error. Please sign in again.";
      } else if (errorStr.includes("not found") || errorStr.includes("does not exist")) {
        errorMessage = "Resource not found.";
        errorDetails = 'The project or related database table might not exist.';
      } else if (errorStr.includes("foreign key constraint")) {
        errorMessage = "Reference error. The template references a resource you don't have access to.";
      }
      
      console.error(`${errorMessage} ${errorDetails}`, {
        error: errorStr,
        projectId
      });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Move to next step
  const handleNext = () => {
    if (currentStep === 'basic') {
      setCurrentStep('editor');
    }
  };

  // Skip basic step and go directly to editor
  const handleSkip = () => {
    setCurrentStep('editor');
  };

  // Go back to basic step
  const handleBack = () => {
    if (currentStep === 'editor') {
      setCurrentStep('basic');
    }
  };

  // Handle AI suggestion for a question
  const handleAISuggestion = (suggestion: string, questionId?: string) => {
    if (questionId) {
      // Update an existing question
      handleQuestionChange(questionId, 'text', suggestion);
    } else {
      // Add a new question with the suggestion
      const newQuestion: Question = {
        id: `question-${Date.now()}`,
        text: suggestion,
        type: 'open',
        required: true,
        order: template.questions.length
      };
      
      setTemplate(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {templateId ? 'Edit Interview Template' : 'Create New Interview Template'}
          </DialogTitle>
        </DialogHeader>
        
        {currentStep === 'basic' ? (
          // Step 1: Basic Information
          <div className="flex flex-col flex-grow py-4">
            <div className="space-y-6 mx-auto w-full max-w-2xl flex-grow">
              <div>
                <Label htmlFor="template-name" className="text-base">Template Name</Label>
                <Input
                  id="template-name"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Customer Discovery Interview"
                  className="mt-2 text-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="template-description" className="text-base">Description</Label>
                <Textarea
                  id="template-description"
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this interview template for?"
                  rows={5}
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="template-category" className="text-base">Category</Label>
                  <Select
                    value={template.category}
                    onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="template-category" className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="customer_discovery">Customer Discovery</SelectItem>
                      <SelectItem value="problem_interview">Problem Interview</SelectItem>
                      <SelectItem value="solution_interview">Solution Interview</SelectItem>
                      <SelectItem value="user_testing">User Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="template-duration" className="text-base">Estimated Duration (minutes)</Label>
                  <Input
                    id="template-duration"
                    type="number"
                    min={1}
                    value={template.estimated_duration}
                    onChange={(e) => setTemplate(prev => ({ 
                      ...prev, 
                      estimated_duration: parseInt(e.target.value) || undefined 
                    }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-8">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Step 2: Template Editor with AI
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-hidden flex-grow">
            {/* Left side (AI Assistant) - 2/5 width on medium screens and above */}
            <div className="md:col-span-2 bg-muted/20 rounded-md border overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-b bg-muted/30 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">AI Interview Assistant</span>
              </div>
              <InterviewAIChat 
                projectId={projectId}
                onSuggestion={handleAISuggestion} 
                templateName={template.name}
                questions={template.questions}
                className="flex-grow overflow-hidden"
              />
            </div>
            
            {/* Right side (Template Preview) - 3/5 width on medium screens and above */}
            <div className="md:col-span-3 flex flex-col overflow-hidden border rounded-md">
              <div className="px-4 py-2 border-b bg-muted/20 flex items-center justify-between">
                <div className="flex items-center">
                  <FileEdit className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Template Preview</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddQuestion}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
                
              <ScrollArea className="flex-grow">
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{template.name || 'Untitled Template'}</h3>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground">
                      {template.category && (
                        <span>Category: {template.category.replace('_', ' ')}</span>
                      )}
                      {template.estimated_duration && (
                        <span>Duration: ~{template.estimated_duration} minutes</span>
                      )}
                    </div>
                    <Separator className="my-4" />
                  </div>
                  
                  <div className="space-y-6">
                    {template.questions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileEdit className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>No questions added yet</p>
                        <p className="text-sm mt-2">
                          Add questions manually or use the AI assistant for suggestions
                        </p>
                      </div>
                    ) : (
                      template.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="border rounded-md p-4 space-y-3 bg-card"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="mr-2 p-1 cursor-move">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm font-medium">
                                Question {index + 1}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleMoveQuestion(question.id, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleMoveQuestion(question.id, 'down')}
                                disabled={index === template.questions.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleRemoveQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Question Text */}
                          <div>
                            <Textarea
                              value={question.text}
                              onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                              placeholder="Enter your question"
                              rows={2}
                            />
                          </div>
                          
                          {/* Question Type & Required */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`question-type-${question.id}`}>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value) => handleQuestionChange(
                                  question.id, 
                                  'type', 
                                  value as 'open' | 'multiple_choice' | 'rating' | 'yes_no'
                                )}
                              >
                                <SelectTrigger id={`question-type-${question.id}`}>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open-ended</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                  <SelectItem value="rating">Rating</SelectItem>
                                  <SelectItem value="yes_no">Yes/No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-6">
                              <input
                                type="checkbox"
                                id={`question-required-${question.id}`}
                                checked={question.required}
                                onChange={(e) => handleQuestionChange(
                                  question.id, 
                                  'required', 
                                  e.target.checked
                                )}
                                className="h-4 w-4"
                              />
                              <Label htmlFor={`question-required-${question.id}`}>Required question</Label>
                            </div>
                          </div>
                          
                          {/* Multiple Choice Options */}
                          {question.type === 'multiple_choice' && (
                            <div className="space-y-2 pt-2">
                              <Label>Options</Label>
                              {(question.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => handleOptionChange(
                                      question.id, 
                                      optionIndex, 
                                      e.target.value
                                    )}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-destructive"
                                    onClick={() => handleRemoveOption(question.id, optionIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddOption(question.id)}
                                className="mt-2"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
            
            <DialogFooter className="md:col-span-5">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="mr-auto"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTemplate}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Template'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 