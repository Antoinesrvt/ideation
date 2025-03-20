import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Tag,
  Trash2,
  User
} from 'lucide-react';

// Types
interface Decision {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  impact: 'high' | 'medium' | 'low';
  context: string;
  alternatives: string[];
  rationale: string;
  constraints: string[];
  outcome?: {
    status: 'positive' | 'negative' | 'neutral' | 'unknown';
    description: string;
    learnedLessons: string[];
    dateReviewed: string;
  };
  relatedDecisions: string[];
  createdBy: string;
}

// Mock data
const mockDecisions: Decision[] = [
  {
    id: 'decision-1',
    title: 'Pivot from B2C to B2B model',
    description: 'Changed our business model focus from direct consumer sales to enterprise clients',
    date: '2023-04-15',
    category: 'business-model',
    tags: ['pivot', 'business-model', 'strategy'],
    impact: 'high',
    context: 'After three months of testing our consumer offering, we struggled with high CAC and low retention. Several enterprise clients approached us about custom solutions.',
    alternatives: [
      'Continue with B2C but revise pricing strategy',
      'Create a hybrid model serving both markets',
      'Shut down and restart with new approach'
    ],
    rationale: 'B2B customers showed stronger product-market fit, lower acquisition costs, and higher LTV. Our technology was more differentiated in the enterprise space.',
    constraints: [
      'Limited runway (6 months remaining)',
      'Small team (4 people)',
      'Need to leverage existing technology'
    ],
    outcome: {
      status: 'positive',
      description: 'Secured 3 enterprise clients within 2 months, increased MRR by 250%, and reached cash flow positivity.',
      learnedLessons: [
        'B2B sales cycles were longer than anticipated (avg. 6 weeks)',
        'Required more customization than expected',
        'Partnership approach more effective than direct sales'
      ],
      dateReviewed: '2023-07-10'
    },
    relatedDecisions: ['decision-3'],
    createdBy: 'Jane Smith'
  },
  {
    id: 'decision-2',
    title: 'Outsource development of mobile app',
    description: 'Hired external developers for mobile app instead of building in-house',
    date: '2023-03-02',
    category: 'product',
    tags: ['development', 'outsourcing', 'mobile'],
    impact: 'medium',
    context: 'Needed to develop mobile capabilities quickly but lacked internal expertise. Core team focused on web platform and backend systems.',
    alternatives: [
      'Hire mobile developers full-time',
      'Delay mobile app development',
      'Build a mobile-responsive web app only'
    ],
    rationale: 'Outsourcing provided faster time to market, specialized expertise, and flexibility without long-term commitment.',
    constraints: [
      'Budget cap of $50K',
      'Timeline requirement of 3 months',
      'Need to maintain quality control'
    ],
    outcome: {
      status: 'negative',
      description: 'App delivered 6 weeks late with quality issues. Required significant internal resources to fix, ultimately costing more than hiring a developer.',
      learnedLessons: [
        'Vendor selection process was insufficient',
        'Specifications weren\'t detailed enough',
        'Communication challenges created misalignments',
        'Needed stronger oversight throughout process'
      ],
      dateReviewed: '2023-06-20'
    },
    relatedDecisions: [],
    createdBy: 'Michael Johnson'
  },
  {
    id: 'decision-3',
    title: 'Focus on healthcare vertical',
    description: 'Specialized our B2B offering for healthcare providers instead of serving multiple industries',
    date: '2023-05-28',
    category: 'market',
    tags: ['focus', 'vertical', 'healthcare'],
    impact: 'high',
    context: 'After pivoting to B2B, we saw interest from multiple industries but strongest traction in healthcare. Limited resources required prioritization.',
    alternatives: [
      'Serve multiple verticals with generic offering',
      'Focus on financial services (second strongest interest)',
      'Address two verticals in parallel'
    ],
    rationale: 'Healthcare showed highest willingness to pay, clearest use cases, and most urgent needs. Team had some healthcare expertise to leverage.',
    constraints: [
      'Marketing budget limitations',
      'Need to establish credibility quickly',
      'Product development capacity'
    ],
    outcome: {
      status: 'positive',
      description: 'Established leadership position in healthcare niche, shortened sales cycle, and increased win rate.',
      learnedLessons: [
        'Industry-specific language and examples significantly improved conversion',
        'Regulatory requirements more complex than anticipated',
        'Referrals became primary lead source within vertical'
      ],
      dateReviewed: '2023-08-15'
    },
    relatedDecisions: ['decision-1'],
    createdBy: 'Jane Smith'
  },
  {
    id: 'decision-4',
    title: 'Raise seed funding vs. bootstrap',
    description: 'Decided to pursue seed funding instead of continuing to bootstrap',
    date: '2023-02-10',
    category: 'financial',
    tags: ['funding', 'investors', 'growth'],
    impact: 'high',
    context: 'Company had been bootstrapped for 8 months with founders\' savings. Reached initial traction but growth limited by resources.',
    alternatives: [
      'Continue bootstrapping with slower growth',
      'Seek non-dilutive funding (grants, loans)',
      'Find strategic partner/acquisition'
    ],
    rationale: 'Growth opportunity required more capital than could be self-funded. Market timing suggested moving quickly to establish position.',
    constraints: [
      'Founders\' financial runway ending',
      'Competitive landscape intensifying',
      'Key hires needed to address technical challenges'
    ],
    outcome: {
      status: 'neutral',
      description: 'Secured $750K seed round after 4 months of fundraising. Enabled team expansion but fundraising took longer than expected and diverted focus.',
      learnedLessons: [
        'Fundraising process was more time-intensive than anticipated',
        'Earlier preparation of materials would have streamlined process',
        'Investor expectations created additional pressures on growth metrics'
      ],
      dateReviewed: '2023-07-30'
    },
    relatedDecisions: [],
    createdBy: 'Alex Wong'
  },
  {
    id: 'decision-5',
    title: 'Adopt freemium pricing model',
    description: 'Implemented freemium pricing strategy with feature-limited free tier',
    date: '2023-06-12',
    category: 'business-model',
    tags: ['pricing', 'acquisition', 'conversion'],
    impact: 'medium',
    context: 'Faced challenges with long sales cycles and high customer acquisition costs. Needed strategy to increase top-of-funnel and demonstrate value.',
    alternatives: [
      'Free trial model (time-limited)',
      'Demo only with direct sales',
      'Reduced-price entry tier'
    ],
    rationale: 'Freemium would allow users to experience value before purchasing, create network effects, and generate data for product improvement.',
    constraints: [
      'Needed to limit cannibalization of paid tiers',
      'Server costs per free user',
      'Support capacity limitations'
    ],
    outcome: {
      status: 'unknown',
      description: 'Recently implemented; too early to determine success. Initial signs show increased signups but conversion to paid still being monitored.',
      learnedLessons: [],
      dateReviewed: ''
    },
    relatedDecisions: [],
    createdBy: 'Michael Johnson'
  }
];

