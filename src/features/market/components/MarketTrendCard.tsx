import React from 'react';
import { MarketTrend } from '@/types';

interface MarketTrendCardProps {
  trend: MarketTrend;
  onEdit?: (id: string) => void;
}

export const MarketTrendCard: React.FC<MarketTrendCardProps> = ({ 
  trend,
  onEdit 
}) => {
  const getDirectionText = (direction: 'upward' | 'downward' | 'stable') => {
    switch (direction) {
      case 'upward':
        return 'Trending Upward';
      case 'downward':
        return 'Trending Downward';
      default:
        return 'Stable Trend';
    }
  };
  
  const getTypeColor = (type: 'opportunity' | 'threat' | 'neutral') => {
    switch (type) {
      case 'opportunity':
        return 'bg-blue-100 text-blue-800';
      case 'threat':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300"
      onClick={() => onEdit && onEdit(trend.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{trend.name || 'Unnamed Trend'}</h3>
          <p className="text-sm text-gray-500">{getDirectionText(trend.direction)}</p>
        </div>
        <span className={`px-2 py-1 ${getTypeColor(trend.type)} text-xs rounded-full`}>
          {trend.type.charAt(0).toUpperCase() + trend.type.slice(1)}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {trend.description || 'No description provided.'}
      </p>
      {trend.tags && trend.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap">
          {trend.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mr-2 mb-2">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};