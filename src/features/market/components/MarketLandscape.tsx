'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, Users, Building2, Handshake, 
  TrendingUp, FileText, Target, 
  Globe, PieChart, ExternalLink,
  Info, ChevronRight, ArrowUpRight,
  BarChart2, Palette, Calculator, CheckSquare, Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { MarketAnalysisUIData } from '../types';
import { MarketSection } from './MarketSectionNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SectionCircleProps {
  icon: React.ReactNode;
  label: string;
  completed: boolean;
  onClick: () => void;
  itemCount?: number;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: string;
  className?: string;
  popoverContent?: React.ReactNode;
}

interface MarketLandscapeProps {
  data: MarketAnalysisUIData;
  onSectionClick: (section: MarketSection) => void;
  currentSection: string;
}

// Animation variants
const circleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: 0.1
    }
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 15 
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15
    }
  }
};

const lineVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { 
      duration: 1.5, 
      ease: "easeInOut",
      delay: 0.3
    } 
  }
};

const popoverVariants = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 10, 
    transition: { duration: 0.15 }
  }
};

const SectionCircle: React.FC<SectionCircleProps> = ({ 
  icon, 
  label, 
  completed, 
  onClick,
  itemCount = 0,
  isActive = false,
  size = 'md',
  position,
  className,
  popoverContent
}) => {
  const [showPopover, setShowPopover] = useState(false);
  
  // Size mapping - reduced sizes for more compact visualization
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  return (
    <div 
      className="relative"
      style={{ position: 'absolute', ...position && JSON.parse(position) }}
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <motion.div 
        onClick={onClick}
        className={cn(
          "relative flex flex-col items-center justify-center cursor-pointer group", 
          className
        )}
        variants={circleVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        <div className={cn(
          "rounded-full flex items-center justify-center relative transition-all p-3",
          "shadow-md border-2 bg-white",
          sizeClasses[size],
          isActive ? "border-purple-600 ring-2 ring-purple-200 ring-offset-2" : 
          completed ? "border-green-500" : "border-blue-400"
        )}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: isActive ? "text-purple-600" : completed ? "text-green-600" : "text-blue-500", 
            size: size === 'lg' ? 24 : size === 'md' ? 20 : 18 
          })}
          
          {/* Item count badge, if items exist */}
          {itemCount > 0 && (
            <div 
              className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center px-1 z-10 rounded-full text-white font-medium text-xs"
              style={{ backgroundColor: completed ? "#10b981" : "#3b82f6" }}
            >
              {itemCount}
            </div>
          )}
        </div>
        
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <span className={cn(
            "text-sm font-medium transition-all",
            isActive ? "text-purple-700" : "text-gray-700",
            size === 'lg' ? "text-base" : "text-xs"
          )}>
            {label}
          </span>
          
        
        </div>
      </motion.div>
      
      {/* Integrated popover that appears on hover */}
      {popoverContent && (
        <AnimatePresence>
          {showPopover && (
            <motion.div 
              className="absolute z-50 bg-white rounded-xl shadow-lg p-4 w-52 border border-gray-100"
              style={{ 
                left: '50%',
                transform: 'translateX(-50%)',
                top: '100%',
                marginTop: '10px'
              }}
              variants={popoverVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Triangle pointer */}
              <div 
                className="absolute w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"
                style={{ 
                  left: '50%', 
                  marginLeft: '-6px',
                  top: '-6px'
                }}
              />
              
              {popoverContent}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Create a reusable NetworkNode component
interface NetworkNodeProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  position: { x: number, y: number };
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  color?: 'purple' | 'green' | 'blue' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const NetworkNode: React.FC<NetworkNodeProps> = ({
  id,
  label,
  icon,
  position,
  count = 0,
  isActive = false,
  onClick,
  color = 'purple',
  size = 'md'
}) => {
  // Color mappings with refined styling
  const colorMap = {
    purple: {
      bg: 'bg-purple-50',
      border: isActive ? 'border-purple-500' : 'border-purple-200',
      ring: 'ring-purple-200',
      text: 'text-purple-600',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      shadow: 'shadow-purple-100',
      hover: 'hover:bg-purple-100 hover:border-purple-300',
      connection: '#9333ea80'
    },
    green: {
      bg: 'bg-green-50',
      border: isActive ? 'border-green-500' : 'border-green-200',
      ring: 'ring-green-200',
      text: 'text-green-600',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800',
      shadow: 'shadow-green-100',
      hover: 'hover:bg-green-100 hover:border-green-300',
      connection: '#22c55e80'
    },
    blue: {
      bg: 'bg-blue-50',
      border: isActive ? 'border-blue-500' : 'border-blue-200',
      ring: 'ring-blue-200',
      text: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      shadow: 'shadow-blue-100',
      hover: 'hover:bg-blue-100 hover:border-blue-300',
      connection: '#3b82f680'
    },
    red: {
      bg: 'bg-red-50',
      border: isActive ? 'border-red-500' : 'border-red-200',
      ring: 'ring-red-200',
      text: 'text-red-600',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
      shadow: 'shadow-red-100',
      hover: 'hover:bg-red-100 hover:border-red-300',
      connection: '#ef444480'
    }
  };

  // Size mappings - slight adjustments
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const colors = colorMap[color];
  
  // Animation for node appearance
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    // Small delay to allow for transition effects
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300 + Math.random() * 300); // Staggered appearance
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`m-2 absolute ${sizeMap[size]} rounded-full ${colors.bg} flex items-center justify-center z-20 cursor-pointer transition-all duration-200 border shadow-sm
      ${isActive ? `border-2 ${colors.border} ring-2 ${colors.ring} ${colors.shadow}` : `border ${colors.border} ${colors.hover}`}`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.5})`,
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-in-out'
      }}
      onClick={onClick}
      data-node-id={id}
    >
      <div className="flex flex-col items-center text-center">
        {React.cloneElement(icon as React.ReactElement, { 
          className: colors.text,
          size: size === 'lg' ? 22 : size === 'md' ? 20 : 18 
        })}
        <div className="text-[10px] font-medium mt-1">{label}</div>
        {count > 0 && (
          <Badge className={`mt-0.5 text-[8px] py-0 px-1.5 ${colors.badgeBg} ${colors.badgeText}`}>
            {count}
          </Badge>
        )}
      </div>
    </div>
  );
};

interface MarketSizeItem {
  label: string;
  value: number;
  total: number;
  percentage: number;
  color: string;
  growthRate?: number;
}

interface MarketSizeVisualizationProps {
  data: MarketSizeItem[];
  title?: string;
  description?: string;
}

const MarketSizeVisualization: React.FC<MarketSizeVisualizationProps> = ({
  data,
  title = 'Market Size',
  description
}) => {
  const [hoveredItem, setHoveredItem] = React.useState<MarketSizeItem | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Format large numbers with K, M, B suffixes
  const formatValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value}`;
  };
  
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Info className="h-3.5 w-3.5 text-gray-500" />
              <span className="sr-only">More info</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side="top" className="w-64">
            <p className="text-xs text-gray-600">
              {description || 'The market size visualization shows the relative size of different market segments.'}
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden flex">
        {data.map((item, index) => (
          <div
            key={index}
            className="h-full relative group cursor-pointer"
            style={{ 
              width: `${item.percentage}%`, 
              backgroundColor: item.color,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            
            {/* Only show label on larger segments or on hover */}
            {(item.percentage > 15 || hoveredItem === item) && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm">
                {item.label}
              </span>
            )}
            
            {/* Hover card with detailed info */}
            <HoverCard open={hoveredItem === item}>
              <HoverCardTrigger asChild>
                <div className="absolute inset-0" />
              </HoverCardTrigger>
              <HoverCardContent 
                side="top" 
                className="w-56 p-3 bg-white/95 backdrop-blur-sm"
                style={{
                  borderLeft: `3px solid ${item.color}`
                }}
              >
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium">{item.label}</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="text-gray-500">Market size:</div>
                    <div className="font-medium text-right">{formatValue(item.value)}</div>
                    
                    <div className="text-gray-500">% of total:</div>
                    <div className="font-medium text-right">{item.percentage.toFixed(1)}%</div>
                    
                    {item.growthRate !== undefined && (
                      <>
                        <div className="text-gray-500">Growth rate:</div>
                        <div className={`font-medium text-right ${item.growthRate > 0 ? 'text-green-600' : 
                          item.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {item.growthRate > 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        ))}
      </div>
      
      {/* Expanded view with legend and more details */}
      {isExpanded && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          {data.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{item.label}</span>
                <span className="text-xs text-gray-500">{formatValue(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MarketLandscape: React.FC<MarketLandscapeProps> = ({
  data,
  onSectionClick,
  currentSection
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const networkContainerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Use ResizeObserver to keep track of container dimensions
  React.useEffect(() => {
    if (!networkContainerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(networkContainerRef.current);
    
    return () => {
      if (networkContainerRef.current) {
        resizeObserver.unobserve(networkContainerRef.current);
      }
    };
  }, []);
  
  // Calculate node positions based on container dimensions and aspect ratio
  const getNodePositions = () => {
    // Base positions for a square container
    const basePositions = {
      competitors: { x: 25, y: 25 },
      trends: { x: 75, y: 25 },
      partners: { x: 25, y: 75 },
      customers: { x: 75, y: 75 },
      business: { x: 50, y: 50 } // Center position for business node
    };

    // If we have dimensions, adjust positions based on aspect ratio
    if (dimensions.width > 0 && dimensions.height > 0) {
      const aspectRatio = dimensions.width / dimensions.height;
      
      // For wide containers, spread nodes horizontally
      if (aspectRatio > 1.5) {
        return {
          competitors: { x: 20, y: 25 },
          trends: { x: 80, y: 25 },
          partners: { x: 20, y: 75 },
          customers: { x: 80, y: 75 },
          business: { x: 50, y: 50 }
        };
      }
      
      // For tall containers, compress horizontally and spread vertically
      if (aspectRatio < 0.75) {
        return {
          competitors: { x: 25, y: 20 },
          trends: { x: 75, y: 20 },
          partners: { x: 25, y: 80 },
          customers: { x: 75, y: 80 },
          business: { x: 50, y: 50 }
        };
      }
    }
    
    // Default to base positions if dimensions aren't available or aspect ratio is fairly square
    return basePositions;
  };
  
  const nodePositions = getNodePositions();
  
  // Determine completion status for each section
  const marketDefinitionComplete = !!data.overview?.marketDefinition?.industry;
  const customersComplete = data.personas.length > 0 && data.interviews.length > 0;
  const competitorsComplete = data.competitors.length > 0;
  const partnersComplete = Array.isArray(data.partners) && data.partners.length > 0;
  const trendsComplete = data.trends.length > 0;
  
  // Calculate market metrics
  const totalCustomers = data.personas.reduce((sum, persona) => {
    const size = typeof persona.demographics === 'string' && 
                persona.demographics.match(/\d+/) ? 
                parseInt(persona.demographics.match(/\d+/)?.[0] || '0') : 0;
    return sum + size;
  }, 0);
  
  const avgCompetitorRevenue = data.competitors.length > 0 
    ? data.competitors.reduce((sum, comp) => {
        const revenue = typeof comp.market_share === 'string' && 
                      comp.market_share.match(/\d+/) ? 
                      parseInt(comp.market_share.match(/\d+/)?.[0] || '0') : 0;
        return sum + revenue;
      }, 0) / data.competitors.length 
    : 0;
    
  const positiveTrends = data.trends.filter(trend => trend.direction === 'upward').length;
  const negativeTrends = data.trends.filter(trend => trend.direction === 'downward').length;
  
  // Calculate overall completion percentage
  const sectionsComplete = [
    marketDefinitionComplete, 
    customersComplete, 
    competitorsComplete, 
    partnersComplete,
    trendsComplete
  ].filter(Boolean).length;
  
  const overallCompletion = Math.round((sectionsComplete / 5) * 100);
  
  // Market size values
  const tam = data.overview?.marketSize?.tam || 0;
  const sam = data.overview?.marketSize?.sam || 0;
  const som = data.overview?.marketSize?.som || 0;
  
  // Check if a section is active
  const isActive = (section: string) => currentSection === section;
  
  const getPopoverContent = (section: string) => {
    switch(section) {
      case 'business':
        return (
          <div>
            <h4 className="font-semibold mb-1">Your Business</h4>
            <p className="text-sm text-muted-foreground mb-2">Define your business position, industry, market size, and segments</p>
            {marketDefinitionComplete ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" /> Business defined
              </div>
            ) : (
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <Info className="h-3 w-3" /> Click to define your business
              </div>
            )}
          </div>
        );
      case 'customers':
        return (
          <div>
            <h4 className="font-semibold mb-1">Customer Analysis</h4>
            <p className="text-sm text-muted-foreground mb-2">Define personas and record customer interviews</p>
            <div className="text-xs flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Personas:</span>
                <span className="font-medium">{data.personas.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Interviews:</span>
                <span className="font-medium">{data.interviews.length}</span>
              </div>
            </div>
          </div>
        );
      case 'competitors':
        return (
          <div>
            <h4 className="font-semibold mb-1">Competitor Analysis</h4>
            <p className="text-sm text-muted-foreground mb-2">Track your competitors and their offerings</p>
            <div className="text-xs flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Companies analyzed:</span>
                <span className="font-medium">{data.competitors.length}</span>
              </div>
              {data.competitors.length > 0 && (
                <div className="flex justify-between">
                  <span>Avg. market share:</span>
                  <span className="font-medium">{formatCurrency(avgCompetitorRevenue)}</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'partners':
        return (
          <div>
            <h4 className="font-semibold mb-1">Partnership Network</h4>
            <p className="text-sm text-muted-foreground mb-2">Map your strategic partners and ecosystem</p>
            {partnersComplete ? (
              <div className="text-xs flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Partners mapped:</span>
                  <span className="font-medium">{data.partners?.length || 0}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <Info className="h-3 w-3" /> Click to define your partners
              </div>
            )}
          </div>
        );
      case 'trends':
        return (
          <div>
            <h4 className="font-semibold mb-1">Market Trends</h4>
            <p className="text-sm text-muted-foreground mb-2">Track market trends affecting your business</p>
            <div className="text-xs flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Opportunities:</span>
                <span className="font-medium text-green-600">{positiveTrends}</span>
              </div>
              <div className="flex justify-between">
                <span>Threats:</span>
                <span className="font-medium text-red-600">{negativeTrends}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header with overall status and market health */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-purple-500" />
            Market Landscape
            {overallCompletion >= 80 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 ml-2">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Complete
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {data.overview?.marketDefinition?.industry 
              ? `${data.overview.marketDefinition.industry} industry • ${formatMarketMaturity(data.overview.marketDefinition.maturity)} stage` 
              : 'Define your market to see industry insights'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${overallCompletion}%`,
                      backgroundColor: getProgressColor(overallCompletion)
                    }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">{overallCompletion}%</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Market Analysis Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Complete all sections to get a comprehensive view of your market landscape.
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Market Definition</span>
                    <span>{marketDefinitionComplete ? '100%' : '0%'}</span>
                  </div>
                  <Progress value={marketDefinitionComplete ? 100 : 0} className="h-1" />
                
                  <div className="flex justify-between text-xs">
                    <span>Customers</span>
                    <span>{customersComplete ? '100%' : data.personas.length > 0 ? '50%' : '0%'}</span>
                  </div>
                  <Progress value={customersComplete ? 100 : data.personas.length > 0 ? 50 : 0} className="h-1" />
                
                  <div className="flex justify-between text-xs">
                    <span>Competitors</span>
                    <span>{competitorsComplete ? '100%' : '0%'}</span>
                  </div>
                  <Progress value={competitorsComplete ? 100 : 0} className="h-1" />
                
                  <div className="flex justify-between text-xs">
                    <span>Partners</span>
                    <span>{partnersComplete ? '100%' : '0%'}</span>
                  </div>
                  <Progress value={partnersComplete ? 100 : 0} className="h-1" />
                
                  <div className="flex justify-between text-xs">
                    <span>Trends</span>
                    <span>{trendsComplete ? '100%' : '0%'}</span>
                  </div>
                  <Progress value={trendsComplete ? 100 : 0} className="h-1" />
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onSectionClick('business')}
            className="hidden md:flex"
          >
            <FileText className="h-4 w-4 mr-2" />
            Edit Business Definition
          </Button>
        </div>
      </div>
      
      {/* Main dashboard grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Market size column */}
        <div className="space-y-6">
          <Card className="bg-slate-50/50 border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-500" />
                Market Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 px-2">
                <div className="w-full mx-auto relative">
                  <MarketSizeVisualization 
                    data={[
                      { 
                        label: 'TAM', 
                        value: tam, 
                        total: tam, 
                        percentage: 100, 
                        color: '#9333ea',
                        growthRate: 8.2
                      },
                      { 
                        label: 'SAM', 
                        value: sam, 
                        total: tam, 
                        percentage: (sam / tam) * 100, 
                        color: '#3b82f6',
                        growthRate: 12.5
                      },
                      { 
                        label: 'SOM', 
                        value: som, 
                        total: tam, 
                        percentage: (som / tam) * 100, 
                        color: '#22c55e',
                        growthRate: 15.3
                      }
                    ]}
                    description="TAM (Total Addressable Market) represents the total market demand for your products/services. SAM (Serviceable Available Market) is the portion of TAM targeted by your products and services. SOM (Serviceable Obtainable Market) is the portion of SAM that you can realistically capture."
                  />
                </div>
              </div>
              
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Market penetration</span>
                  <span className="font-medium">{sam && tam ? Math.round((sam / tam) * 100) : 0}%</span>
                </div>
                <Progress value={sam && tam ? (sam / tam) * 100 : 0} className="h-1" />
                
                <div className="flex justify-between text-xs mt-1.5">
                  <span className="text-muted-foreground">Initial capture goal</span>
                  <span className="font-medium">{som && sam ? Math.round((som / sam) * 100) : 0}%</span>
                </div>
                <Progress value={som && sam ? (som / sam) * 100 : 0} className="h-1" />
              </div>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full mt-4 text-xs" 
                onClick={() => onSectionClick('business')}
              >
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Recalculate
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50/50 border shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Palette className="h-4 w-4 mr-2 text-purple-500" />
                Market Maturity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative h-24 mt-2">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gray-200"></div>
                <div className="absolute left-[20%] bottom-0 h-2 w-[1px] bg-gray-300"></div>
                <div className="absolute left-[40%] bottom-0 h-2 w-[1px] bg-gray-300"></div>
                <div className="absolute left-[60%] bottom-0 h-2 w-[1px] bg-gray-300"></div>
                <div className="absolute left-[80%] bottom-0 h-2 w-[1px] bg-gray-300"></div>
                
                <div className="absolute bottom-1 left-0 text-[10px] text-gray-500">Emerging</div>
                <div className="absolute bottom-1 left-[38%] text-[10px] text-gray-500">Growing</div>
                <div className="absolute bottom-1 left-[78%] text-[10px] text-gray-500">Mature</div>
                
                {/* Market maturity curve */}
                <div className="absolute inset-x-0 bottom-6 h-12">
                  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path 
                      d="M0,30 Q25,0 50,5 Q75,10 100,25" 
                      fill="none" 
                      stroke="rgba(147, 51, 234, 0.5)" 
                      strokeWidth="2"
                    />
                  </svg>
                  
                  {/* Current position indicator */}
                  <div 
                    className="absolute bottom-0 w-3 h-3 bg-purple-500 rounded-full shadow-md transform -translate-x-1/2"
                    style={{
                      left: getMaturityPosition(data.overview?.marketDefinition?.maturity || 'growing')
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-3 px-2">
                <h4 className="text-xs font-medium text-purple-700 mb-1">
                  {formatMarketMaturity(data.overview?.marketDefinition?.maturity || 'growing')} Market
                </h4>
                <p className="text-xs text-muted-foreground">
                  {getMaturityDescription(data.overview?.marketDefinition?.maturity || 'growing')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Middle column with market network */}
        <div className="md:col-span-2">
          <Card className="h-full bg-white border shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Globe className="h-4 w-4 mr-2 text-purple-600" />
                Market Network
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-grow relative">
              <div className="absolute inset-0" ref={networkContainerRef}>
                <div className="relative w-full h-full">
                  {/* Connection lines first (lower z-index) */}
                  <NetworkLines 
                    centerPosition={nodePositions.business}
                    connections={[
                      { id: 'partners', position: nodePositions.partners, color: '#22c55e80' },
                      { id: 'trends', position: nodePositions.trends, color: '#3b82f680' },
                      { id: 'competitors', position: nodePositions.competitors, color: '#ef444480' },
                      { id: 'customers', position: nodePositions.customers, color: '#9333ea80' }
                    ]}
                  />

                  {/* Nodes with higher z-index */}
                  {/* Partners node - bottom left */}
                  <NetworkNode
                    id="partners"
                    label="Partners"
                    icon={<Handshake />}
                    position={nodePositions.partners}
                    count={data.partners?.length || 0}
                    color="green"
                    isActive={isActive('partners')}
                    onClick={() => onSectionClick('partners')}
                  />
                  
                  {/* Competitors node - top left */}
                  <NetworkNode
                    id="competitors"
                    label="Competitors"
                    icon={<Building2 />}
                    position={nodePositions.competitors}
                    count={data.competitors.length}
                    color="red"
                    isActive={isActive('competitors')}
                    onClick={() => onSectionClick('competitors')}
                  />
                  
                  {/* Trends node */}
                  <NetworkNode
                    id="trends"
                    label="Trends"
                    icon={<TrendingUp />}
                    position={nodePositions.trends}
                    count={data.trends.length}
                    color="blue"
                    isActive={isActive('trends')}
                    onClick={() => onSectionClick('trends')}
                  />
                  
                  {/* Business node at the center - must be above connection lines */}
                  <NetworkNode
                    id="business"
                    label="Your Business"
                    icon={<Building />}
                    position={nodePositions.business}
                    color="purple"
                    size="lg"
                    isActive={isActive('business')}
                    onClick={() => onSectionClick('business')}
                  />
                  
                  {/* Customers node */}
                  <NetworkNode
                    id="customers"
                    label="Customers"
                    icon={<Users />}
                    position={nodePositions.customers}
                    count={data.personas.length}
                    color="purple"
                    isActive={isActive('customers')}
                    onClick={() => onSectionClick('customers')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Small metric card component
const SmallMetricCard = ({ 
  icon, 
  label, 
  value, 
  subtext, 
  color = "blue",
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtext: string; 
  color?: "blue" | "red" | "green" | "purple" | "amber"; 
  onClick?: () => void;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 hover:bg-blue-100/70",
    red: "bg-red-50 border-red-100 hover:bg-red-100/70",
    green: "bg-green-50 border-green-100 hover:bg-green-100/70",
    purple: "bg-purple-50 border-purple-100 hover:bg-purple-100/70",
    amber: "bg-amber-50 border-amber-100 hover:bg-amber-100/70",
  };
  
  return (
    <motion.div
      className={`p-3 rounded-lg border ${colorClasses[color]} transition-all cursor-pointer`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 + (["blue", "purple", "amber", "red"].indexOf(color) * 0.1) }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-base font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3" />
        <span>{subtext}</span>
      </div>
    </motion.div>
  );
};

// Helper function to get next incomplete section
function getNextIncompleteSection(): MarketSection {
  // Implementation would check completion status of each section
  // and return the first incomplete one
  return 'business';
}

// Helper function to format market maturity
function formatMarketMaturity(maturity: string): string {
  switch (maturity) {
    case 'emerging': return 'Emerging';
    case 'growing': return 'Growing';
    case 'mature': return 'Mature';
    case 'declining': return 'Declining';
    default: return 'Unknown';
  }
}

// Helper function to get market maturity position on the graph
function getMaturityPosition(maturity: string): string {
  switch (maturity) {
    case 'emerging': return '20%';
    case 'growing': return '45%';
    case 'mature': return '75%';
    case 'declining': return '90%';
    default: return '45%';
  }
}

// Helper function to get market maturity description
function getMaturityDescription(maturity: string): string {
  switch (maturity) {
    case 'emerging':
      return 'Early stage market with high growth potential but higher risk. Focus on education and early adoption.';
    case 'growing':
      return 'Rapid growth phase with increasing adoption and expanding customer base. Focus on scaling.';
    case 'mature':
      return 'Stable market with established players. Focus on differentiation and efficiency.';
    case 'declining':
      return 'Market in decline with shrinking demand. Focus on innovation or market exit strategy.';
    default:
      return 'Define your market maturity to see recommendations.';
  }
}

// Helper function to get progress color
function getProgressColor(percentage: number): string {
  if (percentage >= 80) return '#22c55e'; // green-500
  if (percentage >= 50) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
}

interface Connection {
  id: string;
  position: {
    x: number;
    y: number;
  };
  color: string;
}

interface NetworkLinesProps {
  centerPosition: {
    x: number;
    y: number;
  };
  connections: Connection[];
}

const NetworkLines: React.FC<NetworkLinesProps> = ({ centerPosition, connections }) => {
  // Create subtle cross lines for background structure
  const crossLines = [
    // // Horizontal lines
    // <line key="h-1" x1="0%" y1="25%" x2="100%" y2="25%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,3" strokeOpacity="0.4" />,
    // <line key="h-2" x1="0%" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,3" strokeOpacity="0.4" />,
    // <line key="h-3" x1="0%" y1="75%" x2="100%" y2="75%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,3" strokeOpacity="0.4" />,
    
    // // Vertical lines
    // <line key="v-1" x1="25%" y1="0%" x2="25%" y2="100%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,3" strokeOpacity="0.4" />,
    // <line key="v-2" x1="50%" y1="0%" x2="50%" y2="100%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,3" strokeOpacity="0.4" />,
    // <line key="v-3" x1="75%" y1="0%" x2="75%" y2="100%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,3" strokeOpacity="0.4" />,
    
    // Diagonal lines - very subtle
    <line key="d-1" x1="0%" y1="0%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,5" strokeOpacity="0.2" />,
    <line key="d-2" x1="0%" y1="100%" x2="100%" y2="0%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,5" strokeOpacity="0.2" />
  ];

  // Create connection lines from center position to each node
  const connectionLines = connections.map(connection => {
    // Generate random offsets for organic-looking lines
    const offsetX1 = Math.random() * 0.5;
    const offsetY1 = Math.random() * 0.5;
    
    return (
      <g key={connection.id}>
        {/* Draw subtle gradient line for connection */}
        <linearGradient id={`line-gradient-${connection.id}`} gradientUnits="userSpaceOnUse"
          x1={`${centerPosition.x}%`} y1={`${centerPosition.y}%`} 
          x2={`${connection.position.x}%`} y2={`${connection.position.y}%`}>
          <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.2" />
          <stop offset="100%" stopColor={connection.color.replace('80', '40')} />
        </linearGradient>
        
        {/* Main connection line */}
        <line
          x1={`${centerPosition.x}%`}
          y1={`${centerPosition.y}%`}
          x2={`${connection.position.x}%`}
          y2={`${connection.position.y}%`}
          stroke={`url(#line-gradient-${connection.id})`}
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        
        {/* Subtle pulsating dot midway along the line */}
        <circle
          cx={`${centerPosition.x + (connection.position.x - centerPosition.x) * 0.6 + offsetX1}%`}
          cy={`${centerPosition.y + (connection.position.y - centerPosition.y) * 0.6 + offsetY1}%`}
          r="0.4"
          fill={connection.color.replace('80', '30')}
          className="animate-pulse"
        />
      </g>
    );
  });

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ zIndex: 1 }}
    >
      <g className="cross-lines">{crossLines}</g>
      <g className="connection-lines">{connectionLines}</g>
    </svg>
  );
}; 