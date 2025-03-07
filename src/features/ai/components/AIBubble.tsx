'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ai-chat.css';

interface AIBubbleProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AIBubble: React.FC<AIBubbleProps> = ({ isExpanded, onToggle, children }) => {
  const nucleusRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!nucleusRef.current) return;

    const nucleus = nucleusRef.current;
    let animationFrame: number;
    let isAnimating = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (isExpanded || isTransforming || isAnimating) return;

      const rect = nucleus.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      
      setMousePosition({ x, y });

      if (!isAnimating) {
        isAnimating = true;
        animationFrame = requestAnimationFrame(() => {
          const tiltX = y * -20;
          const tiltY = x * 20;
          const scale = isHovered ? 1.05 : 1;

          nucleus.style.transform = `
            perspective(1200px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale(${scale})
            translateZ(2px)
          `;

          isAnimating = false;
        });
      }
    };

    const handleMouseEnter = () => {
      if (isExpanded || isTransforming) return;
      setIsHovered(true);
      nucleus.style.transition = 'transform 0.3s var(--easing-spring)';
    };

    const handleMouseLeave = () => {
      if (isExpanded || isTransforming) return;
      setIsHovered(false);
      setMousePosition({ x: 0, y: 0 });
      
      nucleus.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
      nucleus.style.transition = 'transform 0.5s var(--easing-spring)';
    };

    nucleus.addEventListener('mousemove', handleMouseMove);
    nucleus.addEventListener('mouseenter', handleMouseEnter);
    nucleus.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      nucleus.removeEventListener('mousemove', handleMouseMove);
      nucleus.removeEventListener('mouseenter', handleMouseEnter);
      nucleus.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, [isExpanded, isTransforming, isHovered]);

  const handleClick = () => {
    if (isTransforming || isExpanded) return;
    
    setIsTransforming(true);
    onToggle();
    
    setTimeout(() => {
      setIsTransforming(false);
    }, 800);
  };

  return (
    <div 
      ref={containerRef}
      className={`ai-container ${isTransforming ? 'transforming' : ''} ${isExpanded ? 'expanded' : ''}`}
    >
      <motion.div 
        className="ai-nucleus"
        ref={nucleusRef}
        onClick={handleClick}
        initial={false}
        animate={{
          scale: isHovered ? 1.05 : 1,
          transition: {
            duration: 0.3,
            ease: [0.34, 1.56, 0.64, 1]
          }
        }}
        style={{
          pointerEvents: isTransforming ? 'none' : 'auto'
        }}
      >
        <div className="nucleus-sphere">
          <div className="glass-layer" />
          <div className="energy-core" />
          <div className="inner-glow" />
        </div>
        
        <div className="orbital-system">
          <div className="orbital-ring orbital-ring-1" />
          <div className="orbital-ring orbital-ring-2" />
          <div className="orbital-ring orbital-ring-3" />
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="assistant-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.3
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: 20,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 