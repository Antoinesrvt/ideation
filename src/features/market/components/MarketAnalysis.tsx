import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpRight, BarChart2, ChevronRight, Info, PlusCircle, 
  Users, UserSearch, Search, TrendingUp, Activity, AlertCircle,
  Target, ScaleIcon, LineChart, HelpCircle, ArrowLeft, FileText,
  BarChart, UserRound, MessageSquare, Handshake, AppWindow, LayoutDashboard,
  Building
} from 'lucide-react';
import { EnhancedCustomerPersonaCard } from './EnhancedCustomerPersonaCard';
import { EnhancedCustomerInterviewCard } from './EnhancedCustomerInterviewCard';
import { CompetitorTable } from './CompetitorTable';
import { EnhancedMarketTrendCard } from './EnhancedMarketTrendCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useProjectStore } from '@/store';
import { useMarketAnalysis, ExtendedMarketAnalysisData } from '@/hooks/features/useMarketAnalysis';
import { useParams } from 'next/navigation';
import TabList from "@/features/common/components/TabList";
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';
import { SectionTab } from '@/components/ui/section-tab';
import { MarketOverviewData, MarketAnalysisUIData, MarketPartner, PartnerFormValues } from '../types';
import { MarketOverview } from './MarketOverview';
import { MarketSectionNavigation, MarketSection } from './MarketSectionNavigation';
import { MarketLandscape } from './MarketLandscape';
import { MarketInsights } from './MarketInsights';
import { PartnerAnalysis } from './PartnerAnalysis';
import { PartnerWrapper } from './PartnerWrapper';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MarketDefinition, MarketSize } from '../types';
import { BusinessSection } from './BusinessSection';
import { MarketPersonas } from './MarketPersonas';
import { marketAnalysisService } from '@/lib/services';
import type { MarketPersona } from '@/store/types';

