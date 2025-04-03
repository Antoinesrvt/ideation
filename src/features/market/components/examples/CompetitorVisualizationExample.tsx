import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitorPositioningMatrix } from '../CompetitorPositioningMatrix';
import { FeatureComparisonTable } from '../FeatureComparisonTable';
import { CompetitorRadarChart, CompetitorRating, Dimension } from '../CompetitorRadarChart';
import { Competitor } from '../CompetitorAnalysis';

// Define Feature and FeatureStatus interfaces based on actual component implementations
interface Feature {
  id: string;
  name: string;
  description?: string;
  category?: string;
  importance?: 'critical' | 'high' | 'medium' | 'low';
}

interface FeatureStatus {
  competitorId: string;
  featureId: string;
  status: 'yes' | 'partial' | 'no' | 'planned' | 'unknown';
  notes?: string;
}

// Sample competitors for demonstration
const SAMPLE_COMPETITORS: Competitor[] = [
  {
    id: '1',
    name: 'Your Company',
    website: 'https://yourcompany.com',
    market_share: '15',
    price: '$$$',
    strengths: ['Innovative UI', 'Fast customer support', 'Integration ecosystem'],
    weaknesses: ['Limited features in free tier', 'New market entrant'],
    company_size: '50-200',
    revenue_range: '$5M-$20M',
    founded_year: 2019,
    funding_status: 'Series A',
    growth_rate: '45',
    positioning: 'Premium',
    customer_sentiment: 8.5,
  },
  {
    id: '2',
    name: 'Competitor A',
    website: 'https://competitora.com',
    market_share: '35',
    price: '$$$$',
    strengths: ['Market leader', 'Enterprise features', 'Strong brand'],
    weaknesses: ['Expensive', 'Slow to innovate', 'Complex UI'],
    company_size: '1000+',
    revenue_range: '$100M+',
    founded_year: 2010,
    funding_status: 'Public',
    growth_rate: '15',
    positioning: 'Enterprise',
    customer_sentiment: 7.2,
  },
  {
    id: '3',
    name: 'Competitor B',
    website: 'https://competitorb.com',
    market_share: '25',
    price: '$$',
    strengths: ['Affordable', 'Easy to use', 'Good documentation'],
    weaknesses: ['Limited scaling', 'Basic features', 'Few integrations'],
    company_size: '200-500',
    revenue_range: '$20M-$50M',
    founded_year: 2015,
    funding_status: 'Series B',
    growth_rate: '30',
    positioning: 'Mid-market',
    customer_sentiment: 8.1,
  },
  {
    id: '4',
    name: 'Competitor C',
    website: 'https://competitorc.com',
    market_share: '10',
    price: '$',
    strengths: ['Freemium model', 'Open source', 'Developer-focused'],
    weaknesses: ['Limited support', 'Requires technical expertise', 'Fewer business features'],
    company_size: '10-50',
    revenue_range: '$1M-$5M',
    founded_year: 2018,
    funding_status: 'Seed',
    growth_rate: '65',
    positioning: 'Developer',
    customer_sentiment: 8.9,
  },
];

// Sample features for comparison table
const SAMPLE_FEATURES: Feature[] = [
  { id: 'f1', name: 'User Authentication', category: 'Core', importance: 'high' },
  { id: 'f2', name: 'Data Export', category: 'Data', importance: 'medium' },
  { id: 'f3', name: 'Mobile App', category: 'Platform', importance: 'high' },
  { id: 'f4', name: 'API Access', category: 'Integration', importance: 'high' },
  { id: 'f5', name: 'Custom Reporting', category: 'Analytics', importance: 'medium' },
  { id: 'f6', name: 'Team Collaboration', category: 'Collaboration', importance: 'medium' },
  { id: 'f7', name: 'White Labeling', category: 'Customization', importance: 'low' },
  { id: 'f8', name: '24/7 Support', category: 'Support', importance: 'medium' },
];

