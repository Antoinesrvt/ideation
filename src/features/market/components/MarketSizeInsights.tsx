import React from 'react';
import { AlertCircle, CheckCircle, InfoIcon, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface MarketSizeInsightsProps {
  tam: number;
  sam: number;
  som: number;
  industry?: string;
  className?: string;
}

export function MarketSizeInsights({
  tam,
  sam,
  som,
  industry,
  className = ''
}: MarketSizeInsightsProps) {
  // Calculate ratios
  const samToTamRatio = tam > 0 ? (sam / tam) * 100 : 0;
  const somToSamRatio = sam > 0 ? (som / sam) * 100 : 0;
  
  // Get industry benchmarks (simplified for demo)
  const getIndustryBenchmarks = () => {
    if (!industry) return null;
    
    const lowercaseIndustry = industry.toLowerCase();
    
    if (lowercaseIndustry.includes('saas') || lowercaseIndustry.includes('software')) {
      return {
        samToTam: { min: 10, max: 30, ideal: 20 },
        somToSam: { min: 3, max: 10, ideal: 5 },
        description: 'SaaS companies typically target specific verticals or company sizes, making SAM 10-30% of TAM. Initial market capture (SOM) is usually 3-10% of SAM in early years.'
      };
    } 
    
    if (lowercaseIndustry.includes('ecommerce') || lowercaseIndustry.includes('retail')) {
      return {
        samToTam: { min: 5, max: 20, ideal: 10 },
        somToSam: { min: 1, max: 5, ideal: 2 },
        description: 'E-commerce is highly competitive with lower barriers to entry, making SAM 5-20% of TAM. Initial market capture (SOM) is typically 1-5% of SAM.'
      };
    } 
    
    if (lowercaseIndustry.includes('health') || lowercaseIndustry.includes('medical')) {
      return {
        samToTam: { min: 15, max: 40, ideal: 25 },
        somToSam: { min: 2, max: 8, ideal: 4 },
        description: 'Healthcare solutions often target specific conditions or demographics, with SAM typically 15-40% of TAM. Regulatory barriers mean SOM is usually 2-8% of SAM initially.'
      };
    }
    
    // Default benchmarks
    return {
      samToTam: { min: 10, max: 30, ideal: 20 },
      somToSam: { min: 2, max: 10, ideal: 5 },
      description: 'For most businesses, a realistic SAM is 10-30% of TAM, while initial SOM is typically 2-10% of SAM depending on competition, barriers to entry, and go-to-market strategy.'
    };
  };
  
  const benchmarks = getIndustryBenchmarks();
  
  // Determine market size status
  const getTamStatus = () => {
    if (tam === 0) return 'empty';
    if (tam < 1000000) return 'small'; // Less than 1M
    if (tam < 10000000) return 'moderate'; // 1M - 10M
    if (tam < 100000000) return 'large'; // 10M - 100M
    return 'huge'; // > 100M
  };
  
  const getSamToTamStatus = () => {
    if (tam === 0 || sam === 0) return 'empty';
    if (!benchmarks) return 'neutral';
    
    if (samToTamRatio < benchmarks.samToTam.min) return 'low';
    if (samToTamRatio > benchmarks.samToTam.max) return 'high';
    return 'good';
  };
  
  const getSomToSamStatus = () => {
    if (sam === 0 || som === 0) return 'empty';
    if (!benchmarks) return 'neutral';
    
    if (somToSamRatio < benchmarks.somToSam.min) return 'low';
    if (somToSamRatio > benchmarks.somToSam.max) return 'high';
    return 'good';
  };
  
  // Get insight message based on market status
  const getInsightMessage = () => {
    const tamStatus = getTamStatus();
    const samToTamStatus = getSamToTamStatus();
    const somToSamStatus = getSomToSamStatus();
    
    if (tamStatus === 'empty') {
      return {
        type: 'warning',
        title: 'Missing Market Size Data',
        message: 'Enter your TAM, SAM, and SOM values to get market size insights.',
        icon: <InfoIcon className="h-5 w-5 text-gray-400" />
      };
    }
    
    if (tamStatus === 'small') {
      return {
        type: 'warning',
        title: 'Small Market Opportunity',
        message: 'Your total addressable market is relatively small. Consider whether this market can support your growth ambitions.',
        icon: <AlertCircle className="h-5 w-5 text-amber-400" />
      };
    }
    
    if (samToTamStatus === 'high' && somToSamStatus !== 'empty') {
      return {
        type: 'warning',
        title: 'Ambitious Market Targeting',
        message: `Your SAM is ${samToTamRatio.toFixed(0)}% of TAM, which is on the higher end. Ensure your target market definition is focused and realistic.`,
        icon: <TrendingUp className="h-5 w-5 text-amber-400" />
      };
    }
    
    if (somToSamStatus === 'high' && samToTamStatus !== 'empty') {
      return {
        type: 'warning',
        title: 'Aggressive Market Share Projection',
        message: `Your projected market share (SOM) is ${somToSamRatio.toFixed(0)}% of SAM, which is ambitious. Consider competitive factors and barriers to entry.`,
        icon: <TrendingUp className="h-5 w-5 text-amber-500" />
      };
    }
    
    if (somToSamStatus === 'low' && tamStatus === 'huge') {
      return {
        type: 'info',
        title: 'Conservative in a Large Market',
        message: `You're targeting a conservative ${somToSamRatio.toFixed(1)}% of your SAM in a large market. This approach may be realistic but consider growth potential.`,
        icon: <LineChart className="h-5 w-5 text-blue-500" />
      };
    }
    
    if (samToTamStatus === 'good' && somToSamStatus === 'good') {
      return {
        type: 'success',
        title: 'Balanced Market Approach',
        message: `Your market sizing ratios align with industry benchmarks. SAM is ${samToTamRatio.toFixed(0)}% of TAM, and SOM is ${somToSamRatio.toFixed(0)}% of SAM.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      };
    }
    
    return {
      type: 'info',
      title: 'General Market Insight',
      message: 'Continue refining your market sizing calculations based on research and competitive analysis.',
      icon: <InfoIcon className="h-5 w-5 text-blue-500" />
    };
  };
  
  const insight = getInsightMessage();
  
  return (
    <div className={cn("space-y-4", className)}>
      <Alert variant={insight.type === 'warning' ? 'destructive' : 'default'}>
        <div className="flex items-start">
          {insight.icon}
          <div className="ml-3">
            <AlertTitle>{insight.title}</AlertTitle>
            <AlertDescription className="mt-1 text-sm">
              {insight.message}
            </AlertDescription>
          </div>
        </div>
      </Alert>
      
      {benchmarks && tam > 0 && (
        <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-md">
          <p className="font-medium">Industry Benchmarks</p>
          <p className="text-muted-foreground text-xs">{benchmarks.description}</p>
          
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span>SAM/TAM Ratio:</span>
              <span className={cn(
                "font-medium",
                getSamToTamStatus() === 'low' ? "text-amber-600" :
                getSamToTamStatus() === 'high' ? "text-amber-600" :
                getSamToTamStatus() === 'good' ? "text-green-600" : ""
              )}>
                {samToTamRatio.toFixed(1)}% 
                {getSamToTamStatus() !== 'empty' && (
                  <span className="text-gray-500 font-normal ml-1">
                    (Benchmark: {benchmarks.samToTam.min}-{benchmarks.samToTam.max}%)
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span>SOM/SAM Ratio:</span>
              <span className={cn(
                "font-medium",
                getSomToSamStatus() === 'low' ? "text-amber-600" :
                getSomToSamStatus() === 'high' ? "text-amber-600" :
                getSomToSamStatus() === 'good' ? "text-green-600" : ""
              )}>
                {somToSamRatio.toFixed(1)}%
                {getSomToSamStatus() !== 'empty' && (
                  <span className="text-gray-500 font-normal ml-1">
                    (Benchmark: {benchmarks.somToSam.min}-{benchmarks.somToSam.max}%)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {tam > 0 && sam > 0 && som > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Market Size Summary</p>
          <div className="text-xs space-y-1 bg-white rounded-md border p-3">
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Total Addressable Market (TAM)</span>
              <span className="font-medium">{formatCurrency(tam)}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Serviceable Addressable Market (SAM)</span>
              <span className="font-medium">{formatCurrency(sam)} <span className="text-gray-400 font-normal">({samToTamRatio.toFixed(1)}% of TAM)</span></span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Serviceable Obtainable Market (SOM)</span>
              <span className="font-medium">{formatCurrency(som)} <span className="text-gray-400 font-normal">({somToSamRatio.toFixed(1)}% of SAM)</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 