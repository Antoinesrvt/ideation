export const BUDGET_CATEGORIES = {
  RECETTES: {
    IMPOTS_MENAGES: {
      title: "Impôts des ménages",
      items: ["tvaRate", "irRate"],
      icon: "👨‍👩‍👧‍👦",
      descriptions: {
        tvaRate:
          "La TVA représente près de 50% des recettes fiscales. Le taux normal est de 20%, avec des taux réduits à 5.5% et 10%. Une variation d'un point de TVA représente environ 7 milliards d'euros de recettes.",
        irRate:
          "L'Impôt sur le Revenu suit un barème progressif avec des taux de 0% à 45%. Le taux moyen effectif est d'environ 14%. Il représente environ 15% des recettes fiscales et génère plus de 80 milliards d'euros par an.",
      },
    },
    IMPOTS_ENTREPRISES: {
      title: "Impôts des entreprises",
      items: ["isRate", "isEntreprises"],
      icon: "🏢",
      descriptions: {
        isRate:
          "Les cotisations sociales (patronales et salariales) financent la protection sociale. Le taux moyen est d'environ 27.5% du PIB. Une variation d'un point représente environ 10 milliards d'euros.",
        isEntreprises:
          "L'Impôt sur les Sociétés a un taux normal de 25% depuis 2022, avec des taux réduits pour les PME. Il génère environ 65 milliards d'euros par an et fluctue avec les cycles économiques.",
      },
    },
    AUTRES_RECETTES: {
      title: "Autres recettes",
      items: ["ticpe", "droitsSuccession", "autresRecettes"],
      icon: "💶",
      descriptions: {
        ticpe:
          "La TICPE rapporte environ 17.5 milliards d'euros par an. Son rendement dépend de la consommation de carburants et des politiques environnementales.",
        droitsSuccession:
          "Les droits de succession et donation rapportent environ 12.5 milliards d'euros par an. Les taux varient de 5% à 45% selon le lien de parenté et le montant.",
        autresRecettes:
          "Comprend les revenus du domaine de l'État, les amendes, les dividendes des entreprises publiques et diverses taxes spécifiques, pour environ 45 milliards d'euros.",
      },
    },
  },
  DEPENSES: {
    PROTECTION_SOCIALE: {
      title: "Protection sociale",
      items: ["retraites", "sante"],
      icon: "🏥",
      descriptions: {
        retraites:
          "Premier poste de dépenses publiques avec 327 milliards d'euros. Inclut les retraites de base, complémentaires et les minima sociaux pour les seniors. Le vieillissement démographique augmente ce poste de 2-3% par an.",
        sante:
          "230 milliards d'euros couvrant l'assurance maladie, les hôpitaux publics, la prévention et les soins de ville. La crise Covid a augmenté structurellement ces dépenses.",
      },
    },
    EDUCATION_RECHERCHE: {
      title: "Éducation et Recherche",
      items: ["education", "recherche"],
      icon: "🎓",
      descriptions: {
        education:
          "110 milliards d'euros pour l'enseignement primaire, secondaire et supérieur. Premier employeur public avec plus d'un million d'agents.",
        recherche:
          "28 milliards d'euros incluant les organismes de recherche (CNRS, INSERM...), le crédit impôt recherche et le soutien à l'innovation.",
      },
    },
    SECURITE_JUSTICE: {
      title: "Sécurité et Justice",
      items: ["defense", "securite", "justice"],
      icon: "⚖️",
      descriptions: {
        defense:
          "50 milliards d'euros en 2024, en augmentation pour atteindre 2% du PIB. Couvre les opérations, l'équipement et la modernisation des armées.",
        securite:
          "45 milliards d'euros pour la police nationale, la gendarmerie, les pompiers et la sécurité civile. En hausse constante depuis 2015.",
        justice:
          "12 milliards d'euros pour les tribunaux, prisons et aide juridictionnelle. Budget en forte augmentation pour résorber les délais.",
      },
    },
    SERVICES_PUBLICS: {
      title: "Services publics",
      items: ["services", "interetsDette"],
      icon: "🏛️",
      descriptions: {
        services:
          "60 milliards d'euros pour le fonctionnement des administrations centrales et territoriales. Inclut la masse salariale et les moyens de fonctionnement.",
        interetsDette:
          "51 milliards d'euros en 2024 pour les intérêts de la dette. Très sensible aux variations des taux d'intérêt. La dette totale dépasse 3000 milliards.",
      },
    },
    DEVELOPPEMENT_DURABLE: {
      title: "Développement durable",
      items: ["culture", "ecologie"],
      icon: "🌱",
      descriptions: {
        culture:
          "15 milliards d'euros pour le patrimoine, la création artistique, l'audiovisuel public et l'accès à la culture. Complété par les collectivités locales.",
        ecologie:
          "25 milliards d'euros pour la transition écologique, incluant les aides à la rénovation, les énergies renouvelables et la biodiversité. En forte croissance.",
      },
    },
  },
};

