import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EditableField } from '../shared/EditableField';
import { SectionProps } from '../../types/brand-essentials.types';
import { cn } from '@/lib/utils';

export function CoreIdentityForm({ data, isEditing, onUpdate, className }: SectionProps) {
  const handleFieldChange = (field: string) => (value: string) => {
    onUpdate({ [field]: value });
  };

  const validateRequired = (value: string) => {
    return value.trim() === '' ? 'This field is required' : null;
  };

  const validateLength = (min: number, max: number) => (value: string) => {
    if (value.trim() === '') return 'This field is required';
    if (value.length < min) return `Must be at least ${min} characters`;
    if (value.length > max) return `Must be less than ${max} characters`;
    return null;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Core Identity</CardTitle>
        <CardDescription>Define your brand's name, tagline, mission, and vision.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            label="Brand Name"
            name="name"
            value={data.name}
            onChange={handleFieldChange('name')}
            isEditing={isEditing}
            placeholder="Enter your brand name"
            validation={validateRequired}
            required
          />
          
          <EditableField
            label="Tagline"
            name="tagline"
            value={data.tagline}
            onChange={handleFieldChange('tagline')}
            isEditing={isEditing}
            placeholder="Enter your brand tagline"
            helperText="A memorable phrase that captures your brand's essence"
            validation={validateLength(5, 100)}
            required
          />
        </div>
        
        <Separator />
        
        <EditableField
          label="Mission Statement"
          name="mission"
          value={data.mission}
          onChange={handleFieldChange('mission')}
          isEditing={isEditing}
          type="textarea"
          placeholder="Why does your brand exist? What purpose does it serve?"
          helperText="Your mission statement should clearly articulate your brand's purpose and goals"
          validation={validateLength(20, 500)}
          required
          aiSuggestions
        />
        
        <EditableField
          label="Vision Statement"
          name="vision"
          value={data.vision}
          onChange={handleFieldChange('vision')}
          isEditing={isEditing}
          type="textarea"
          placeholder="What future does your brand want to create?"
          helperText="Your vision statement should paint a picture of the future your brand aims to create"
          validation={validateLength(20, 500)}
          required
          aiSuggestions
        />
        
        <EditableField
          label="Unique Value Proposition"
          name="uniqueValueProposition"
          value={data.uniqueValueProposition}
          onChange={handleFieldChange('uniqueValueProposition')}
          isEditing={isEditing}
          type="textarea"
          placeholder="What makes your brand different? Why should customers choose you?"
          helperText="Clearly articulate the unique benefits and value your brand offers to customers"
          validation={validateLength(20, 300)}
          required
          aiSuggestions
        />
      </CardContent>
    </Card>
  );
} 