const marketTabs = [
  {
    id: "overview",
    label: "Market Overview",
    icon: <BarChart2 className="h-4 w-4 mr-2" />,
  },
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

// Animation variants for the tab content
const sectionContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Animation variants for child elements within each section
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

// Replace the mockMarketOverviewData with a properly typed version
const mockMarketOverviewData: MarketOverviewData = {
  marketDefinition: {
    industry: 'Software as a Service',
    geography: 'global',
    maturity: 'growing'
  },
  marketSize: {
    tam: 150000000000, // $150B
    sam: 45000000000, // $45B
    som: 4500000000, // $4.5B
    tamMethod: 'top-down',
    samPercentage: 30,
    somPercentage: 10
  },
  segments: [
    {
      name: 'Enterprise',
      size: 60,
      growth: 15
    },
    {
      name: 'Mid-market',
      size: 30,
      growth: 22
    },
    {
      name: 'Small Business',
      size: 10,
      growth: 18
    }
  ]
};

export type MarketAnalysisProps = {
  projectId: string;
  currentSection?: MarketSection;
  onSectionClick?: (section: MarketSection) => void;
  readOnly?: boolean;
}

export function MarketAnalysis({ 
  projectId,
  currentSection = 'overview',
  onSectionClick,
  readOnly = false
}: MarketAnalysisProps) {
  const { toast } = useToast();
  
  // For handling tabs in detail sections
  const [activeTab, setActiveTab] = useState('personas');
  
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
    deleteTrend,
    addPartner,
    updatePartner,
    deletePartner
  } = useMarketAnalysis(projectId);
  
  const { comparisonMode } = useProjectStore();
  
  // Calculate completion status for various sections
  const completionStatus = useMemo(() => {
    // Market definition completion
    const marketDefinitionScore = data.overview?.marketDefinition?.industry ? 100 : 0;
    
    // Trends completion
    const trendsScore = Math.min(data.trends.length * 20, 100);
    
    // Customers completion (personas + interviews)
    const personasScore = Math.min(data.personas.length * 10, 50);
    const interviewsScore = Math.min(data.interviews.length * 10, 50);
    const customersScore = (personasScore + interviewsScore) / 2;
    
    // Competitors completion
    const competitorsScore = Math.min(data.competitors.length * 20, 100);
    
    // Partners completion (if exists)
    const partnersScore = data.partners && data.partners.length > 0 
      ? Math.min(data.partners.length * 20, 100) 
      : 0;
    
    return {
      'business': marketDefinitionScore,
      'trends': trendsScore,
      'customers': customersScore,
      'competitors': competitorsScore,
      'partners': partnersScore,
      'overall': (marketDefinitionScore + trendsScore + customersScore + competitorsScore + partnersScore) / 5
    };
  }, [data]);
  
  // Effect to sync tab state with section when section changes
  useEffect(() => {
    if (currentSection === 'customers') {
      setActiveTab('personas');
    } else if (currentSection === 'business') {
      setActiveTab('overview');
    }
  }, [currentSection]);
  
  // Handle tab change within a section
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Handle section change
  const handleSectionClick = (section: MarketSection) => {
    console.log(`Section clicked: ${section}`); // Debug logging
    if (onSectionClick) {
      onSectionClick(section);
    }
  };

  const handleAddPersona = async () => {
    if (!projectId) return;
    
    console.log('MarketAnalysis - Handle add persona called');
    
    try {
      await addPersona({
      name: 'New Persona',
        role: '',
        demographics: '',
        pain_points: [],
        goals: [],
      project_id: projectId,
        created_by: null,
        // Add the new required fields with defaults
        influence_score: null,
        priority: null,
        persona_segments: [],
        empathy_map: null
    });
      
      toast({
        title: 'Success',
        description: 'New persona has been added',
        variant: 'default'
      });
    } catch (err) {
      console.error('MarketAnalysis - Error adding persona:', err);
      toast({
        title: 'Error',
        description: `Failed to add persona: ${(err as Error).message}`,
        variant: 'destructive'
      });
    }
  };
  
  const handleAddInterview = async () => {
    if (!projectId) return;
    
    try {
      await addInterview({
      name: 'New Interview',
        company: '',
      interview_date: new Date().toISOString(),
        sentiment: 'neutral',
        notes: '',
        key_insights: [],
        tags: [],
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
        website: '',
        strengths: [],
        weaknesses: [],
        price: '',
        market_share: '',
        notes: '',
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
        name: 'New Market Trend',
        direction: 'upward',
        trend_type: 'opportunity',
        description: '',
        tags: [],
        sources: [],
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
  
  // If we're loading or have an error, show appropriate state
  if (isLoading) return <LoadingState message="Loading market analysis data..." />;
  if (error) return <ErrorState error={error.message} />;
  
  // Convert interviews to ExtendedMarketInterview type
  const extendedInterviews = useMemo(() => {
    return data.interviews.map(interview => ({
      ...interview,
      status: undefined  // Add the status field required by ExtendedMarketInterview
    }));
  }, [data.interviews]);
  
  // Set default overview data if none exists yet
  const marketData: MarketAnalysisUIData = {
    personas: data.personas,
    interviews: extendedInterviews,
    competitors: data.competitors,
    trends: data.trends,
    partners: data.partners,
    overview: data.overview ? {
      marketDefinition: data.overview.marketDefinition || mockMarketOverviewData.marketDefinition,
      marketSize: data.overview.marketSize || mockMarketOverviewData.marketSize,
      segments: data.overview.segments || mockMarketOverviewData.segments
    } : mockMarketOverviewData
  };
  
  // Get section title for breadcrumbs
  const getSectionTitle = (section: MarketSection): string => {
    switch (section) {
      case 'overview': return 'Overview';
      case 'business': return 'Your Business';
      case 'trends': return 'Market Trends';
      case 'customers': return 'Customers';
      case 'competitors': return 'Competitors';
      case 'partners': return 'Partners';
      default: return 'Market Analysis';
    }
  };
  
  // Wrap partner data in a separate component to handle optional props
  const PartnerWrapper = ({
    partners,
    addPartner,
    updatePartner,
    deletePartner,
    readOnly
  }: any) => (
    <PartnerAnalysis 
      partners={partners}
      onAddPartner={addPartner} 
      onUpdatePartner={updatePartner} 
      onDeletePartner={deletePartner}
      readOnly={readOnly}
    />
  );

  // Add this after the component function declaration and state hooks
  useEffect(() => {
    console.log('MarketAnalysis - Market data:', marketData);
    console.log('MarketAnalysis - Personas count:', marketData.personas?.length || 0);
  }, [marketData]);

  return (
    <div className="h-full w-full overflow-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={sectionContentVariants}
          className="space-y-6 w-full h-full"
        >
          {/* Overview Section */}
          {currentSection === 'overview' && (
            <motion.div variants={itemVariants} className="w-full h-full">
              <Card className="h-full overflow-hidden">
                <CardContent className="p-4 h-full">
                  <MarketLandscape 
                    data={marketData}
                    onSectionClick={(section) => {
                      // Make sure onSectionClick is provided
                      if (onSectionClick) {
                        switch(section) {
                          case 'business':
                          case 'trends':
                          case 'customers':
                          case 'competitors':
                          case 'partners':
                          case 'overview':
                            // These are all valid sections in our MarketSection type
                            handleSectionClick(section as MarketSection);
                            break;
                          default:
                            console.warn(`Invalid section: ${section}`);
                            break;
                        }
                      }
                    }}
                    currentSection={currentSection}
                  />
          </CardContent>
        </Card>
            </motion.div>
          )}
          
          {/* Business Section (replacing Market Definition) */}
          {currentSection === 'business' && (
            <motion.div variants={itemVariants} className="w-full h-full">
              <BusinessSection 
                data={marketData.overview}
                onUpdate={readOnly ? undefined : (data) => {
                  // Handle updating overview data
                }}
              />
            </motion.div>
          )}
          
          {/* Trends Section */}
          {currentSection === 'trends' && (
            <motion.div variants={itemVariants} className="w-full h-full">
        <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Market Trends
            </CardTitle>
                    <CardDescription>
                      Track emerging market trends that could impact your business
                    </CardDescription>
                  </div>
                  
                  {!readOnly && (
                    <Button size="sm" onClick={handleAddTrend}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Trend
                    </Button>
                  )}
          </CardHeader>
                
          <CardContent>
                  {marketData.trends.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No market trends added yet</p>
                      {!readOnly && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={handleAddTrend}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add your first trend
                        </Button>
                      )}
                </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marketData.trends.map(trend => (
                        <EnhancedMarketTrendCard
                          key={trend.id}
                          trend={trend}
                          onEdit={readOnly ? undefined : () => {}}
                          onUpdate={readOnly ? undefined : updateTrend}
                          onDelete={readOnly ? undefined : deleteTrend}
                          readOnly={readOnly}
                        />
                      ))}
              </div>
                  )}
          </CardContent>
        </Card>
                </motion.div>
              )}

          {/* Customers Section */}
          {currentSection === 'customers' && (
            <motion.div variants={itemVariants} className="w-full h-full">
              <div className="h-full">
                <MarketPersonas 
                  personas={marketData.personas || []} 
                  projectId={projectId}
                  interviews={marketData.interviews || []}
                />
            </div>
                </motion.div>
              )}

          {/* Competitors Section */}
          {currentSection === 'competitors' && (
            <motion.div variants={itemVariants} className="w-full h-full">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center">
                      <Target className="h-5 w-5 mr-2 text-red-500" />
                      Competitor Analysis
                    </CardTitle>
                    <CardDescription>
                      Track and analyze your main competitors
                    </CardDescription>
                  </div>
                  
                  {!readOnly && (
                    <Button size="sm" onClick={handleAddCompetitor}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Competitor
                    </Button>
                  )}
                </CardHeader>
                
                <CardContent>
                  {marketData.competitors.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No competitors added yet</p>
                      {!readOnly && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={handleAddCompetitor}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add your first competitor
                        </Button>
                      )}
            </div>
                  ) : (
            <CompetitorTable
                      competitors={marketData.competitors}
                      onAdd={readOnly ? undefined : handleAddCompetitor}
                      onUpdate={readOnly ? undefined : updateCompetitor}
                      onDelete={readOnly ? undefined : deleteCompetitor}
                      readOnly={readOnly}
                    />
                  )}
                </CardContent>
              </Card>
                </motion.div>
              )}

          {/* Partners Section */}
          {currentSection === 'partners' && (
            <motion.div variants={itemVariants} className="w-full h-full">
              <PartnerWrapper 
                partners={marketData.partners || []}
                addPartner={readOnly ? undefined : addPartner}
                updatePartner={readOnly ? undefined : updatePartner}
                deletePartner={readOnly ? undefined : deletePartner}
                readOnly={readOnly}
                />
                          </motion.div>
          )}
                </motion.div>
            </AnimatePresence>
    </div>
  );
}