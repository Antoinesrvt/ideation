import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, BarChart2, ChevronRight, Info, PlusCircle, 
  Users, UserSearch, Search, TrendingUp, Activity, AlertCircle,
  Target, ScaleIcon, LineChart, HelpCircle
} from 'lucide-react';
import { CustomerPersonaCard } from './CustomerPersonaCard';
import { CustomerInterviewCard } from './CustomerInterviewCard';
import { CompetitorTable } from './CompetitorTable';
import { MarketTrendCard } from './MarketTrendCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useProjectStore } from '@/store';
import { useAIStore } from '@/hooks/useAIStore';
import { generateId } from '@/lib/utils';
import { useMarketAnalysis } from '@/hooks/features/useMarketAnalysis';
import { useParams } from 'next/navigation';
import TabList from "@/features/common/components/TabList";
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';

const marketTabs = [
  {
    id: "personas",
    label: "Customer Personas",
    icon: <Users className="h-4 w-4 mr-2" />,
  },
  {
    id: "interviews",
    label: "Customer Interviews",
    icon: <UserSearch className="h-4 w-4 mr-2" />,
  },
  {
    id: "competitors",
    label: "Competitors",
    icon: <Target className="h-4 w-4 mr-2" />,
  },
  {
    id: "trends",
    label: "Market Trends",
    icon: <TrendingUp className="h-4 w-4 mr-2" />,
  },
];
import { SectionTab } from '@/components/ui/section-tab';

// Animation variants for the tab content
const tabContentVariants = {
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
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Animation variants for child elements within each tab
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.1 }
  }
};

