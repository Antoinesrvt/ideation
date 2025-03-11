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
  Check, ChevronDown, ChevronUp, Globe, Building, BarChart
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MarketSize } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { EnhancedSlider } from './EnhancedSlider';
import { MarketSizeFunnel } from './MarketSizeFunnel';

interface MarketSizingCalculatorProps {
  initialData?: MarketSize;
  onSave?: (data: MarketSize) => void;
}

export function MarketSizingCalculator({ initialData, onSave }: MarketSizingCalculatorProps) {
  // State for all form values
  const [tamValue, setTamValue] = useState(initialData?.tam ? initialData.tam.toString() : '');
  const [samValue, setSamValue] = useState(initialData?.sam ? initialData.sam.toString() : '');
  const [somValue, setSomValue] = useState(initialData?.som ? initialData.som.toString() : '');
  const [tamMethod, setTamMethod] = useState<'top-down' | 'bottom-up' | 'value-theory'>(
    initialData?.tamMethod || 'top-down'
  );
  const [samPercentage, setSamPercentage] = useState(initialData?.samPercentage || 30); // Default to 30% of TAM
  const [somPercentage, setSomPercentage] = useState(initialData?.somPercentage || 10); // Default to 10% of SAM
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [activeMarketType, setActiveMarketType] = useState<'b2b' | 'b2c'>('b2b');
  
  const { toast } = useToast();
  
  // Parse number values
  const parsedTam = tamValue ? parseFloat(tamValue) : 0;
  const parsedSam = samValue ? parseFloat(samValue) : 0;
  const parsedSom = somValue ? parseFloat(somValue) : 0;
  
  // Handle TAM change and update SAM and SOM based on percentages
  useEffect(() => {
    if (tamValue && !isNaN(parseFloat(tamValue))) {
      const tamNumber = parseFloat(tamValue);
      const samNumber = (tamNumber * samPercentage) / 100;
      setSamValue(samNumber.toString());
      
      const somNumber = (samNumber * somPercentage) / 100;
      setSomValue(somNumber.toString());
    }
  }, [tamValue, samPercentage, somPercentage]);
  
  // Handle form submission
  const handleCalculate = () => {
    if (!tamValue) {
      toast({
        title: "Missing information",
        description: "Please enter your Total Addressable Market (TAM) value.",
        variant: "destructive"
      });
      return;
    }
    
    setCalculationComplete(true);
    
    if (onSave) {
      const marketSizeData: MarketSize = {
        tam: parsedTam,
        sam: parsedSam,
        som: parsedSom,
        tamMethod: tamMethod,
        samPercentage: samPercentage,
        somPercentage: somPercentage
      };
      
      onSave(marketSizeData);
    }
    
    toast({
      title: "Market sizing calculated",
      description: "Your market sizing estimates have been updated.",
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
    setTamValue('');
    setSamValue('');
    setSomValue('');
    setCalculationComplete(false);
    setSamPercentage(30);
    setSomPercentage(10);
  };
  
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
          Calculate the size of your potential market using the TAM, SAM, and SOM methodology.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Market Type Selection */}
        <div className="space-y-4">
          <Label>Market Type</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={activeMarketType === 'b2b' ? 'default' : 'outline'} 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveMarketType('b2b')}
            >
              <Building className={`h-8 w-8 ${activeMarketType === 'b2b' ? 'text-white' : 'text-primary'}`} />
              <span>B2B Market</span>
            </Button>
            <Button 
              variant={activeMarketType === 'b2c' ? 'default' : 'outline'}
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveMarketType('b2c')}
            >
              <Users className={`h-8 w-8 ${activeMarketType === 'b2c' ? 'text-white' : 'text-primary'}`} />
              <span>B2C Market</span>
            </Button>
          </div>
        </div>
      
        {/* TAM Section */}
        <motion.div 
          className="space-y-4 p-4 border rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 bg-primary/10">Step 1</Badge>
              <Label htmlFor="tam" className="text-lg font-medium">Total Addressable Market (TAM)</Label>
            </div>
            <Select value={tamMethod} onValueChange={(value: any) => setTamMethod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Calculation Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-down">Top-down approach</SelectItem>
                <SelectItem value="bottom-up">Bottom-up approach</SelectItem>
                <SelectItem value="value-theory">Value theory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CurrencyInput
                id="tam"
                value={tamValue}
                onChange={setTamValue}
                placeholder="1,000,000,000"
                helperText="Enter the total market demand for your product or service."
                min={0}
                step={1000000}
              />
            </div>
            
            <div className="bg-muted/40 p-3 rounded-md">
              <h4 className="font-medium mb-2">TAM Calculation Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Top-down: Start with industry research data</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Bottom-up: Multiply total customers by average price</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* SAM Section */}
        <motion.div 
          className="space-y-4 p-4 border rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 bg-primary/10">Step 2</Badge>
              <Label htmlFor="sam" className="text-lg font-medium">Serviceable Addressable Market (SAM)</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-6">
              <CurrencyInput
                id="sam"
                value={samValue}
                onChange={setSamValue}
                placeholder="300,000,000"
                helperText="This is the portion of TAM that your products and services target."
                min={0}
                max={parsedTam}
                step={100000}
              />
              
              <EnhancedSlider
                id="samPercentage"
                label="Percentage of TAM"
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
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
                helperText="Typical SAM is 20-40% of TAM for most businesses"
              />
            </div>
            
            <div className="bg-muted/40 p-3 rounded-md">
              <h4 className="font-medium mb-2">Defining Your SAM</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Consider these factors when determining your SAM:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Geographic limitations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Customer segment focus</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Technical limitations</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* SOM Section */}
        <motion.div 
          className="space-y-4 p-4 border rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 bg-primary/10">Step 3</Badge>
              <Label htmlFor="som" className="text-lg font-medium">Serviceable Obtainable Market (SOM)</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-6">
              <CurrencyInput
                id="som"
                value={somValue}
                onChange={setSomValue}
                placeholder="30,000,000"
                helperText="This is the portion of SAM that you can realistically capture in the next 3-5 years."
                min={0}
                max={parsedSam}
                step={10000}
              />
              
              <EnhancedSlider
                id="somPercentage"
                label="Percentage of SAM"
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
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' }
                ]}
                helperText={`Typical SOM is 5-15% of SAM for ${activeMarketType === 'b2b' ? 'B2B' : 'B2C'} startups`}
              />
            </div>
            
            <div className="bg-muted/40 p-3 rounded-md">
              <h4 className="font-medium mb-2">Realistic SOM Factors</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Consider these factors for a realistic SOM:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Competitive landscape</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Go-to-market resources</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Product readiness</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* Market Size Visualization */}
        <AnimatePresence>
          {calculationComplete && (
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-medium mb-4">Market Size Visualization</h3>
              <MarketSizeFunnel
                tam={parsedTam}
                sam={parsedSam}
                som={parsedSom}
                samPercentage={samPercentage}
                somPercentage={somPercentage}
                className="mt-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Market Size Insights */}
        {calculationComplete && (
          <motion.div 
            className="p-4 bg-primary/5 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Market Sizing Insights</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {parsedSom >= 1000000000 
                    ? "Your projected SOM is highly ambitious. Consider validating your market capture assumptions."
                    : parsedSom >= 100000000
                    ? "Your projected SOM indicates a significant market opportunity that typically requires substantial investment."
                    : parsedSom >= 10000000
                    ? "Your projected SOM represents a solid opportunity that could support a venture-backed startup."
                    : "Your projected SOM is relatively modest. Consider expanding your target market or value proposition."}
                </p>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Industry Context: </span> 
                  {activeMarketType === 'b2b'
                    ? "B2B companies typically see longer sales cycles but higher customer values."
                    : "B2C companies often need larger customer bases to achieve similar revenue levels."}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportToFinancials}>
            <BarChart className="h-4 w-4 mr-2" />
            Export to Financials
          </Button>
          
          <Button onClick={handleCalculate}>
            Calculate Market Size
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 