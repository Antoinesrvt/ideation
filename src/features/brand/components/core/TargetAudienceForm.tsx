import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { SectionProps, AudienceSegment } from '../../types/brand-essentials.types';
import { cn } from '@/lib/utils';

const defaultSegment: AudienceSegment = {
  id: '',
  name: '',
  description: '',
  color: '#6B7280',
  size: 0,
  needs: [],
  painPoints: [],
  channels: [],
  marketSize: 0,
  priority: 1,
  growthRate: 0
};

const predefinedColors = [
  '#0066FF', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export function TargetAudienceForm({ data, isEditing, onUpdate, className }: SectionProps) {
  const [editingSegment, setEditingSegment] = useState<AudienceSegment | null>(null);
  const [newSegment, setNewSegment] = useState<AudienceSegment>({
    ...defaultSegment,
    color: predefinedColors[0]
  });
  const [newItem, setNewItem] = useState('');
  const [activeField, setActiveField] = useState<'needs' | 'painPoints' | 'channels' | null>(null);

  const handleAddSegment = () => {
    if (newSegment.name.trim() === '' || newSegment.description.trim() === '') return;

    const segmentToAdd: AudienceSegment = {
      ...newSegment,
      id: `segment-${Date.now()}`,
      color: predefinedColors[data.targetAudience.length % predefinedColors.length]
    };

    onUpdate({
      targetAudience: [...data.targetAudience, segmentToAdd]
    });

    setNewSegment({
      ...defaultSegment,
      color: predefinedColors[(data.targetAudience.length + 1) % predefinedColors.length]
    });
  };

  const handleUpdateSegment = () => {
    if (!editingSegment) return;
    if (editingSegment.name.trim() === '' || editingSegment.description.trim() === '') return;

    onUpdate({
      targetAudience: data.targetAudience.map(s => 
        s.id === editingSegment.id ? editingSegment : s
      )
    });

    setEditingSegment(null);
  };

  const handleRemoveSegment = (id: string) => {
    onUpdate({
      targetAudience: data.targetAudience.filter(s => s.id !== id)
    });
  };

  const handleAddItem = (segmentId: string, field: 'needs' | 'painPoints' | 'channels') => {
    if (!newItem.trim()) return;

    onUpdate({
      targetAudience: data.targetAudience.map(s => 
        s.id === segmentId 
          ? { ...s, [field]: [...s[field], newItem.trim()] }
          : s
      )
    });

    setNewItem('');
    setActiveField(null);
  };

  const handleRemoveItem = (segmentId: string, field: 'needs' | 'painPoints' | 'channels', index: number) => {
    onUpdate({
      targetAudience: data.targetAudience.map(s => 
        s.id === segmentId 
          ? { ...s, [field]: s[field].filter((_, i) => i !== index) }
          : s
      )
    });
  };

  const renderItemList = (
    items: string[], 
    segmentId: string, 
    field: 'needs' | 'painPoints' | 'channels',
    label: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">{label}</h4>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setActiveField(field)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className="py-1 px-2"
            >
              {item}
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 text-gray-400 hover:text-red-600"
                  onClick={() => handleRemoveItem(segmentId, field, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No {label.toLowerCase()} defined</p>
      )}

      {isEditing && activeField === field && (
        <div className="flex items-center space-x-2 mt-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Add ${label.toLowerCase()}...`}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => handleAddItem(segmentId, field)}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Target Audience</CardTitle>
        <CardDescription>Define who your brand serves and communicates with.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.targetAudience.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {data.targetAudience.map((segment) => (
                <div
                  key={segment.id}
                  className="border rounded-lg p-4 relative space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{segment.name}</h3>
                      <p className="text-sm text-gray-600">{segment.description}</p>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: segment.color }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderItemList(segment.needs, segment.id, 'needs', 'Needs')}
                    {renderItemList(segment.painPoints, segment.id, 'painPoints', 'Pain Points')}
                    {renderItemList(segment.channels, segment.id, 'channels', 'Channels')}
                  </div>

                  {isEditing && (
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-blue-600"
                        onClick={() => setEditingSegment(segment)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-red-600"
                        onClick={() => handleRemoveSegment(segment.id)}
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
              No target audience segments defined yet.
              {isEditing && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewSegment({ ...defaultSegment })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Segment
                  </Button>
                </div>
              )}
            </div>
          )}

          {isEditing && !editingSegment && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Add New Segment</h4>
              <div className="space-y-3">
                <div>
                  <Input
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    placeholder="Segment name (e.g., Small Business Owners)"
                  />
                </div>
                <div>
                  <Textarea
                    value={newSegment.description}
                    onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                    placeholder="Describe this audience segment"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={newSegment.marketSize || ''}
                      onChange={(e) => setNewSegment({ 
                        ...newSegment, 
                        marketSize: parseInt(e.target.value) || 0 
                      })}
                      placeholder="Market size"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={newSegment.growthRate || ''}
                      onChange={(e) => setNewSegment({ 
                        ...newSegment, 
                        growthRate: parseInt(e.target.value) || 0 
                      })}
                      placeholder="Growth rate (%)"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddSegment}
                  disabled={!newSegment.name || !newSegment.description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Segment
                </Button>
              </div>
            </div>
          )}

          {isEditing && editingSegment && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Edit Segment</h4>
              <div className="space-y-3">
                <div>
                  <Input
                    value={editingSegment.name}
                    onChange={(e) => setEditingSegment({ ...editingSegment, name: e.target.value })}
                    placeholder="Segment name"
                  />
                </div>
                <div>
                  <Textarea
                    value={editingSegment.description}
                    onChange={(e) => setEditingSegment({ ...editingSegment, description: e.target.value })}
                    placeholder="Segment description"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={editingSegment.marketSize || ''}
                      onChange={(e) => setEditingSegment({ 
                        ...editingSegment, 
                        marketSize: parseInt(e.target.value) || 0 
                      })}
                      placeholder="Market size"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={editingSegment.growthRate || ''}
                      onChange={(e) => setEditingSegment({ 
                        ...editingSegment, 
                        growthRate: parseInt(e.target.value) || 0 
                      })}
                      placeholder="Growth rate (%)"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingSegment(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSegment}
                    disabled={!editingSegment.name || !editingSegment.description}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Segment
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