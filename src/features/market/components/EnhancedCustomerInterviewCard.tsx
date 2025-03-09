import React, { useState } from 'react';
import { FileText, CalendarIcon, Info, MessageCircle, Edit, Trash, Save, X, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomerInterviewCardProps } from '../types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface EnhancedCustomerInterviewCardProps extends CustomerInterviewCardProps {
  // Additional props specific to the enhanced version
}

export function EnhancedCustomerInterviewCard({ 
  interview,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: EnhancedCustomerInterviewCardProps) {
  // State for handling edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: interview.name || '',
    contact_email: interview.contact_email || '',
    interview_date: interview.interview_date ? new Date(interview.interview_date).toISOString().split('T')[0] : '',
    notes: interview.notes || '',
    key_insights: interview.key_insights || [],
    sentiment: interview.sentiment || 'neutral'
  });
  
  // New insight input
  const [newInsight, setNewInsight] = useState('');
  
  // Helper functions from original component
  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <MessageCircle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const extractKeyInsights = (notes: string) => {
    if (!notes) return [];
    const insights = [];
    const lines = notes.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        insights.push(trimmed.substring(2));
      }
    }
    return insights;
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Automatically extract key insights from notes
    if (name === 'notes') {
      const insights = extractKeyInsights(value);
      if (insights.length > 0) {
        setFormData(prev => ({
          ...prev,
          key_insights: insights
        }));
      }
    }
  };
  
  // Handle sentiment selection
  const handleSentimentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      sentiment: value as 'positive' | 'neutral' | 'negative'
    }));
  };
  
  // Handle adding new insight
  const addInsight = () => {
    if (newInsight.trim()) {
      setFormData(prev => ({
        ...prev,
        key_insights: [...prev.key_insights, newInsight.trim()]
      }));
      setNewInsight('');
    }
  };
  
  // Handle removing an insight
  const removeInsight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_insights: prev.key_insights.filter((_, i) => i !== index)
    }));
  };
  
  // Handle save
  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        id: interview.id,
        data: {
          name: formData.name,
          contact_email: formData.contact_email,
          interview_date: formData.interview_date ? new Date(formData.interview_date).toISOString() : null,
          notes: formData.notes,
          key_insights: formData.key_insights,
          sentiment: formData.sentiment
        }
      });
    }
    setIsEditing(false);
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: interview.name || '',
      contact_email: interview.contact_email || '',
      interview_date: interview.interview_date ? new Date(interview.interview_date).toISOString().split('T')[0] : '',
      notes: interview.notes || '',
      key_insights: interview.key_insights || [],
      sentiment: interview.sentiment || 'neutral'
    });
    setIsEditing(false);
  };
  
  // View mode content
  const viewContent = (
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="font-heading font-medium text-primary-800">
              {interview.name || 'Unnamed Contact'}
            </h3>
            <p className="text-xs text-dark-500">{interview.company || 'No company provided'}</p>
          </div>
        </div>
        <div className="flex items-center">
          {interview.interview_date && (
            <div className="flex items-center text-xs text-dark-500 mr-3">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDate(interview.interview_date)}
            </div>
          )}
          <Badge variant={getSentimentVariant(interview.sentiment as 'positive' | 'neutral' | 'negative')} className="capitalize">
            {getSentimentIcon(interview.sentiment as 'positive' | 'neutral' | 'negative')}
            <span className="ml-1">{interview.sentiment || 'neutral'}</span>
          </Badge>
        </div>
      </div>
      
      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-gray-100 mb-4 text-sm text-dark-600">
        {interview.notes || 'No interview notes recorded'}
      </div>
      
      <div>
        <div className="flex items-center mb-2">
          <h4 className="text-sm font-medium text-primary-800">Key Insights</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs">
                <p className="text-xs">The most important findings from this customer interview</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-wrap gap-2">
          {interview.key_insights && interview.key_insights.length > 0 ? (
            interview.key_insights.map((insight, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
              >
                {insight}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-dark-400 italic">No key insights recorded</p>
          )}
        </div>
      </div>
      
      {!readOnly && (
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary-700 hover:bg-primary-50"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit Interview
          </Button>
        </div>
      )}
    </CardContent>
  );
  
  // Edit mode content
  const editContent = (
    <CardContent className="p-5">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Contact Name</label>
            <Input 
              name="contact_name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Contact Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Contact Email</label>
            <Input 
              name="contact_email"
              value={formData.contact_email}
              onChange={handleInputChange}
              placeholder="Contact Email"
              type="email"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Interview Date</label>
            <Input 
              name="interview_date"
              value={formData.interview_date}
              onChange={handleInputChange}
              placeholder="Interview Date"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Sentiment</label>
            <Select 
              value={formData.sentiment} 
              onValueChange={handleSentimentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-700">Interview Notes</label>
          <Textarea 
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Interview notes..."
            className="min-h-[120px]"
          />
          <p className="text-xs text-dark-400">
            Tip: Start bullet points with "- " or "* " to automatically extract key insights
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center mb-2">
            <label className="text-sm font-medium text-dark-700">Key Insights</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="max-w-xs">
                  <p className="text-xs">The most important findings from this customer interview</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.key_insights.map((insight, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100 flex items-center gap-1"
              >
                {insight}
                <button 
                  onClick={() => removeInsight(index)}
                  className="ml-1 rounded-full hover:bg-primary-200/50 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input 
              value={newInsight}
              onChange={(e) => setNewInsight(e.target.value)}
              placeholder="Add insight..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInsight();
                }
              }}
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={addInsight}
              disabled={!newInsight.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between gap-3 mt-6 pt-3 border-t border-gray-100">
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-accent-700 hover:bg-accent-50"
            onClick={() => onDelete(interview.id)}
          >
            <Trash className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="text-dark-700"
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleSave}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </CardContent>
  );
  
  return (
    <EnhancedCard
      viewContent={viewContent}
      editContent={editContent}
      isEditing={isEditing}
      variant={
        interview.status === 'new' ? 'gradient' :
        interview.status === 'modified' ? 'elevated' :
        interview.status === 'removed' ? 'outline' :
        'default'
      } 
      className={`transition-all ${
        interview.status === 'new' ? 'border-green-300 from-green-50 to-white' :
        interview.status === 'modified' ? 'border-yellow-300 shadow-yellow-100/50' :
        interview.status === 'removed' ? 'border-red-300 text-red-800' :
        'hover:border-primary-300'
      }`}
    />
  );
} 