// Journey stages constants
export const JOURNEY_STAGES = [
  {
    id: 'validate-idea',
    title: 'Valider l\'idée',
    description: 'Quel est le marché: concurrents, potentiel, trends, POV users',
    tools: ['market', 'validation'],
    recommendedFirst: 'market',
    color: '#7209B7', // Keep original color for first stage
    dependencies: [], // No dependencies for first stage
    unlocks: ['define-mission'],
    validationCriteria: [
      { id: 'competitor-analysis', name: 'Schéma concurrents défini', threshold: 0.7 },
      { id: 'partner-schema', name: 'Schéma partenaires défini', threshold: 0.6 },
      { id: 'client-needs', name: 'Besoins clients identifiés', threshold: 0.8 },
      { id: 'market-trends', name: 'Trends du marché identifiés', threshold: 0.7 },
      { id: 'personas-defined', name: 'Personas définis', threshold: 0.8 }
    ],
    dataOutputs: [
      { id: 'competitor-schema', name: 'Schéma concurrents' },
      { id: 'partner-schema', name: 'Schéma partenaires' },
      { id: 'client-schema', name: 'Schéma clients (besoins et comment y répondre)' },
      { id: 'market-trends', name: 'Trends du marché' },
      { id: 'personas', name: 'Personas' }
    ]
  },
  {
    id: 'define-mission',
    title: 'Préciser la mission',
    description: 'Définir la mission, les valeurs et la proposition de valeur',
    tools: ['brand', 'business-model'],
    recommendedFirst: 'brand',
    color: '#4361EE', // Keep original color for second stage
    dependencies: ['validate-idea'], // Depends on validate-idea stage
    unlocks: ['validate-product'],
    validationCriteria: [
      { id: 'values-defined', name: 'Valeurs définies', threshold: 0.8 },
      { id: 'mission-articulated', name: 'Mission articulée', threshold: 0.9 },
      { id: 'branding-outlined', name: 'Branding général défini', threshold: 0.6 },
      { id: 'value-proposition', name: 'Proposition de valeur définie', threshold: 0.8 }
    ],
    dataOutputs: [
      { id: 'values', name: 'Valeurs' },
      { id: 'mission', name: 'Mission' },
      { id: 'general-branding', name: 'Branding général' },
      { id: 'value-proposition', name: 'Valeur proposée' }
    ]
  },
  {
    id: 'validate-product',
    title: 'Valider le produit',
    description: 'Définir les fonctionnalités clés et le modèle d\'affaires',
    tools: ['product-design', 'business-model'],
    recommendedFirst: 'product-design',
    color: '#4CC9F0', // Keep original color for third stage
    dependencies: ['define-mission'], // Depends on define-mission stage
    unlocks: ['generate-docs'],
    validationCriteria: [
      { id: 'key-features-defined', name: 'Fonctionnalités clés définies', threshold: 0.8 },
      { id: 'business-model-validated', name: 'Modèle d\'affaires validé', threshold: 0.7 }
    ],
    dataOutputs: [
      { id: 'key-features', name: 'Key features' },
      { id: 'business-model', name: 'Business model' }
    ]
  },
  {
    id: 'generate-docs',
    title: 'Générer guidelines et docs',
    description: 'Créer la documentation, les guidelines, le pitch et la roadmap',
    tools: ['documents', 'financials'],
    recommendedFirst: 'documents',
    color: '#F72585', // Keep original color for fourth stage
    dependencies: ['validate-product'], // Depends on validate-product stage
    unlocks: [],
    validationCriteria: [
      { id: 'financials-created', name: 'Financiers créés', threshold: 0.7 },
      { id: 'branding-guidelines', name: 'Guidelines de marque établis', threshold: 0.8 },
      { id: 'pitch-created', name: 'Pitch deck créé', threshold: 0.7 },
      { id: 'roadmap-defined', name: 'Roadmap définie', threshold: 0.6 }
    ],
    dataOutputs: [
      { id: 'financials', name: 'Financiers' },
      { id: 'branding', name: 'Branding' },
      { id: 'pitch', name: 'Pitch' },
      { id: 'roadmap', name: 'Roadmap' }
    ]
  },
]; 