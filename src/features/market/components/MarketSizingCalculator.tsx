import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { 
  Info, Target, TrendingUp, Users, DollarSign, HelpCircle, Download, PlusCircle, 
  Check, ChevronDown, ChevronUp, Globe, Building, BarChart, Lightbulb, ArrowLeft, ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MarketSize } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { EnhancedSlider } from './EnhancedSlider';
import { MarketSizeFunnel } from './MarketSizeFunnel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MarketSizingCalculatorProps {
  initialData?: MarketSize;
  onSave?: (data: MarketSize) => void;
  isModal?: boolean; // New prop to indicate if it's being rendered in a modal
}

// Industry presets for quick selection
const INDUSTRY_PRESETS = [
  { name: "SaaS", tam: 150000000000, samPct: 30, somPct: 10, b2b: true },
  { name: "E-commerce", tam: 4700000000000, samPct: 20, somPct: 5, b2b: false },
  { name: "Fintech", tam: 1300000000000, samPct: 25, somPct: 8, b2b: true },
  { name: "Healthcare", tam: 8500000000000, samPct: 15, somPct: 3, b2b: true },
  { name: "Consumer Apps", tam: 400000000000, samPct: 35, somPct: 12, b2b: false },
];

// Step descriptions for the new stepped workflow
const STEP_DESCRIPTIONS = [
  "Define your Total Addressable Market (TAM) - the entire market demand for your product or service.",
  "Calculate your Serviceable Addressable Market (SAM) - the portion of TAM that your product can realistically target.",
  "Determine your Serviceable Obtainable Market (SOM) - the portion of SAM that you can capture in the short term."
];