// Sample feature statuses
const SAMPLE_FEATURE_STATUSES: FeatureStatus[] = [
  // Your Company (id: '1')
  { competitorId: '1', featureId: 'f1', status: 'yes' },
  { competitorId: '1', featureId: 'f2', status: 'yes' },
  { competitorId: '1', featureId: 'f3', status: 'planned', notes: 'Coming in Q3' },
  { competitorId: '1', featureId: 'f4', status: 'yes' },
  { competitorId: '1', featureId: 'f5', status: 'partial', notes: 'Basic reporting only' },
  { competitorId: '1', featureId: 'f6', status: 'yes' },
  { competitorId: '1', featureId: 'f7', status: 'no' },
  { competitorId: '1', featureId: 'f8', status: 'yes' },
  
  // Competitor A (id: '2')
  { competitorId: '2', featureId: 'f1', status: 'yes' },
  { competitorId: '2', featureId: 'f2', status: 'yes' },
  { competitorId: '2', featureId: 'f3', status: 'yes' },
  { competitorId: '2', featureId: 'f4', status: 'yes' },
  { competitorId: '2', featureId: 'f5', status: 'yes' },
  { competitorId: '2', featureId: 'f6', status: 'yes' },
  { competitorId: '2', featureId: 'f7', status: 'yes' },
  { competitorId: '2', featureId: 'f8', status: 'yes' },
  
  // Competitor B (id: '3')
  { competitorId: '3', featureId: 'f1', status: 'yes' },
  { competitorId: '3', featureId: 'f2', status: 'yes' },
  { competitorId: '3', featureId: 'f3', status: 'no' },
  { competitorId: '3', featureId: 'f4', status: 'partial', notes: 'Limited endpoints' },
  { competitorId: '3', featureId: 'f5', status: 'no' },
  { competitorId: '3', featureId: 'f6', status: 'yes' },
  { competitorId: '3', featureId: 'f7', status: 'no' },
  { competitorId: '3', featureId: 'f8', status: 'no' },
  
  // Competitor C (id: '4')
  { competitorId: '4', featureId: 'f1', status: 'yes' },
  { competitorId: '4', featureId: 'f2', status: 'partial', notes: 'CSV only' },
  { competitorId: '4', featureId: 'f3', status: 'no' },
  { competitorId: '4', featureId: 'f4', status: 'yes' },
  { competitorId: '4', featureId: 'f5', status: 'no' },
  { competitorId: '4', featureId: 'f6', status: 'no' },
  { competitorId: '4', featureId: 'f7', status: 'no' },
  { competitorId: '4', featureId: 'f8', status: 'no' },
];

// Sample dimensions for radar chart
const SAMPLE_DIMENSIONS: Dimension[] = [
  { id: 'price', label: 'Price Competitiveness', description: 'How competitive is their pricing model?' },
  { id: 'features', label: 'Feature Richness', description: 'How comprehensive is their feature set?' },
  { id: 'ux', label: 'User Experience', description: 'How good is their user experience and interface?' },
  { id: 'innovation', label: 'Innovation', description: 'How innovative is their product or approach?' },
  { id: 'market_reach', label: 'Market Reach', description: 'How broad is their market reach and penetration?' },
  { id: 'customer_support', label: 'Customer Support', description: 'How good is their customer support and service?' },
];

