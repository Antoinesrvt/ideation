import React from 'react';
import { ChevronRight, Users, Edit, Info } from 'lucide-react';
import { CustomerPersona } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CustomerPersonaCardProps {
  persona: CustomerPersona;
  onEdit?: (id: string) => void;
  onUpdate?: (updated: CustomerPersona) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export const CustomerPersonaCard: React.FC<CustomerPersonaCardProps> = ({ 
  persona,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}) => {
  // Calculate completeness of persona profile
  const calculateCompleteness = () => {
    let score = 0;
    if (persona.name) score += 20;
    if (persona.role) score += 20;
    if (persona.demographics) score += 20;
    if (persona.painPoints && persona.painPoints.length > 0) score += 20;
    if (persona.goals && persona.goals.length > 0) score += 20;
    return score;
  };
  
  const completeness = calculateCompleteness();
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold">{persona.name || 'New Persona'}</h3>
            <p className="text-sm text-gray-500">{persona.role || 'Role not defined'}</p>
          </div>
        </div>
        <Badge variant="outline" className={`
          ${completeness === 100 ? 'bg-green-50 text-green-700 border-green-200' : 
            completeness >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
            'bg-orange-50 text-orange-700 border-orange-200'}
        `}>
          {completeness}% Complete
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium text-gray-700">Demographics</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include age, location, education, income level, and other relevant demographic information.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {persona.demographics || 'Not specified yet'}
          </p>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium text-gray-700">Pain Points</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>List the specific challenges and frustrations this persona faces that your solution can address.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.painPoints && persona.painPoints.length > 0 
              ? persona.painPoints.map((point, index) => (
                <Badge key={index} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                  {point}
                </Badge>
              ))
              : <p className="text-sm text-gray-600 italic">None specified yet</p>
            }
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium text-gray-700">Goals</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Describe what this persona is trying to achieve or the outcomes they desire.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.goals && persona.goals.length > 0 
              ? persona.goals.map((goal, index) => (
                <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                  {goal}
                </Badge>
              ))
              : <p className="text-sm text-gray-600 italic">None specified yet</p>
            }
          </div>
        </div>
      </div>
      
      {!readOnly && (
        <div className="flex justify-between mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2.5 py-1.5"
            onClick={() => onEdit && onEdit(persona.id)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Persona
          </Button>
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 flex items-center gap-1 hover:bg-red-50 px-2.5 py-1.5"
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};