import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Edit, Info } from 'lucide-react';

interface MarketSizeFunnelProps {
  tam: number;
  sam: number;
  som: number;
  samPercentage: number;
  somPercentage: number;
  className?: string;
  viewMode?: 'values' | 'percentages';
  interactive?: boolean;
  onSamChange?: (value: number) => void;
  onSomChange?: (value: number) => void;
}

export function MarketSizeFunnel({ 
  tam, 
  sam, 
  som, 
  samPercentage, 
  somPercentage,
  className = '',
  viewMode = 'values',
  interactive = false,
  onSamChange,
  onSomChange
}: MarketSizeFunnelProps) {
  // Local state for slider values
  const [localSamPercentage, setLocalSamPercentage] = useState(samPercentage);
  const [localSomPercentage, setLocalSomPercentage] = useState(somPercentage);
  const [showSamEdit, setShowSamEdit] = useState(false);
  const [showSomEdit, setShowSomEdit] = useState(false);
  
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };
  
  // Get percentage text
  const getPercentageText = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  // Calculate funnel dimensions
  const funnelHeight = 320;
  const funnelWidth = 400;
  const tamHeight = funnelHeight * 0.4;  // 40% of total height
  const samHeight = funnelHeight * 0.32; // 32% of total height
  const somHeight = funnelHeight * 0.28; // 28% of total height
  
  // Calculate width percentages for each level
  const tamWidth = funnelWidth;
  const samWidth = (funnelWidth * 0.8) * (samPercentage / 100) + (funnelWidth * 0.2); // Min 20% width, max 100%
  const somWidth = (funnelWidth * 0.6) * (somPercentage / 100) + (funnelWidth * 0.1); // Min 10% width, max 70%
  
  // Calculate positions
  const tamY = 0;
  const samY = tamY + tamHeight;
  const somY = samY + samHeight;
  
  // Create funnel points
  const tamPoints = [
    [0, tamY],                    // Top left
    [tamWidth, tamY],             // Top right
    [samWidth + (tamWidth - samWidth) / 2, samY], // Bottom right
    [(tamWidth - samWidth) / 2, samY]             // Bottom left
  ].map(p => p.join(',')).join(' ');
  
  const samPoints = [
    [(tamWidth - samWidth) / 2, samY],             // Top left
    [samWidth + (tamWidth - samWidth) / 2, samY],  // Top right
    [somWidth + (tamWidth - somWidth) / 2, somY],  // Bottom right
    [(tamWidth - somWidth) / 2, somY]              // Bottom left
  ].map(p => p.join(',')).join(' ');
  
  const somPoints = [
    [(tamWidth - somWidth) / 2, somY],             // Top left
    [somWidth + (tamWidth - somWidth) / 2, somY],  // Top right
    [somWidth + (tamWidth - somWidth) / 2, somY + somHeight], // Bottom right
    [(tamWidth - somWidth) / 2, somY + somHeight]  // Bottom left
  ].map(p => p.join(',')).join(' ');

  // Get display values based on view mode
  const getTamDisplay = () => {
    return viewMode === 'values' ? formatCurrency(tam) : '100%';
  };

  const getSamDisplay = () => {
    return viewMode === 'values' ? formatCurrency(sam) : `${samPercentage}%`;
  };

  const getSomDisplay = () => {
    return viewMode === 'values' ? formatCurrency(som) : `${somPercentage}% of SAM (${(samPercentage * somPercentage / 100).toFixed(1)}% of TAM)`;
  };

  // Handler functions for percentage changes
  const handleSamPercentageChange = (newPercentage: number[]) => {
    setLocalSamPercentage(newPercentage[0]);
  };
  
  const handleSomPercentageChange = (newPercentage: number[]) => {
    setLocalSomPercentage(newPercentage[0]);
  };
  
  const applySamChange = () => {
    if (onSamChange) {
      onSamChange(tam * localSamPercentage / 100);
      setShowSamEdit(false);
    }
  };
  
  const applySomChange = () => {
    if (onSomChange) {
      onSomChange(sam * localSomPercentage / 100);
      setShowSomEdit(false);
    }
  };

  // Define tooltip content for each section
  const tamTooltip = `Total Addressable Market: ${formatCurrency(tam)}`;
  const samTooltip = `Serviceable Addressable Market: ${formatCurrency(sam)} (${samPercentage}% of TAM)`;
  const somTooltip = `Serviceable Obtainable Market: ${formatCurrency(som)} (${somPercentage}% of SAM)`;
  
  return (
    <div className={`relative ${className}`} style={{ height: funnelHeight, width: funnelWidth, margin: '0 auto' }}>
      <svg width={funnelWidth} height={funnelHeight} viewBox={`0 0 ${funnelWidth} ${funnelHeight}`} className="overflow-visible">
        {/* Funnel Shadows */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
          </filter>
        </defs>
        
        {/* TAM Section */}
        <motion.polygon 
          points={tamPoints}
          fill="url(#tamGradient)"
          stroke="#e2e8f0"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          filter="url(#shadow)"
          className={interactive ? "cursor-pointer" : ""}
          aria-label={tamTooltip}
        >
          <title>{tamTooltip}</title>
        </motion.polygon>
        <defs>
          <linearGradient id="tamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
          </linearGradient>
        </defs>
        
        {/* SAM Section with Popover for interactive mode */}
        <Popover open={showSamEdit} onOpenChange={setShowSamEdit}>
          <PopoverTrigger asChild>
            <motion.polygon 
              points={samPoints}
              fill="url(#samGradient)"
              stroke="#e2e8f0"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                stroke: interactive && onSamChange ? "#3b82f6" : "#e2e8f0",
                strokeWidth: interactive && onSamChange ? 2 : 1
              }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              filter="url(#shadow)"
              className={interactive && onSamChange ? "cursor-pointer hover:brightness-110" : ""}
              aria-label={samTooltip}
              onClick={() => {
                if (interactive && onSamChange) {
                  setShowSamEdit(true);
                }
              }}
            >
              <title>{interactive && onSamChange ? "Click to adjust SAM percentage" : samTooltip}</title>
            </motion.polygon>
          </PopoverTrigger>
          {interactive && onSamChange && (
            <PopoverContent className="w-80 p-4 z-50" sideOffset={5}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Adjust SAM Percentage</h4>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold">{localSamPercentage}%</span> of TAM
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="sam-percentage" className="text-xs">SAM as percentage of TAM</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="sam-percentage"
                      value={[localSamPercentage]}
                      min={1}
                      max={100}
                      step={1}
                      onValueChange={handleSamPercentageChange}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-center">
                      {localSamPercentage}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground pb-2">
                  Estimated SAM: <span className="font-medium">{formatCurrency(tam * localSamPercentage / 100)}</span>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSamEdit(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={applySamChange}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          )}
        </Popover>
        <defs>
          <linearGradient id="samGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
          </linearGradient>
        </defs>
        
        {/* SOM Section with Popover for interactive mode */}
        <Popover open={showSomEdit} onOpenChange={setShowSomEdit}>
          <PopoverTrigger asChild>
            <motion.polygon 
              points={somPoints}
              fill="url(#somGradient)"
              stroke="#e2e8f0"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                stroke: interactive && onSomChange ? "#3b82f6" : "#e2e8f0",
                strokeWidth: interactive && onSomChange ? 2 : 1
              }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              filter="url(#shadow)"
              className={interactive && onSomChange ? "cursor-pointer hover:brightness-110" : ""}
              aria-label={somTooltip}
              onClick={() => {
                if (interactive && onSomChange) {
                  setShowSomEdit(true);
                }
              }}
            >
              <title>{interactive && onSomChange ? "Click to adjust SOM percentage" : somTooltip}</title>
            </motion.polygon>
          </PopoverTrigger>
          {interactive && onSomChange && (
            <PopoverContent className="w-80 p-4 z-50" sideOffset={5}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Adjust SOM Percentage</h4>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold">{localSomPercentage}%</span> of SAM
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="som-percentage" className="text-xs">SOM as percentage of SAM</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="som-percentage"
                      value={[localSomPercentage]}
                      min={1}
                      max={100}
                      step={1}
                      onValueChange={handleSomPercentageChange}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-center">
                      {localSomPercentage}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground pb-2">
                  Estimated SOM: <span className="font-medium">{formatCurrency(sam * localSomPercentage / 100)}</span><br />
                  Percentage of TAM: <span className="font-medium">{((samPercentage * localSomPercentage) / 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSomEdit(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={applySomChange}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          )}
        </Popover>
        <defs>
          <linearGradient id="somGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.7)" />
          </linearGradient>
        </defs>
        
        {/* TAM Label */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <text x={tamWidth / 2} y={tamY + tamHeight / 3} textAnchor="middle" fill="#1e293b" fontWeight="bold" fontSize="16">
            TAM
          </text>
          <text x={tamWidth / 2} y={tamY + tamHeight / 3 + 25} textAnchor="middle" fill="#1e293b" fontSize="14">
            {getTamDisplay()}
          </text>
          {viewMode === 'percentages' && (
            <text x={tamWidth / 2} y={tamY + tamHeight / 3 + 45} textAnchor="middle" fill="#64748b" fontSize="12">
              {formatCurrency(tam)}
            </text>
          )}
        </motion.g>
        
        {/* SAM Label */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <text x={funnelWidth / 2} y={samY + samHeight / 2} textAnchor="middle" fill="#1e293b" fontWeight="bold" fontSize="16">
            SAM
          </text>
          <text x={funnelWidth / 2} y={samY + samHeight / 2 + 25} textAnchor="middle" fill="#1e293b" fontSize="14">
            {getSamDisplay()}
          </text>
          <text x={funnelWidth / 2} y={samY + samHeight / 2 + 45} textAnchor="middle" fill="#64748b" fontSize="12">
            {viewMode === 'values' ? `${getPercentageText(samPercentage)} of TAM` : formatCurrency(sam)}
          </text>
          {interactive && onSamChange && (
            <g className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => setShowSamEdit(true)}>
              <circle cx={funnelWidth / 2 + 55} cy={samY + samHeight / 2 - 3} r="10" fill="rgba(59, 130, 246, 0.1)" />
              <Edit className="w-4 h-4 text-blue-500" x={funnelWidth / 2 + 53} y={samY + samHeight / 2 - 7} />
            </g>
          )}
        </motion.g>
        
        {/* SOM Label */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1 }}
        >
          <text x={funnelWidth / 2} y={somY + somHeight / 2 + 10} textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="16">
            SOM
          </text>
          <text x={funnelWidth / 2} y={somY + somHeight / 2 + 35} textAnchor="middle" fill="#ffffff" fontSize="14">
            {getSomDisplay()}
          </text>
          {viewMode === 'values' && (
            <text x={funnelWidth / 2} y={somY + somHeight / 2 + 55} textAnchor="middle" fill="#e2e8f0" fontSize="12">
              {getPercentageText(somPercentage)} of SAM
            </text>
          )}
          {interactive && onSomChange && (
            <g className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => setShowSomEdit(true)}>
              <circle cx={funnelWidth / 2 + 55} cy={somY + somHeight / 2 + 10} r="10" fill="rgba(255, 255, 255, 0.2)" />
              <Edit className="w-4 h-4 text-white" x={funnelWidth / 2 + 53} y={somY + somHeight / 2 + 6} />
            </g>
          )}
        </motion.g>
        
        {/* Lines connecting sections */}
        <motion.line 
          x1={(tamWidth - samWidth) / 2} y1={samY}
          x2={(tamWidth - samWidth) / 2 - 80} y2={samY}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="2,2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        />
        <motion.line 
          x1={(tamWidth - somWidth) / 2} y1={somY}
          x2={(tamWidth - somWidth) / 2 - 80} y2={somY}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="2,2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.3 }}
        />
        
        {/* Connector Annotations */}
        <motion.text 
          x={(tamWidth - samWidth) / 2 - 85} 
          y={samY + 5} 
          textAnchor="end" 
          fill="#64748b" 
          fontSize="12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          Serviceable Market
        </motion.text>
        <motion.text 
          x={(tamWidth - somWidth) / 2 - 85} 
          y={somY + 5} 
          textAnchor="end" 
          fill="#64748b" 
          fontSize="12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.5 }}
        >
          Obtainable Market
        </motion.text>

        {/* Interactive hint if enabled */}
        {interactive && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.4, delay: 1.6 }}
            className="pointer-events-none"
          >
            <rect
              x={funnelWidth / 2 - 120}
              y={funnelHeight - 30}
              width="240"
              height="24"
              rx="4"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
            />
            <text 
              x={funnelWidth / 2} 
              y={funnelHeight - 16} 
              textAnchor="middle" 
              fill="#3b82f6" 
              fontSize="12"
              className="font-medium"
            >
              <tspan><Info className="inline h-3 w-3 mr-1 mb-0.5" /></tspan>
              <tspan>Click on SAM/SOM sections to adjust values</tspan>
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
} 