// Sample ratings for radar chart
const SAMPLE_RATINGS: CompetitorRating[] = [
  // Your Company (id: '1')
  { competitorId: '1', dimensionId: 'price', rating: 7 },
  { competitorId: '1', dimensionId: 'features', rating: 6 },
  { competitorId: '1', dimensionId: 'ux', rating: 9 },
  { competitorId: '1', dimensionId: 'innovation', rating: 9 },
  { competitorId: '1', dimensionId: 'market_reach', rating: 4 },
  { competitorId: '1', dimensionId: 'customer_support', rating: 8 },
  
  // Competitor A (id: '2')
  { competitorId: '2', dimensionId: 'price', rating: 3 },
  { competitorId: '2', dimensionId: 'features', rating: 9 },
  { competitorId: '2', dimensionId: 'ux', rating: 5 },
  { competitorId: '2', dimensionId: 'innovation', rating: 6 },
  { competitorId: '2', dimensionId: 'market_reach', rating: 9 },
  { competitorId: '2', dimensionId: 'customer_support', rating: 6 },
  
  // Competitor B (id: '3')
  { competitorId: '3', dimensionId: 'price', rating: 8 },
  { competitorId: '3', dimensionId: 'features', rating: 5 },
  { competitorId: '3', dimensionId: 'ux', rating: 7 },
  { competitorId: '3', dimensionId: 'innovation', rating: 4 },
  { competitorId: '3', dimensionId: 'market_reach', rating: 6 },
  { competitorId: '3', dimensionId: 'customer_support', rating: 5 },
  
  // Competitor C (id: '4')
  { competitorId: '4', dimensionId: 'price', rating: 10 },
  { competitorId: '4', dimensionId: 'features', rating: 3 },
  { competitorId: '4', dimensionId: 'ux', rating: 6 },
  { competitorId: '4', dimensionId: 'innovation', rating: 7 },
  { competitorId: '4', dimensionId: 'market_reach', rating: 2 },
  { competitorId: '4', dimensionId: 'customer_support', rating: 2 },
];

export function CompetitorVisualizationExample() {
  // Handler for position matrix changes
  const handlePositionChange = (competitorId: string, position: { x: number; y: number }, dimensions: { x: string; y: string }) => {
    console.log('Position changed:', { competitorId, position, dimensions });
  };
  
  // Handler for feature comparison table
  const handleUpdateFeatureStatus = async (status: FeatureStatus): Promise<void> => {
    console.log('Feature status changed:', status);
    return Promise.resolve();
  };
  
  const handleAddFeature = async (feature: Omit<Feature, 'id'>): Promise<void> => {
    console.log('Feature added:', feature);
    return Promise.resolve();
  };
  
  // Handler for radar chart
  const handleRatingChange = async (rating: CompetitorRating): Promise<void> => {
    console.log('Rating changed:', rating);
    return Promise.resolve();
  };
  
  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Competitor Analysis Example</CardTitle>
        <CardDescription>
          Explore different ways to visualize and compare competitors
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="positioning" className="w-full h-full">
          <div className="px-6 border-b">
            <TabsList className="h-10 bg-transparent">
              <TabsTrigger 
                value="positioning" 
                className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 transition-none"
              >
                Positioning Matrix
              </TabsTrigger>
              <TabsTrigger 
                value="features" 
                className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 transition-none"
              >
                Feature Comparison
              </TabsTrigger>
              <TabsTrigger 
                value="radar" 
                className="data-[state=active]:bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 transition-none"
              >
                Radar Analysis
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6 h-[calc(100%-3rem)]">
            <TabsContent value="positioning" className="mt-0 h-full">
              <CompetitorPositioningMatrix 
                competitors={SAMPLE_COMPETITORS}
                onPositionChange={handlePositionChange}
                yourCompanyId="1"
              />
            </TabsContent>
            
            <TabsContent value="features" className="mt-0 h-full">
              <FeatureComparisonTable 
                competitors={SAMPLE_COMPETITORS}
                features={SAMPLE_FEATURES}
                featureStatuses={SAMPLE_FEATURE_STATUSES}
                onUpdateFeatureStatus={handleUpdateFeatureStatus}
                onAddFeature={handleAddFeature}
                yourCompanyId="1"
                readOnly={false}
              />
            </TabsContent>
            
            <TabsContent value="radar" className="mt-0 h-full">
              <CompetitorRadarChart 
                competitors={SAMPLE_COMPETITORS}
                dimensions={SAMPLE_DIMENSIONS}
                ratings={SAMPLE_RATINGS}
                onRatingChange={handleRatingChange}
                yourCompanyId="1"
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 