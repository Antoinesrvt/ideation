import { Project, ProjectDetails, Document, GRPModel, MarketAnalysis, UserFlow } from '@/types';

/**
 * Mock data for development
 */
export const mockData = {
  projects: [
    {
      id: '1',
      name: 'My Startup Project',
      lastEdited: new Date().toISOString(),
      completion: 42
    }
  ] as Project[],
  
  projectDetails: {
    id: '1',
    name: 'My Startup Project',
    lastEdited: new Date().toISOString(),
    completion: 42,
    canvas: {
      keyPartners: [],
      keyActivities: [{ id: '1', text: 'Product Development', checked: true }],
      valuePropositions: [
        { id: '1', text: 'All-in-one ideation platform', checked: true },
        { id: '2', text: 'Time-saving document generation', checked: true }
      ],
      customerSegments: [{ id: '1', text: 'Early-stage founders', checked: true }],
      channels: [],
      costStructure: [],
      revenueStreams: [{ id: '1', text: 'Subscription model - $29/mo', checked: true }]
    },
    grpModel: {
      generation: {
        porteurs: [
          { id: 'g1-1', title: 'John Smith - CEO & Founder', description: 'Product vision, business strategy, fundraising' },
          { id: 'g1-2', title: 'Sarah Johnson - CTO', description: 'Technical development, product architecture' }
        ],
        propositionValeur: [
          { id: 'g2-1', title: 'All-in-one ideation platform', description: 'Simplifies startup planning process from idea to execution' },
          { id: 'g2-2', title: 'Time-saving document generation', description: 'Automatically creates professional documents from user inputs' }
        ],
        fabricationValeur: [
          { id: 'g3-1', title: 'Cloud-based SaaS platform', description: 'Developed with React and Node.js, hosted on AWS' },
          { id: 'g3-2', title: 'AI-assisted document generation', description: 'Uses AI APIs to generate business documents' }
        ]
      },
      remuneration: {
        sourcesRevenus: [
          { id: 'r1-1', title: 'Subscription model', description: '$29/mo individual, $99/mo team', percentage: 75 },
          { id: 'r1-2', title: 'Enterprise licenses', description: '$499/mo for organizations', percentage: 20 },
          { id: 'r1-3', title: 'Template marketplace', description: 'Premium templates $5-49 each', percentage: 5 }
        ],
        volumeRevenus: [],
        performance: []
      },
      partage: {
        partiesPrenantes: [
          { id: 'p1-1', title: 'Startup Entrepreneurs', description: 'Primary users who benefit from easier business planning' },
          { id: 'p1-2', title: 'Incubators & Accelerators', description: 'Partners who provide the tool to their portfolio companies' }
        ],
        conventions: [],
        ecosysteme: []
      }
    } as GRPModel,
    marketAnalysis: {
      customerInsights: {
        personas: [
          {
            id: 'persona1',
            name: 'Founder Fiona',
            role: 'Tech Entrepreneur',
            demographics: '30-45 years old, urban, bachelor\'s or master\'s degree',
            painPoints: ['Time constraints', 'Limited resources', 'Difficulty organizing ideas'],
            goals: ['Launch MVP quickly', 'Secure funding', 'Build scalable business']
          }
        ],
        interviews: [
          {
            id: 'interview1',
            name: 'Sarah',
            company: 'TechLaunch',
            date: '2025-02-25T12:00:00Z',
            sentiment: 'positive',
            notes: 'Sarah validated our document generation feature as a major time-saver for her team.'
          }
        ]
      },
      competitors: [
        {
          id: 'comp1',
          name: 'FounderSuite',
          strengths: ['Strong financial tools'],
          weaknesses: ['No user flow design'],
          price: '$39/mo'
        },
        {
          id: 'comp2',
          name: 'Strategyzer',
          strengths: ['Excellent canvas tools'],
          weaknesses: ['Limited document gen'],
          price: '$25/mo'
        }
      ],
      trends: [
        {
          id: 'trend1',
          name: 'AI-Powered Startup Tools',
          direction: 'upward',
          type: 'opportunity',
          description: 'Growing demand for AI-assisted business planning and document generation among early-stage startups.',
          tags: ['AI', 'Automation']
        }
      ]
    } as MarketAnalysis,
    userFlow: {
      wireframes: [
        {
          id: 'wire1',
          name: 'Landing Page',
          createdAt: '2025-02-27T12:00:00Z'
        },
        {
          id: 'wire2',
          name: 'Canvas Editor',
          createdAt: '2025-02-27T14:00:00Z'
        }
      ],
      features: [
        {
          id: 'feat1',
          name: 'Business Model Canvas Editor',
          description: 'Interactive canvas with save/load functionality',
          priority: 'must',
          status: 'completed',
          tags: ['Core']
        },
        {
          id: 'feat2',
          name: 'Basic Document Generation',
          description: 'Simple pitch deck and business plan export',
          priority: 'must',
          status: 'in-progress',
          tags: ['Core']
        },
        {
          id: 'feat3',
          name: 'Competitor Analysis Tools',
          description: 'Comprehensive market research features',
          priority: 'should',
          status: 'planned',
          tags: ['V1']
        }
      ],
      journey: {
        stages: [
          {
            id: 'stage1',
            name: 'Discovery',
            description: 'User discovers tool',
            actions: ['Visits landing page', 'Reads features', 'Views pricing'],
            painPoints: [
              { issue: 'Too many options', solution: 'Simplify landing page' }
            ],
            completed: true
          },
          {
            id: 'stage2',
            name: 'Onboarding',
            description: 'Creates account',
            actions: ['Signs up', 'Completes profile', 'Views tutorial'],
            painPoints: [],
            completed: true
          },
          {
            id: 'stage3',
            name: 'Creation',
            description: 'Builds first canvas',
            actions: ['Opens Business Model Canvas', 'Inputs initial business idea', 'Saves progress'],
            painPoints: [
              { issue: 'Not sure what to include', solution: 'Add tooltips and examples' }
            ],
            completed: true
          }
        ]
      }
    } as UserFlow,
    documents: [
      {
        id: 'doc1',
        name: 'Business Plan - Draft 1',
        type: 'business-plan',
        url: 'https://example.com/document.pdf',
        createdAt: '2025-02-25T10:00:00Z'
      }
    ]
  } as ProjectDetails,
  
  documents: [] as Document[]
};