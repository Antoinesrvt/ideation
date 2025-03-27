import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

// Risk categories
type RiskCategory = 'market' | 'execution' | 'financial' | 'product' | 'team';

// Risk type
interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: number; // 0-1 scale
  probability: number; // 0-1 scale
  impact: number; // 0-1 scale
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: { name: string; weight: number }[];
  mitigationPlan?: string;
  mitigationProgress: number; // 0-1 scale
  mitigationToolLinks?: string[];
}

// Mock risks data
const mockRisks: Risk[] = [
  {
    id: 'risk-1',
    title: 'Market Competition Intensifying',
    description: 'New entrants and existing competitors are rapidly expanding their offerings in our target market segment.',
    category: 'market',
    severity: 0.8,
    probability: 0.7,
    impact: 0.9,
    trend: 'increasing',
    factors: [
      { name: 'Two new competitors launched in Q2', weight: 0.8 },
      { name: 'Major competitor raised $10M funding', weight: 0.9 },
      { name: 'Price pressure from low-cost alternatives', weight: 0.7 }
    ],
    mitigationPlan: 'Focus on differentiating through unique features and superior UX while accelerating development of proprietary technology.',
    mitigationProgress: 0.3,
    mitigationToolLinks: ['market', 'product-design']
  },
  {
    id: 'risk-2',
    title: 'Regulatory Changes Expected',
    description: 'Upcoming regulatory changes in Q3 may affect our ability to collect and use customer data.',
    category: 'market',
    severity: 0.7,
    probability: 0.8,
    impact: 0.6,
    trend: 'increasing',
    factors: [
      { name: 'New data privacy laws being drafted', weight: 0.9 },
      { name: 'Industry facing increased scrutiny', weight: 0.7 },
      { name: 'Competitors already adjusting practices', weight: 0.5 }
    ],
    mitigationPlan: 'Consult with legal experts, redesign data collection practices, and develop compliant alternatives.',
    mitigationProgress: 0.4,
    mitigationToolLinks: ['validation']
  },
  {
    id: 'risk-3',
    title: 'Development Timeline Slippage',
    description: 'Current development velocity indicates possible delays in reaching MVP launch date.',
    category: 'execution',
    severity: 0.6,
    probability: 0.7,
    impact: 0.5,
    trend: 'stable',
    factors: [
      { name: 'Backend integration taking longer than estimated', weight: 0.8 },
      { name: 'Technical debt from earlier rapid development', weight: 0.6 },
      { name: 'Limited developer resources', weight: 0.7 }
    ],
    mitigationPlan: 'Re-prioritize feature set for MVP, consider bringing on additional development resources.',
    mitigationProgress: 0.5,
    mitigationToolLinks: ['team']
  },
  {
    id: 'risk-4',
    title: 'Customer Acquisition Cost Higher Than Expected',
    description: 'Initial marketing campaigns showing higher CAC than projected in financial model.',
    category: 'financial',
    severity: 0.7,
    probability: 0.6,
    impact: 0.8,
    trend: 'decreasing',
    factors: [
      { name: 'Digital ad costs increased by 30%', weight: 0.9 },
      { name: 'Lower than expected conversion rates', weight: 0.7 },
      { name: 'Targeting may be too broad', weight: 0.6 }
    ],
    mitigationPlan: 'Refine target audience, test alternative acquisition channels, optimize conversion funnel.',
    mitigationProgress: 0.6,
    mitigationToolLinks: ['financials', 'market']
  },
  {
    id: 'risk-5',
    title: 'Core Technical Assumption Unproven',
    description: 'Key algorithm efficiency remains unproven at production scale.',
    category: 'product',
    severity: 0.9,
    probability: 0.5,
    impact: 0.9,
    trend: 'stable',
    factors: [
      { name: 'Limited testing with production-level data volumes', weight: 0.8 },
      { name: 'Early benchmarks show potential scaling issues', weight: 0.7 },
      { name: 'Alternative approaches may require redesign', weight: 0.9 }
    ],
    mitigationPlan: 'Accelerate technical testing with realistic data volumes, prepare fallback architecture if needed.',
    mitigationProgress: 0.2,
    mitigationToolLinks: ['validation']
  },
  {
    id: 'risk-6',
    title: 'Key Team Member Departure Risk',
    description: 'Critical technical lead showing signs of potential departure.',
    category: 'team',
    severity: 0.8,
    probability: 0.4,
    impact: 0.9,
    trend: 'decreasing',
    factors: [
      { name: 'Specialized knowledge concentrated in one person', weight: 0.9 },
      { name: 'Limited documentation of core systems', weight: 0.7 },
      { name: 'Competitive job market for similar roles', weight: 0.8 }
    ],
    mitigationPlan: 'Implement knowledge sharing sessions, improve documentation, create retention plan.',
    mitigationProgress: 0.7,
    mitigationToolLinks: ['team']
  }
];