export function MarketSizingCalculator({ initialData, onSave, isModal = false }: MarketSizingCalculatorProps) {
  // State for all form values
  const [tamValue, setTamValue] = useState(initialData?.tam ? initialData.tam.toString() : '150000000000');
  const [samValue, setSamValue] = useState(initialData?.sam ? initialData.sam.toString() : '45000000000');
  const [somValue, setSomValue] = useState(initialData?.som ? initialData.som.toString() : '4500000000');
  const [tamMethod, setTamMethod] = useState<'top-down' | 'bottom-up' | 'value-theory'>(
    initialData?.tamMethod || 'top-down'
  );
  const [samPercentage, setSamPercentage] = useState(initialData?.samPercentage || 30); // Default to 30% of TAM
  const [somPercentage, setSomPercentage] = useState(initialData?.somPercentage || 10); // Default to 10% of SAM
  const [activeMarketType, setActiveMarketType] = useState<'b2b' | 'b2c'>('b2b');
  const [viewMode, setViewMode] = useState<'values' | 'percentages'>('values');
  
  // New state for stepped workflow
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Add debounce for auto-save
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Show visualization immediately
  const [calculationComplete, setCalculationComplete] = useState(true);
  
  const { toast } = useToast();
  
  // Parse number values
  const parsedTam = tamValue ? parseFloat(tamValue) : 0;
  const parsedSam = samValue ? parseFloat(samValue) : 0;
  const parsedSom = somValue ? parseFloat(somValue) : 0;
  
  // Format currency values consistently
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };
  
  // Auto-calculate when tam or percentages change with debounce
  useEffect(() => {
    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new timeout to debounce rapid changes
    const timeout = setTimeout(() => {
      handleAutoCalculate();
    }, 500); // 500ms debounce
    
    setSaveTimeout(timeout);
    
    // Cleanup on component unmount
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [tamValue, samPercentage, somPercentage, tamMethod]);
  
  // Handle TAM change and update SAM and SOM based on percentages
  const handleAutoCalculate = () => {
    if (tamValue && !isNaN(parseFloat(tamValue))) {
      const tamNumber = parseFloat(tamValue);
      const samNumber = (tamNumber * samPercentage) / 100;
      setSamValue(samNumber.toString());
      
      const somNumber = (samNumber * somPercentage) / 100;
      setSomValue(somNumber.toString());
      
      setCalculationComplete(true);
      
      if (onSave) {
        const marketSizeData: MarketSize = {
          tam: tamNumber,
          sam: samNumber,
          som: somNumber,
          tamMethod: tamMethod,
          samPercentage: samPercentage,
          somPercentage: somPercentage
        };
        
        onSave(marketSizeData);
      }
    }
  };
  
  // Handle preset selection
  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    
    if (presetName && presetName !== 'custom') {
      const preset = INDUSTRY_PRESETS.find(p => p.name === presetName);
      if (preset) {
        setTamValue(preset.tam.toString());
        setSamPercentage(preset.samPct);
        setSomPercentage(preset.somPct);
        setActiveMarketType(preset.b2b ? 'b2b' : 'b2c');
        
        toast({
          title: `${preset.name} preset applied`,
          description: "Market sizing values have been updated.",
        });
      }
    }
  };
  
  // Apply industry preset
  const applyPreset = (preset: typeof INDUSTRY_PRESETS[0]) => {
    setTamValue(preset.tam.toString());
    setSamPercentage(preset.samPct);
    setSomPercentage(preset.somPct);
    setActiveMarketType(preset.b2b ? 'b2b' : 'b2c');
    setSelectedPreset(preset.name);
    
    toast({
      title: `${preset.name} preset applied`,
      description: "Market sizing values have been updated.",
    });
  };
  
  const handleExportToFinancials = () => {
    // In a real implementation, this would connect to your financial planning section
    toast({
      title: "Market sizing exported",
      description: "Your market sizing data has been exported to the financial section."
    });
  };
  
  const handleReset = () => {
    setTamValue('150000000000');
    setSamPercentage(30);
    setSomPercentage(10);
    setActiveMarketType('b2b');
    setSelectedPreset('custom');
    setCurrentStep(1);
    handleAutoCalculate();
    
    toast({
      title: "Market sizing reset",
      description: "Values have been reset to defaults."
    });
  };
  
  const handleFinish = () => {
    handleAutoCalculate();
    toast({
      title: "Market sizing calculation complete",
      description: `Your TAM: ${formatCurrency(parsedTam)}, SAM: ${formatCurrency(parsedSam)}, SOM: ${formatCurrency(parsedSom)}`
    });
  };
  
  // Get description for TAM method
  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'top-down':
        return 'Start with broad market research and narrow down to your segment.';
      case 'bottom-up':
        return 'Start with specific unit economics and scale up to the market.';
      case 'value-theory':
        return 'Calculate maximum value customers would pay for solving their problem.';
      default:
        return '';
    }
  };
  
  // Format market insights based on data
  const getMarketInsight = () => {
    if (parsedSom >= 1000000000) {
      return {
        title: "Ambitious Market Opportunity",
        description: "Your projected SOM is highly ambitious. Consider validating your market capture assumptions and ensuring you have the resources to pursue such a large opportunity.",
        icon: <Target className="h-5 w-5 text-blue-600" />
      };
    } else if (parsedSom >= 100000000) {
      return {
        title: "Significant Market Opportunity",
        description: "Your projected SOM indicates a significant market opportunity that typically requires substantial investment and a strong go-to-market strategy.",
        icon: <TrendingUp className="h-5 w-5 text-green-600" />
      };
    } else if (parsedSom >= 10000000) {
      return {
        title: "Solid Venture Opportunity",
        description: "Your projected SOM represents a solid opportunity that could support a venture-backed startup with good growth potential.",
        icon: <Lightbulb className="h-5 w-5 text-yellow-600" />
      };
    } else {
      return {
        title: "Niche Market Opportunity",
        description: "Your projected SOM is relatively modest. Consider expanding your target market, value proposition, or exploring higher-value customer segments.",
        icon: <Info className="h-5 w-5 text-purple-600" />
      };
    }
  };
  
  const marketInsight = getMarketInsight();
  
  // Render the calculator with or without the outer Card wrapper based on context
  const calculatorContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Market Size Visualization - Takes larger portion of space */}
      <div className="lg:col-span-7 order-2 lg:order-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Market Size Visualization</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'values' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('values')}
                  className="h-8 text-xs"
                >
                  Dollar Values
                </Button>
                <Button
                  variant={viewMode === 'percentages' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('percentages')}
                  className="h-8 text-xs"
                >
                  Percentages
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow flex items-center justify-center pt-4">
            <MarketSizeFunnel
              tam={parsedTam}
              sam={parsedSam}
              som={parsedSom}
              samPercentage={samPercentage}
              somPercentage={somPercentage}
              viewMode={viewMode}
              interactive={isModal}
              onSamChange={isModal ? (value) => {
                const percentage = (value / parsedTam) * 100;
                setSamPercentage(percentage);
              } : undefined}
              onSomChange={isModal ? (value) => {
                const percentage = (value / parsedSam) * 100;
                setSomPercentage(percentage);
              } : undefined}
              className="mt-2"
            />
          </CardContent>
          
          <CardFooter className="bg-muted/20 border-t p-4">
            <div className="flex items-start space-x-3 w-full">
              {marketInsight.icon}
              <div className="flex-grow">
                <h4 className="font-medium text-sm">{marketInsight.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {marketInsight.description}
                </p>
                <div className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold">Industry Context: </span> 
                  {activeMarketType === 'b2b'
                    ? "B2B companies typically see longer sales cycles but higher customer values."
                    : "B2C companies often need larger customer bases to achieve similar revenue levels."}
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Market Size Parameters - Takes smaller portion of space with stepped workflow */}
      <div className="lg:col-span-5 order-1 lg:order-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Market Calculation</CardTitle>
              <Badge variant="outline">Step {currentStep} of 3</Badge>
            </div>
            <CardDescription>
              {STEP_DESCRIPTIONS[currentStep - 1]}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Define TAM */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Market Type & Industry</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Market Type</Label>
                      <div className="flex gap-2">
                        <Button 
                          variant={activeMarketType === 'b2b' ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setActiveMarketType('b2b')}
                          className="flex-1"
                        >
                          <Building className="h-4 w-4 mr-1" />
                          B2B
                        </Button>
                        <Button 
                          variant={activeMarketType === 'b2c' ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setActiveMarketType('b2c')}
                          className="flex-1"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          B2C
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Industry Preset</Label>
                      <Select value={selectedPreset} onValueChange={handlePresetChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select preset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          {INDUSTRY_PRESETS.filter(preset => 
                            preset.b2b === (activeMarketType === 'b2b')
                          ).map(preset => (
                            <SelectItem key={preset.name} value={preset.name}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="tam" className="font-medium">Total Addressable Market (TAM)</Label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Understanding TAM</h4>
                          <p className="text-sm text-muted-foreground">
                            The total market demand for your product or service across all potential users or customers.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <CurrencyInput id="tam" value={tamValue} onChange={setTamValue} min={0} step={1000000} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the total possible market size for your product
                  </p>
                </div>
                
                {/* Advanced options for TAM */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center w-full justify-between mt-4">
                      <span className="text-sm">Advanced Options</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="tamMethod" className="text-sm">TAM Calculation Method</Label>
                      <Select value={tamMethod} onValueChange={(value: any) => setTamMethod(value)}>
                        <SelectTrigger id="tamMethod">
                          <SelectValue placeholder="Calculation Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-down">Top-down approach</SelectItem>
                          <SelectItem value="bottom-up">Bottom-up approach</SelectItem>
                          <SelectItem value="value-theory">Value theory</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {getMethodDescription(tamMethod)}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            
            {/* Step 2: Define SAM */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2 bg-muted p-3 rounded-md mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">TAM</Badge>
                      <span className="font-medium">{formatCurrency(parsedTam)}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="samPercentage" className="font-medium">Serviceable Addressable Market (SAM)</Label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Understanding SAM</h4>
                          <p className="text-sm text-muted-foreground">
                            The portion of your TAM that you can realistically target with your product or service based on geography, market segments, and other factors.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md mb-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">SAM Percentage:</span>
                        <span className="text-sm font-medium">{samPercentage}% of TAM</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="text-xs">Amount:</span>
                        <span className="text-xs">{formatCurrency(parsedSam)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <EnhancedSlider
                      id="samPercentage"
                      value={samPercentage}
                      onChange={setSamPercentage}
                      min={1}
                      max={100}
                      step={1}
                      valueSuffix="%"
                      markers={[
                        { value: 10, label: '10%' },
                        { value: 25, label: '25%' },
                        { value: 50, label: '50%' },
                        { value: 75, label: '75%' }
                      ]}
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Typical ranges:</p>
                      <ul className="text-xs list-disc pl-4 mt-1">
                        <li>20-40% for established markets</li>
                        <li>10-20% for emerging markets</li>
                        <li>5-15% for niche/specialty markets</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Advanced options for SAM */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center w-full justify-between mt-4">
                      <span className="text-sm">Advanced Options</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="sam-advanced" className="text-sm">SAM Direct Input</Label>
                      <CurrencyInput
                        id="sam-advanced"
                        value={samValue}
                        onChange={(value) => {
                          setSamValue(value);
                          if (parsedTam > 0) {
                            const newPercentage = (parseFloat(value) / parsedTam) * 100;
                            if (!isNaN(newPercentage)) {
                              setSamPercentage(Math.min(100, newPercentage));
                            }
                          }
                        }}
                        placeholder="300,000,000"
                        min={0}
                        max={parsedTam}
                        step={100000}
                      />
                      <p className="text-xs text-muted-foreground">
                        Directly enter SAM value instead of using percentage
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            
            {/* Step 3: Define SOM */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2 bg-muted p-3 rounded-md mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">TAM</Badge>
                        <span className="font-medium">{formatCurrency(parsedTam)}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">SAM</Badge>
                        <span className="font-medium">{formatCurrency(parsedSam)}</span>
                        <span className="text-muted-foreground text-xs">({samPercentage}% of TAM)</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="somPercentage" className="font-medium">Serviceable Obtainable Market (SOM)</Label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Understanding SOM</h4>
                          <p className="text-sm text-muted-foreground">
                            The portion of your SAM that you can realistically capture in the short to medium term based on competition, resources, and your go-to-market strategy.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md mb-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">SOM Percentage:</span>
                        <span className="text-sm font-medium">{somPercentage}% of SAM</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="text-xs">Amount:</span>
                        <span className="text-xs">{formatCurrency(parsedSom)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="text-xs">Percentage of TAM:</span>
                        <span className="text-xs">{(samPercentage * somPercentage / 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <EnhancedSlider
                      id="somPercentage"
                      value={somPercentage}
                      onChange={setSomPercentage}
                      min={1}
                      max={100}
                      step={1}
                      valueSuffix="%"
                      markers={[
                        { value: 5, label: '5%' },
                        { value: 10, label: '10%' },
                        { value: 25, label: '25%' },
                        { value: 50, label: '50%' }
                      ]}
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Typical ranges:</p>
                      <ul className="text-xs list-disc pl-4 mt-1">
                        <li>1-5% for new market entrants</li>
                        <li>5-15% for established companies</li>
                        <li>15-30% for market leaders</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Advanced options for SOM */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center w-full justify-between mt-4">
                      <span className="text-sm">Advanced Options</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="som-advanced" className="text-sm">SOM Direct Input</Label>
                      <CurrencyInput
                        id="som-advanced"
                        value={somValue}
                        onChange={(value) => {
                          setSomValue(value);
                          if (parsedSam > 0) {
                            const newPercentage = (parseFloat(value) / parsedSam) * 100;
                            if (!isNaN(newPercentage)) {
                              setSomPercentage(Math.min(100, newPercentage));
                            }
                          }
                        }}
                        placeholder="30,000,000"
                        min={0}
                        max={parsedSam}
                        step={10000}
                      />
                      <p className="text-xs text-muted-foreground">
                        Directly enter SOM value instead of using percentage
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)} className="ml-auto">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button variant="default" onClick={handleFinish}>
                  <Check className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
  
  // If rendered in a modal, don't wrap in a Card
  if (isModal) {
    return calculatorContent;
  }
  
  // Otherwise, wrap in a Card for standalone use
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Market Size Estimation
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Understanding Market Sizing</h4>
                <p className="text-sm text-muted-foreground">
                  TAM (Total Addressable Market): The total market demand for a product or service.
                </p>
                <p className="text-sm text-muted-foreground">
                  SAM (Serviceable Addressable Market): The portion of TAM targeted by your products and services.
                </p>
                <p className="text-sm text-muted-foreground">
                  SOM (Serviceable Obtainable Market): The portion of SAM that you can realistically capture.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardTitle>
        <CardDescription>
          Visualize and calculate the size of your potential market using the TAM, SAM, and SOM methodology.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {calculatorContent}
      </CardContent>
    </Card>
  );
} 