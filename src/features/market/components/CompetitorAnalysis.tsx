import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BarChart2, PlusCircle, Edit, Trash2, Share2, Download, HelpCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CompetitorMatrix } from './CompetitorMatrix';
import { FeatureComparisonTable } from './FeatureComparisonTable';
import { CompetitorRadarChart, Dimension, CompetitorRating } from './CompetitorRadarChart';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, TooltipProps } from 'recharts';

// Re-use the Competitor interface
export interface Competitor {
  id: string;
  name: string;
  website?: string | null;
  market_share?: string | null;
  customer_sentiment?: number | null;
  positioning?: string | null;
  price?: string | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  // Include all the fields from our enhanced schema
  [key: string]: any;
}

// Feature interface for comparison table
export interface Feature {
  id: string;
  name: string;
  category?: string;
  importance?: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
}

// Feature status for comparison table
export interface FeatureStatus {
  featureId: string;
  competitorId: string;
  status: 'yes' | 'partial' | 'no' | 'planned' | 'unknown';
  notes?: string;
}

// Props for the CompetitorAnalysis component
interface CompetitorAnalysisProps {
  competitors: Competitor[];
  projectId: string;
  className?: string;
  onAddCompetitor?: (competitor: Omit<Competitor, 'id'>) => Promise<Competitor>;
  onUpdateCompetitor?: (competitor: Competitor) => Promise<void>;
  onDeleteCompetitor?: (id: string) => Promise<void>;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

// Default dimensions for radar chart
const DEFAULT_DIMENSIONS: Dimension[] = [
  { id: 'price', label: 'Price Competitiveness', description: 'How competitive is their pricing model?' },
  { id: 'features', label: 'Feature Richness', description: 'How comprehensive is their feature set?' },
  { id: 'ux', label: 'User Experience', description: 'How good is their user experience and interface?' },
  { id: 'innovation', label: 'Innovation', description: 'How innovative is their product or approach?' },
  { id: 'market_reach', label: 'Market Reach', description: 'How broad is their market reach and penetration?' },
  { id: 'customer_support', label: 'Customer Support', description: 'How good is their customer support and service?' },
];

// Default features for comparison
const DEFAULT_FEATURES: Feature[] = [
  { id: 'f1', name: 'User Authentication', category: 'Core', importance: 'high' },
  { id: 'f2', name: 'Data Export', category: 'Data', importance: 'medium' },
  { id: 'f3', name: 'Mobile App', category: 'Platform', importance: 'high' },
  { id: 'f4', name: 'API Access', category: 'Integration', importance: 'high' },
  { id: 'f5', name: 'Custom Reporting', category: 'Analytics', importance: 'medium' },
  { id: 'f6', name: 'Team Collaboration', category: 'Collaboration', importance: 'medium' },
  { id: 'f7', name: 'White Labeling', category: 'Customization', importance: 'low' },
  { id: 'f8', name: '24/7 Support', category: 'Support', importance: 'medium' },
];

// Sample ratings for demonstration
const generateSampleRatings = (competitors: Competitor[], dimensions: Dimension[]): CompetitorRating[] => {
  const ratings: CompetitorRating[] = [];
  
  competitors.forEach(competitor => {
    dimensions.forEach(dimension => {
      // Generate a random rating between 3 and 9
      const randomRating = Math.floor(Math.random() * 7) + 3;
      
      ratings.push({
        competitorId: competitor.id,
        dimensionId: dimension.id,
        rating: randomRating
      });
    });
  });
  
  return ratings;
};

// Sample feature statuses for demonstration
const generateSampleFeatureStatuses = (competitors: Competitor[], features: Feature[]): FeatureStatus[] => {
  const statuses: FeatureStatus[] = [];
  const statusOptions: Array<FeatureStatus['status']> = ['yes', 'partial', 'no', 'planned', 'unknown'];
  
  competitors.forEach(competitor => {
    features.forEach(feature => {
      // Select a random status
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      statuses.push({
        competitorId: competitor.id,
        featureId: feature.id,
        status: randomStatus
      });
    });
  });
  
  return statuses;
};

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-secondary border rounded-md shadow-sm p-2 text-xs">
        <p className="font-medium">{label}</p>
        <p>Market Share: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export function CompetitorAnalysis({
  competitors,
  projectId,
  className,
  onAddCompetitor,
  onUpdateCompetitor,
  onDeleteCompetitor,
  isLoading = false,
  isReadOnly = false
}: CompetitorAnalysisProps) {
  const [activeTab, setActiveTab] = useState('positioning');
  const [dimensions, setDimensions] = useState<Dimension[]>(DEFAULT_DIMENSIONS);
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);
  const [ratings, setRatings] = useState<CompetitorRating[]>([]);
  const [featureStatuses, setFeatureStatuses] = useState<FeatureStatus[]>([]);
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const { toast } = useToast();
  
