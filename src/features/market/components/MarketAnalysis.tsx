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
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';
import { useParams } from 'next/navigation';
import { 
  MarketAnalysisUIData,
  PersonaFormValues,
  InterviewFormValues,
  CompetitorFormValues,
  TrendFormValues
} from '../types';

export function MarketAnalysis() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : undefined;
  
  const { 
    data,
    isLoading,
    error,
    addPersona,
    updatePersona,
    deletePersona,
    addInterview,
    updateInterview,
    deleteInterview,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
    addTrend,
    updateTrend,
    deleteTrend
  } = useMarketAnalysis(projectId);
  
  const { comparisonMode } = useProjectStore();
  
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
    if (!projectId) return;
    
    addPersona({
      name: 'New Persona',
      role: null,
      demographics: null,
      pain_points: null,
      goals: null,
      project_id: projectId,
      created_by: null
    });
  };
  
  const handleAddInterview = () => {
    if (!projectId) return;
    
    addInterview({
      name: 'New Interview',
      company: null,
      interview_date: new Date().toISOString(),
      sentiment: null,
      notes: null,
      key_insights: null,
      tags: null,
      project_id: projectId,
      created_by: null
    });
  };
  
  const handleAddCompetitor = () => {
    if (!projectId) return;
    
    addCompetitor({
      name: 'New Competitor',
      website: null,
      strengths: null,
      weaknesses: null,
      price: null,
      market_share: null,
      notes: null,
      project_id: projectId,
      created_by: null
    });
  };
  
  const handleAddTrend = () => {
    if (!projectId) return;
    
    addTrend({
      name: 'New Trend',
      direction: null,
      trend_type: null,
      description: null,
      tags: null,
      sources: null,
      project_id: projectId,
      created_by: null
    });
  };
  
  // Toggle help section visibility
  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Loading market analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-500">Error loading market analysis data</p>
          <p className="text-gray-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Market Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Market Insight Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">
                  {marketStats.marketInsightScore}%
                </span>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Your market insight score is calculated based on the
                    completeness of your market analysis. Add more personas,
                    interviews, competitors, and trends to improve your score.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <Progress value={marketStats.marketInsightScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Customer Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserSearch className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">
                  {marketStats.sentimentScore}%
                </span>
              </div>
              <Badge
                variant="outline"
                className={
                  marketStats.sentimentScore >= 70
                    ? "bg-green-50 text-green-700"
                    : marketStats.sentimentScore >= 40
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }
              >
                {marketStats.sentimentScore >= 70
                  ? "Positive"
                  : marketStats.sentimentScore >= 40
                  ? "Mixed"
                  : "Negative"}
              </Badge>
            </div>
            <Progress value={marketStats.sentimentScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Market Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded">
                <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <div className="text-xl font-bold">
                  {marketStats.totalPersonas}
                </div>
                <div className="text-xs text-gray-500">Personas</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <Target className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <div className="text-xl font-bold">
                  {marketStats.totalCompetitors}
                </div>
                <div className="text-xs text-gray-500">Competitors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded">
                <ArrowUpRight className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <div className="text-xl font-bold">
                  {marketStats.opportunities}
                </div>
                <div className="text-xs text-gray-500">Opportunities</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <AlertCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
                <div className="text-xl font-bold">{marketStats.threats}</div>
                <div className="text-xs text-gray-500">Threats</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="personas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Personas
          </TabsTrigger>
          <TabsTrigger value="interviews" className="flex items-center gap-2">
            <UserSearch className="h-4 w-4" />
            Customer Interviews
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Market Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Customer Personas</h2>
              <Badge variant="outline" className="ml-2">
                {data.personas.length}
              </Badge>
            </div>
            <Button onClick={handleAddPersona}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Persona
            </Button>
          </div>

          <Collapsible open={expandedHelp.personas}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHelp("personas")}
                className="flex items-center gap-2 mb-4"
              >
                <HelpCircle className="h-4 w-4" />
                Persona Development Guide
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <LightbulbIcon className="h-4 w-4 text-blue-600" />
                Tips for Creating Effective Personas
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Base personas on real customer research and interviews</li>
                <li>Include demographic information, goals, and pain points</li>
                <li>
                  Focus on behaviors and motivations rather than assumptions
                </li>
                <li>Update personas as you learn more about your customers</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.personas.map((persona) => (
                <CustomerPersonaCard
                  key={persona.id}
                  persona={persona}
                  onEdit={(id) => {}}
                  onUpdate={updatePersona}
                  onDelete={deletePersona}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Customer Interviews</h2>
              <Badge variant="outline" className="ml-2">
                {data.interviews.length}
              </Badge>
            </div>
            <Button onClick={handleAddInterview}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Interview
            </Button>
          </div>

          <Collapsible open={expandedHelp.interviews}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHelp("interviews")}
                className="flex items-center gap-2 mb-4"
              >
                <HelpCircle className="h-4 w-4" />
                Interview Best Practices
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <LightbulbIcon className="h-4 w-4 text-blue-600" />
                Tips for Conducting Effective Interviews
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>
                  Ask open-ended questions to encourage detailed responses
                </li>
                <li>
                  Focus on understanding the customer's context and challenges
                </li>
                <li>Record verbatim quotes and specific examples</li>
                <li>Look for patterns across multiple interviews</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.interviews.map((interview) => (
                <CustomerInterviewCard
                  key={interview.id}
                  interview={interview}
                  onEdit={(id) => {}}
                  onUpdate={updateInterview}
                  onDelete={deleteInterview}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Competitor Analysis</h2>
              <Badge variant="outline" className="ml-2">
                {data.competitors.length}
              </Badge>
            </div>
          </div>

          <Collapsible open={expandedHelp.competitors}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHelp("competitors")}
                className="flex items-center gap-2 mb-4"
              >
                <HelpCircle className="h-4 w-4" />
                Competitive Analysis Guide
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <LightbulbIcon className="h-4 w-4 text-blue-600" />
                Tips for Effective Competitor Analysis
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Research both direct and indirect competitors</li>
                <li>Analyze their strengths and weaknesses objectively</li>
                <li>Monitor their pricing strategies and market positioning</li>
                <li>Look for gaps in the market that you can fill</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[600px]">
            <CompetitorTable
              competitors={data.competitors}
              onAdd={handleAddCompetitor}
              onEdit={(id) => {}}
              onUpdate={updateCompetitor}
              onDelete={deleteCompetitor}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Market Trends</h2>
              <Badge variant="outline" className="ml-2">
                {data.trends.length}
              </Badge>
            </div>
            <Button onClick={handleAddTrend}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Trend
            </Button>
          </div>

          <Collapsible open={expandedHelp.trends}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHelp("trends")}
                className="flex items-center gap-2 mb-4"
              >
                <HelpCircle className="h-4 w-4" />
                Market Trend Analysis Guide
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <LightbulbIcon className="h-4 w-4 text-blue-600" />
                Tips for Identifying Market Trends
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Monitor industry publications and research reports</li>
                <li>
                  Track technological advancements and their potential impact
                </li>
                <li>Consider social and economic factors</li>
                <li>Validate trends through customer feedback and data</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.trends.map((trend) => (
                <MarketTrendCard
                  key={trend.id}
                  trend={trend}
                  onEdit={(id) => {}}
                  onUpdate={updateTrend}
                  onDelete={deleteTrend}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}