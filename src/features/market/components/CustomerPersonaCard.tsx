import React from 'react';
import { Users, Edit, Info, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomerPersonaCardProps } from '../types';

export function CustomerPersonaCard({ 
  persona,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: CustomerPersonaCardProps) {
  // Calculate completeness of persona profile
  const calculateCompleteness = () => {
    let score = 0;
    if (persona.name) score += 20;
    if (persona.role) score += 20;
    if (persona.demographics) score += 20;
    if (persona.pain_points && persona.pain_points.length > 0) score += 20;
    if (persona.goals && persona.goals.length > 0) score += 20;
    return score;
  };
  
  const completeness = calculateCompleteness();
  
  return (
    <Card 
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
    >
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
              onClick={() => onEdit?.(persona.id)}
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
    </Card>
  );
}