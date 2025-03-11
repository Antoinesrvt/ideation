import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface EnhancedSliderProps {
  id: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  markers?: Array<{
    value: number;
    label: string;
  }>;
  helperText?: string;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  disabled?: boolean;
}

export function EnhancedSlider({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  markers = [],
  helperText,
  className = '',
  valuePrefix = '',
  valueSuffix = '',
  disabled = false
}: EnhancedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate the position of the value bubble
  const position = ((value - min) / (max - min)) * 100;
  
  // Format the displayed value
  const formattedValue = `${valuePrefix}${value}${valueSuffix}`;
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <Label htmlFor={id}>{label}</Label>}
        <span className="text-sm font-medium">
          {formattedValue}
        </span>
      </div>
      
      <div className="relative pt-6 pb-8">
        {/* Value bubble that follows the slider */}
        <motion.div 
          className={`absolute -top-1 transform -translate-x-1/2 z-10 ${isDragging ? 'opacity-100' : 'opacity-0'}`}
          style={{ left: `${position}%` }}
          animate={{ 
            opacity: isDragging ? 1 : 0,
            scale: isDragging ? 1 : 0.8,
            y: isDragging ? -5 : 0
          }}
          transition={{ duration: 0.1 }}
        >
          <div className="bg-primary text-white text-xs py-1 px-2 rounded-md shadow-md whitespace-nowrap">
            {formattedValue}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary mx-auto" />
        </motion.div>
        
        {/* Main slider component */}
        <Slider
          id={id}
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(values) => onChange(values[0])}
          disabled={disabled}
          onValueCommit={() => setIsDragging(false)}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          className={`${isDragging ? 'slider-active' : ''}`}
        />
        
        {/* Marker indicators */}
        {markers.length > 0 && (
          <div className="flex justify-between mt-1">
            {markers.map((marker, index) => {
              // Calculate marker position
              const markerPosition = ((marker.value - min) / (max - min)) * 100;
              
              return (
                <div 
                  key={index} 
                  className="relative" 
                  style={{ left: `${markerPosition}%`, marginLeft: index === 0 ? '0' : `-${index * 2}px` }}
                >
                  <div className={`w-0.5 h-2 bg-gray-300 mx-auto ${value >= marker.value ? 'bg-primary' : ''}`} />
                  <span className="text-xs text-gray-500 absolute whitespace-nowrap transform -translate-x-1/2" style={{ top: '8px' }}>
                    {marker.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      
      {/* Quick value buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(min)}
          className={`px-2 py-1 text-xs rounded-md border ${value === min ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          disabled={disabled}
        >
          Min
        </button>
        <button
          type="button"
          onClick={() => onChange(min + (max - min) * 0.25)}
          className={`px-2 py-1 text-xs rounded-md border ${Math.abs(value - (min + (max - min) * 0.25)) < step ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          disabled={disabled}
        >
          25%
        </button>
        <button
          type="button"
          onClick={() => onChange(min + (max - min) * 0.5)}
          className={`px-2 py-1 text-xs rounded-md border ${Math.abs(value - (min + (max - min) * 0.5)) < step ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          disabled={disabled}
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => onChange(min + (max - min) * 0.75)}
          className={`px-2 py-1 text-xs rounded-md border ${Math.abs(value - (min + (max - min) * 0.75)) < step ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          disabled={disabled}
        >
          75%
        </button>
        <button
          type="button"
          onClick={() => onChange(max)}
          className={`px-2 py-1 text-xs rounded-md border ${value === max ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          disabled={disabled}
        >
          Max
        </button>
      </div>
      
      {/* Add custom CSS for active slider state */}
      <style jsx global>{`
        .slider-active [role="slider"] {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
} 