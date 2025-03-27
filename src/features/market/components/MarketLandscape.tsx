'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, Users, Building2, Handshake, 
  TrendingUp, FileText, Target, 
  Globe, PieChart, ExternalLink,
  Info, ChevronRight, ArrowUpRight
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

const MarketSizeVisualization: React.FC<{
  tam: number;
  sam: number;
  som: number;
}> = ({ tam, sam, som }) => {
  return (
    <div className="relative flex justify-center items-center mt-4">
      {/* TAM/SAM/SOM concentric circles visualization */}
      <div className="relative flex flex-col items-center justify-center">
        {/* TAM - largest circle */}
        <motion.div 
          className="absolute w-64 h-64 rounded-full border-2 border-slate-200 bg-slate-50/40 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute -top-8">
            <Badge variant="outline" className="bg-gray-50 text-gray-700 shadow-sm border border-gray-300 py-1.5 px-3 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-gray-500" />
              <span className="font-semibold">TAM: {formatCurrency(tam)}</span>
            </Badge>
          </div>
        </motion.div>
        
        {/* SAM - medium circle */}
        <motion.div 
          className="absolute w-40 h-40 rounded-full border-2 border-blue-200 bg-blue-50/40 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute -left-24">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 shadow-sm border border-blue-200 py-1.5 px-3 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-semibold">SAM: {formatCurrency(sam)}</span>
            </Badge>
          </div>
        </motion.div>
        
        {/* SOM - smallest circle */}
        <motion.div 
          className="absolute w-20 h-20 rounded-full border-2 border-green-200 bg-green-50/40 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="absolute -bottom-9">
            <Badge variant="outline" className="bg-green-50 text-green-700 shadow-sm border border-green-200 py-1.5 px-3 flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-green-500" />
              <span className="font-semibold">SOM: {formatCurrency(som)}</span>
            </Badge>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const MarketLandscape: React.FC<MarketLandscapeProps> = ({
  data,
  onSectionClick,
  currentSection
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
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
      case 'market':
        return (
          <div>
            <h4 className="font-semibold mb-1">Market Definition</h4>
            <p className="text-sm text-muted-foreground mb-2">Define your industry, market size, and segments</p>
            {marketDefinitionComplete ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" /> Market defined
              </div>
            ) : (
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <Info className="h-3 w-3" /> Click to define your market
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
    <Card className="w-full shadow-md bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Market Landscape</h3>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <Badge variant="outline" className="font-medium cursor-help">
                  {overallCompletion}% Complete
                </Badge>
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
                    <div className="flex justify-between text-xs">
                      <span>Customers</span>
                      <span>{customersComplete ? '100%' : data.personas.length > 0 ? '50%' : '0%'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Competitors</span>
                      <span>{competitorsComplete ? '100%' : '0%'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Partners</span>
                      <span>{partnersComplete ? '100%' : '0%'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Trends</span>
                      <span>{trendsComplete ? '100%' : '0%'}</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          {/* Main visualization container with fixed aspect ratio for consistency */}
          <div className="relative w-full" style={{ paddingBottom: "70%" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* TAM - largest circle */}
              <motion.div 
                className="relative w-[80%] h-[80%] rounded-full border-2 border-slate-200 bg-slate-50/50 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* TAM Label */}
                <motion.div 
                  className="absolute -top-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge 
                    variant="outline" 
                    className="bg-gray-50 text-gray-700 shadow-sm border border-gray-300 py-1 px-2 flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium">TAM: {formatCurrency(tam)}</span>
                  </Badge>
                </motion.div>
                
                {/* SAM - medium circle */}
                <motion.div 
                  className="w-[65%] h-[65%] rounded-full border-2 border-blue-200 bg-blue-50/40 flex items-center justify-center relative"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {/* SAM Label */}
                  <motion.div 
                    className="absolute -left-5 transform -translate-x-full"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 shadow-sm border border-blue-200 py-1 px-2 flex items-center gap-1"
                    >
                      <Target className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium">SAM: {formatCurrency(sam)}</span>
                    </Badge>
                  </motion.div>
                  
                  {/* SOM/Market Circle at center */}
                  <motion.div 
                    className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center
                              shadow-md bg-white z-30 transition-colors
                              ${isActive('market') ? 'border-purple-600 ring-2 ring-purple-200' : 
                              marketDefinitionComplete ? 'border-green-500' : 'border-purple-400'}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    onClick={() => onSectionClick('market')}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                      transition: { 
                        type: 'spring',
                        stiffness: 300,
                        damping: 15 
                      }
                    }}
                    whileTap={{
                      scale: 0.95,
                      transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 15
                      }
                    }}
                  >
                    <FileText size={20} className="text-purple-500 mb-1" />
                    <span className="font-medium text-xs">Market</span>
                    
                    {data.overview?.marketDefinition?.industry ? (
                      <div className="mt-1 text-center">
                        <span className="text-[9px] block max-w-[80px] truncate px-1">
                          {data.overview.marketDefinition.industry}
                        </span>
                        
                        {/* Fixed position SOM badge that won't move on hover */}
                        <motion.div 
                          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Badge 
                            variant="outline" 
                            className="bg-green-50 text-green-700 shadow-sm border border-green-200 py-0.5 px-1.5 flex items-center gap-1 text-[9px]"
                          >
                            <PieChart className="h-2 w-2 text-green-500" />
                            <span className="font-medium">SOM: {formatCurrency(som)}</span>
                          </Badge>
                        </motion.div>
                      </div>
                    ) : (
                      <span className="text-[8px] text-purple-600 mt-1">Click to define</span>
                    )}
                  </motion.div>
                </motion.div>
                
                {/* Partners - TOP LEFT, inside TAM circle */}
                <SectionCircle
                  icon={<Handshake />}
                  label="Partners"
                  completed={partnersComplete}
                  onClick={() => onSectionClick('partners')}
                  itemCount={data.partners?.length || 0}
                  isActive={isActive('partners')}
                  position={JSON.stringify({ left: '28%', top: '28%', transform: 'translate(-50%, -50%)' })}
                  popoverContent={getPopoverContent('partners')}
                />
                
                {/* Trends - TOP RIGHT, inside TAM circle */}
                <SectionCircle
                  icon={<TrendingUp />}
                  label="Trends"
                  completed={trendsComplete}
                  onClick={() => onSectionClick('trends')}
                  itemCount={data.trends.length}
                  isActive={isActive('trends')}
                  position={JSON.stringify({ right: '28%', top: '28%', transform: 'translate(50%, -50%)' })}
                  popoverContent={getPopoverContent('trends')}
                />
                
                {/* Competitors - BOTTOM LEFT, inside TAM circle */}
                <SectionCircle
                  icon={<Building2 />}
                  label="Competitors"
                  completed={competitorsComplete}
                  onClick={() => onSectionClick('competitors')}
                  itemCount={data.competitors.length}
                  isActive={isActive('competitors')}
                  position={JSON.stringify({ left: '28%', bottom: '28%', transform: 'translate(-50%, 50%)' })}
                  popoverContent={getPopoverContent('competitors')}
                />
                
                {/* Customers - BOTTOM RIGHT, inside TAM circle */}
                <SectionCircle
                  icon={<Users />}
                  label="Customers"
                  completed={customersComplete}
                  onClick={() => onSectionClick('customers')}
                  itemCount={data.personas.length}
                  isActive={isActive('customers')}
                  position={JSON.stringify({ right: '28%', bottom: '28%', transform: 'translate(50%, 50%)' })}
                  popoverContent={getPopoverContent('customers')}
                />
                
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                  {/* Partners line */}
                  <motion.path 
                    d="M 32% 32% Q 40% 40%, 50% 50%" 
                    fill="transparent"
                    stroke="#10b981" 
                    strokeWidth="1.5"
                    variants={lineVariants}
                    initial="initial"
                    animate="animate"
                    strokeDasharray="4,4"
                    strokeLinecap="round"
                  />
                  
                  {/* Trends line */}
                  <motion.path 
                    d="M 68% 32% Q 60% 40%, 50% 50%" 
                    fill="transparent"
                    stroke="#10b981" 
                    strokeWidth="1.5"
                    variants={lineVariants}
                    initial="initial"
                    animate="animate"
                    strokeDasharray="4,4"
                    strokeLinecap="round"
                  />
                  
                  {/* Competitors line */}
                  <motion.path 
                    d="M 32% 68% Q 40% 60%, 50% 50%" 
                    fill="transparent"
                    stroke="#10b981" 
                    strokeWidth="1.5"
                    variants={lineVariants}
                    initial="initial"
                    animate="animate"
                    strokeDasharray="4,4"
                    strokeLinecap="round"
                  />
                  
                  {/* Customers line */}
                  <motion.path 
                    d="M 68% 68% Q 60% 60%, 50% 50%" 
                    fill="transparent"
                    stroke="#10b981" 
                    strokeWidth="1.5"
                    variants={lineVariants}
                    initial="initial"
                    animate="animate"
                    strokeDasharray="4,4"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
          
          {/* Market metrics summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-blue-50 p-3 rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="text-xs font-medium text-blue-700 mb-1 flex items-center">
                <Target className="h-3.5 w-3.5 mr-1" />
                Target Market (SAM)
              </div>
              <div className="text-lg font-bold text-blue-900">
                {formatCurrency(sam || 0)}
              </div>
              <div className="text-xs text-blue-600 flex items-center mt-1 gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>{sam && tam ? Math.round((sam / tam) * 100) : 0}% of total market</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-purple-50 p-3 rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="text-xs font-medium text-purple-700 mb-1 flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                Customer Base
              </div>
              <div className="text-lg font-bold text-purple-900">
                {totalCustomers > 0 ? totalCustomers.toLocaleString() : "Not defined"}
              </div>
              <div className="text-xs text-purple-600 flex items-center mt-1 gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>{data.personas.length} personas defined</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-amber-50 p-3 rounded-lg border border-amber-100 hover:shadow-md transition-shadow"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="text-xs font-medium text-amber-700 mb-1 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                Market Trends
              </div>
              <div className="text-lg font-bold text-amber-900">
                {data.trends.length > 0 ? (
                  <span>{data.trends.length} identified</span>
                ) : (
                  "Not defined"
                )}
              </div>
              {data.trends.length > 0 && (
                <div className="text-xs flex gap-3 mt-1">
                  <span className="text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> {positiveTrends} rising
                  </span>
                  {negativeTrends > 0 && (
                    <span className="text-red-600 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 rotate-180" /> {negativeTrends} declining
                    </span>
                  )}
                </div>
              )}
            </motion.div>
            
            <motion.div 
              className="bg-red-50 p-3 rounded-lg border border-red-100 hover:shadow-md transition-shadow"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="text-xs font-medium text-red-700 mb-1 flex items-center">
                <Building2 className="h-3.5 w-3.5 mr-1" />
                Competitors
              </div>
              <div className="text-lg font-bold text-red-900">
                {data.competitors.length > 0 ? (
                  <span>{data.competitors.length} mapped</span>
                ) : (
                  "Not defined"
                )}
              </div>
              {avgCompetitorRevenue > 0 && (
                <div className="text-xs text-red-600 flex items-center mt-1 gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Avg revenue: {formatCurrency(avgCompetitorRevenue)}</span>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>In progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span>TAM - Total market</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-300"></div>
              <span>SAM - Serviceable market</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 