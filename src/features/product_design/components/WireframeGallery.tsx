import React, { useState } from 'react';
import { PlusCircle, Image, Upload, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductWireframe } from '@/store/types';

interface WireframeGalleryProps {
  wireframes: ProductWireframe[];
  onAdd?: () => void;
  onSelect?: (id: string) => void;
}

export const WireframeGallery: React.FC<WireframeGalleryProps> = ({ 
  wireframes,
  onAdd,
  onSelect 
}) => {
  const [showBestPractices, setShowBestPractices] = useState(false);
  
  const getWireframeType = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('mobile')) return 'Mobile';
    if (lowerName.includes('desktop')) return 'Desktop';
    if (lowerName.includes('tablet')) return 'Tablet';
    return 'Web';
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          {wireframes.length > 0 && (
            <p className="text-sm text-gray-500">
              {wireframes.length} wireframe{wireframes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {wireframes.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
              <Image className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Wireframes Yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create wireframes to visualize your product's interface.
              </p>
              <button 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={onAdd}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Wireframe
              </button>
            </div>
          </div>
        )}

        {wireframes.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {wireframes.map(wireframe => (
              <div 
                key={wireframe.id} 
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                onClick={() => onSelect && onSelect(wireframe.id)}
              >
                <div className="bg-gray-100 p-8 flex items-center justify-center">
                  {wireframe.image_url ? (
                    <img 
                      src={wireframe.image_url} 
                      alt={wireframe.name} 
                      className="w-full h-40 object-contain"
                    />
                  ) : (
                    <div className="bg-white border border-gray-300 w-full h-40 rounded-md shadow-sm relative group-hover:border-blue-300 transition-colors">
                      <div className="absolute top-0 left-0 right-0 h-8 border-b border-gray-300 bg-gray-50 flex items-center px-2">
                        <div className="w-3 h-3 rounded-full bg-red-300 mr-1"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-300 mr-1"></div>
                        <div className="w-3 h-3 rounded-full bg-green-300"></div>
                        
                        <div className="ml-auto text-xs text-gray-400">
                          {getWireframeType(wireframe.name)}
                        </div>
                      </div>
                      <div className="p-2 mt-8">
                        <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-3/4 h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="flex space-x-2">
                          <div className="w-20 h-6 bg-blue-200 rounded"></div>
                          <div className="w-14 h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/10">
                        <Badge className="bg-blue-500 text-white px-2 py-1">
                          <Upload className="h-3 w-3 mr-1" />
                          Add Image
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{wireframe.name}</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to edit this wireframe</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-gray-500">Created {formatDate(wireframe.created_at ?? "")}</p>
                </div>
              </div>
            ))}
            
            <div 
              className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 h-64 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={onAdd}
            >
              <PlusCircle className="h-8 w-8 mb-2" />
              <p className="mb-1">Add New Wireframe</p>
              <p className="text-xs text-gray-400 text-center max-w-[180px]">
                Visualize your product interfaces
              </p>
            </div>
          </div>
        )}

        {wireframes.length > 0 && (
          <Collapsible
            open={showBestPractices}
            onOpenChange={setShowBestPractices}
            className="mt-4"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 flex justify-between"
              >
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Wireframing Tips
                </div>
                {showBestPractices ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 text-sm mb-1">Wireframing Best Practices</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Focus on layout and functionality, not visual design details</li>
                  <li>• Use wireframes to test navigation and user flows early</li>
                  <li>• Keep elements simple with placeholders for images and content</li>
                  <li>• Get feedback on wireframes before moving to high-fidelity mockups</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </TooltipProvider>
  );
};