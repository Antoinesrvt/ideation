import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MarketAnalysisUIData } from '../types';
import { 
  Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, Users, 
  Building2, CircleDollarSign, ExternalLink, ArrowUpRight,
  ChevronRight, Info, Trophy, Star, BoxSelect, Clock,
  Target, Handshake
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MarketInsightsProps {
  data: MarketAnalysisUIData;
  className?: string;
}

export function MarketInsights({ data, className }: MarketInsightsProps) {
  // Calculate opportunities and threats
  const opportunities = data.trends.filter(t => t.trend_type === 'opportunity');
  const threats = data.trends.filter(t => t.trend_type === 'threat');
  
  // Calculate total addressable market
  const tam = data.overview?.marketSize?.tam || 0;
  const sam = data.overview?.marketSize?.sam || 0;
  const som = data.overview?.marketSize?.som || 0;
  
  // Calculate total customer base
  const totalCustomers = data.personas.reduce((sum, persona) => {
    // Extract estimated size from demographics if it contains a number
    const size = typeof persona.demographics === 'string' && 
               persona.demographics.match(/\d+/) ? 
               parseInt(persona.demographics.match(/\d+/)?.[0] || '0') : 0;
    return sum + size;
  }, 0);
  
  // Extract top competitors by market share
  const topCompetitors = [...data.competitors]
    .sort((a, b) => {
      // Extract numbers from market_share field
      const aShare = typeof a.market_share === 'string' && 
                   a.market_share.match(/\d+/) ? 
                   parseInt(a.market_share.match(/\d+/)?.[0] || '0') : 0;
      const bShare = typeof b.market_share === 'string' && 
                   b.market_share.match(/\d+/) ? 
                   parseInt(b.market_share.match(/\d+/)?.[0] || '0') : 0;
      return bShare - aShare;
    })
    .slice(0, 3);
  
  // Calculate market completion
  const hasMarketDefinition = !!data.overview?.marketDefinition?.industry;
  const hasPersonas = data.personas.length > 0;
  const hasInterviews = data.interviews.length > 0;
  const hasCompetitors = data.competitors.length > 0;
  const hasPartners = data.partners && data.partners.length > 0;
  const hasTrends = data.trends.length > 0;
  
  const completionPercentage = [
    hasMarketDefinition,
    hasPersonas,
    hasInterviews,
    hasCompetitors,
    hasPartners,
    hasTrends
  ].filter(Boolean).length / 6 * 100;
  
  // Generate action items based on missing data
  const getActionItems = () => {
    const actions = [];
    
    if (!hasMarketDefinition) {
      actions.push({
        title: "Define your market",
        description: "Set your industry and market size",
        icon: <BoxSelect className="h-4 w-4 text-blue-500" />,
        priority: "high"
      });
    }
    
    if (!hasPersonas) {
      actions.push({
        title: "Create customer personas",
        description: "Define who your ideal customers are",
        icon: <Users className="h-4 w-4 text-purple-500" />,
        priority: "high"
      });
    }
    
    if (!hasInterviews && hasPersonas) {
      actions.push({
        title: "Record customer interviews",
        description: "Document insights from real customer conversations",
        icon: <Users className="h-4 w-4 text-purple-500" />,
        priority: "medium"
      });
    }
    
    if (!hasCompetitors) {
      actions.push({
        title: "Map your competitors",
        description: "Identify your main competition",
        icon: <Building2 className="h-4 w-4 text-red-500" />,
        priority: "high"
      });
    }
    
    if (!hasPartners && hasMarketDefinition) {
      actions.push({
        title: "Define key partnerships",
        description: "Map strategic partners in your ecosystem",
        icon: <Users className="h-4 w-4 text-green-500" />,
        priority: "medium"
      });
    }
    
    if (!hasTrends && hasMarketDefinition) {
      actions.push({
        title: "Identify market trends",
        description: "Track trends that could impact your business",
        icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
        priority: "medium"
      });
    }
    
    return actions;
  };
  
  // Generate key insights based on data
  const generateInsights = (): { text: string; icon: React.ReactNode; color: string }[] => {
    const insights: { text: string; icon: React.ReactNode; color: string }[] = [];
    
    // Market size insights
    if (tam > 0) {
      insights.push({
        text: `Your total addressable market is ${formatCurrency(tam)}.`,
        icon: <CircleDollarSign className="h-4 w-4" />,
        color: "text-green-600"
      });
    }
    
    if (sam > 0 && tam > 0) {
      const samPercentage = Math.round((sam / tam) * 100);
      insights.push({
        text: `You're targeting ${samPercentage}% of the total market (${formatCurrency(sam)}).`,
        icon: <Target className="h-4 w-4" />,
        color: "text-blue-600"
      });
    }
    
    // Customer insights
    if (data.personas.length > 0) {
      insights.push({
        text: `You've identified ${data.personas.length} customer personas representing approximately ${totalCustomers.toLocaleString()} potential customers.`,
        icon: <Users className="h-4 w-4" />,
        color: "text-purple-600"
      });
    }
    
    // Competitive insights
    if (data.competitors.length > 0) {
      insights.push({
        text: `You're competing with ${data.competitors.length} identified competitors in your market.`,
        icon: <Building2 className="h-4 w-4" />,
        color: "text-red-600"
      });
    }
    
    if (topCompetitors.length > 0) {
      const topCompetitor = topCompetitors[0];
      insights.push({
        text: `Your top competitor ${topCompetitor.name} has strengths in: ${topCompetitor.strengths?.slice(0, 2)?.join(', ') || 'not specified'}`,
        icon: <Trophy className="h-4 w-4" />,
        color: "text-amber-600"
      });
    }
    
    // Trends insights
    if (opportunities.length > 0) {
      insights.push({
        text: `You've identified ${opportunities.length} market opportunities to capitalize on.`,
        icon: <ArrowUpRight className="h-4 w-4" />,
        color: "text-green-600"
      });
    }
    
    if (threats.length > 0) {
      insights.push({
        text: `There are ${threats.length} market threats to monitor closely.`,
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "text-red-600"
      });
    }
    
    // If partnerships exist
    if (data.partners && data.partners.length > 0) {
      insights.push({
        text: `You've mapped ${data.partners.length} strategic partnerships in your ecosystem.`,
        icon: <Handshake className="h-4 w-4" />,
        color: "text-green-600"
      });
    }
    
    return insights;
  };
  
  // Market tips based on current stage
  const getMarketTips = () => {
    // Basic tips that are always valuable
    const tips = [
      "Focus on a specific niche rather than trying to address the entire market",
      "Identify the 'jobs to be done' for your target customers",
      "Look for unsolved problems and underserved segments in your competitor analysis"
    ];
    
    // Add stage-specific tips
    if (!hasPersonas) {
      tips.unshift("Start by creating detailed customer personas to guide your market analysis");
    } else if (!hasCompetitors) {
      tips.unshift("Conduct a thorough competitor analysis to find gaps in the market");
    } else if (!hasTrends) {
      tips.unshift("Identify key market trends to stay ahead of market changes");
    }
    
    return tips.slice(0, 3); // Return top 3 tips
  };
  
  const insights = generateInsights();
  const actionItems = getActionItems();
  const marketTips = getMarketTips();
  
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall completion widget */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Market Analysis Completion</span>
            <span className="font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        {/* Action items section */}
        {actionItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
              Next Steps
            </h3>
            
            <div className="space-y-2">
              {actionItems.slice(0, 3).map((action, index) => (
                <motion.div 
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-md border",
                    action.priority === "high" ? "border-red-100 bg-red-50" :
                    action.priority === "medium" ? "border-amber-100 bg-amber-50" :
                    "border-green-100 bg-green-50"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      action.priority === "high" ? "border-red-200 text-red-700 bg-red-50" :
                      action.priority === "medium" ? "border-amber-200 text-amber-700 bg-amber-50" :
                      "border-green-200 text-green-700 bg-green-50"
                    )}
                  >
                    {action.priority}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Key insights accordion */}
        <Accordion type="single" collapsible defaultValue="insights" className="w-full">
          <AccordionItem value="insights" className="border-b">
            <AccordionTrigger className="text-sm hover:no-underline py-2">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500" />
                Key Insights
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1 pb-2">
                {insights.length > 0 ? (
                  insights.slice(0, 4).map((insight, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <div className={cn("flex-shrink-0 w-5 h-5 mt-0.5", insight.color)}>
                        {insight.icon}
                      </div>
                      <p className="text-xs">{insight.text}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Complete your market analysis to generate insights.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="tips" className="border-b">
            <AccordionTrigger className="text-sm hover:no-underline py-2">
              <span className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-500" />
                Market Tips
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1 pb-2">
                {marketTips.map((tip, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 pb-2"
                  >
                    <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <p className="text-xs">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="metrics" className="border-b">
            <AccordionTrigger className="text-sm hover:no-underline py-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Key Metrics
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="text-xs text-muted-foreground">Market Size</div>
                  <div className="text-sm font-medium">
                    {tam > 0 ? formatCurrency(tam) : 'Not set'}
                  </div>
                </div>
                
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="text-xs text-muted-foreground">Target Segment</div>
                  <div className="text-sm font-medium">
                    {sam > 0 ? formatCurrency(sam) : 'Not set'}
                  </div>
                </div>
                
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="text-xs text-muted-foreground">Customers</div>
                  <div className="text-sm font-medium">
                    {data.personas.length > 0 ? data.personas.length : 'None'}
                  </div>
                </div>
                
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="text-xs text-muted-foreground">Competitors</div>
                  <div className="text-sm font-medium">
                    {data.competitors.length > 0 ? data.competitors.length : 'None'}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Opportunity and threat summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Quick Overview</h3>
          <div className="flex flex-wrap gap-2">
            {opportunities.length > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                {opportunities.length} Opportunities
              </Badge>
            )}
            {threats.length > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                {threats.length} Threats
              </Badge>
            )}
            {topCompetitors.length > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                {topCompetitors.length} Key Competitors
              </Badge>
            )}
            {data.interviews.length > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                {data.interviews.length} Customer Interviews
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
          <a href="https://www.ama.org/marketing-news/how-to-conduct-a-market-analysis-a-complete-guide-for-businesses-and-marketers/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1" /> Market Analysis Guide
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
} 