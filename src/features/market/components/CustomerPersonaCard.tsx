import React from 'react';
import { ChevronRight, Users } from 'lucide-react';
import { CustomerPersona } from '@/types';

interface CustomerPersonaCardProps {
  persona: CustomerPersona;
  onEdit?: (id: string) => void;
}

export const CustomerPersonaCard: React.FC<CustomerPersonaCardProps> = ({ 
  persona,
  onEdit 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Users className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <h3 className="font-semibold">{persona.name || 'New Persona'}</h3>
          <p className="text-sm text-gray-500">{persona.role || 'Role not defined'}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Demographics</p>
          <p className="text-sm text-gray-600">{persona.demographics || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Pain Points</p>
          <p className="text-sm text-gray-600">
            {persona.painPoints && persona.painPoints.length > 0 
              ? persona.painPoints.join(', ') 
              : 'None specified'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Goals</p>
          <p className="text-sm text-gray-600">
            {persona.goals && persona.goals.length > 0 
              ? persona.goals.join(', ') 
              : 'None specified'}
          </p>
        </div>
      </div>
      <button 
        className="mt-4 text-blue-600 text-sm flex items-center"
        onClick={() => onEdit && onEdit(persona.id)}
      >
        Edit Persona <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};