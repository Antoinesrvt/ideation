import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// Animation phase enum to match parent component
type AnimationPhase = 'idle' | 'expanding' | 'expanded' | 'collapsing';

interface AIBubbleProps {
  expanded: boolean;
  animationPhase: AnimationPhase;
  onClick: () => void;
}

// Create a Particle component for better organization and performance
const Particle: React.FC<{ delay: number, color: string, size: number, position: { x: number, y: number } }> = ({ 
  delay, 
  color, 
  size, 
  position 
}) => {
  const hoverX = (Math.random() * 10 - 5).toFixed(1);
  const hoverY = (Math.random() * 10 - 5).toFixed(1);
  
  return (
    <motion.div
      className="particle"
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: color,
        left: `${position.x}%`,
        top: `${position.y}%`,
        opacity: 0.7,
        filter: 'blur(0.5px)',
      }}
      animate={{
        x: [0, Number(hoverX), 0, -Number(hoverX), 0],
        y: [0, Number(hoverY), 0, -Number(hoverY), 0],
        opacity: [0.7, 1, 0.8, 1, 0.7],
        boxShadow: [
          'none',
          color === '#00c2ff' ? '0 0 10px 3px rgba(0, 194, 255, 0.8)' : '0 0 10px 3px rgba(255, 255, 255, 0.6)',
          'none',
          color === '#00c2ff' ? '0 0 8px 2px rgba(0, 194, 255, 0.7)' : '0 0 8px 2px rgba(255, 255, 255, 0.5)',
          'none'
        ]
      }}
      transition={{
        duration: 8 + (delay * 2),
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export const AIBubble: React.FC<AIBubbleProps> = ({
  expanded,
  animationPhase,
  onClick
}) => {
  const nucleusRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Array<{
    id: number;
    color: string;
    size: number;
    position: { x: number; y: number };
    delay: number;
  }>>([]);
  
  // Create particles data on component mount
  useEffect(() => {
    // Create exactly 15 particles with persistent properties
    if (particles.current.length === 0) {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 20;
        const x = Math.cos(angle) * distance + 50;
        const y = Math.sin(angle) * distance + 50;
        const size = Math.random() * 2 + 2;
        const color = Math.random() < 0.3 ? "#00c2ff" : "white";
        const delay = Math.random() * 2;
        
        particles.current.push({
          id: i,
          color,
          size,
          position: { x, y },
          delay
        });
      }
    }
  }, []);

  return (
    <>
      {/* Visible only when not expanded */}
      <motion.div 
        className="nucleus-inner"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: expanded || animationPhase === 'expanding' ? 0 : 1,
          pointerEvents: expanded ? 'none' : 'auto'
        }}
        transition={{ 
          duration: 0.4,
          delay: animationPhase === 'collapsing' ? 0.2 : 0
        }}
      >
        <div className="nucleus-glass" />
        <div className="nucleus-highlight" />
        <div className="nucleus-core" />
        <div className="orbital-system">
          <div className="orbital-ring" />
          <div className="orbital-ring" />
          <div className="orbital-ring" />
        </div>
        <div className="particles">
          {particles.current.map(particle => (
            <Particle
              key={particle.id}
              color={particle.color}
              size={particle.size}
              position={particle.position}
              delay={particle.delay}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Transformation ripple effect */}
      <motion.div 
        className="transformation-ripple"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: animationPhase === 'expanding' ? [0.7, 0.5, 0] : 0,
          scale: animationPhase === 'expanding' ? [1, 1.1, 1.3] : 0,
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeOut"
        }}
      />
      
      {/* Pulse effect appears on click */}
      <motion.div 
        className="nucleus-pulse"
        initial={{ scale: 0.9, opacity: 0 }}
        whileTap={{ scale: 1.4, opacity: 0.7, transition: { duration: 0.4 } }}
      />
    </>
  );
};

export default AIBubble; 