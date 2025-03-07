import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChangeType = 'modified' | 'added' | 'removed';

interface DiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onCancel: () => void;
  title: string;
  changeType: ChangeType;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
}

export function DiffViewer({
  isOpen,
  onClose,
  onAccept,
  onCancel,
  title,
  changeType,
  beforeContent,
  afterContent
}: DiffViewerProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    let position = ((clientX - sliderRect.left) / sliderRect.width) * 100;
    position = Math.max(0, Math.min(100, position));
    
    setSliderPosition(position);
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('touchmove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="w-[90%] max-w-[900px] max-h-[90vh] bg-white rounded-md shadow-2xl overflow-hidden flex flex-col transform scale-100 transition-all duration-300">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {title}
          </h2>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          <div 
            ref={sliderRef}
            className="relative w-full h-[400px] shadow-lg overflow-hidden"
          >
            <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 text-white rounded-full text-sm font-medium z-10">
              Current
            </div>
            <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 text-white rounded-full text-sm font-medium z-10">
              Suggested
            </div>
            
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <div className="absolute inset-0 p-6 bg-white flex items-center justify-center">
                {beforeContent}
              </div>
            </div>
            
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ 
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` 
              }}
            >
              <div className="absolute inset-0 p-6 bg-white flex items-center justify-center">
                {afterContent}
              </div>
            </div>
            
            <div 
              className="absolute top-0 bottom-0 w-10 z-10 cursor-ew-resize"
              style={{ left: `calc(${sliderPosition}% - 20px)` }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-primary shadow-lg flex items-center justify-center text-xl">
                ⟷
              </div>
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white -translate-x-1/2"></div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <div 
              className={`w-3 h-3 rounded-full ${
                changeType === 'modified' ? 'bg-blue-500' : 
                changeType === 'added' ? 'bg-green-500' : 
                'bg-red-500'
              }`}
            ></div>
            <span className="text-slate-600">
              {changeType === 'modified' ? 'Modified Component' : 
               changeType === 'added' ? 'Added Component' : 
               'Removed Component'}
            </span>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={onAccept}>Accept Change</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 