import React, { useState } from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export interface EnhancedCardProps extends Omit<CardProps, 'children'> {
  /**
   * Content to display in view mode
   */
  viewContent: React.ReactNode;
  
  /**
   * Content to display in edit mode
   */
  editContent: React.ReactNode;
  
  /**
   * Whether the card is in edit mode
   */
  isEditing: boolean;
  
  /**
   * Callback when exiting edit mode
   * (This is separate from any save/cancel actions that might be in your edit content)
   */
  onEditExit?: () => void;
  
  /**
   * Animation duration in seconds
   * @default 0.3
   */
  animationDuration?: number;
  
  /**
   * Custom animation variants for the card
   */
  customAnimationVariants?: Variants;
}

export function EnhancedCard({
  viewContent,
  editContent,
  isEditing,
  onEditExit,
  animationDuration = 0.3,
  customAnimationVariants,
  className,
  ...cardProps
}: EnhancedCardProps) {
  // Default animation variants
  const defaultVariants: Variants = {
    initial: { opacity: 0.6, y: 10, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: animationDuration,
        ease: "easeOut"
      } 
    },
    exit: { 
      opacity: 0.6, 
      y: -10, 
      scale: 0.98,
      transition: { 
        duration: animationDuration * 0.8,
        ease: "easeIn"
      } 
    }
  };
  
  // Combine default with custom variants if provided
  const variants: Variants = {
    ...(defaultVariants),
    ...(customAnimationVariants || {})
  };
  
  return (
    <Card
      className={`transition-all ${className || ''}`}
      {...cardProps}
    >
      <AnimatePresence mode="wait" onExitComplete={() => onEditExit?.()}>
        {isEditing ? (
          <motion.div
            key="edit-mode"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="origin-top"
          >
            {editContent}
          </motion.div>
        ) : (
          <motion.div
            key="view-mode"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="origin-top"
          >
            {viewContent}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
} 