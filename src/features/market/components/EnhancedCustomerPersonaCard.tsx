import React, { useState } from 'react';
import { Users, Edit, Info, Trash, Save, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { CustomerPersonaCardProps } from '../types';
import { motion } from 'framer-motion';

interface EnhancedCustomerPersonaCardProps extends CustomerPersonaCardProps {
  // Additional props specific to the enhanced version
}

export function EnhancedCustomerPersonaCard({ 
  persona,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: EnhancedCustomerPersonaCardProps) {
  // State for handling edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: persona.name || '',
    role: persona.role || '',
    demographics: persona.demographics || '',
    pain_points: persona.pain_points || [],
    goals: persona.goals || []
  });
  
  // New tag inputs
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newGoal, setNewGoal] = useState('');
  
  // Calculate completeness of persona profile
  const calculateCompleteness = () => {
    let score = 0;
    if (formData.name) score += 20;
    if (formData.role) score += 20;
    if (formData.demographics) score += 20;
    if (formData.pain_points && formData.pain_points.length > 0) score += 20;
    if (formData.goals && formData.goals.length > 0) score += 20;
    return score;
  };

  const completeness = calculateCompleteness();
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding new pain point
  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        pain_points: [...prev.pain_points, newPainPoint.trim()]
      }));
      setNewPainPoint('');
    }
  };
  
  // Handle adding new goal
  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };
  
  // Handle removing a pain point
  const removePainPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pain_points: prev.pain_points.filter((_, i) => i !== index)
    }));
  };
  
  // Handle removing a goal
  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };
  
  // Handle save
  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        id: persona.id,
        data: {
          name: formData.name,
          role: formData.role,
          demographics: formData.demographics,
          pain_points: formData.pain_points,
          goals: formData.goals
        }
      });
    }
    setIsEditing(false);
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: persona.name || '',
      role: persona.role || '',
      demographics: persona.demographics || '',
      pain_points: persona.pain_points || [],
      goals: persona.goals || []
    });
    setIsEditing(false);
  };
  
  // View mode content
  const viewContent = (
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shadow-sm">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="font-heading font-semibold text-primary-800">{persona.name || 'New Persona'}</h3>
            <p className="text-sm text-dark-500">{persona.role || 'Role not defined'}</p>
          </div>
        </div>
        <Badge variant={
          completeness === 100 ? 'secondary' : 
          completeness >= 60 ? 'outline' : 
          'default'
        } className={`h-7 ${
          completeness === 100 ? 'bg-green-50 text-green-700 border-green-200' : 
          completeness >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
          'bg-orange-50 text-orange-700 border-orange-200'
        }`}>
          {completeness}% Complete
        </Badge>
      </div>
      
      <div className="mb-4">
        <Progress 
          value={completeness} 
          variant={completeness === 100 ? 'primary' : 
                 completeness >= 60 ? 'secondary' : 
                 'accent'}
          size="md"
          className="mb-4"
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium text-primary-800">Demographics</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                  <p>Include age, location, education, income level, and other relevant demographic information.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-sm text-dark-600 bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-gray-100">
            {persona.demographics || 'Not specified yet'}
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium text-primary-800">Pain Points</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                  <p>List the specific challenges and frustrations this persona faces that your solution can address.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.pain_points && persona.pain_points.length > 0 
              ? persona.pain_points.map((point, index) => (
                <Badge key={index} variant="outline" className="bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100">
                  {point}
                </Badge>
              ))
              : <p className="text-sm text-dark-400 italic">None specified yet</p>
            }
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium text-primary-800">Goals</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                  <p>Describe what this persona is trying to achieve or the outcomes they desire.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.goals && persona.goals.length > 0 
              ? persona.goals.map((goal, index) => (
                <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100">
                  {goal}
                </Badge>
              ))
              : <p className="text-sm text-dark-400 italic">None specified yet</p>
            }
          </div>
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
            Edit Persona
          </Button>
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-accent-700 hover:bg-accent-50"
              onClick={() => onDelete(persona.id)}
            >
              <Trash className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      )}
    </CardContent>
  );
  
  // Edit mode content
  const editContent = (
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shadow-sm">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1">
            <Input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Persona Name"
              className="font-heading font-semibold text-primary-800 mb-1"
            />
            <Input 
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="Role/Position"
              className="text-sm text-dark-500"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <Progress 
          value={completeness} 
          variant={completeness === 100 ? 'primary' : 
                 completeness >= 60 ? 'secondary' : 
                 'accent'}
          size="md"
          className="mb-1"
        />
        <p className="text-xs text-right text-dark-500">{completeness}% Complete</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <div className="flex items-center mb-2">
            <p className="text-sm font-medium text-primary-800">Demographics</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                  <p>Include age, location, education, income level, and other relevant demographic information.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea 
            name="demographics"
            value={formData.demographics}
            onChange={handleInputChange}
            placeholder="Add demographic details..."
            className="min-h-[80px]"
          />
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <p className="text-sm font-medium text-primary-800">Pain Points</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                  <p>List the specific challenges and frustrations this persona faces that your solution can address.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.pain_points.map((point, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100 flex items-center gap-1"
              >
                {point}
                <button 
                  onClick={() => removePainPoint(index)}
                  className="ml-1 rounded-full hover:bg-accent-200/50 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newPainPoint}
              onChange={(e) => setNewPainPoint(e.target.value)}
              placeholder="Add pain point..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPainPoint();
                }
              }}
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={addPainPoint}
              disabled={!newPainPoint.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <p className="text-sm font-medium text-primary-800">Goals</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                  <p>Describe what this persona is trying to achieve or the outcomes they desire.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.goals.map((goal, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100 flex items-center gap-1"
              >
                {goal}
                <button 
                  onClick={() => removeGoal(index)}
                  className="ml-1 rounded-full hover:bg-primary-200/50 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add goal..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addGoal();
                }
              }}
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={addGoal}
              disabled={!newGoal.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
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
    </CardContent>
  );
  
  return (
    <EnhancedCard
      viewContent={viewContent}
      editContent={editContent}
      isEditing={isEditing}
      variant={
        persona.status === 'new' ? 'gradient' :
        persona.status === 'modified' ? 'elevated' :
        persona.status === 'removed' ? 'outline' :
        'default'
      } 
      animation="hover"
      className={`transition-all ${
        persona.status === 'new' ? 'border-green-300 from-green-50 to-white' :
        persona.status === 'modified' ? 'border-yellow-300 shadow-yellow-100/50' :
        persona.status === 'removed' ? 'border-red-300 text-red-800' :
        'hover:border-primary-300'
      }`}
    />
  );
} 