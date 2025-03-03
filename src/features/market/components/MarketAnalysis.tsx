import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, BarChart2, ChevronRight, LightbulbIcon, PlusCircle, 
  Users, UserSearch, Search, TrendingUp, Activity, AlertCircle, Info,
  Target, ScaleIcon, LineChart, HelpCircle, ChevronDown
} from 'lucide-react';
import { MarketAnalysis as MarketAnalysisType, CustomerInterview, CustomerPersona, Competitor, MarketTrend } from '@/types';
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
  
  // Calculate market insights dashboard metrics
  const marketStats = useMemo(() => {
    const totalPersonas = data.customerInsights.personas.length;
    const totalInterviews = data.customerInsights.interviews.length;
    const totalCompetitors = data.competitors.length;
    const totalTrends = data.trends.length;
    
    const positiveInterviews = data.customerInsights.interviews.filter(i => i.sentiment === 'positive').length;
    const sentimentScore = totalInterviews > 0 
      ? Math.round((positiveInterviews / totalInterviews) * 100) 
      : 0;
      
    const opportunities = data.trends.filter(t => t.type === 'opportunity').length;
    const threats = data.trends.filter(t => t.type === 'threat').length;
    
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
  
  // Toggle help section visibility
  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="p-6">
      {/* Header with help menu */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Analysis</h2>
          <p className="text-gray-600">Research your market, competitors, and validate your idea with data-driven insights</p>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>Help Guide</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Market Analysis Resources</h4>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Quick Guides:</p>
                <a href="#" className="text-blue-600 hover:underline block">
                  → How to create effective personas
                </a>
                <a href="#" className="text-blue-600 hover:underline block">
                  → Conducting customer interviews
                </a>
                <a href="#" className="text-blue-600 hover:underline block">
                  → Analyzing competitors
                </a>
                <a href="#" className="text-blue-600 hover:underline block">
                  → Identifying market trends
                </a>
                <p className="text-gray-500 mt-2">
                  Click on the '?' icons in each section for specific guidance.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      {/* Market Insights Dashboard */}
      <div className="mb-6">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Customer Understanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserSearch className="mr-2 h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{marketStats.totalPersonas}</div>
                    <p className="text-xs text-gray-500">Personas Defined</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-indigo-500" />
                  <div>
                    <div className="text-2xl font-bold">{marketStats.totalInterviews}</div>
                    <p className="text-xs text-gray-500">Interviews</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Customer Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="text-2xl font-bold">{marketStats.sentimentScore}%</div>
                  <p className="text-xs text-gray-500">Positive Feedback</p>
                </div>
                <Progress 
                  value={marketStats.sentimentScore} 
                  className={`h-2 flex-1 ${
                    marketStats.sentimentScore > 60 
                      ? "bg-green-100" 
                      : marketStats.sentimentScore > 30 
                        ? "bg-yellow-100" 
                        : "bg-red-100"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Competitive Landscape</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Search className="mr-2 h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{marketStats.totalCompetitors}</div>
                  <p className="text-xs text-gray-500">Competitors Analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUpRight className="mr-2 h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{marketStats.opportunities}</div>
                    <p className="text-xs text-gray-500">Opportunities</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">{marketStats.threats}</div>
                    <p className="text-xs text-gray-500">Threats</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}
        
        {/* <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-medium">Market Research Completion</h3>
                <p className="text-sm text-gray-500">Based on the comprehensiveness of your research</p>
              </div>
              <div className="text-2xl font-bold">{marketStats.marketInsightScore}%</div>
            </div>
            <Progress 
              value={marketStats.marketInsightScore} 
              className={`h-2 ${
                marketStats.marketInsightScore > 70 
                  ? "bg-green-100" 
                  : marketStats.marketInsightScore > 30 
                    ? "bg-yellow-100" 
                    : "bg-orange-100"
              }`}
            />
            <div className="grid grid-cols-4 mt-2 text-xs text-gray-500">
              <div>Personas</div>
              <div>Interviews</div>
              <div>Competitors</div>
              <div>Trends</div>
            </div>
          </CardContent>
        </Card> */}
      </div>
      
      <Tabs defaultValue="customers">
        <TabsList className="mb-4">
          <TabsTrigger value="customers" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Customer Insights
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Competitor Research
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trend Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-4">
          {/* Collapsible help section for customer insights */}
          <Collapsible
            open={expandedHelp.personas}
            onOpenChange={() => toggleHelp('personas')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-800">
                <div className="flex items-center">
                  <LightbulbIcon className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Effective Customer Research Tips</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.personas ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-blue-100 border-t-0 bg-blue-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Creating Detailed Personas</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Define demographics, behaviors, and pain points</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Focus on motivations and goals, not just characteristics</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Create 3-5 personas for most startups</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Conducting Effective Interviews</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Ask open-ended questions to gather deeper insights</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Focus on problems, not solutions</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Look for patterns across multiple interviews</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Persona Builder</CardTitle>
                <CardDescription>Define your target customers in detail</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start" className="max-w-xs">
                    <p>Personas help you understand who your customers are, what motivates them, and what problems they need solved.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              {data.customerInsights.personas.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-1">No personas defined yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Creating detailed customer personas will help you understand who your target users are, what problems they face, and how your product can help them.
                  </p>
                  <Button onClick={handleAddPersona}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Persona
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.customerInsights.personas.map(persona => (
                      <CustomerPersonaCard key={persona.id} persona={persona} />
                    ))}
                    
                    <div 
                      className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={handleAddPersona}
                    >
                      <PlusCircle className="h-8 w-8 mb-2" />
                      <p>Create New Persona</p>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="text-sm text-gray-500 bg-gray-50 rounded-b-lg">
              <div className="flex items-start">
                <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 hover:bg-blue-50">Tip</Badge>
                <p>Your personas should represent real people, not idealized customers. Base them on research, not assumptions.</p>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Validation</CardTitle>
                <CardDescription>Track your customer interviews and insights</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start" className="max-w-xs">
                    <p>Customer interviews provide direct feedback and validate your assumptions about customer needs.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              {data.customerInsights.interviews.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                  <UserSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-1">No interviews recorded yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Customer interviews provide valuable insights into user needs and validate your assumptions. Aim to conduct at least 10-15 interviews.
                  </p>
                  <Button onClick={handleAddInterview}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Interview
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {data.customerInsights.interviews.map(interview => (
                      <CustomerInterviewCard key={interview.id} interview={interview} />
                    ))}
                    
                    <div 
                      className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={handleAddInterview}
                    >
                      <PlusCircle className="h-8 w-8 mb-2" />
                      <p>Add Customer Interview</p>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="text-sm text-gray-500 bg-gray-50 rounded-b-lg">
              <div className="flex items-start">
                <Badge variant="outline" className="mr-2 bg-purple-50 text-purple-700 hover:bg-purple-50">Goal</Badge>
                <p>Aim to conduct at least 10-15 interviews to identify meaningful patterns in customer feedback.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="competitors" className="space-y-4">
          {/* Collapsible help section for competitor research */}
          <Collapsible
            open={expandedHelp.competitors}
            onOpenChange={() => toggleHelp('competitors')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-800">
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="font-medium">Competitor Analysis Best Practices</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.competitors ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-purple-100 border-t-0 bg-purple-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">How to Analyze Competitors</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Identify direct and indirect competitors</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Evaluate their product features, positioning, and pricing</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Analyze their marketing strategies and channels</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Finding Your Competitive Edge</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Look for gaps in their offerings that you can fill</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Identify their weaknesses and how your solution addresses them</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Focus on your unique value proposition</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>Compare your solution with market alternatives</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start" className="max-w-xs">
                    <p>Understanding your competition helps you position your product effectively and identify opportunities for differentiation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              {data.competitors.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-1">No competitors analyzed yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Analyzing your competitors helps you understand the marketplace and identify opportunities for differentiation.
                  </p>
                  <Button onClick={handleAddCompetitor}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Competitor
                  </Button>
                </div>
              ) : (
                <CompetitorTable 
                  competitors={data.competitors} 
                  onAddCompetitor={handleAddCompetitor} 
                />
              )}
            </CardContent>
            <CardFooter className="text-sm text-gray-500 bg-gray-50 rounded-b-lg">
              <div className="flex items-start">
                <Badge variant="outline" className="mr-2 bg-purple-50 text-purple-700 hover:bg-purple-50">Strategy</Badge>
                <p>Don't just identify competitors—understand what makes them successful and where they fall short.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          {/* Collapsible help section for trend analysis */}
          <Collapsible
            open={expandedHelp.trends}
            onOpenChange={() => toggleHelp('trends')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-green-100 bg-green-50 hover:bg-green-100 text-green-800">
                <div className="flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-medium">Market Trend Tracking Guide</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.trends ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-green-100 border-t-0 bg-green-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Spotting Relevant Trends</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Monitor industry publications and news sources</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Track technological, social, and regulatory changes</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Follow thought leaders and influencers in your space</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Acting on Trends</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Identify how trends affect your target customers</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Assess potential impact on your business model</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Adapt your strategy to leverage opportunities and mitigate threats</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Monitor industry trends relevant to your startup</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start" className="max-w-xs">
                    <p>Tracking trends helps you anticipate market changes and adapt your strategy accordingly.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              {data.trends.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-1">No market trends identified yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Identifying relevant market trends helps you anticipate changes and adapt your strategy to stay ahead of the competition.
                  </p>
                  <Button onClick={handleAddTrend}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Trend
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {data.trends.map(trend => (
                      <MarketTrendCard key={trend.id} trend={trend} />
                    ))}
                    
                    <div 
                      className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={handleAddTrend}
                    >
                      <PlusCircle className="h-8 w-8 mb-2" />
                      <p>Add Market Trend</p>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="text-sm text-gray-500 bg-gray-50 rounded-b-lg">
              <div className="flex items-start">
                <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 hover:bg-green-50">Insight</Badge>
                <p>The best startups don't just respond to trends—they anticipate and capitalize on them before competitors.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};