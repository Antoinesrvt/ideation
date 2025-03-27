'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SidebarPanel {
  id: string;
  icon: React.ReactNode;
  label: string;
  content: React.ReactNode;
}

interface SidebarCycleProps {
  panels: SidebarPanel[];
  initialPanelId?: string;
  className?: string;
}

export function SidebarCycle({ 
  panels, 
  initialPanelId,
  className 
}: SidebarCycleProps) {
  const initialIndex = initialPanelId 
    ? panels.findIndex(panel => panel.id === initialPanelId)
    : 0;
  
  const [activePanelIndex, setActivePanelIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right'>('right');
  
  const nextPanel = () => {
    if (activePanelIndex < panels.length - 1) {
      setSwipeDirection('left');
      setActivePanelIndex(prev => prev + 1);
    }
  };
  
  const prevPanel = () => {
    if (activePanelIndex > 0) {
      setSwipeDirection('right');
      setActivePanelIndex(prev => prev - 1);
    }
  };
  
  // Handle swipe gestures
  const handleTouchStart = React.useRef<number | null>(null);
  
  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.touches[0].clientX;
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (handleTouchStart.current === null) return;
    
    const touchEnd = e.touches[0].clientX;
    const diff = handleTouchStart.current - touchEnd;
    
    // If swipe is significant enough
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left
        if (activePanelIndex < panels.length - 1) {
          setSwipeDirection('left');
          setActivePanelIndex(prev => prev + 1);
        }
      } else {
        // Swipe right
        if (activePanelIndex > 0) {
          setSwipeDirection('right');
          setActivePanelIndex(prev => prev - 1);
        }
      }
      
      handleTouchStart.current = null;
    }
  };
  
  return (
    <div 
      className={cn("w-full h-full flex flex-col", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Panel navigation */}
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={prevPanel}
          disabled={activePanelIndex === 0}
          className="h-7 w-7"
        >
          <ChevronLeft size={16} />
        </Button>
        
        <div className="flex gap-1.5 items-center">
          {panels.map((panel, index) => (
            <button
              key={panel.id}
              onClick={() => {
                setSwipeDirection(index > activePanelIndex ? 'left' : 'right');
                setActivePanelIndex(index);
              }}
              className="focus:outline-none"
              aria-label={`Switch to ${panel.label} panel`}
            >
              <div 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  index === activePanelIndex 
                    ? "bg-primary w-6" 
                    : "bg-muted w-1.5"
                )}
              />
            </button>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextPanel}
          disabled={activePanelIndex === panels.length - 1}
          className="h-7 w-7"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      
      {/* Active panel label */}
      <div className="text-sm font-medium flex items-center gap-1.5 mb-3">
        {panels[activePanelIndex].icon}
        {panels[activePanelIndex].label}
      </div>
      
      {/* Panel content with animation */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={panels[activePanelIndex].id}
            initial={{ opacity: 0, x: swipeDirection === 'right' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection === 'right' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {panels[activePanelIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 