export function MarketAnalysis() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : undefined;
  const { toast } = useToast();
  
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

  const handleAddPersona = async () => {
    if (!projectId) return;
    
    try {
      await addPersona({
        name: 'New Persona',
        role: null,
        demographics: null,
        pain_points: null,
        goals: null,
        project_id: projectId,
        created_by: null
      });
      
      toast({
        title: 'Success',
        description: 'New persona has been added',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add persona',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddInterview = async () => {
    if (!projectId) return;
    
    try {
      await addInterview({
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
      
      toast({
        title: 'Success',
        description: 'New interview has been added',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add interview',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddCompetitor = async () => {
    if (!projectId) return;
    
    try {
      await addCompetitor({
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
      
      toast({
        title: 'Success',
        description: 'New competitor has been added',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add competitor',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddTrend = async () => {
    if (!projectId) return;
    
    try {
      await addTrend({
        name: 'New Trend',
        direction: null,
        trend_type: null,
        description: null,
        tags: null,
        sources: null,
        project_id: projectId,
        created_by: null
      });
      
      toast({
        title: 'Success',
        description: 'New trend has been added',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add trend',
        variant: 'destructive'
      });
    }
  };
  
  // Handle updates with proper error handling
  const handleUpdatePersona = async (params: { id: string; data: any }) => {
    try {
      await updatePersona(params);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update persona',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateInterview = async (params: { id: string; data: any }) => {
    try {
      await updateInterview(params);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update interview',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateCompetitor = async (params: { id: string; data: any }) => {
    try {
      await updateCompetitor(params);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update competitor',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTrend = async (params: { id: string; data: any }) => {
    try {
      await updateTrend(params);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update trend',
        variant: 'destructive'
      });
    }
  };

  // Handle deletions with proper error handling
  const handleDeletePersona = async (id: string) => {
    try {
      await deletePersona(id);
      toast({
        title: 'Success',
        description: 'Persona has been deleted',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete persona',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteInterview = async (id: string) => {
    try {
      await deleteInterview(id);
      toast({
        title: 'Success',
        description: 'Interview has been deleted',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete interview',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    try {
      await deleteCompetitor(id);
      toast({
        title: 'Success',
        description: 'Competitor has been deleted',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete competitor',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTrend = async (id: string) => {
    try {
      await deleteTrend(id);
      toast({
        title: 'Success',
        description: 'Trend has been deleted',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete trend',
        variant: 'destructive'
      });
    }
  };
  
  // Toggle help section visibility
  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Add state for the active tab
  const [activeTab, setActiveTab] = useState<string>("personas");


  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState 
            error={error} 
            onRetry={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
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
      <LayoutGroup id="market-analysis-tabs">
        <div className="space-y-6">
          <Tabs defaultValue="personas" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabList tabs={marketTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Add AnimatePresence to handle the exit animations properly */}
            <AnimatePresence mode="wait">
              {activeTab === "personas" && (
                <motion.div
                  key="personas"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="personas" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<Users className="h-5 w-5 text-primary-700" />}
                      title="Customer Personas"
                      description="Create detailed profiles of your target customers to better understand their needs, behaviors, and pain points."
                      onCreate={handleAddPersona}
                      count={data.personas.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Creating Effective Personas",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              Effective customer personas should include:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li>Demographics (age, occupation, income level)</li>
                              <li>Goals and motivations</li>
                              <li>Pain points and challenges</li>
                              <li>Purchasing behaviors</li>
                              <li>Decision-making factors</li>
                            </ul>
                            <p className="text-dark-600 pt-2">
                              Focus on 3-5 primary personas that represent your core customer segments.
                            </p>
                          </div>
                        )
                      }}
                      hasItems={data.personas.length > 0}
                      emptyState={{
                        description: "Define who your target customers are, what they need, and what motivates their decisions."
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {data.personas.map((persona) => (
                          <motion.div
                            key={persona.id}
                            variants={itemVariants}
                          >
                            <CustomerPersonaCard
                              persona={persona}
                              onEdit={(id) => {}}
                              onUpdate={handleUpdatePersona}
                              onDelete={handleDeletePersona}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "interviews" && (
                <motion.div
                  key="interviews"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="interviews" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<UserSearch className="h-5 w-5 text-primary-700" />}
                      title="Customer Interviews"
                      description="Document insights from customer conversations to validate your ideas and identify needs."
                      onCreate={handleAddInterview}
                      count={data.interviews.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Conducting Effective Interviews",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              Tips for effective customer interviews:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li>Ask open-ended questions</li>
                              <li>Focus on their problems, not your solutions</li>
                              <li>Listen more than you talk</li>
                              <li>Look for patterns across multiple interviews</li>
                              <li>Take detailed notes and ask for clarification</li>
                            </ul>
                          </div>
                        )
                      }}
                      hasItems={data.interviews.length > 0}
                      emptyState={{
                        description: "Record insights from customer conversations to understand their needs and pain points."
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {data.interviews.map((interview) => (
                          <motion.div
                            key={interview.id}
                            variants={itemVariants}
                          >
                            <CustomerInterviewCard
                              interview={interview}
                              onEdit={(id) => {}}
                              onUpdate={handleUpdateInterview}
                              onDelete={handleDeleteInterview}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "competitors" && (
                <motion.div
                  key="competitors"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="competitors" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<Target className="h-5 w-5 text-primary-700" />}
                      title="Competitive Analysis"
                      description="Analyze your competitors to identify market gaps and opportunities for your product."
                      onCreate={handleAddCompetitor}
                      count={data.competitors.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Conducting Competitive Analysis",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              When analyzing competitors, consider:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li>Direct vs. indirect competitors</li>
                              <li>Their key strengths and weaknesses</li>
                              <li>Pricing strategies and market positioning</li>
                              <li>Marketing and distribution channels</li>
                              <li>Customer reviews and sentiment</li>
                            </ul>
                            <p className="text-dark-600 pt-2">
                              Look for gaps in the market that your product can address.
                            </p>
                          </div>
                        )
                      }}
                      hasItems={data.competitors.length > 0}
                      emptyState={{
                        description: "Analyze competitors to identify market gaps and opportunities for differentiation."
                      }}
                    >
                      <CompetitorTable
                        competitors={data.competitors}
                        onAdd={handleAddCompetitor}
                        onEdit={(id) => {}}
                        onUpdate={handleUpdateCompetitor}
                        onDelete={handleDeleteCompetitor}
                      />
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "trends" && (
                <motion.div
                  key="trends"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="trends" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<TrendingUp className="h-5 w-5 text-primary-700" />}
                      title="Market Trends"
                      description="Monitor industry trends to understand market direction and potential opportunities or threats."
                      onCreate={handleAddTrend}
                      count={data.trends.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Identifying Market Trends",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              How to identify and analyze market trends:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li>Monitor industry publications and research reports</li>
                              <li>Track technological advancements and their potential impact</li>
                              <li>Consider social and economic factors</li>
                              <li>Validate trends through customer feedback and data</li>
                            </ul>
                          </div>
                        )
                      }}
                      hasItems={data.trends.length > 0}
                      emptyState={{
                        description: "Track industry trends to identify opportunities and threats for your product strategy."
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {data.trends.map((trend) => (
                          <motion.div
                            key={trend.id}
                            variants={itemVariants}
                          >
                            <MarketTrendCard
                              trend={trend}
                              onEdit={(id) => {}}
                              onUpdate={handleUpdateTrend}
                              onDelete={handleDeleteTrend}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </LayoutGroup>
    </div>
  );
}