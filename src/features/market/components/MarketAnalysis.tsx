import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, PlusCircle, Users } from 'lucide-react';
import { MarketAnalysis as MarketAnalysisType, CustomerInterview, CustomerPersona, Competitor, MarketTrend } from '@/types';
import { CustomerPersonaCard } from './CustomerPersonaCard';
import { CustomerInterviewCard } from './CustomerInterviewCard';
import { CompetitorTable } from './CompetitorTable';
import { MarketTrendCard } from './MarketTrendCard';

interface MarketAnalysisProps {
  data?: MarketAnalysisType;
  onUpdate: (data: Partial<MarketAnalysisType>) => void;
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ 
  data = {
    customerInsights: { personas: [], interviews: [] },
    competitors: [],
    trends: []
  },
  onUpdate 
}) => {
  const handleAddPersona = () => {
    const newPersona: CustomerPersona = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      role: '',
      demographics: '',
      painPoints: [],
      goals: []
    };
    
    onUpdate({
      customerInsights: {
        ...data.customerInsights,
        personas: [...data.customerInsights.personas, newPersona]
      }
    });
  };
  
  const handleAddInterview = () => {
    const newInterview: CustomerInterview = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      company: '',
      date: new Date().toISOString(),
      sentiment: 'neutral',
      notes: ''
    };
    
    onUpdate({
      customerInsights: {
        ...data.customerInsights,
        interviews: [...data.customerInsights.interviews, newInterview]
      }
    });
  };
  
  const handleAddCompetitor = () => {
    const newCompetitor: Competitor = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      strengths: [],
      weaknesses: [],
      price: ''
    };
    
    onUpdate({
      competitors: [...data.competitors, newCompetitor]
    });
  };
  
  const handleAddTrend = () => {
    const newTrend: MarketTrend = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      direction: 'stable',
      type: 'neutral',
      description: '',
      tags: []
    };
    
    onUpdate({
      trends: [...data.trends, newTrend]
    });
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Market Analysis</h2>
        <p className="text-gray-600">Research your market, competitors, and validate your idea</p>
      </div>
      
      <Tabs defaultValue="customers">
        <TabsList className="mb-4">
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Research</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Persona Builder</CardTitle>
              <CardDescription>Define your target customers in detail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {data.customerInsights.personas.map(persona => (
                  <CustomerPersonaCard key={persona.id} persona={persona} />
                ))}
                
                <div 
                  className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer"
                  onClick={handleAddPersona}
                >
                  <PlusCircle className="h-8 w-8 mb-2" />
                  <p>Create New Persona</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Validation</CardTitle>
              <CardDescription>Track your customer interviews and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.customerInsights.interviews.map(interview => (
                  <CustomerInterviewCard key={interview.id} interview={interview} />
                ))}
                
                <div 
                  className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer"
                  onClick={handleAddInterview}
                >
                  <PlusCircle className="h-8 w-8 mb-2" />
                  <p>Add Customer Interview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
              <CardDescription>Compare your solution with market alternatives</CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitorTable 
                competitors={data.competitors} 
                onAddCompetitor={handleAddCompetitor} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>Monitor industry trends relevant to your startup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trends.map(trend => (
                  <MarketTrendCard key={trend.id} trend={trend} />
                ))}
                
                <div 
                  className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer"
                  onClick={handleAddTrend}
                >
                  <PlusCircle className="h-8 w-8 mb-2" />
                  <p>Add Market Trend</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};