import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Competitor } from '@/types';

interface CompetitorTableProps {
  competitors: Competitor[];
  onAddCompetitor: () => void;
  onEditCompetitor?: (id: string) => void;
}

export const CompetitorTable: React.FC<CompetitorTableProps> = ({ 
  competitors,
  onAddCompetitor,
  onEditCompetitor 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-4 font-medium text-gray-700">Competitor</th>
            <th className="text-left py-2 px-4 font-medium text-gray-700">Strengths</th>
            <th className="text-left py-2 px-4 font-medium text-gray-700">Weaknesses</th>
            <th className="text-left py-2 px-4 font-medium text-gray-700">Price</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map(competitor => (
            <tr 
              key={competitor.id} 
              className="border-b border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => onEditCompetitor && onEditCompetitor(competitor.id)}
            >
              <td className="py-2 px-4">{competitor.name || 'Unnamed competitor'}</td>
              <td className="py-2 px-4 text-sm">
                {competitor.strengths && competitor.strengths.length > 0 
                  ? competitor.strengths.join(', ') 
                  : 'None specified'}
              </td>
              <td className="py-2 px-4 text-sm">
                {competitor.weaknesses && competitor.weaknesses.length > 0 
                  ? competitor.weaknesses.join(', ') 
                  : 'None specified'}
              </td>
              <td className="py-2 px-4 text-sm">{competitor.price || 'Unknown'}</td>
            </tr>
          ))}
          <tr>
            <td 
              colSpan={4} 
              className="py-2 px-4 text-gray-500 cursor-pointer hover:bg-gray-50"
              onClick={onAddCompetitor}
            >
              <div className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Add competitor</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};