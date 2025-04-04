import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketSizingCalculator } from './MarketSizingCalculator';
import { motion } from 'framer-motion';
import { 
  BarChart, Target, Globe, LineChart, 
  TrendingUp, PieChart, Info, Layers, Map,
  FileQuestion, ArrowRight, CheckCircle, AlertCircle, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { MarketOverviewData, MarketSize, MarketDefinition } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MarketSizeFunnel } from './MarketSizeFunnel';
import { MarketMaturityCurve } from './MarketMaturityCurve';
import { SegmentationChart, SegmentCard } from './SegmentationChart';
import { AssumptionTracker, MarketAssumption } from './AssumptionTracker';
import { generateId } from '@/lib/utils';
import { MarketSizeInsights } from './MarketSizeInsights';
import { MarketSizingModal } from './MarketSizingModal';

interface MarketOverviewProps {
  data?: MarketOverviewData;
  onUpdate?: (data: Partial<MarketOverviewData>) => void;
  isLoading?: boolean;
}

// Animation variants for content
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

// Item variants for staggered animations
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  }
};

// Mock data for assumptions
const mockAssumptions: MarketAssumption[] = [
  {
    id: '1',
    text: 'Early adopters will pay at least $50/month for this solution',
    status: 'unverified',
    createdAt: new Date(),
  },
  {
    id: '2',
    text: 'The target market is growing at 15%+ annually',
    status: 'validated',
    createdAt: new Date(),
    validationMethod: 'Industry report'
  },
  {
    id: '3',
    text: 'Current alternatives are too expensive for SMBs',
    status: 'unverified',
    createdAt: new Date(),
  }
];