  // Handle rating changes from the radar chart
  const handleRatingChange = async (rating: CompetitorRating): Promise<void> => {
    try {
      // Update rating in state
      setRatings(prev => prev.map(r => 
        r.competitorId === rating.competitorId && r.dimensionId === rating.dimensionId
          ? rating
          : r
      ));
      
      // Here you would typically save to database
      toast({
        title: "Rating updated",
        description: "Competitor rating has been updated successfully.",
      });
      
      // If onUpdateCompetitor is provided, you could use it to save the new data
      // This depends on your data structure
      
    } catch (error) {
      toast({
        title: "Error updating rating",
        description: "There was a problem updating the competitor rating.",
        variant: "destructive",
      });
      console.error("Error updating competitor rating:", error);
    }
  };
  
  // Handle feature status changes from the feature comparison table
  const handleFeatureStatusChange = async (updatedStatus: FeatureStatus): Promise<void> => {
    try {
      // Update status in state
      setFeatureStatuses(prev => {
        const existingIndex = prev.findIndex(
          s => s.competitorId === updatedStatus.competitorId && s.featureId === updatedStatus.featureId
        );
        
        if (existingIndex >= 0) {
          const newStatuses = [...prev];
          newStatuses[existingIndex] = updatedStatus;
          return newStatuses;
        } else {
          return [...prev, updatedStatus];
        }
      });
      
      // Here you would typically save to database
      toast({
        title: "Feature status updated",
        description: "Competitor feature status has been updated successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error updating feature status",
        description: "There was a problem updating the feature status.",
        variant: "destructive",
      });
      console.error("Error updating feature status:", error);
    }
  };
  
  // Handle adding a new feature to the comparison table
  const handleAddFeature = async (feature: Omit<Feature, 'id'>): Promise<void> => {
    try {
      // Generate a new ID
      const newFeature: Feature = {
        ...feature,
        id: `f${Date.now()}` // Simple ID generation
      };
      
      // Add to features state
      setFeatures(prev => [...prev, newFeature]);
      
      // Only create status entries for existing competitors
      if (competitors.length > 0) {
        // Initialize feature statuses for all competitors
        const newStatuses = competitors.map(competitor => ({
          featureId: newFeature.id,
          competitorId: competitor.id,
          status: 'unknown' as const
        }));
        
        setFeatureStatuses(prev => [...prev, ...newStatuses]);
      }
      
      toast({
        title: "Feature added",
        description: "New feature has been added to the comparison table.",
      });
      
    } catch (error) {
      toast({
        title: "Error adding feature",
        description: "There was a problem adding the new feature.",
        variant: "destructive",
      });
      console.error("Error adding feature:", error);
    }
  };
  
  // Add new competitor
  const handleAddCompetitor = async (competitor: Omit<Competitor, 'id'>) => {
    if (!onAddCompetitor) return;
    
    try {
      setIsAddingCompetitor(false);
      
      const newCompetitor = await onAddCompetitor({
        ...competitor,
        project_id: projectId
      });
      
      // Only create ratings if we need them for the radar chart
      if (activeTab === 'radar' && dimensions.length > 0) {
        // Generate initial ratings for the new competitor
        const newRatings = dimensions.map(dimension => ({
          competitorId: newCompetitor.id,
          dimensionId: dimension.id,
          rating: 5 // Default middle rating
        }));
        
        // Update state
        setRatings(prev => [...prev, ...newRatings]);
      }
      
      // Only create feature statuses if we need them for the feature comparison
      if (activeTab === 'features' && features.length > 0) {
        // Generate initial feature statuses for the new competitor
        const newStatuses = features.map(feature => ({
          featureId: feature.id,
          competitorId: newCompetitor.id,
          status: 'unknown' as const
        }));
        
        // Update state
        setFeatureStatuses(prev => [...prev, ...newStatuses]);
      }
      
      toast({
        title: "Competitor added",
        description: "New competitor has been added successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error adding competitor",
        description: "There was a problem adding the new competitor.",
        variant: "destructive",
      });
      console.error("Error adding competitor:", error);
    }
  };
  
