import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Wireframe } from '@/types';
import { formatDate } from '@/lib/utils';

interface WireframeGalleryProps {
  wireframes: Wireframe[];
  onAdd?: () => void;
  onSelect?: (id: string) => void;
}

export const WireframeGallery: React.FC<WireframeGalleryProps> = ({ 
  wireframes,
  onAdd,
  onSelect 
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {wireframes.map(wireframe => (
        <div 
          key={wireframe.id} 
          className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect && onSelect(wireframe.id)}
        >
          <div className="bg-gray-100 p-8 flex items-center justify-center">
            {wireframe.imageUrl ? (
              <img 
                src={wireframe.imageUrl} 
                alt={wireframe.name} 
                className="w-full h-40 object-contain"
              />
            ) : (
              <div className="bg-white border border-gray-300 w-full h-40 rounded-md shadow-sm relative">
                <div className="absolute top-0 left-0 right-0 h-8 border-b border-gray-300 bg-gray-50 flex items-center px-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
                <div className="p-2 mt-8">
                  <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex">
                    <div className="w-20 h-6 bg-blue-200 rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-200">
            <h4 className="font-medium">{wireframe.name}</h4>
            <p className="text-xs text-gray-500">Created {formatDate(wireframe.createdAt)}</p>
          </div>
        </div>
      ))}
      
      <div 
        className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 h-64 cursor-pointer hover:bg-gray-50"
        onClick={onAdd}
      >
        <PlusCircle className="h-8 w-8 mb-2" />
        <p>Add New Wireframe</p>
      </div>
    </div>
  );
};