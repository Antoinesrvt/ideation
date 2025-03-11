import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketSizingCalculator } from './MarketSizingCalculator';
import { motion } from 'framer-motion';
import { 
  BarChart, Target, Globe, LineChart, 
  TrendingUp, PieChart, Info, Layers, Map
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

export function MarketOverview({ data, onUpdate, isLoading }: MarketOverviewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sizing');
  const [marketDefinition, setMarketDefinition] = useState<MarketDefinition>(
    data?.marketDefinition || {
      industry: '',
      geography: 'global',
      maturity: 'growing'
    }
  );
  
  // Calculate completion percentage for market research
  const marketResearchCompletion = calculateCompletionPercentage(data);
  
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
      className="space-y-8"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Market Overview Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Market Research Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold">
                    {marketResearchCompletion}%
                  </span>
                </div>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      Complete all sections of your market overview to enhance your understanding
                      of your market opportunity. This score tracks your progress.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <Progress value={marketResearchCompletion} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Industry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <span className="text-xl font-semibold truncate">
                  {marketDefinition.industry || 'Not defined'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {marketDefinition.geography === 'global' ? 'Global market' : marketDefinition.geography}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Market Maturity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-primary" />
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-semibold capitalize">
                    {marketDefinition.maturity || 'Not defined'}
                  </span>
                  <Badge 
                    variant={marketDefinition.maturity === 'growing' ? 'default' : 
                          marketDefinition.maturity === 'emerging' ? 'outline' :
                          marketDefinition.maturity === 'mature' ? 'secondary' : 'destructive'}>
                    {marketDefinition.maturity === 'growing' ? 'High Growth' : 
                     marketDefinition.maturity === 'emerging' ? 'Early Stage' :
                     marketDefinition.maturity === 'mature' ? 'Stable' : 'Declining'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Market Definition Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              Market Definition
            </CardTitle>
            <CardDescription>
              Define your target market to set the foundation for your market analysis
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
                    onChange={(e) => handleMarketDefinitionChange('industry', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Specify the industry your product or service operates in
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="geography">Geographic Focus</Label>
                  <Select 
                    value={marketDefinition.geography} 
                    onValueChange={(value) => handleMarketDefinitionChange('geography', value)}
                  >
                    <SelectTrigger id="geography">
                      <SelectValue placeholder="Select geographic focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="north-america">North America</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
                      <SelectItem value="latin-america">Latin America</SelectItem>
                      <SelectItem value="middle-east-africa">Middle East & Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maturity">Market Maturity</Label>
                  <Select 
                    value={marketDefinition.maturity} 
                    onValueChange={(value: any) => handleMarketDefinitionChange('maturity', value)}
                  >
                    <SelectTrigger id="maturity">
                      <SelectValue placeholder="Select market maturity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emerging">
                        <div className="flex items-center">
                          <span>Emerging</span>
                          <Badge variant="outline" className="ml-2">Early Stage</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="growing">
                        <div className="flex items-center">
                          <span>Growing</span>
                          <Badge className="ml-2">High Growth</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="mature">
                        <div className="flex items-center">
                          <span>Mature</span>
                          <Badge variant="secondary" className="ml-2">Stable</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="declining">
                        <div className="flex items-center">
                          <span>Declining</span>
                          <Badge variant="destructive" className="ml-2">Contracting</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assess what stage your target market is in currently
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex-1 h-2 bg-muted rounded-full relative overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 ${
                        marketDefinition.maturity === 'emerging' ? 'w-1/4 bg-blue-400' : 
                        marketDefinition.maturity === 'growing' ? 'w-2/4 bg-green-400' :
                        marketDefinition.maturity === 'mature' ? 'w-3/4 bg-yellow-400' : 
                        'w-full bg-red-400'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {marketDefinition.maturity === 'emerging' ? 'Early opportunities, high risk' : 
                     marketDefinition.maturity === 'growing' ? 'Rapid growth phase' :
                     marketDefinition.maturity === 'mature' ? 'Stable, competitive' : 
                     'Limited growth, consolidation'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={() => {
                toast({
                  title: "Market definition saved",
                  description: "Your market definition has been updated."
                });
              }}
            >
              Save Market Definition
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Market Sizing Calculator */}
      <motion.div variants={itemVariants}>
        <MarketSizingCalculator 
          initialData={data?.marketSize} 
          onSave={handleMarketSizeUpdate} 
        />
      </motion.div>
      
      {/* Placeholder for future sections */}
      <motion.div variants={itemVariants}>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2 text-primary" />
              Market Segmentation
            </CardTitle>
            <CardDescription>
              Break down your market into addressable segments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Market Segmentation Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This feature will allow you to define and analyze specific market segments 
                based on demographics, behavior, needs, and more.
              </p>
              <Button className="mt-4" variant="outline">
                Request early access
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 