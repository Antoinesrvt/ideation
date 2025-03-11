import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { SectionProps, ValueItem } from '../../types/brand-essentials.types';
import { cn } from '@/lib/utils';

const defaultValue: ValueItem = {
  id: '',
  title: '',
  description: '',
  impact: 'medium',
  examples: [],
  metrics: {
    alignment: 0,
    implementation: 0,
    impact: 0
  }
};

export function BrandValuesForm({ data, isEditing, onUpdate, className }: SectionProps) {
  const [editingValue, setEditingValue] = useState<ValueItem | null>(null);
  const [newValue, setNewValue] = useState<ValueItem>({ ...defaultValue });
  const [newExample, setNewExample] = useState('');

  const handleAddValue = () => {
    if (newValue.title.trim() === '' || newValue.description.trim() === '') return;

    const valueToAdd: ValueItem = {
      ...newValue,
      id: `value-${Date.now()}`,
      examples: [],
      metrics: {
        alignment: 0,
        implementation: 0,
        impact: 0
      }
    };

    onUpdate({
      values: [...data.values, valueToAdd]
    });

    setNewValue({ ...defaultValue });
  };

  const handleUpdateValue = () => {
    if (!editingValue) return;
    if (editingValue.title.trim() === '' || editingValue.description.trim() === '') return;

    onUpdate({
      values: data.values.map(v => 
        v.id === editingValue.id ? editingValue : v
      )
    });

    setEditingValue(null);
  };

  const handleRemoveValue = (id: string) => {
    onUpdate({
      values: data.values.filter(v => v.id !== id)
    });
  };

  const handleAddExample = (valueId: string) => {
    if (!newExample.trim()) return;

    onUpdate({
      values: data.values.map(v => 
        v.id === valueId 
          ? { ...v, examples: [...v.examples, newExample.trim()] }
          : v
      )
    });

    setNewExample('');
  };

  const handleRemoveExample = (valueId: string, exampleIndex: number) => {
    onUpdate({
      values: data.values.map(v => 
        v.id === valueId 
          ? { ...v, examples: v.examples.filter((_, i) => i !== exampleIndex) }
          : v
      )
    });
  };

  const getImpactColor = (impact: ValueItem['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Brand Values</CardTitle>
        <CardDescription>Define the core principles that guide your brand.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.values.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.values.map((value) => (
                <div
                  key={value.id}
                  className="border rounded-lg p-4 relative space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{value.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                    </div>
                    <Badge className={cn("ml-2", getImpactColor(value.impact))}>
                      {value.impact} impact
                    </Badge>
                  </div>

                  {value.examples.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Examples</h4>
                      <ul className="space-y-1">
                        {value.examples.map((example, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                            {example}
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-2 text-gray-400 hover:text-red-600"
                                onClick={() => handleRemoveExample(value.id, index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex items-center mt-3 space-x-2">
                      <Input
                        value={newExample}
                        onChange={(e) => setNewExample(e.target.value)}
                        placeholder="Add an example..."
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleAddExample(value.id)}
                      >
                        Add
                      </Button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-blue-600"
                        onClick={() => setEditingValue(value)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-red-600"
                        onClick={() => handleRemoveValue(value.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-lg text-gray-500">
              No brand values defined yet.
              {isEditing && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewValue({ ...defaultValue })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
              )}
            </div>
          )}

          {isEditing && !editingValue && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Add New Value</h4>
              <div className="space-y-3">
                <div>
                  <Input
                    value={newValue.title}
                    onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
                    placeholder="Value title (e.g., Innovation, Quality)"
                  />
                </div>
                <div>
                  <Textarea
                    value={newValue.description}
                    onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
                    placeholder="Describe what this value means for your brand"
                    rows={2}
                  />
                </div>
                <div>
                  <Select
                    value={newValue.impact}
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setNewValue({ ...newValue, impact: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Impact</SelectItem>
                      <SelectItem value="medium">Medium Impact</SelectItem>
                      <SelectItem value="low">Low Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddValue}
                  disabled={!newValue.title || !newValue.description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              </div>
            </div>
          )}

          {isEditing && editingValue && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Edit Value</h4>
              <div className="space-y-3">
                <div>
                  <Input
                    value={editingValue.title}
                    onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                    placeholder="Value title"
                  />
                </div>
                <div>
                  <Textarea
                    value={editingValue.description}
                    onChange={(e) => setEditingValue({ ...editingValue, description: e.target.value })}
                    placeholder="Value description"
                    rows={2}
                  />
                </div>
                <div>
                  <Select
                    value={editingValue.impact}
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setEditingValue({ ...editingValue, impact: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Impact</SelectItem>
                      <SelectItem value="medium">Medium Impact</SelectItem>
                      <SelectItem value="low">Low Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingValue(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateValue}
                    disabled={!editingValue.title || !editingValue.description}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Value
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 