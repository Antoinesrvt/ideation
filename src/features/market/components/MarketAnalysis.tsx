import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, BarChart2, ChevronRight, LightbulbIcon, PlusCircle, 
  Users, UserSearch, Search, TrendingUp, Activity, AlertCircle, Info,
  Target, ScaleIcon, LineChart, HelpCircle, ChevronDown, Check, X
} from 'lucide-react';
import { CustomerPersonaCard } from './CustomerPersonaCard';
import { CustomerInterviewCard } from './CustomerInterviewCard';
import { CompetitorTable } from './CompetitorTable';
import { MarketTrendCard } from './MarketTrendCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useProjectStore } from '@/store';
import { useAIStore } from '@/hooks/useAIStore';
import { generateId } from '@/lib/utils';
import { 
  MarketPersona, 
  MarketInterview, 
  MarketCompetitor, 
  MarketTrend 
} from '@/store/types';
import { CustomerPersona } from '@/types';

// Extended types for UI that add status for comparison mode
interface ExtendedMarketPersona extends MarketPersona {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

interface ExtendedMarketInterview extends MarketInterview {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

interface ExtendedMarketCompetitor extends MarketCompetitor {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

interface ExtendedMarketTrend extends MarketTrend {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

// Define UI data structure
interface MarketAnalysisUIData {
  personas: ExtendedMarketPersona[];
  interviews: ExtendedMarketInterview[];
  competitors: ExtendedMarketCompetitor[];
  trends: ExtendedMarketTrend[];
}

export const MarketAnalysis: React.FC = () => {
  const { 
    currentData,
    comparisonMode,
    stagedData,
    addMarketPersona,
    addMarketInterview,
    addMarketCompetitor,
    addMarketTrend,
    updateMarketPersona,
    updateMarketInterview,
    updateMarketCompetitor,
    updateMarketTrend,
    deleteMarketPersona,
    deleteMarketInterview,
    deleteMarketCompetitor,
    deleteMarketTrend,
  } = useProjectStore();
  
  const { acceptAIChanges, rejectAIChanges } = useAIStore();
  
  // Track which help sections are expanded
  const [expandedHelp, setExpandedHelp] = useState<{
    personas: boolean;
    interviews: boolean;
    competitors: boolean;
    trends: boolean;
  }>({
    personas: false,
    interviews: false,
    competitors: false,
    trends: false
  });
  
  // Get current data from the store
  const data = useMemo(() => 
    ({
      personas: currentData.marketPersonas || [],
      interviews: currentData.marketInterviews || [],
      competitors: currentData.marketCompetitors || [],
      trends: currentData.marketTrends || []
    }),
    [currentData] 
  );
  
  // Get staged data if in comparison mode
  const stagedUIData = useMemo(() => {
    if (!comparisonMode || !stagedData) return null;
    
    return {
      personas: stagedData.marketPersonas || [],
      interviews: stagedData.marketInterviews || [],
      competitors: stagedData.marketCompetitors || [],
      trends: stagedData.marketTrends || []
    };
  }, [comparisonMode, stagedData]);
  
  // Helper function to determine if an item is new/modified in comparison mode
  const getItemStatus = (
    section: 'personas' | 'interviews' | 'competitors' | 'trends',
    itemId: string
  ): 'new' | 'modified' | 'unchanged' | 'removed' => {
    if (!comparisonMode || !stagedUIData) return 'unchanged';
    
    const currentItem = data[section].find(item => item.id === itemId);
    const stagedItem = stagedUIData[section].find(item => item.id === itemId);
    
    if (!currentItem && stagedItem) return 'new';
    if (currentItem && !stagedItem) return 'removed';
    if (currentItem && stagedItem) {
      return JSON.stringify(currentItem) !== JSON.stringify(stagedItem) ? 'modified' : 'unchanged';
    }
    
    return 'unchanged';
  };
  
  // Calculate market insights dashboard metrics
  const marketStats = useMemo(() => {
    const totalPersonas = data.personas.length;
    const totalInterviews = data.interviews.length;
    const totalCompetitors = data.competitors.length;
    const totalTrends = data.trends.length;
    
    // Check if sentiment exists before filtering
    const positiveInterviews = data.interviews.filter(i => i.sentiment === 'positive').length;
    const sentimentScore = totalInterviews > 0 
      ? Math.round((positiveInterviews / totalInterviews) * 100) 
      : 0;
      
    const opportunities = data.trends.filter(t => t.trend_type === 'opportunity').length;
    const threats = data.trends.filter(t => t.trend_type === 'threat').length;
    
    return {
      totalPersonas,
      totalInterviews,
      totalCompetitors,
      totalTrends,
      sentimentScore,
      opportunities,
      threats,
      marketInsightScore: Math.min(Math.round((totalPersonas + totalInterviews + totalCompetitors + totalTrends) / 12 * 100), 100)
    };
  }, [data]);

  const handleAddPersona = () => {
    const projectId = currentData.project?.id || '';
    
    addMarketPersona({
      id: generateId(),
      name: 'New Persona',
      role: '', 
      demographics: '',
      pain_points: [],
      goals: [],
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  const handleAddInterview = () => {
    const projectId = currentData.project?.id || '';
    
    addMarketInterview({
      id: generateId(),
      name: 'New Interview',
      company: '',
      interview_date: null,
      sentiment: 'neutral',
      notes: '',
      key_insights: [],
      tags: [],
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  const handleAddCompetitor = () => {
    const projectId = currentData.project?.id || '';
    
    addMarketCompetitor({
      id: generateId(),
      name: 'New Competitor',
      website: null,
      strengths: [],
      weaknesses: [],
      price: null,
      market_share: '', // String in database
      notes: null,
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  const handleAddTrend = () => {
    const projectId = currentData.project?.id || '';
    
    addMarketTrend({
      id: generateId(),
      name: 'New Trend',
      direction: 'stable',
      trend_type: 'neutral',
      description: '',
      tags: [],
      sources: [],
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  // Toggle help section visibility
  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper to map MarketPersona to CustomerPersona for the card component
  const mapToCustomerPersona = (persona: MarketPersona): CustomerPersona => {
    return {
      id: persona.id,
      name: persona.name,
      role: persona.role || '',
      demographics: persona.demographics || '',
      painPoints: persona.pain_points || [],
      goals: persona.goals || []
    };
  };
  
  return (
    <div className="p-6">
      {/* Header with help menu */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Analysis</h2>
          <p className="text-gray-600">Research your market, competitors, and validate your idea with data-driven insights</p>
        </div>
        
        <div className="flex items-center gap-2">
          {comparisonMode && (
            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center mr-2">
              <span className="text-blue-700 text-sm font-medium">Viewing AI suggested changes</span>
            </div>
          )}
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                <span>Help Guide</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Market Analysis Guide</h4>
                <p className="text-sm text-gray-500">
                  Research your target market, customers, competition, and industry trends to
                  validate your business idea and find product-market fit.
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Create customer personas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserSearch className="h-4 w-4 text-blue-500" />
                    <span>Document customer interviews</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Search className="h-4 w-4 text-blue-500" />
                    <span>Analyze competitors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span>Track market trends</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      
      {/* Market insight dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded">
                  <Activity className="text-blue-700 h-5 w-5" />
                </div>
                <span className="font-medium">Market Insight</span>
              </div>
              <div>
                <Badge 
                  variant="outline" 
                  className={`
                    ${marketStats.marketInsightScore >= 75 ? 'bg-green-50 text-green-700 border-green-200' :
                     marketStats.marketInsightScore >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                     'bg-red-50 text-red-700 border-red-200'}
                  `}
                >
                  {marketStats.marketInsightScore}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={marketStats.marketInsightScore} 
              className={`h-2 ${
                marketStats.marketInsightScore >= 75 ? 'bg-green-100' :
                marketStats.marketInsightScore >= 50 ? 'bg-yellow-100' :
                'bg-red-100'
              }`} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded">
                  <Users className="text-purple-700 h-5 w-5" />
                </div>
                <span className="font-medium">Personas & Interviews</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-xl font-bold">{marketStats.totalPersonas}</span>
                <span className="text-xs text-gray-500">Personas</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{marketStats.totalInterviews}</span>
                <span className="text-xs text-gray-500">Interviews</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded">
                  <Target className="text-orange-700 h-5 w-5" />
                </div>
                <span className="font-medium">Competition</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{marketStats.totalCompetitors}</span>
              <span className="text-xs text-gray-500">Tracked competitors</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded">
                  <TrendingUp className="text-green-700 h-5 w-5" />
                </div>
                <span className="font-medium">Market Trends</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-600">{marketStats.opportunities}</span>
                <span className="text-xs text-gray-500">Opportunities</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-red-600">{marketStats.threats}</span>
                <span className="text-xs text-gray-500">Threats</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content tabs */}
      <Tabs defaultValue="personas" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="personas" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Customer Personas</span>
          </TabsTrigger>
          <TabsTrigger value="interviews" className="flex items-center gap-1">
            <UserSearch className="h-4 w-4" />
            <span>Customer Interviews</span>
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Competitors</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Market Trends</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Customer Personas Tab */}
        <TabsContent value="personas" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <h3 className="text-lg font-semibold">Customer Personas</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6 w-6 p-0" 
                onClick={() => toggleHelp('personas')}
              >
                <Info className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            
            <Button onClick={handleAddPersona} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Add Persona</span>
            </Button>
          </div>
          
          <Collapsible open={expandedHelp.personas} className="mb-4">
            <CollapsibleContent>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-sm text-blue-900">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <LightbulbIcon className="h-4 w-4 text-blue-600" />
                    <span>Creating Effective Customer Personas</span>
                  </h4>
                  <p className="mb-2">
                    Customer personas help you understand your target users. Create detailed profiles that include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Demographics (age, location, income, education)</li>
                    <li>Pain points and challenges they face</li>
                    <li>Goals and motivations</li>
                    <li>Behavior patterns and preferences</li>
                    <li>Decision-making factors</li>
                  </ul>
                  <p className="mt-2">
                    Use real data from interviews and surveys whenever possible to make your personas more accurate.
                  </p>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonMode && stagedUIData && stagedUIData.personas.map(persona => {
                const status = getItemStatus('personas', persona.id);
                if (status === 'new' || status === 'modified') {
                  return (
                    <div key={persona.id} className={`
                      ${status === 'new' ? 'border-2 border-green-300' : 'border-2 border-amber-300'}
                      rounded-lg relative overflow-hidden
                    `}>
                      {status === 'new' ? (
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 absolute top-0 right-0">
                          New
                        </div>
                      ) : (
                        <div className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 absolute top-0 right-0">
                          Modified
                        </div>
                      )}
                      <CustomerPersonaCard 
                        persona={mapToCustomerPersona(persona)} 
                        readOnly={true}
                      />
                    </div>
                  );
                }
                return null;
              })}
            
            {data.personas.map(persona => {
              const status = comparisonMode && stagedUIData ? getItemStatus('personas', persona.id) : 'unchanged';
              if (comparisonMode && status === 'removed') {
                return (
                  <div key={persona.id} className="border-2 border-red-300 rounded-lg relative overflow-hidden opacity-60">
                    <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 absolute top-0 right-0">
                      Removed
                    </div>
                    <CustomerPersonaCard 
                      persona={mapToCustomerPersona(persona)} 
                      readOnly={true}
                    />
                  </div>
                );
              }
              
              if (!comparisonMode || (comparisonMode && status === 'unchanged')) {
                return (
                  <CustomerPersonaCard 
                    key={persona.id} 
                    persona={mapToCustomerPersona(persona)} 
                    onUpdate={(updated) => updateMarketPersona(persona.id, {
                      name: updated.name,
                      role: updated.role,
                      demographics: updated.demographics,
                      pain_points: updated.painPoints,
                      goals: updated.goals
                    })} 
                    onDelete={() => deleteMarketPersona(persona.id)} 
                  />
                );
              }
              
              return null;
            })}
            
            {data.personas.length === 0 && !comparisonMode && (
              <Card className="border-dashed border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6 h-48 col-span-full">
                <Users className="h-10 w-10 text-gray-400 mb-2" />
                <h4 className="text-gray-900 font-medium mb-1">No customer personas yet</h4>
                <p className="text-gray-500 text-sm text-center mb-4">
                  Add customer personas to understand your target audience
                </p>
                <Button onClick={handleAddPersona} variant="outline" className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>Add First Persona</span>
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Customer Interviews Tab - Structure similar to Personas */}
        <TabsContent value="interviews" className="space-y-4">
          {/* Similar structure to personas tab */}
        </TabsContent>
        
        {/* Competitors Tab - Structure similar to Personas */}
        <TabsContent value="competitors" className="space-y-4">
          {/* Similar structure to personas tab */}
        </TabsContent>
        
        {/* Market Trends Tab - Structure similar to Personas */}
        <TabsContent value="trends" className="space-y-4">
          {/* Similar structure to personas tab */}
        </TabsContent>
      </Tabs>
    </div>
  );
};