export function RiskAssessmentDashboard({ projectId }: { projectId: string }) {
  const [expandedRisks, setExpandedRisks] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const filteredRisks = activeCategory === 'all' 
    ? mockRisks 
    : mockRisks.filter(risk => risk.category === activeCategory);
  
  // Toggle risk expansion
  const toggleRisk = (riskId: string) => {
    if (expandedRisks.includes(riskId)) {
      setExpandedRisks(expandedRisks.filter(id => id !== riskId));
    } else {
      setExpandedRisks([...expandedRisks, riskId]);
    }
  };
  
  // Calculate overall risk score (weighted average of severity * probability)
  const calculateOverallRiskScore = (risks: Risk[]) => {
    if (risks.length === 0) return 0;
    
    const totalWeight = risks.reduce((sum, risk) => sum + (risk.severity * risk.probability), 0);
    return totalWeight / risks.length;
  };
  
  // Get color for severity
  const getSeverityColor = (severity: number) => {
    if (severity >= 0.7) return 'text-red-600';
    if (severity >= 0.4) return 'text-amber-600';
    return 'text-green-600';
  };
  
  // Get icon for trend
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
      default:
        return <span className="h-4 w-4 inline-block" />;
    }
  };
  
  // Get category display name
  const getCategoryDisplayName = (category: RiskCategory): string => {
    const categoryNames: Record<RiskCategory, string> = {
      market: 'Market Risk',
      execution: 'Execution Risk',
      financial: 'Financial Risk',
      product: 'Product Risk',
      team: 'Team Risk'
    };
    return categoryNames[category];
  };
  
  // Get category colors
  const getCategoryColor = (category: RiskCategory): string => {
    const categoryColors: Record<RiskCategory, string> = {
      market: 'bg-blue-100 text-blue-800',
      execution: 'bg-purple-100 text-purple-800',
      financial: 'bg-green-100 text-green-800',
      product: 'bg-amber-100 text-amber-800',
      team: 'bg-red-100 text-red-800'
    };
    return categoryColors[category];
  };
  
  const overallRiskScore = calculateOverallRiskScore(mockRisks);
  
  // Count risks by category
  const risksByCategory = mockRisks.reduce((acc, risk) => {
    acc[risk.category] = (acc[risk.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // High severity risks
  const highSeverityRisks = mockRisks.filter(risk => risk.severity >= 0.7);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Risk Assessment Dashboard
          </CardTitle>
          <CardDescription>
            Identify and mitigate key risks to your startup success
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Overall Risk Score</div>
                <div className="flex items-end">
                  <div className={`text-2xl font-bold ${getSeverityColor(overallRiskScore)}`}>
                    {Math.round(overallRiskScore * 100)}%
                  </div>
                  <div className="text-xs text-gray-600 ml-2 mb-1">
                    {overallRiskScore >= 0.7 ? 'High' : overallRiskScore >= 0.4 ? 'Medium' : 'Low'}
                  </div>
                </div>
                <Progress 
                  value={overallRiskScore * 100} 
                  className="h-1.5 mt-2" 
                  indicatorClassName={`${
                    overallRiskScore >= 0.7 
                      ? 'bg-red-500' 
                      : overallRiskScore >= 0.4 
                        ? 'bg-amber-500' 
                        : 'bg-green-500'
                  }`}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">High Severity Risks</div>
                <div className="flex items-end">
                  <div className="text-2xl font-bold text-red-600">
                    {highSeverityRisks.length}
                  </div>
                  <div className="text-xs text-gray-600 ml-2 mb-1">
                    of {mockRisks.length} total risks
                  </div>
                </div>
                <div className="flex space-x-1 mt-2">
                  {mockRisks.map((risk, i) => (
                    <div 
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${
                        risk.severity >= 0.7 
                          ? 'bg-red-500' 
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Risk Categories</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(risksByCategory).map(([category, count]) => (
                    <Badge 
                      key={category}
                      className={getCategoryColor(category as RiskCategory)}
                    >
                      {getCategoryDisplayName(category as RiskCategory)}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Risk List */}
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Risks</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              <div className="space-y-3">
                {filteredRisks.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No risks found in this category</p>
                  </div>
                ) : (
                  filteredRisks
                    .sort((a, b) => (b.severity * b.probability) - (a.severity * a.probability))
                    .map(risk => (
                      <Card key={risk.id} className="overflow-hidden">
                        <div 
                          className={`h-1 w-full ${
                            risk.severity >= 0.7 
                              ? 'bg-red-500' 
                              : risk.severity >= 0.4 
                                ? 'bg-amber-500' 
                                : 'bg-green-500'
                          }`}
                        />
                        <div className="p-4">
                          <div 
                            className="flex justify-between items-start cursor-pointer"
                            onClick={() => toggleRisk(risk.id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <Badge className={getCategoryColor(risk.category)}>
                                  {getCategoryDisplayName(risk.category)}
                                </Badge>
                                <div className="flex items-center ml-2">
                                  {getTrendIcon(risk.trend)}
                                  <span className="text-xs text-gray-500 ml-1">
                                    {risk.trend.charAt(0).toUpperCase() + risk.trend.slice(1)}
                                  </span>
                                </div>
                              </div>
                              <h3 className="font-medium">{risk.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                            </div>
                            <div className="flex items-center ml-4">
                              <div className="text-right mr-3">
                                <div className={`font-medium ${getSeverityColor(risk.severity)}`}>
                                  Severity: {Math.round(risk.severity * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  Probability: {Math.round(risk.probability * 100)}%
                                </div>
                              </div>
                              {expandedRisks.includes(risk.id) 
                                ? <ChevronDown className="h-5 w-5 text-gray-400" />
                                : <ChevronRight className="h-5 w-5 text-gray-400" />
                              }
                            </div>
                          </div>
                          
                          {expandedRisks.includes(risk.id) && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2">Risk Factors:</h4>
                                <ul className="space-y-1">
                                  {risk.factors.map((factor, i) => (
                                    <li key={i} className="text-sm flex items-center">
                                      <div 
                                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                          factor.weight >= 0.7 
                                            ? 'bg-red-500' 
                                            : factor.weight >= 0.4 
                                              ? 'bg-amber-500' 
                                              : 'bg-green-500'
                                        }`}
                                      />
                                      {factor.name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {risk.mitigationPlan && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-medium mb-2">Mitigation Plan:</h4>
                                  <p className="text-sm text-gray-700">{risk.mitigationPlan}</p>
                                  
                                  <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                      <span>Mitigation Progress</span>
                                      <span>{Math.round(risk.mitigationProgress * 100)}%</span>
                                    </div>
                                    <Progress 
                                      value={risk.mitigationProgress * 100} 
                                      className="h-1.5" 
                                      indicatorClassName="bg-blue-500" 
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {risk.mitigationToolLinks && risk.mitigationToolLinks.length > 0 && (
                                <div className="flex justify-end">
                                  <Button variant="outline" size="sm">
                                    Address This Risk
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 