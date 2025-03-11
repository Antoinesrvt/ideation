import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditableFieldProps } from '../../types/brand-essentials.types';
import { toast } from '@/components/ui/use-toast';

export function EditableField({
  label,
  value,
  name,
  isEditing,
  onChange,
  placeholder,
  helperText,
  validation,
  type = 'input',
  className,
  required = false,
  aiSuggestions = false
}: EditableFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (validation) {
      const validationError = validation(newValue);
      setError(validationError);
    }
    onChange(newValue);
  };

  const handleGenerateAISuggestion = async () => {
    setIsGenerating(true);
    try {
      // Here you would integrate with your AI service
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "AI Suggestion Generated",
        description: "We've generated a suggestion based on your brand context."
      });
    } catch (error) {
      toast({
        title: "Failed to generate suggestion",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {aiSuggestions && isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleGenerateAISuggestion}
            disabled={isGenerating}
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Suggest
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-1">
          {type === 'textarea' ? (
            <Textarea
              name={name}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className={cn(error && "border-red-500")}
            />
          ) : (
            <Input
              name={name}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className={cn(error && "border-red-500")}
            />
          )}
          {helperText && !error && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      ) : (
        <div className="p-3 bg-gray-50 rounded-md">
          {value || <span className="text-muted-foreground italic">Not set</span>}
        </div>
      )}
    </div>
  );
} 