  // Delete competitor
  const handleDeleteCompetitor = async (id: string) => {
    if (!onDeleteCompetitor) return;
    
    try {
      await onDeleteCompetitor(id);
      
      // Remove associated ratings and feature statuses
      setRatings(prev => prev.filter(r => r.competitorId !== id));
      setFeatureStatuses(prev => prev.filter(s => s.competitorId !== id));
      
      toast({
        title: "Competitor deleted",
        description: "The competitor has been deleted successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error deleting competitor",
        description: "There was a problem deleting the competitor.",
        variant: "destructive",
      });
      console.error("Error deleting competitor:", error);
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Competitor Analysis</CardTitle>
            <CardDescription className="text-muted-foreground">
              Analyze and compare your competitors across multiple dimensions.
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingCompetitor(true)}
                disabled={isLoading}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Competitor
              </Button>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Export analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Share analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="px-6 border-b">
            <TabsList className="h-10 bg-transparent">
              <TabsTrigger value="positioning" className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 transition-none">
                Positioning Matrix
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 transition-none">
                Feature Comparison
              </TabsTrigger>
              <TabsTrigger value="radar" className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 transition-none">
                Radar Analysis
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 transition-none">
                Market Stats
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="h-[600px] py-2">
            <TabsContent value="positioning" className="m-0 p-2 data-[state=active]:pb-0">
              {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No competitors yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Add competitors to visualize their positioning in the market.
                  </p>
                  {!isReadOnly && (
                    <Button 
                      onClick={() => setIsAddingCompetitor(true)}
                      disabled={isLoading}
                    >
                      Add First Competitor
                    </Button>
                  )}
                </div>
              ) : (
                <CompetitorMatrix 
                  competitors={competitors}
                  onPositionChange={
                    onUpdateCompetitor ? 
                    (competitorId, x, y) => {
                      // Find the competitor
                      const competitor = competitors.find(c => c.id === competitorId);
                      if (competitor && onUpdateCompetitor) {
                        // Update with new position
                        onUpdateCompetitor({
                          ...competitor,
                          positioning_x: x * 100, // Convert from 0-1 scale to 0-100 scale
                          positioning_y: y * 100  // Convert from 0-1 scale to 0-100 scale
                        });
                      }
                    } : undefined
                  }
                  onSavePositions={
                    onUpdateCompetitor ?
                    (positions, dimensions) => {
                      // For bulk updates, could implement batch update functionality
                      console.log('Saving all positions with dimensions:', dimensions);
                    } : undefined
                  }
                  readOnly={isReadOnly}
                />
              )}
            </TabsContent>
            
