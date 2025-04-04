import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  ChevronDown, 
  Info, 
  Link, 
  Plus, 
  Save, 
  Tag, 
  TrendingDown, 
  TrendingUp, 
  X, 
  Zap 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TrendFormValues } from '../../types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export interface TrendFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TrendFormValues) => void;
  initialData?: Partial<TrendFormValues>;
  title?: string;
}

export function TrendForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  title = 'Add Market Trend' 
}: TrendFormProps) {
  const [formData, setFormData] = useState<TrendFormValues>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    trend_type: initialData?.trend_type || 'neutral',
    direction: initialData?.direction || 'stable',
    tags: initialData?.tags || [],
    sources: initialData?.sources || [],
    impact_score: initialData?.impact_score || 5,
    timeframe: initialData?.timeframe || 'medium',
    confidence: initialData?.confidence || 3,
    related_segments: initialData?.related_segments || [],
    related_personas: initialData?.related_personas || [],
    related_trends: initialData?.related_trends || [],
    status: initialData?.status || 'emerging',
    opportunity_size: initialData?.opportunity_size || 0,
  });
  
  // Input states for array fields
  const [newTag, setNewTag] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newSegment, setNewSegment] = useState('');
  const [newPersona, setNewPersona] = useState('');
  const [newRelatedTrend, setNewRelatedTrend] = useState('');
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData?.name || '',
        description: initialData?.description || '',
        trend_type: initialData?.trend_type || 'neutral',
        direction: initialData?.direction || 'stable',
        tags: initialData?.tags || [],
        sources: initialData?.sources || [],
        impact_score: initialData?.impact_score || 5,
        timeframe: initialData?.timeframe || 'medium',
        confidence: initialData?.confidence || 3,
        related_segments: initialData?.related_segments || [],
        related_personas: initialData?.related_personas || [],
        related_trends: initialData?.related_trends || [],
        status: initialData?.status || 'emerging',
        opportunity_size: initialData?.opportunity_size || 0,
      });
      setNewTag('');
      setNewSource('');
      setNewSegment('');
      setNewPersona('');
      setNewRelatedTrend('');
    }
  }, [open, initialData]);
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle number input changes
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle slider changes
  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value[0]
    }));
  };
  
  // Array field handlers
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const addSource = () => {
    if (newSource.trim() && !formData.sources.includes(newSource.trim())) {
      setFormData(prev => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()]
      }));
      setNewSource('');
    }
  };
  
  const addSegment = () => {
    if (newSegment.trim() && !formData.related_segments?.includes(newSegment.trim())) {
      setFormData(prev => ({
        ...prev,
        related_segments: [...(prev.related_segments || []), newSegment.trim()]
      }));
      setNewSegment('');
    }
  };
  
  const addPersona = () => {
    if (newPersona.trim() && !formData.related_personas?.includes(newPersona.trim())) {
      setFormData(prev => ({
        ...prev,
        related_personas: [...(prev.related_personas || []), newPersona.trim()]
      }));
      setNewPersona('');
    }
  };
  
  const addRelatedTrend = () => {
    if (newRelatedTrend.trim() && !formData.related_trends?.includes(newRelatedTrend.trim())) {
      setFormData(prev => ({
        ...prev,
        related_trends: [...(prev.related_trends || []), newRelatedTrend.trim()]
      }));
      setNewRelatedTrend('');
    }
  };
  
  // Remove handlers
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  const removeSource = (source: string) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s !== source)
    }));
  };
  
  const removeSegment = (segment: string) => {
    setFormData(prev => ({
      ...prev,
      related_segments: (prev.related_segments || []).filter(s => s !== segment)
    }));
  };
  
  const removePersona = (persona: string) => {
    setFormData(prev => ({
      ...prev,
      related_personas: (prev.related_personas || []).filter(p => p !== persona)
    }));
  };
  
  const removeRelatedTrend = (trend: string) => {
    setFormData(prev => ({
      ...prev,
      related_trends: (prev.related_trends || []).filter(t => t !== trend)
    }));
  };
  
  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add a new market trend to track and analyze its impact on your business.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-base font-medium mb-3">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Trend Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter a name for this trend"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trend_type">Trend Type</Label>
                    <Select
                      value={formData.trend_type}
                      onValueChange={(value) => handleSelectChange('trend_type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opportunity" className="flex items-center">
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 text-green-500 mr-2" />
                            Opportunity
                          </div>
                        </SelectItem>
                        <SelectItem value="threat">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                            Threat
                          </div>
                        </SelectItem>
                        <SelectItem value="neutral">
                          <div className="flex items-center">
                            <Info className="h-4 w-4 text-blue-500 mr-2" />
                            Neutral
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="direction">Direction</Label>
                    <Select
                      value={formData.direction}
                      onValueChange={(value) => handleSelectChange('direction', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upward">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                            Upward
                          </div>
                        </SelectItem>
                        <SelectItem value="downward">
                          <div className="flex items-center">
                            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                            Downward
                          </div>
                        </SelectItem>
                        <SelectItem value="stable">
                          <div className="flex items-center">
                            <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                            Stable
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the trend in detail"
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Analysis & Impact */}
            <div>
              <h3 className="text-base font-medium mb-3">Analysis & Impact</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="impact_score">Impact Score (1-10)</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-4">
                        <Slider 
                          id="impact_score"
                          min={1} 
                          max={10} 
                          step={1}
                          value={[formData.impact_score ?? 5]}
                          onValueChange={(value) => handleSliderChange('impact_score', value)}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">{formData.impact_score}/10</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Low Impact</span>
                        <span>High Impact</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confidence">Confidence Level (1-5)</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-4">
                        <Slider 
                          id="confidence"
                          min={1} 
                          max={5} 
                          step={1}
                          value={[formData.confidence ?? 3]}
                          onValueChange={(value) => handleSliderChange('confidence', value)}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">{formData.confidence}/5</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Low Confidence</span>
                        <span>High Confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <RadioGroup 
                      value={formData.timeframe} 
                      onValueChange={(value) => handleSelectChange('timeframe', value)}
                      className="flex space-x-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="short" id="timeframe-short" />
                        <Label htmlFor="timeframe-short" className="cursor-pointer">Short-term</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="timeframe-medium" />
                        <Label htmlFor="timeframe-medium" className="cursor-pointer">Medium-term</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="long" id="timeframe-long" />
                        <Label htmlFor="timeframe-long" className="cursor-pointer">Long-term</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <RadioGroup 
                      value={formData.status} 
                      onValueChange={(value) => handleSelectChange('status', value)}
                      className="flex space-x-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="emerging" id="status-emerging" />
                        <Label htmlFor="status-emerging" className="cursor-pointer">Emerging</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="established" id="status-established" />
                        <Label htmlFor="status-established" className="cursor-pointer">Established</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="declining" id="status-declining" />
                        <Label htmlFor="status-declining" className="cursor-pointer">Declining</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="opportunity_size">Market Opportunity Size (USD)</Label>
                  <Input
                    id="opportunity_size"
                    name="opportunity_size"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.opportunity_size}
                    onChange={handleNumberInputChange}
                    placeholder="e.g., 1000000"
                    className="mt-1"
                  />
                  {formData.opportunity_size !== undefined && formData.opportunity_size > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(formData.opportunity_size)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Relationships & Context */}
            <div>
              <h3 className="text-base font-medium mb-3">Relationships & Context</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Related Market Segments</Label>
                    <div className="text-xs text-muted-foreground">
                      {(formData.related_segments || []).length} segment(s)
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={newSegment}
                      onChange={(e) => setNewSegment(e.target.value)}
                      placeholder="Add a market segment"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSegment();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={addSegment}
                      disabled={!newSegment.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {(formData.related_segments || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.related_segments || []).map((segment) => (
                        <Badge 
                          key={segment} 
                          variant="secondary"
                          className="flex items-center gap-1 bg-blue-100 text-blue-700"
                        >
                          {segment}
                          <button 
                            type="button"
                            onClick={() => removeSegment(segment)} 
                            className="ml-1 text-blue-500 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Related Customer Personas</Label>
                    <div className="text-xs text-muted-foreground">
                      {(formData.related_personas || []).length} persona(s)
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={newPersona}
                      onChange={(e) => setNewPersona(e.target.value)}
                      placeholder="Add a customer persona"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addPersona();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={addPersona}
                      disabled={!newPersona.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {(formData.related_personas || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.related_personas || []).map((persona) => (
                        <Badge 
                          key={persona} 
                          variant="secondary"
                          className="flex items-center gap-1 bg-purple-100 text-purple-700"
                        >
                          {persona}
                          <button 
                            type="button"
                            onClick={() => removePersona(persona)} 
                            className="ml-1 text-purple-500 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Related Trends</Label>
                    <div className="text-xs text-muted-foreground">
                      {(formData.related_trends || []).length} trend(s)
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={newRelatedTrend}
                      onChange={(e) => setNewRelatedTrend(e.target.value)}
                      placeholder="Add a related trend"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRelatedTrend();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={addRelatedTrend}
                      disabled={!newRelatedTrend.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {(formData.related_trends || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.related_trends || []).map((trend) => (
                        <Badge 
                          key={trend} 
                          variant="secondary"
                          className="flex items-center gap-1 bg-green-100 text-green-700"
                        >
                          {trend}
                          <button 
                            type="button"
                            onClick={() => removeRelatedTrend(trend)} 
                            className="ml-1 text-green-500 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Metadata */}
            <div>
              <h3 className="text-base font-medium mb-3">Metadata</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Sources</Label>
                    <div className="text-xs text-muted-foreground">
                      {formData.sources.length} source(s)
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      placeholder="Add a source (URL, publication, etc.)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSource();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={addSource}
                      disabled={!newSource.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.sources.map((source) => (
                        <Badge 
                          key={source} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {source}
                          <button 
                            type="button"
                            onClick={() => removeSource(source)} 
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Tags</Label>
                    <div className="text-xs text-muted-foreground">
                      {formData.tags.length} tag(s)
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={addTag}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="flex items-center gap-1 bg-gray-100"
                        >
                          {tag}
                          <button 
                            type="button"
                            onClick={() => removeTag(tag)} 
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Trend
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 