export const PARAM_CONFIG = {
  // Recettes
  tvaRate: { min: 5, max: 30, step: 0.5, label: "TVA", defaultValue: 20 },
  irRate: {
    min: 5,
    max: 25,
    step: 0.5,
    label: "Impôt sur le revenu",
    defaultValue: 14,
  },
  isRate: {
    min: 15,
    max: 40,
    step: 0.5,
    label: "Impôts sociaux",
    defaultValue: 27.5,
  },
  isEntreprises: {
    min: 15,
    max: 40,
    step: 0.5,
    label: "Impôt sur les sociétés",
    defaultValue: 25,
  },
  ticpe: { min: 10, max: 30, step: 0.5, label: "TICPE", defaultValue: 17.5 },
  droitsSuccession: {
    min: 5,
    max: 25,
    step: 0.5,
    label: "Droits de succession",
    defaultValue: 12.5,
  },
  autresRecettes: {
    min: 20,
    max: 70,
    step: 1,
    label: "Autres recettes",
    defaultValue: 45,
  },

  // Dépenses
  retraites: {
    min: 200,
    max: 400,
    step: 1,
    label: "Retraites",
    defaultValue: 327,
  },
  sante: { min: 150, max: 300, step: 1, label: "Santé", defaultValue: 230 },
  education: {
    min: 80,
    max: 150,
    step: 1,
    label: "Éducation",
    defaultValue: 110,
  },
  defense: { min: 30, max: 100, step: 1, label: "Défense", defaultValue: 50 },
  services: {
    min: 40,
    max: 100,
    step: 1,
    label: "Services publics",
    defaultValue: 60,
  },
  interetsDette: {
    min: 30,
    max: 80,
    step: 1,
    label: "Intérêts de la dette",
    defaultValue: 51,
  },
  securite: { min: 30, max: 70, step: 1, label: "Sécurité", defaultValue: 45 },
  recherche: {
    min: 20,
    max: 50,
    step: 1,
    label: "Recherche",
    defaultValue: 28,
  },
  justice: { min: 8, max: 25, step: 1, label: "Justice", defaultValue: 12 },
  culture: { min: 10, max: 30, step: 1, label: "Culture", defaultValue: 15 },
  ecologie: {
    min: 15,
    max: 50,
    step: 1,
    label: "Transition écologique",
    defaultValue: 25,
  },
};

// Nouvelles constantes pour les calculs
export const ECONOMIC_CONSTANTS = {
  PIB: 2500, // PIB en milliards d'euros
  CONSUMPTION_RATIO: 0.5, // Part de la consommation dans le PIB
  WAGE_RATIO: 0.7, // Part de la masse salariale dans le PIB
  CORPORATE_PROFIT_RATIO: 0.3, // Part des bénéfices des entreprises dans le PIB
};

// Données historiques pour comparaison
export const HISTORICAL_DATA = {
  "2023": {
    recettes: {
      total: 585,
      breakdown: {
        tva: 185,
        ir: 90,
        is: 65,
        ticpe: 17.5,
        droitsSuccession: 12.5,
        autres: 45,
      },
    },
    depenses: {
      total: 953,
      breakdown: {
        retraites: 327,
        sante: 230,
        education: 110,
        defense: 50,
        services: 60,
        interetsDette: 51,
        securite: 45,
        recherche: 28,
        justice: 12,
        culture: 15,
        ecologie: 25,
      },
    },
    deficit: -368,
    dette: 3088,
  },
};