            <TabsContent value="features" className="m-0 p-2 data-[state=active]:pb-0">
              {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No competitors yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Add competitors to compare their features.
                  </p>
                  {!isReadOnly && (
                    <Button 
                      onClick={() => setIsAddingCompetitor(true)}
                      disabled={isLoading}
                    >
                      Add First Competitor
                    </Button>
                  )}
                </div>
              ) : (
                <FeatureComparisonTable 
                  competitors={competitors}
                  features={features}
                  featureStatuses={featureStatuses}
                  onUpdateFeatureStatus={handleFeatureStatusChange}
                  onAddFeature={handleAddFeature}
                  readOnly={isReadOnly}
                />
              )}
            </TabsContent>
            
            <TabsContent value="radar" className="m-0 p-2 data-[state=active]:pb-0">
              {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No competitors yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Add competitors to compare their performance across key dimensions.
                  </p>
                  {!isReadOnly && (
                    <Button 
                      onClick={() => setIsAddingCompetitor(true)}
                      disabled={isLoading}
                    >
                      Add First Competitor
                    </Button>
                  )}
                </div>
              ) : (
                <CompetitorRadarChart 
                  competitors={competitors}
                  dimensions={dimensions}
                  ratings={ratings}
                  onRatingChange={handleRatingChange}
                  readOnly={isReadOnly}
                />
              )}
            </TabsContent>
            
            <TabsContent value="stats" className="m-0 p-2 data-[state=active]:pb-0">
              {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No competitors yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Add competitors to view market statistics.
                  </p>
                  {!isReadOnly && (
                    <Button 
                      onClick={() => setIsAddingCompetitor(true)}
                      disabled={isLoading}
                    >
                      Add First Competitor
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-md font-medium mb-4">Market Share Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={competitors.map(comp => ({
                            name: comp.name,
                            value: parseFloat(comp.market_share || '0')
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-lg border">
                    <h3 className="text-md font-medium p-4 border-b">Market Stats Summary</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competitor</TableHead>
                          <TableHead>Market Share</TableHead>
                          <TableHead>Revenue Range</TableHead>
                          <TableHead>Founded</TableHead>
                          <TableHead>Growth Rate</TableHead>
                          <TableHead>Funding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {competitors.map(competitor => (
                          <TableRow key={competitor.id}>
                            <TableCell className="font-medium">{competitor.name}</TableCell>
                            <TableCell>{competitor.market_share || 'N/A'}</TableCell>
                            <TableCell>{competitor.revenue_range || 'N/A'}</TableCell>
                            <TableCell>{competitor.founded_year || 'N/A'}</TableCell>
                            <TableCell>{competitor.growth_rate || 'N/A'}</TableCell>
                            <TableCell>{competitor.funding_status || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
      
      {/* Add Competitor Dialog */}
      {!isReadOnly && (
        <Dialog open={isAddingCompetitor} onOpenChange={setIsAddingCompetitor}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Competitor</DialogTitle>
            </DialogHeader>
            
            <form 
              className="space-y-4 py-2" 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                
                const competitor: Omit<Competitor, 'id'> = {
                  name: data.name as string,
                  website: data.website as string,
                  market_share: data.market_share as string,
                  price: data.price as string,
                  positioning: data.positioning as string,
                  strengths: data.strengths ? (data.strengths as string).split(',').map(s => s.trim()) : null,
                  weaknesses: data.weaknesses ? (data.weaknesses as string).split(',').map(s => s.trim()) : null,
                  notes: data.notes as string,
                  
                  // Additional fields from enhanced schema
                  company_size: data.company_size as string,
                  revenue_range: data.revenue_range as string,
                  founded_year: data.founded_year as string,
                  funding_status: data.funding_status as string,
                  growth_rate: data.growth_rate as string,
                };
                
                handleAddCompetitor(competitor);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Competitor Name*</Label>
                  <Input id="name" name="name" required />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" placeholder="https://..." />
                </div>
                
                <div>
                  <Label htmlFor="market_share">Market Share (%)</Label>
                  <Input id="market_share" name="market_share" placeholder="0.0" />
                </div>
                
                <div>
                  <Label htmlFor="price">Price Point</Label>
                  <Input id="price" name="price" placeholder="$$$" />
                </div>
                
                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <Input id="company_size" name="company_size" placeholder="e.g. 50-200" />
                </div>
                
                <div>
                  <Label htmlFor="revenue_range">Revenue Range</Label>
                  <Input id="revenue_range" name="revenue_range" placeholder="e.g. $1M-$10M" />
                </div>
                
                <div>
                  <Label htmlFor="founded_year">Founded Year</Label>
                  <Input id="founded_year" name="founded_year" placeholder="e.g. 2015" />
                </div>
                
                <div>
                  <Label htmlFor="funding_status">Funding Status</Label>
                  <Input id="funding_status" name="funding_status" placeholder="e.g. Series B" />
                </div>
                
                <div>
                  <Label htmlFor="growth_rate">Growth Rate</Label>
                  <Input id="growth_rate" name="growth_rate" placeholder="e.g. 15%" />
                </div>
                
                <div>
                  <Label htmlFor="positioning">Positioning</Label>
                  <Input id="positioning" name="positioning" placeholder="e.g. Premium" />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="strengths">Strengths (comma separated)</Label>
                  <Input id="strengths" name="strengths" placeholder="UI/UX, Performance, Integrations" />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="weaknesses">Weaknesses (comma separated)</Label>
                  <Input id="weaknesses" name="weaknesses" placeholder="Pricing, Customer Support, Limited Features" />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} placeholder="Additional information about this competitor..." />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsAddingCompetitor(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Competitor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
} 