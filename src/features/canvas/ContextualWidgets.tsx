import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Share2, 
  Download,
  Bookmark,
  Clock,
  PlusCircle,
  Edit,
  Save,
  ArrowUpRight,
  BarChart2,
  Brain,
  PanelLeft,
  LightbulbIcon,
  CircleHelp
} from 'lucide-react';

import { Focus } from './JourneyCanvas';

interface ContextualWidgetsProps {
  focus: Focus;
  stageProgress: Record<string, number>;
  toolProgress: Record<string, number>;
}

// Available widget types by category
type WidgetCategory = 'tools' | 'insights' | 'ai' | 'resources';

export function ContextualWidgets({
  focus,
  stageProgress,
  toolProgress
}: ContextualWidgetsProps) {
  // State for the active tab category
  const [activeCategory, setActiveCategory] = useState<WidgetCategory>('insights');
  
  // State for sidebar collapse on mobile/small screens
  const [collapsed, setCollapsed] = useState(false);
  
  // Custom AI prompt ideas based on current focus
  const getContextualPromptIdeas = (): string[] => {
    if (focus.type === 'overview') {
      return [
        "What should I focus on next in my journey?",
        "How do I prioritize between my current challenges?",
        "What metrics should I be tracking at this stage?",
        "Help me overcome my current bottleneck",
        "What's a good time estimate for completing my next milestone?"
      ];
    }
    
    if (focus.type === 'stage') {
      switch (focus.stageId) {
        case 'propose':
          return [
            "Help me brainstorm product ideas",
            "What problem am I trying to solve?",
            "How do I create a compelling value proposition?"
          ];
        case 'validity':
          return [
            "How do I test my market assumptions?",
            "What validation methods should I use?",
            "How many customer interviews should I conduct?"
          ];
        case 'viability':
          return [
            "How do I calculate my unit economics?",
            "What's a good pricing strategy for my product?",
            "How much funding should I raise?"
          ];
        case 'create':
          return [
            "How do I build a minimum viable product?",
            "What features should I prioritize?",
            "How do I find technical talent?"
          ];
        default:
          return [
            "What should I focus on next?",
            "How do I overcome this challenge?",
            "What metrics should I track?"
          ];
      }
    }
    
    if (focus.type === 'tool' && focus.toolId) {
      const toolPrompts: Record<string, string[]> = {
        'venture_viability_radar': [
          "How do I interpret this viability score?",
          "What's a good benchmark for market size?",
          "How can I improve my venture's viability?"
        ],
        'go_no_go_framework': [
          "What data should I consider for this decision?",
          "How do I weigh different decision factors?",
          "What are the risks of moving forward?"
        ],
        'dependency_matrix': [
          "How do I manage complex dependencies?",
          "What should I prioritize first?",
          "How do I resolve this dependency conflict?"
        ],
        'decision_journal': [
          "What should I include in my decision record?",
          "How do I learn from past decisions?",
          "How do I evaluate decision quality?"
        ]
      };
      
      return toolPrompts[focus.toolId] || [
        "How do I use this tool effectively?",
        "What are best practices for this activity?",
        "Can you explain this concept in detail?"
      ];
    }
    
    return [
      "How do I build a successful startup?",
      "What's the next step in my journey?",
      "How do I overcome this challenge?"
    ];
  };
  
  // Get relevant decision insights based on current focus
  const getDecisionInsights = () => {
    if (focus.type === 'overview') {
      // Calculate the overall progress (average of all stage progress)
      const stageProgressValues = Object.values(stageProgress);
      const overallProgress = stageProgressValues.length 
        ? Math.round(stageProgressValues.reduce((sum, val) => sum + val, 0) / stageProgressValues.length) 
        : 0;
      
      // Count stages with progress greater than 0
      const stagesStarted = Object.values(stageProgress).filter(progress => progress > 0).length;
      
      // Count stages with progress at 100%
      const stagesCompleted = Object.values(stageProgress).filter(progress => progress >= 100).length;

      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Journey Health</div>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Overall Progress</span>
            </div>
            <span className="text-sm font-medium">{overallProgress}%</span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Stages Started</span>
            </div>
            <span className="text-sm font-medium">{stagesStarted} / 4</span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm">Stages Completed</span>
            </div>
            <span className="text-sm font-medium">{stagesCompleted} / 4</span>
          </div>
          
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-md p-3">
            <div className="flex items-start">
              <LightbulbIcon className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-blue-800 mb-1">Next Steps Recommendation</div>
                <div className="text-xs text-blue-700">
                  {overallProgress < 25 ? 
                    "Focus on completing the 'Propose a Product' stage before moving forward." :
                    overallProgress < 50 ? 
                    "Ensure your product has been validated with potential customers before proceeding." :
                    overallProgress < 75 ?
                    "Consider your financial and team needs as you prepare to build your product." :
                    "Finalize your product and prepare for launch and growth."}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (focus.type === 'stage' && focus.stageId === 'viability') {
      // Show viability radar mini-visualization
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium mb-2">Viability Assessment</div>
          
          <div className="h-36 w-full bg-gray-50 rounded-md flex items-center justify-center mb-2">
            <div className="text-xs text-gray-400">Radar visualization</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Market Potential</span>
              <span className="font-medium text-green-600">High</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Financial Viability</span>
              <span className="font-medium text-amber-600">Medium</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Technical Feasibility</span>
              <span className="font-medium text-red-600">Low</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
          >
            <BarChart2 className="h-3 w-3 mr-2" />
            View Full Analysis
          </Button>
        </div>
      );
    }
    
    if (focus.type === 'tool' && focus.toolId === 'dependency_matrix') {
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Critical Dependencies</div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="text-sm font-medium text-amber-800 mb-1">Attention Needed</div>
            <div className="text-xs text-amber-700">
              3 critical dependencies must be resolved before proceeding to the next stage.
            </div>
          </div>
          
          <div className="space-y-2 mt-2">
            <div className="p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium">Customer Validation</div>
              <div className="text-gray-500">Required for: Financial Planning</div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium">Market Research</div>
              <div className="text-gray-500">Required for: Pricing Strategy</div>
            </div>
          </div>
        </div>
      );
    }
    
    // Default insights
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium">Recent Decisions</div>
        
        <div className="space-y-2">
          <div className="p-2 bg-gray-50 rounded-md">
            <div className="text-xs font-medium">Pricing Model Selection</div>
            <div className="text-xs text-gray-500">2 days ago</div>
          </div>
          
          <div className="p-2 bg-gray-50 rounded-md">
            <div className="text-xs font-medium">Target Market Definition</div>
            <div className="text-xs text-gray-500">5 days ago</div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="w-full mt-2">
          <BookOpen className="h-3 w-3 mr-2" />
          Open Decision Journal
        </Button>
      </div>
    );
  };
  
  // Add this new function to get focused resources based on current progress
  const getFocusedResources = () => {
    // Calculate overall progress to determine appropriate resources
    const overallProgress = Object.values(stageProgress).reduce((sum, val) => sum + val, 0) / 
      (Object.values(stageProgress).length || 1);
    
    if (overallProgress < 0.3) {
      // Early stage resources
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Recommended Resources</div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              Problem-Solution Fit Canvas
            </div>
            <div className="text-xs text-gray-600">
              Clearly articulate the problem you're solving and your solution.
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
              Customer Interview Guide
            </div>
            <div className="text-xs text-gray-600">
              Template for effective customer discovery interviews.
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Value Proposition Canvas
            </div>
            <div className="text-xs text-gray-600">
              Define your unique value proposition for target customers.
            </div>
          </div>
        </div>
      );
    } else if (overallProgress < 0.7) {
      // Mid-stage resources
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Recommended Resources</div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              Business Model Canvas
            </div>
            <div className="text-xs text-gray-600">
              Define and validate your complete business model.
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              Financial Projection Template
            </div>
            <div className="text-xs text-gray-600">
              Basic financial model for early-stage startups.
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-red-500" />
              Risk Management Framework
            </div>
            <div className="text-xs text-gray-600">
              Identify and mitigate key business risks.
            </div>
          </div>
        </div>
      );
    } else {
      // Later stage resources
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Recommended Resources</div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
              MVP Development Checklist
            </div>
            <div className="text-xs text-gray-600">
              Key components to include in your minimum viable product.
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-pink-500" />
              Brand Identity Guidelines
            </div>
            <div className="text-xs text-gray-600">
              Template for creating consistent brand identity.
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Launch Strategy Planner
            </div>
            <div className="text-xs text-gray-600">
              Prepare for a successful product launch.
            </div>
          </div>
        </div>
      );
    }
  };
  
  // Resources tab content
  const renderResourcesTab = () => {
    let resourceItems: { title: string; icon: React.ReactNode; description?: string }[] = [];
    
    // Default resources always available
    const defaultResources = [
      { 
        title: "Entrepreneurial Handbook", 
        icon: <BookOpen className="h-4 w-4 text-blue-600" />,
        description: "Essential guide for entrepreneurs"
      },
      { 
        title: "Templates Library", 
        icon: <FileText className="h-4 w-4 text-green-600" />,
        description: "Business plan and pitch deck templates" 
      }
    ];
    
    // Context-specific resources
    if (focus.type === 'stage') {
      switch (focus.stageId) {
        case 'propose':
          resourceItems = [
            { 
              title: "Idea Validation Guide", 
              icon: <FileText className="h-4 w-4 text-blue-600" /> 
            },
            { 
              title: "Customer Discovery Templates", 
              icon: <FileText className="h-4 w-4 text-green-600" /> 
            }
          ];
          break;
        case 'validity':
          resourceItems = [
            { 
              title: "Market Research Toolkit", 
              icon: <FileText className="h-4 w-4 text-blue-600" /> 
            },
            { 
              title: "Customer Interview Guide", 
              icon: <FileText className="h-4 w-4 text-green-600" /> 
            }
          ];
          break;
        case 'viability':
          resourceItems = [
            { 
              title: "Financial Modeling Templates", 
              icon: <FileText className="h-4 w-4 text-blue-600" /> 
            },
            { 
              title: "Unit Economics Calculator", 
              icon: <FileText className="h-4 w-4 text-green-600" /> 
            }
          ];
          break;
        case 'create':
          resourceItems = [
            { 
              title: "MVP Development Guide", 
              icon: <FileText className="h-4 w-4 text-blue-600" /> 
            },
            { 
              title: "Product Roadmap Template", 
              icon: <FileText className="h-4 w-4 text-green-600" /> 
            }
          ];
          break;
      }
    } else if (focus.type === 'tool' && focus.toolId) {
      // Tool-specific resources
      const toolResources: Record<string, any[]> = {
        'venture_viability_radar': [
          { 
            title: "Interpreting Viability Metrics", 
            icon: <FileText className="h-4 w-4 text-blue-600" /> 
          },
          { 
            title: "Industry Benchmarks", 
            icon: <FileText className="h-4 w-4 text-green-600" /> 
          }
        ],
        'go_no_go_framework': [
          { 
            title: "Decision Science Guide", 
            icon: <FileText className="h-4 w-4 text-blue-600" /> 
          },
          { 
            title: "Decision Matrix Template", 
            icon: <FileText className="h-4 w-4 text-green-600" /> 
          }
        ]
      };
      
      resourceItems = toolResources[focus.toolId] || [];
    }
    
    // Combine with defaults
    resourceItems = [...resourceItems, ...defaultResources];
    
    return (
      <div className="space-y-3">
        {resourceItems.map((resource, index) => (
          <div 
            key={index}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center">
              {resource.icon}
              <div className="ml-3">
                <span className="text-sm">{resource.title}</span>
                {resource.description && (
                  <p className="text-xs text-gray-500">{resource.description}</p>
                )}
              </div>
            </div>
            <ArrowUpRight className="h-3 w-3 text-gray-400" />
          </div>
        ))}
      </div>
    );
  };
  
  // AI assistant tab
  const renderAITab = () => {
    const promptIdeas = getContextualPromptIdeas();
    
    return (
      <div className="space-y-4">
        <Textarea
          placeholder="Ask for help or insights about your journey..."
          className="resize-none min-h-[100px] text-sm"
        />
        
        <Button className="w-full">
          <MessageSquare className="h-3 w-3 mr-2" />
          Get AI Assistance
        </Button>
        
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Try asking:</div>
          <div className="space-y-2">
            {promptIdeas.map((prompt, i) => (
              <div 
                key={i}
                className="text-xs p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                {prompt}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Tools tab for relevant tools
  const renderToolsTab = () => {
    // Generate a list of relevant tools based on current focus
    let tools: { id: string; title: string; description: string; progress: number }[] = [];
    
    if (focus.type === 'stage' && focus.stageId) {
      // Map of stage IDs to relevant tools
      const stageTools: Record<string, any[]> = {
        'propose': [
          { 
            id: 'business-model',
            title: 'Business Model Canvas', 
            description: 'Define your business model',
            progress: toolProgress['business-model'] || 0
          },
          { 
            id: 'product-design',
            title: 'Product Design', 
            description: 'Sketch your product concept',
            progress: toolProgress['product-design'] || 0
          }
        ],
        'validity': [
          { 
            id: 'market',
            title: 'Market Research', 
            description: 'Analyze your target market',
            progress: toolProgress['market'] || 0
          },
          { 
            id: 'validation',
            title: 'Customer Validation', 
            description: 'Test with real users',
            progress: toolProgress['validation'] || 0
          },
          { 
            id: 'go_no_go_framework',
            title: 'Go/No-Go Framework', 
            description: 'Make data-driven decisions',
            progress: toolProgress['go_no_go_framework'] || 0
          }
        ],
        'viability': [
          { 
            id: 'financials',
            title: 'Financial Planning', 
            description: 'Create financial projections',
            progress: toolProgress['financials'] || 0
          },
          { 
            id: 'venture_viability_radar',
            title: 'Venture Viability Radar', 
            description: 'Assess business viability',
            progress: toolProgress['venture_viability_radar'] || 0
          },
          { 
            id: 'risk_assessment_dashboard',
            title: 'Risk Assessment', 
            description: 'Identify and manage risks',
            progress: toolProgress['risk_assessment_dashboard'] || 0
          }
        ],
        'create': [
          { 
            id: 'team',
            title: 'Team Structure', 
            description: 'Define roles and hiring plan',
            progress: toolProgress['team'] || 0
          },
          { 
            id: 'brand',
            title: 'Brand Identity', 
            description: 'Develop your brand assets',
            progress: toolProgress['brand'] || 0
          },
          { 
            id: 'dependency_matrix',
            title: 'Dependency Matrix', 
            description: 'Manage project dependencies',
            progress: toolProgress['dependency_matrix'] || 0
          }
        ]
      };
      
      tools = stageTools[focus.stageId] || [];
      
      // Always add decision journal as a tool
      tools.push({
        id: 'decision_journal',
        title: 'Decision Journal',
        description: 'Record and track decisions',
        progress: toolProgress['decision_journal'] || 0
      });
    } else {
      // Overview or tool focus - show a subset of key tools
      tools = [
        { 
          id: 'business-model',
          title: 'Business Model Canvas', 
          description: 'Define your business model',
          progress: toolProgress['business-model'] || 0
        },
        { 
          id: 'venture_viability_radar',
          title: 'Venture Viability Radar', 
          description: 'Assess business viability',
          progress: toolProgress['venture_viability_radar'] || 0
        },
        { 
          id: 'go_no_go_framework',
          title: 'Go/No-Go Framework', 
          description: 'Make data-driven decisions',
          progress: toolProgress['go_no_go_framework'] || 0
        },
        { 
          id: 'decision_journal',
          title: 'Decision Journal',
          description: 'Record and track decisions',
          progress: toolProgress['decision_journal'] || 0
        }
      ];
    }
    
    return (
      <div className="space-y-3">
        {tools.map((tool) => (
          <div 
            key={tool.id}
            className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">{tool.title}</div>
                <div className="text-xs text-gray-500">{tool.description}</div>
              </div>
              <Badge variant={tool.progress > 0 ? "outline" : "secondary"} className="text-xs">
                {tool.progress > 0 ? `${tool.progress}%` : 'New'}
              </Badge>
            </div>
            
            {tool.progress > 0 && (
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${tool.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render appropriate tab content
  const renderTabContent = () => {
    switch (activeCategory) {
      case 'insights':
        return getDecisionInsights();
      case 'resources':
        return getFocusedResources();
      case 'ai':
        return renderAITab();
      case 'tools':
        return renderToolsTab();
      default:
        return getDecisionInsights();
    }
  };
  
  // Get title for the current focus
  const getContextTitle = () => {
    if (focus.type === 'overview') {
      return 'Journey Dashboard';
    }
    
    if (focus.type === 'stage' && focus.stageId) {
      const stageNames: Record<string, string> = {
        'propose': 'Propose a Product',
        'validity': 'Check Validity',
        'viability': 'Check Viability',
        'create': 'Create First Product'
      };
      
      return stageNames[focus.stageId] || 'Stage Overview';
    }
    
    if (focus.type === 'tool' && focus.toolId) {
      return focus.toolId.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    
    return 'Journey Context';
  };
  
  // If collapsed on mobile, show only a small tab to expand
  if (collapsed) {
    return (
      <div className="h-full border-l border-gray-200 bg-white flex flex-col w-12 overflow-hidden shadow-sm">
        <button 
          onClick={() => setCollapsed(false)}
          className="flex flex-col items-center justify-center py-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
        >
          <PanelLeft className="h-5 w-5 text-gray-500" />
          <span className="text-xs text-gray-500 mt-1 rotate-90">Open</span>
        </button>
        
        <div className="flex-1 flex flex-col items-center py-4 space-y-6">
          <button 
            onClick={() => { 
              setCollapsed(false);
              setActiveCategory('insights');
            }}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <BarChart2 className="h-5 w-5 text-gray-500" />
          </button>
          
          <button 
            onClick={() => { 
              setCollapsed(false);
              setActiveCategory('tools');
            }}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LightbulbIcon className="h-5 w-5 text-gray-500" />
          </button>
          
          <button 
            onClick={() => { 
              setCollapsed(false);
              setActiveCategory('resources');
            }}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-gray-500" />
          </button>
          
          <button 
            onClick={() => { 
              setCollapsed(false);
              setActiveCategory('ai');
            }}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Brain className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <button 
          className="p-2 flex justify-center items-center border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <CircleHelp className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col border-l border-gray-200 bg-white w-full md:w-80 lg:w-96 overflow-hidden shadow-sm">
      {/* Header with collapsible button */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold truncate">
          {getContextTitle()}
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Tabs for different widget categories */}
      <div className="p-4 flex-1 overflow-y-auto">
        <Tabs 
          defaultValue="insights" 
          value={activeCategory} 
          onValueChange={(value) => setActiveCategory(value as WidgetCategory)}
          className="space-y-4"
        >
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="insights" className="text-xs">
              <BarChart2 className="h-3 w-3 mr-2" />
              <span className="hidden md:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">
              <LightbulbIcon className="h-3 w-3 mr-2" />
              <span className="hidden md:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs">
              <BookOpen className="h-3 w-3 mr-2" />
              <span className="hidden md:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3 w-3 mr-2" />
              <span className="hidden md:inline">AI Help</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="m-0">
            {renderTabContent()}
          </TabsContent>
          <TabsContent value="tools" className="m-0">
            {renderTabContent()}
          </TabsContent>
          <TabsContent value="resources" className="m-0">
            {renderTabContent()}
          </TabsContent>
          <TabsContent value="ai" className="m-0">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Help button */}
      <div className="p-4 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full">
          <CircleHelp className="h-4 w-4 mr-2" />
          Get Help
        </Button>
      </div>
    </div>
  );
} 