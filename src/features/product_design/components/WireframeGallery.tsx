import React, { useState } from 'react';
import { PlusCircle, Image, Upload, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductWireframe } from '@/store/types';

// Add extended type for ProductWireframe to include status
interface ExtendedProductWireframe extends ProductWireframe {
  status?: 'new' | 'modified' | 'removed';
}

interface WireframeGalleryProps {
  wireframes: ExtendedProductWireframe[];
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
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          {wireframes.length > 0 && (
            <p className="text-sm text-dark-500">
              {wireframes.length} wireframe{wireframes.length !== 1 ? 's' : ''}
            </p>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBestPractices(!showBestPractices)}
            className="text-primary-700 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
          >
            <Info className="h-3.5 w-3.5 mr-1.5" />
            {showBestPractices ? 'Hide' : 'Show'} Best Practices
            {showBestPractices ? <ChevronUp className="h-3.5 w-3.5 ml-1.5" /> : <ChevronDown className="h-3.5 w-3.5 ml-1.5" />}
          </Button>
        </div>
        
        <Collapsible open={showBestPractices} className="mb-6">
          <CollapsibleContent>
            <Card variant="default" className="border-primary-100 bg-primary-50/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-heading font-semibold text-primary-800 mb-2">
                  Wireframing Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-dark-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Keep it simple:</strong> Use grayscale and focus on layout rather than details. The goal is to communicate structure, not design.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Be consistent:</strong> Use the same representation for the same type of element throughout your wireframes.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Annotate when needed:</strong> Add notes to explain interactions or elements that might not be obvious.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Use real content:</strong> When possible, use real content instead of lorem ipsum to get a better feel for how the interface will work.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
        
        {wireframes.length === 0 ? (
          <Card variant="default" className="border-dashed border-gray-300">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <Image className="h-12 w-12 text-dark-400 mb-4" />
              <h3 className="text-lg font-heading font-medium text-primary-800 mb-2">No Wireframes Yet</h3>
              <p className="text-dark-500 max-w-sm mb-4">
                Wireframes help visualize your product's interface and layout before detailed design.
              </p>
              {onAdd && (
                <Button 
                  variant="default" 
                  onClick={onAdd}
                  className="bg-gradient-primary text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Wireframe
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wireframes.map(wireframe => (
              <Card 
                key={wireframe.id}
                variant="default"
                className={`hover:shadow-md transition-all ${
                  wireframe.status === 'new' ? 'border-l-4 border-l-green-500 bg-green-50/60' :
                  wireframe.status === 'modified' ? 'border-l-4 border-l-yellow-500 bg-yellow-50/60' :
                  wireframe.status === 'removed' ? 'border-l-4 border-l-red-500 bg-red-50/60' :
                  'hover:border-primary-200'
                }`}
              >
                <CardContent className="p-0">
                  <div 
                    className="relative cursor-pointer aspect-video bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-md"
                    onClick={() => onSelect && onSelect(wireframe.id)}
                  >
                    {wireframe.image_url ? (
                      <img 
                        src={wireframe.image_url} 
                        alt={wireframe.name || 'Wireframe'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-dark-400">
                        <Image className="h-10 w-10 mb-2" />
                        <p className="text-sm">No image uploaded</p>
                      </div>
                    )}
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 bg-black/60 text-white backdrop-blur-sm"
                    >
                      {getWireframeType(wireframe.name || '')}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-3 flex justify-between items-center bg-white/80 backdrop-blur-sm">
                  <div>
                    <h4 className="font-heading font-medium text-primary-800 mb-0.5 text-sm">
                      {wireframe.name || 'Unnamed Wireframe'}
                    </h4>
                    <p className="text-xs text-dark-500">
                      {wireframe.created_at && formatDate(wireframe.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {onSelect && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 text-primary-700 hover:bg-primary-50"
                        onClick={() => onSelect(wireframe.id)}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            {onAdd && (
              <Card 
                variant="outline"
                className="border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50/10 transition-colors cursor-pointer"
                onClick={onAdd}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <Upload className="h-10 w-10 text-primary-400 mb-3" />
                  <h4 className="font-heading font-medium text-primary-700 mb-1">Add New Wireframe</h4>
                  <p className="text-dark-500 text-sm">
                    Upload or create a new wireframe
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};