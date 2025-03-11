import React from 'react';
import { motion } from 'framer-motion';

interface MarketSizeFunnelProps {
  tam: number;
  sam: number;
  som: number;
  samPercentage: number;
  somPercentage: number;
  className?: string;
}

export function MarketSizeFunnel({ 
  tam, 
  sam, 
  som, 
  samPercentage, 
  somPercentage,
  className = ''
}: MarketSizeFunnelProps) {
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
        />
        <defs>
          <linearGradient id="tamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
          </linearGradient>
        </defs>
        
        {/* SAM Section */}
        <motion.polygon 
          points={samPoints}
          fill="url(#samGradient)"
          stroke="#e2e8f0"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          filter="url(#shadow)"
        />
        <defs>
          <linearGradient id="samGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
          </linearGradient>
        </defs>
        
        {/* SOM Section */}
        <motion.polygon 
          points={somPoints}
          fill="url(#somGradient)"
          stroke="#e2e8f0"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          filter="url(#shadow)"
        />
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
            {formatCurrency(tam)}
          </text>
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
            {formatCurrency(sam)}
          </text>
          <text x={funnelWidth / 2} y={samY + samHeight / 2 + 45} textAnchor="middle" fill="#64748b" fontSize="12">
            {getPercentageText(samPercentage)} of TAM
          </text>
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
            {formatCurrency(som)}
          </text>
          <text x={funnelWidth / 2} y={somY + somHeight / 2 + 55} textAnchor="middle" fill="#e2e8f0" fontSize="12">
            {getPercentageText(somPercentage)} of SAM
          </text>
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
      </svg>
    </div>
  );
} 