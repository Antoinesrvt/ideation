import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  BarChart, Target, Globe, LineChart, 
  TrendingUp, PieChart, Info, Layers, Map,
  FileQuestion, ArrowRight, CheckCircle, AlertCircle, Calculator,
  Building, PencilRuler, Compass, ChevronRight, ChevronDown
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
import { Textarea } from '@/components/ui/textarea';
import { MarketSizeFunnel } from './MarketSizeFunnel';
import { MarketMaturityCurve } from './MarketMaturityCurve';
import { SegmentationChart, SegmentCard } from './SegmentationChart';
import { generateId } from '@/lib/utils';
import { MarketSizeInsights } from './MarketSizeInsights';
import { MarketSizingModal } from './MarketSizingModal';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BusinessSectionProps {
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

export function BusinessSection({ data, onUpdate, isLoading }: BusinessSectionProps) {
  const { toast } = useToast();
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
  
  // Business value proposition
  const [valueProposition, setValueProposition] = useState<string>('');
  
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
    
    if (onUpdate) {
      onUpdate({
        segments: updatedSegments
      });
    }
  };
  
  const handleEditSegment = (segment: {name: string; size: number; growth: number}) => {
    // This would typically open an edit modal
    console.log("Edit segment:", segment);
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
  
  function calculateCompletionPercentage(data?: MarketOverviewData): number {
    if (!data) return 0;
    
    let completed = 0;
    let total = 4; // Total number of main sections to complete
    
    // Check market definition
    if (data.marketDefinition?.industry) completed++;
    
    // Check market sizing (TAM/SAM/SOM)
    if (data.marketSize?.tam && data.marketSize?.sam && data.marketSize?.som) completed++;
    
    // Check segments
    if (data.segments && data.segments.length > 0) completed++;
    
    // Check for value proposition
    if (valueProposition) completed++;
    
    return Math.floor((completed / total) * 100);
  }
  
  return (
    <motion.div
      className="h-full w-full overflow-y-auto"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main content with workflow-based sections */}
      <div className="space-y-6">
        {/* Step 1: Value Proposition & Industry Definition */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <div className="flex items-center">
              <Badge
                variant="outline"
                className="mr-2 h-6 w-6 rounded-full flex items-center justify-center p-0 border-primary"
              >
                1
              </Badge>
              <CardTitle className="text-lg">Define Your Business</CardTitle>
            </div>
            <CardDescription>
              What does your business do and which industry does it operate in?
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry" className="text-base font-medium">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Healthcare Technology"
                    value={marketDefinition.industry}
                    onChange={(e) =>
                      handleMarketDefinitionChange("industry", e.target.value)
                    }
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Specify the industry your product or service operates in
                  </p>
                </div>

                <div>
                  <Label htmlFor="geography" className="text-base font-medium">
                    Geographic Focus
                  </Label>
                  <Select
                    value={marketDefinition.geography}
                    onValueChange={(value) =>
                      handleMarketDefinitionChange("geography", value)
                    }
                  >
                    <SelectTrigger id="geography" className="mt-1.5">
                      <SelectValue placeholder="Select geographic focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="north-america">
                        North America
                      </SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
                      <SelectItem value="latin-america">
                        Latin America
                      </SelectItem>
                      <SelectItem value="middle-east-africa">
                        Middle East & Africa
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="valueProposition"
                    className="text-base font-medium"
                  >
                    Value Proposition
                  </Label>
                  <Textarea
                    id="valueProposition"
                    placeholder="Describe your unique value proposition for this market..."
                    value={valueProposition}
                    onChange={(e) => setValueProposition(e.target.value)}
                    className="min-h-[120px] mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    How does your business uniquely solve problems for customers
                    in this market?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="maturity" className="text-base font-medium">
                  Market Maturity
                </Label>
                <MarketMaturityCurve
                  currentMaturity={marketDefinition.maturity}
                  onChange={(maturity) =>
                    handleMarketDefinitionChange("maturity", maturity)
                  }
                  className="mt-1.5"
                />
                <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    {marketDefinition.maturity === "emerging" &&
                      "In emerging markets, focus on education and building awareness. Early adopters will be key to your success."}
                    {marketDefinition.maturity === "growing" &&
                      "Growing markets present opportunities for rapid expansion. Focus on gaining market share and scaling operations."}
                    {marketDefinition.maturity === "mature" &&
                      "In mature markets, focus on differentiation and efficiency. Consider how to disrupt established players."}
                    {marketDefinition.maturity === "declining" &&
                      "In declining markets, consider pivoting, focusing on niche segments, or exploring innovation opportunities."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Market Size & Growth */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <div className="flex items-center">
              <Badge
                variant="outline"
                className="mr-2 h-6 w-6 rounded-full flex items-center justify-center p-0 border-primary"
              >
                2
              </Badge>
              <CardTitle className="text-lg">Market Size & Growth</CardTitle>
            </div>
            <CardDescription>
              Quantify your market opportunity with TAM, SAM, and SOM estimates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 flex items-center justify-center">
                <MarketSizeFunnel
                  tam={data?.marketSize?.tam || 0}
                  sam={data?.marketSize?.sam || 0}
                  som={data?.marketSize?.som || 0}
                  samPercentage={data?.marketSize?.samPercentage || 0}
                  somPercentage={data?.marketSize?.somPercentage || 0}
                  className="max-w-md mx-auto"
                />
              </div>

              <div className="md:col-span-7">
                <div className="bg-muted/30 rounded-lg p-5 h-full flex flex-col">
                  <h3 className="text-lg font-medium mb-1">
                    Market Size Summary
                  </h3>

                  {data?.marketSize?.tam ? (
                    <div className="space-y-4">
                      <MarketSizeInsights
                        tam={data?.marketSize?.tam || 0}
                        sam={data?.marketSize?.sam || 0}
                        som={data?.marketSize?.som || 0}
                        industry={marketDefinition.industry}
                        className="mt-4"
                      />

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="insights">
                          <AccordionTrigger className="text-sm">
                            Market Insights
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="font-medium text-primary">
                                  Industry Trends
                                </p>
                                <p>
                                  The {marketDefinition.industry || "selected"}{" "}
                                  industry is showing{" "}
                                  {data?.marketSize?.tam > 1000000000
                                    ? "significant"
                                    : "moderate"}{" "}
                                  growth potential with opportunities for new
                                  entrants.
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-primary">
                                  Capture Strategy
                                </p>
                                <p>
                                  With your SOM representing{" "}
                                  {Math.round(
                                    ((data?.marketSize?.som || 0) /
                                      (data?.marketSize?.tam || 1)) *
                                      100
                                  )}
                                  % of the total market, a focused go-to-market
                                  strategy will be crucial.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
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

        {/* Step 3: Customer Segments */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <div className="flex items-center">
              <Badge
                variant="outline"
                className="mr-2 h-6 w-6 rounded-full flex items-center justify-center p-0 border-primary"
              >
                3
              </Badge>
              <CardTitle className="text-lg">Customer Segments</CardTitle>
            </div>
            <CardDescription>
              Break down your market into targetable customer segments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex justify-between mb-4">
                  <h3 className="text-base font-medium">Segment Breakdown</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddSegment}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Add Segment
                  </Button>
                </div>

                <div className="h-[300px] border rounded-md bg-white">
                  {segments.length > 0 ? (
                    <SegmentationChart
                      segments={segments}
                      onSegmentClick={handleEditSegment}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-6">
                        <Layers className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                        <p className="text-muted-foreground mb-4">
                          No customer segments defined yet
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddSegment}
                        >
                          <Layers className="h-4 w-4 mr-2" />
                          Create Your First Segment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    Click on any segment bubble to edit its details. Try to
                    identify 2-5 key segments that represent your most valuable
                    customer groups.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium mb-4">Segment Details</h3>
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
                    <div className="text-center p-6 bg-muted/30 rounded-md">
                      <p className="text-muted-foreground text-sm">
                        Add segments to see their details here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/20 px-6 py-4 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                <Info className="h-4 w-4 inline-block mr-1" />
                Use the Validation panel in the sidebar to track assumptions
                about your customer segments
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Segments saved",
                  description: "Your market segments have been updated.",
                });
              }}
            >
              Save Segments
            </Button>
          </CardFooter>
        </Card>

        {/* Bottom help section */}
        <div className="bg-primary-foreground border rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                After defining your business position, explore the "Customers"
                and "Competitors" sections to complete your market analysis. Use
                the sidebar's Validation panel to track and verify your key
                market assumptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 