export function MarketOverview({ data, onUpdate, isLoading }: MarketOverviewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('market');
  const [marketDefinition, setMarketDefinition] = useState<MarketDefinition>(
    data?.marketDefinition || {
      industry: '',
      geography: 'global',
      maturity: 'growing'
    }
  );
  
  // State for market segments
  const [segments, setSegments] = useState<Array<{name: string; size: number; growth: number}>>(
    data?.segments || []
  );
  
  // State for editing segments
  const [editingSegment, setEditingSegment] = useState<{name: string; size: number; growth: number} | null>(null);
  
  // State for assumptions
  const [assumptions, setAssumptions] = useState<MarketAssumption[]>(mockAssumptions);
  
  // Calculate completion percentage for market research
  const marketResearchCompletion = calculateCompletionPercentage(data);
  
  // Update local state when props change
  useEffect(() => {
    if (data?.marketDefinition) {
      setMarketDefinition(data.marketDefinition);
    }
    if (data?.segments) {
      setSegments(data.segments);
    }
  }, [data]);
  
  const handleMarketSizeUpdate = (marketSize: MarketSize) => {
    if (onUpdate) {
      onUpdate({
        marketSize
      });
    }
  };
  
  const handleMarketDefinitionChange = (field: keyof MarketDefinition, value: string) => {
    const updatedDefinition = {
      ...marketDefinition,
      [field]: value
    };
    
    setMarketDefinition(updatedDefinition);
    
    if (onUpdate) {
      onUpdate({
        marketDefinition: updatedDefinition
      });
    }
  };
  
  // Handlers for segments
  const handleAddSegment = () => {
    const newSegment = {
      name: 'New Segment',
      size: 25,
      growth: 10
    };
    const updatedSegments = [...segments, newSegment];
    setSegments(updatedSegments);
    setEditingSegment(newSegment);
    
    if (onUpdate) {
      onUpdate({
        segments: updatedSegments
      });
    }
  };
  
  const handleEditSegment = (segment: {name: string; size: number; growth: number}) => {
    setEditingSegment(segment);
  };
  
  const handleDeleteSegment = (name: string) => {
    const updatedSegments = segments.filter(s => s.name !== name);
    setSegments(updatedSegments);
    
    if (onUpdate) {
      onUpdate({
        segments: updatedSegments
      });
    }
    
    toast({
      title: "Segment deleted",
      description: `"${name}" segment has been removed.`
    });
  };
  
  // Handlers for assumptions
  const handleAddAssumption = (assumption: Omit<MarketAssumption, 'id' | 'createdAt'>) => {
    const newAssumption: MarketAssumption = {
      ...assumption,
      id: generateId(),
      createdAt: new Date()
    };
    setAssumptions([...assumptions, newAssumption]);
  };
  
  const handleUpdateAssumption = (id: string, updates: Partial<MarketAssumption>) => {
    const updatedAssumptions = assumptions.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
    );
    setAssumptions(updatedAssumptions);
  };
  
  const handleDeleteAssumption = (id: string) => {
    setAssumptions(assumptions.filter(a => a.id !== id));
  };
  
  function calculateCompletionPercentage(data?: MarketOverviewData): number {
    if (!data) return 0;
    
    let completed = 0;
    let total = 4; // Total number of main sections to complete
    
    // Check market definition
    if (data.marketDefinition?.industry) completed++;
    
    // Check market sizing (TAM/SAM/SOM)
    if (data.marketSize?.tam && data.marketSize?.sam && data.marketSize?.som) completed++;
    
    // Check segments (would be implemented in a real system)
    if (data.segments && data.segments.length > 0) completed++;
    
    // Additional sections would be checked here...
    
    return Math.floor((completed / total) * 100);
  }
  
  return (
    <motion.div 
      className="h-full w-full overflow-y-auto"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Tabs for different sections */}
      <motion.div
        variants={itemVariants}
        className="h-full w-full flex flex-col"
      >
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="h-full w-full flex flex-col"
        >
          <TabsList className="grid grid-cols-3 w-full flex-shrink-0">
            <TabsTrigger value="market" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Market Definition
            </TabsTrigger>
            <TabsTrigger value="sizing" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Market Sizing
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Segmentation
            </TabsTrigger>
          </TabsList>

          {/* Market Definition Tab */}
          <TabsContent value="market" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              Market Definition
            </CardTitle>
            <CardDescription>
                  Define your target market to set the foundation for your
                  market analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    placeholder="e.g., Healthcare Technology" 
                    value={marketDefinition.industry}
                        onChange={(e) =>
                          handleMarketDefinitionChange(
                            "industry",
                            e.target.value
                          )
                        }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Specify the industry your product or service operates in
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="geography">Geographic Focus</Label>
                  <Select 
                    value={marketDefinition.geography} 
                        onValueChange={(value) =>
                          handleMarketDefinitionChange("geography", value)
                        }
                  >
                    <SelectTrigger id="geography">
                      <SelectValue placeholder="Select geographic focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="north-america">
                            North America
                          </SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="asia-pacific">
                            Asia-Pacific
                          </SelectItem>
                          <SelectItem value="latin-america">
                            Latin America
                          </SelectItem>
                          <SelectItem value="middle-east-africa">
                            Middle East & Africa
                          </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maturity">Market Maturity</Label>
                      <MarketMaturityCurve
                        currentMaturity={marketDefinition.maturity}
                        onChange={(maturity) =>
                          handleMarketDefinitionChange("maturity", maturity)
                        }
                      />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={() => {
                toast({
                  title: "Market definition saved",
                      description: "Your market definition has been updated.",
                });
              }}
            >
              Save Market Definition
            </Button>
          </CardFooter>
        </Card>

            {/* Key Assumptions section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileQuestion className="h-5 w-5 mr-2 text-primary" />
                  Key Market Assumptions
                </CardTitle>
                <CardDescription>
                  Track and validate your critical market assumptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssumptionTracker
                  assumptions={assumptions}
                  onAddAssumption={handleAddAssumption}
                  onUpdateAssumption={handleUpdateAssumption}
                  onDeleteAssumption={handleDeleteAssumption}
                  maxHeight="300px"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Sizing Tab */}
          <TabsContent value="sizing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Market Sizing
                </CardTitle>
                <CardDescription>
                  Estimate the size of your Total Addressable Market (TAM),
                  Serviceable Addressable Market (SAM), and Serviceable
                  Obtainable Market (SOM)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-6 h-full flex items-center justify-center">
                    <MarketSizeFunnel
                      tam={data?.marketSize?.tam || 0}
                      sam={data?.marketSize?.sam || 0}
                      som={data?.marketSize?.som || 0}
                      samPercentage={data?.marketSize?.samPercentage || 0}
                      somPercentage={data?.marketSize?.somPercentage || 0}
                      className="max-w-md mx-auto"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <div className="bg-muted/30 rounded-lg p-5 h-full flex flex-col">
                      <h3 className="text-lg font-medium mb-1">
                        Market Size Summary
                      </h3>

                      {data?.marketSize?.tam ? (
                        <div className="space-y-6">
                          {/* <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-md p-3 shadow-sm">
                              <div className="text-xs text-muted-foreground mb-1">Total Addressable Market</div>
                              <div className="text-lg font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  notation: 'compact',
                                  maximumFractionDigits: 1
                                }).format(data?.marketSize?.tam || 0)}
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-md p-3 shadow-sm">
                              <div className="text-xs text-muted-foreground mb-1">Serviceable Market</div>
                              <div className="text-lg font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  notation: 'compact',
                                  maximumFractionDigits: 1
                                }).format(data?.marketSize?.sam || 0)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {data?.marketSize?.samPercentage}% of TAM
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-md p-3 shadow-sm">
                              <div className="text-xs text-muted-foreground mb-1">Obtainable Market</div>
                              <div className="text-lg font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  notation: 'compact',
                                  maximumFractionDigits: 1
                                }).format(data?.marketSize?.som || 0)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {data?.marketSize?.somPercentage}% of SAM
                              </div>
                            </div>
                          </div> */}

                          <MarketSizeInsights
                            tam={data?.marketSize?.tam || 0}
                            sam={data?.marketSize?.sam || 0}
                            som={data?.marketSize?.som || 0}
                            industry={marketDefinition.industry}
                            className="mt-4"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-grow text-center">
                          <Target className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No market sizing data yet
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Use the calculator to determine your market sizing
                            values based on your target market and industry.
                          </p>
                        </div>
                      )}

                      <div className="mt-auto pt-4">

                        <MarketSizingModal
          initialData={data?.marketSize} 
          onSave={handleMarketSizeUpdate} 
                          trigger={
                            <Button className="w-full flex items-center justify-center gap-2">
                              <Calculator className="h-4 w-4" />
                              <span>
                                {data?.marketSize?.tam
                                  ? "Recalculate Market Size"
                                  : "Calculate Market Size"}
                              </span>
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segmentation Tab */}
          <TabsContent value="segments" className="space-y-4">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2 text-primary" />
              Market Segmentation
            </CardTitle>
            <CardDescription>
              Break down your market into addressable segments
            </CardDescription>
          </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex justify-between mb-4">
                      <h3 className="text-sm font-medium">Segment Breakdown</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddSegment}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Add Segment
                      </Button>
                    </div>

                    <div className="h-[300px] border rounded-md">
                      <SegmentationChart
                        segments={segments}
                        onSegmentClick={handleEditSegment}
                      />
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>
                        Click on any segment bubble to edit its details. Add
                        segments that represent distinct customer groups or
                        market categories.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      Segment Details
                    </h3>
                    <div className="space-y-4">
                      {segments.length > 0 ? (
                        segments.map((segment) => (
                          <SegmentCard
                            key={segment.name}
                            name={segment.name}
                            size={segment.size}
                            growth={segment.growth}
                            onEdit={() => handleEditSegment(segment)}
                            onDelete={() => handleDeleteSegment(segment.name)}
                          />
                        ))
                      ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-md">
                          <Layers className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                          <p className="text-muted-foreground">
                            No segments defined yet
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={handleAddSegment}
                          >
                            <Layers className="h-4 w-4 mr-2" />
                            Add Segment
              </Button>
                        </div>
                      )}
                    </div>
                  </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
} 