// Categories
const decisionCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'business-model', label: 'Business Model' },
  { value: 'product', label: 'Product' },
  { value: 'market', label: 'Market' },
  { value: 'financial', label: 'Financial' },
  { value: 'team', label: 'Team' },
  { value: 'operations', label: 'Operations' }
];

export function DecisionJournal() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDecisions, setExpandedDecisions] = useState<string[]>([]);
  const [addingDecision, setAddingDecision] = useState(false);
  
  // Filter decisions based on category and search query
  const filteredDecisions = mockDecisions
    .filter(decision => filter === 'all' || decision.category === filter)
    .filter(decision => 
      decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
  // Toggle decision expansion
  const toggleDecision = (id: string) => {
    if (expandedDecisions.includes(id)) {
      setExpandedDecisions(expandedDecisions.filter(decId => decId !== id));
    } else {
      setExpandedDecisions([...expandedDecisions, id]);
    }
  };
  
  // Get color for impact badge
  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Get color for outcome status
  const getOutcomeColor = (status: 'positive' | 'negative' | 'neutral' | 'unknown' | undefined) => {
    switch (status) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-amber-600';
      case 'unknown':
      default:
        return 'text-gray-600';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Sort by date (newest first)
  const sortedDecisions = [...filteredDecisions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
              Decision Journal
            </CardTitle>
            <CardDescription>
              Track key decisions, rationales, and outcomes over time
            </CardDescription>
          </div>
          <Dialog open={addingDecision} onOpenChange={setAddingDecision}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Decision
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record New Decision</DialogTitle>
                <DialogDescription>
                  Document an important decision you've made for future reference and learning
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="title" className="text-right text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Brief title of the decision"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Short description of what was decided"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="category" className="text-right text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    className="col-span-3 border rounded-md p-2"
                  >
                    {decisionCategories.filter(c => c.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="impact" className="text-right text-sm font-medium">
                    Impact Level
                  </label>
                  <select
                    id="impact"
                    className="col-span-3 border rounded-md p-2"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="context" className="text-right text-sm font-medium">
                    Context
                  </label>
                  <Textarea
                    id="context"
                    placeholder="What's the situation that led to this decision?"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="rationale" className="text-right text-sm font-medium">
                    Rationale
                  </label>
                  <Textarea
                    id="rationale"
                    placeholder="Why did you make this decision? What factors were considered?"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="alternatives" className="text-right text-sm font-medium">
                    Alternatives
                  </label>
                  <Textarea
                    id="alternatives"
                    placeholder="What other options were considered? (One per line)"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="constraints" className="text-right text-sm font-medium">
                    Constraints
                  </label>
                  <Textarea
                    id="constraints"
                    placeholder="What limitations influenced this decision? (One per line)"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="tags" className="text-right text-sm font-medium">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddingDecision(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setAddingDecision(false)}>
                  Save Decision
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search decisions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="border rounded-md p-2 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {decisionCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Timeline view */}
          <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
            {sortedDecisions.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No decisions found matching your criteria</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              sortedDecisions.map(decision => (
                <div key={decision.id} className="relative">
                  {/* Timeline dot */}
                  <div 
                    className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white ${
                      decision.outcome?.status === 'positive' ? 'bg-green-500' :
                      decision.outcome?.status === 'negative' ? 'bg-red-500' :
                      decision.outcome?.status === 'neutral' ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`}
                  />
                  
                  {/* Card */}
                  <Card className="overflow-hidden">
                    <div className="border-l-4 h-full absolute" style={{ 
                      borderColor: decision.category === 'business-model' ? '#8b5cf6' :
                        decision.category === 'product' ? '#3b82f6' :
                        decision.category === 'market' ? '#10b981' :
                        decision.category === 'financial' ? '#f59e0b' :
                        decision.category === 'team' ? '#ef4444' :
                        '#6b7280'
                    }} />
                    
                    <div className="pl-4 pr-3 pt-3 pb-3">
                      {/* Header row */}
                      <div 
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() => toggleDecision(decision.id)}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className="capitalize bg-gray-50"
                            >
                              {decision.category.replace('-', ' ')}
                            </Badge>
                            <Badge className={getImpactColor(decision.impact)}>
                              {decision.impact} impact
                            </Badge>
                            <div className="flex items-center text-gray-500 text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(decision.date)}
                            </div>
                          </div>
                          
                          <h3 className="font-medium text-gray-900">{decision.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{decision.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {decision.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {decision.outcome && (
                            <div 
                              className={`text-sm font-medium ${getOutcomeColor(decision.outcome.status)}`}
                            >
                              {decision.outcome.status.charAt(0).toUpperCase() + decision.outcome.status.slice(1)}
                            </div>
                          )}
                          {expandedDecisions.includes(decision.id) 
                            ? <ChevronDown className="h-5 w-5 text-gray-400" />
                            : <ChevronRight className="h-5 w-5 text-gray-400" />
                          }
                        </div>
                      </div>
                      
                      {/* Expanded view */}
                      {expandedDecisions.includes(decision.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Context</h4>
                              <p className="text-gray-700">{decision.context}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Rationale</h4>
                              <p className="text-gray-700">{decision.rationale}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Alternatives Considered</h4>
                              <ul className="list-disc pl-4 text-gray-700 space-y-1">
                                {decision.alternatives.map((alt, i) => (
                                  <li key={i}>{alt}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Constraints</h4>
                              <ul className="list-disc pl-4 text-gray-700 space-y-1">
                                {decision.constraints.map((constraint, i) => (
                                  <li key={i}>{constraint}</li>
                                ))}
                              </ul>
                            </div>
                            
                            {decision.outcome && (
                              <div className="md:col-span-2 bg-gray-50 p-3 rounded-md">
                                <h4 className="font-medium text-gray-900 mb-2">Outcome</h4>
                                <div className={`mb-2 ${getOutcomeColor(decision.outcome.status)}`}>
                                  <strong>
                                    {decision.outcome.status.charAt(0).toUpperCase() + decision.outcome.status.slice(1)}
                                  </strong>
                                  {decision.outcome.dateReviewed && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      Reviewed on {formatDate(decision.outcome.dateReviewed)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 mb-2">{decision.outcome.description}</p>
                                
                                {decision.outcome.learnedLessons && decision.outcome.learnedLessons.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-gray-800 mb-1">Lessons Learned:</h5>
                                    <ul className="list-disc pl-4 text-gray-700 space-y-1">
                                      {decision.outcome.learnedLessons.map((lesson, i) => (
                                        <li key={i}>{lesson}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                            <div className="flex items-center text-gray-500 text-xs">
                              <User className="h-3.5 w-3.5 mr-1" />
                              Recorded by {decision.createdBy}
                            </div>
                            
                            <div className="flex gap-2">
                              {!decision.outcome && (
                                <Button size="sm" variant="outline" className="h-8 text-xs">
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Add Outcome
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-8 text-xs">
                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 