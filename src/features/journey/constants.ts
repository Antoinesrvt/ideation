// Journey stages constants
export const JOURNEY_STAGES = [
  {
    id: 'propose',
    title: 'Propose a Product',
    description: 'Define your initial idea and value proposition',
    tools: ['business-model', 'product-design'],
    recommendedFirst: 'business-model',
    color: '#7209B7',
    dependencies: [], // No dependencies for first stage
    unlocks: ['validity'],
    validationCriteria: [
      { id: 'problem-defined', name: 'Problem clearly defined', threshold: 0.7 },
      { id: 'solution-articulated', name: 'Solution articulated', threshold: 0.6 },
      { id: 'value-proposition', name: 'Value proposition defined', threshold: 0.8 }
    ]
  },
  {
    id: 'validity',
    title: 'Check Validity',
    description: 'Validate your idea with market and user research',
    tools: ['market', 'validation'],
    recommendedFirst: 'market',
    color: '#4361EE',
    dependencies: ['propose'], // Depends on propose stage
    unlocks: ['viability'],
    validationCriteria: [
      { id: 'market-size', name: 'Sufficient market size', threshold: 0.7 },
      { id: 'customer-interviews', name: 'Customer interviews conducted', threshold: 0.8 },
      { id: 'problem-validated', name: 'Problem validated with users', threshold: 0.9 }
    ]
  },
  {
    id: 'viability',
    title: 'Check Viability',
    description: 'Plan your business strategy and financials',
    tools: ['financials', 'team'],
    recommendedFirst: 'financials',
    color: '#4CC9F0',
    dependencies: ['validity'], // Depends on validity stage
    unlocks: ['create'],
    validationCriteria: [
      { id: 'business-model', name: 'Viable business model', threshold: 0.7 },
      { id: 'unit-economics', name: 'Positive unit economics', threshold: 0.6 },
      { id: 'resource-plan', name: 'Resource plan in place', threshold: 0.5 }
    ]
  },
  {
    id: 'create',
    title: 'Create First Product',
    description: 'Develop your MVP and brand identity',
    tools: ['brand', 'documents'],
    recommendedFirst: 'brand',
    color: '#F72585',
    dependencies: ['viability'], // Depends on viability stage
    unlocks: [],
    validationCriteria: [
      { id: 'mvp-defined', name: 'MVP scope defined', threshold: 0.8 },
      { id: 'brand-identity', name: 'Brand identity established', threshold: 0.6 },
      { id: 'dev-plan', name: 'Development plan in place', threshold: 0.7 }
    ]
  },
]; 