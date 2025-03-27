import React from 'react';
import { motion } from 'framer-motion';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MarketMaturityCurveProps {
  currentMaturity: 'emerging' | 'growing' | 'mature' | 'declining';
  onChange?: (maturity: 'emerging' | 'growing' | 'mature' | 'declining') => void;
  readOnly?: boolean;
  className?: string;
}

export function MarketMaturityCurve({ 
  currentMaturity, 
  onChange,
  readOnly = false,
  className = '' 
}: MarketMaturityCurveProps) {
  // Define data for each stage
  const stages = [
    { 
      id: 'emerging', 
      label: 'Emerging', 
      description: 'Early stage market with innovative products, high risk but high potential reward',
      color: '#3b82f6', // Blue
      ringClass: 'ring-blue-500',
      badge: 'Early Stage',
      badgeVariant: 'outline' as const,
      x: 15,
      y: 70
    },
    { 
      id: 'growing', 
      label: 'Growing', 
      description: 'Rapid growth phase with increasing adoption and expanding customer base',
      color: '#10b981', // Green
      ringClass: 'ring-green-500',
      badge: 'High Growth',
      badgeVariant: 'default' as const,
      x: 40,
      y: 20
    },
    { 
      id: 'mature', 
      label: 'Mature', 
      description: 'Established market with stable growth and strong competition',
      color: '#f59e0b', // Amber
      ringClass: 'ring-amber-500',
      badge: 'Stable',
      badgeVariant: 'secondary' as const,
      x: 65,
      y: 40
    },
    { 
      id: 'declining', 
      label: 'Declining', 
      description: 'Shrinking market with diminishing returns and consolidation',
      color: '#ef4444', // Red
      ringClass: 'ring-red-500',
      badge: 'Contracting',
      badgeVariant: 'destructive' as const,
      x: 90,
      y: 80
    }
  ];
  
  // Get the selected stage information
  const selectedStage = stages.find(s => s.id === currentMaturity) || stages[0];
  
  // Handle stage selection
  const handleStageSelect = (stage: typeof stages[0]) => {
    if (readOnly) return;
    if (onChange) {
      onChange(stage.id as 'emerging' | 'growing' | 'mature' | 'declining');
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <div className={`relative w-full bg-gray-50 rounded-lg p-4 ${className}`}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative"
      >
        {/* Curve SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-24 md:h-36"
          style={{ filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1))' }}
        >
          {/* Draw the bell curve path */}
          <path
            d="M 0,90 C 15,85 25,40 40,20 C 55,5 65,25 75,45 C 85,65 95,85 100,90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          
          {/* Color segments for each stage */}
          <path
            d="M 0,90 C 15,85 25,40 35,25"
            fill="none"
            stroke={stages[0].color}
            strokeWidth="3"
            opacity={currentMaturity === 'emerging' ? 1 : 0.3}
          />
          <path
            d="M 35,25 C 45,10 55,15 65,35"
            fill="none"
            stroke={stages[1].color}
            strokeWidth="3"
            opacity={currentMaturity === 'growing' ? 1 : 0.3}
          />
          <path
            d="M 65,35 C 75,55 80,65 85,75"
            fill="none"
            stroke={stages[2].color}
            strokeWidth="3"
            opacity={currentMaturity === 'mature' ? 1 : 0.3}
          />
          <path
            d="M 85,75 C 90,80 95,85 100,90"
            fill="none"
            stroke={stages[3].color}
            strokeWidth="3"
            opacity={currentMaturity === 'declining' ? 1 : 0.3}
          />
          
          {/* Stage points with interactive markers */}
          {stages.map((stage) => (
            <g key={stage.id}>
              <circle
                cx={stage.x}
                cy={stage.y}
                r="3"
                fill={stage.color}
                opacity={currentMaturity === stage.id ? 1 : 0.4}
              />
              {/* Selected stage indicator */}
              {currentMaturity === stage.id && (
                <circle
                  cx={stage.x}
                  cy={stage.y}
                  r="6"
                  fill="transparent"
                  stroke={stage.color}
                  strokeWidth="2"
                  opacity="0.8"
                >
                  <animate 
                    attributeName="r" 
                    values="6;8;6" 
                    dur="2s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="opacity" 
                    values="0.8;0.4;0.8" 
                    dur="2s" 
                    repeatCount="indefinite" 
                  />
                </circle>
              )}
            </g>
          ))}
          
          {/* X-axis labels */}
          <text x="0" y="98" fontSize="8" fill="#94a3b8">Time</text>
          <text x="98" y="98" fontSize="8" fill="#94a3b8" textAnchor="end">→</text>
          
          {/* Y-axis labels */}
          <text x="2" y="10" fontSize="8" fill="#94a3b8">Market Size</text>
          <text x="2" y="18" fontSize="8" fill="#94a3b8">↑</text>
        </svg>
        
        {/* Stage selectors */}
        <div className="flex justify-between mt-2">
          {stages.map((stage) => (
            <motion.div 
              key={stage.id}
              variants={itemVariants}
              className={`flex flex-col items-center cursor-pointer ${!readOnly ? 'hover:opacity-90' : ''}`}
              onClick={() => handleStageSelect(stage)}
            >
              <div 
                className={cn(
                  "h-3 w-3 rounded-full mb-1", 
                  currentMaturity === stage.id ? `ring-2 ring-offset-1 ${stage.ringClass}` : ''
                )}
                style={{ backgroundColor: stage.color }}
              />
              <div className="text-xs font-medium relative group">
                {stage.label}
                
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-3 w-3 ml-1 inline-block cursor-help text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    <div className="space-y-2">
                      <Badge variant={stage.badgeVariant}>{stage.badge}</Badge>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                      
                      {/* Characteristics for each stage */}
                      <div className="pt-2 text-xs text-muted-foreground">
                        {stage.id === 'emerging' && (
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Limited customer awareness</li>
                            <li>Few competitors, mostly startups</li>
                            <li>High R&D investment needed</li>
                            <li>Focus on early adopters</li>
                          </ul>
                        )}
                        {stage.id === 'growing' && (
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Rapidly expanding customer base</li>
                            <li>Increasing competition</li>
                            <li>Focus on market share growth</li>
                            <li>Product improvements and extensions</li>
                          </ul>
                        )}
                        {stage.id === 'mature' && (
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Market saturation beginning</li>
                            <li>Strong competitive landscape</li>
                            <li>Focus on efficiency and differentiation</li>
                            <li>Product line extensions</li>
                          </ul>
                        )}
                        {stage.id === 'declining' && (
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Diminishing customer demand</li>
                            <li>Industry consolidation</li>
                            <li>Price competition intensifies</li>
                            <li>Focus on remaining profitable niches</li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Selected stage information */}
        <motion.div 
          variants={itemVariants}
          className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between"
        >
          <div className="flex items-center">
            <Badge variant={selectedStage.badgeVariant} className="mr-2">
              {selectedStage.badge}
            </Badge>
            <span className="text-sm text-gray-600">{selectedStage.description}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Optional: Export a simplified version for smaller contexts
export function MaturityStageCard({ 
  stage, 
  isSelected, 
  onClick 
}: { 
  stage: 'emerging' | 'growing' | 'mature' | 'declining'; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const stageInfo = {
    'emerging': { 
      label: 'Emerging', 
      color: '#3b82f6', 
      badge: 'Early Stage',
      description: 'High risk, high potential'
    },
    'growing': { 
      label: 'Growing', 
      color: '#10b981', 
      badge: 'High Growth',
      description: 'Rapid expansion phase'
    },
    'mature': { 
      label: 'Mature', 
      color: '#f59e0b', 
      badge: 'Stable',
      description: 'Established, competitive'
    },
    'declining': { 
      label: 'Declining', 
      color: '#ef4444', 
      badge: 'Contracting',
      description: 'Diminishing returns'
    }
  };
  
  const info = stageInfo[stage];
  
  return (
    <div 
      className={`border rounded-md p-2 cursor-pointer transition-all duration-200
                ${isSelected ? 'border-2 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
      style={{ borderColor: isSelected ? info.color : '' }}
      onClick={onClick}
    >
      <div className="text-xs font-medium" style={{ color: info.color }}>{info.label}</div>
      <div className="text-xs text-gray-500 truncate mt-1">{info.description}</div>
    </div>
  );
} 