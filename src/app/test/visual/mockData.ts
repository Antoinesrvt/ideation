// Types for the Concentric Circles Dashboard

// Possible validation statuses
export type ValidationStatus =
  | "validated"
  | "invalidated"
  | "in-progress"
  | "untested";

// Represents a segment within a circle
export interface SegmentData {
  id: string;
  name: string;
  validationStatus: ValidationStatus;
  description?: string; // Optional detailed description
  hypothesisStatement?: string; // Optional hypothesis being tested
  validationMethod?: string; // Optional method used to validate
  evidence?: Array<{
    id: string;
    type: "interview" | "survey" | "test" | "metric" | "research";
    summary: string;
    date: string;
    impact: "supporting" | "contradicting" | "neutral";
  }>;
}

// Represents a single concentric circle
export interface CircleData {
  id: string;
  name: string;
  radius: number;
  color: string;
  segments: SegmentData[];
}

// Represents a connection between segments
export interface ConnectionData {
  id: string;
  from: string; // Segment ID
  to: string; // Segment ID
  validationStatus: ValidationStatus;
  relationshipType?: "supports" | "tests" | "depends-on" | "influences";
  notes?: string;
}

// The complete data structure
export interface ConcentricCirclesData {
  circles: CircleData[];
  connections: ConnectionData[];
}

// Sample data for the dashboard
export const sampleDashboardData: ConcentricCirclesData = {
  circles: [
    {
      id: "core",
      name: "Core Value Proposition",
      radius: 60,
      color: "#4299E1", // Blue
      segments: [
        {
          id: "core-1",
          name: "Problem Statement",
          validationStatus: "validated",
          description:
            "Small businesses struggle with validating business ideas before investing heavily",
          hypothesisStatement:
            "Small business owners need a visual framework to validate their business models",
          validationMethod: "Customer interviews and surveys",
          evidence: [
            {
              id: "ev-1",
              type: "interview",
              summary:
                "8/10 entrepreneurs expressed difficulty in validating ideas visually",
              date: "2024-12-15",
              impact: "supporting",
            },
          ],
        },
        {
          id: "core-2",
          name: "Solution Concept",
          validationStatus: "in-progress",
          description:
            "Visual framework for validating business hypotheses through connected elements",
          hypothesisStatement:
            "A visual representation helps entrepreneurs see connections between elements",
          validationMethod: "Prototype testing with early users",
          evidence: [
            {
              id: "ev-2",
              type: "test",
              summary: "Early prototype testing shows positive engagement",
              date: "2025-01-10",
              impact: "supporting",
            },
          ],
        },
        {
          id: "core-3",
          name: "Unique Value",
          validationStatus: "untested",
          description:
            "Connections between business elements are visually explicit",
          hypothesisStatement:
            "Visual connections between business elements provide unique insights",
          validationMethod: "Competitive analysis and user testing",
        },
      ],
    },
    {
      id: "product",
      name: "Product Features",
      radius: 110,
      color: "#48BB78", // Green
      segments: [
        {
          id: "feature-1",
          name: "Concentric Visualization",
          validationStatus: "validated",
          description:
            "Core visualization showing relationships between business elements",
          hypothesisStatement:
            "Users can understand the concentric circles model without extensive training",
          validationMethod: "Usability testing",
        },
        {
          id: "feature-2",
          name: "Validation Tracking",
          validationStatus: "invalidated",
          description: "System for tracking validation status of hypotheses",
          hypothesisStatement:
            "The initial tracking interface is intuitive for users",
          validationMethod: "User testing with prototype",
          evidence: [
            {
              id: "ev-3",
              type: "test",
              summary:
                "Users found the tracking interface confusing in its current form",
              date: "2025-01-20",
              impact: "contradicting",
            },
          ],
        },
        {
          id: "feature-3",
          name: "Connection Mapping",
          validationStatus: "in-progress",
          description: "Visual connections between related business elements",
          hypothesisStatement:
            "Users find value in seeing connections between business elements",
          validationMethod: "Prototype feedback sessions",
        },
        {
          id: "feature-4",
          name: "Templates Library",
          validationStatus: "untested",
          description: "Pre-built templates for common business models",
          hypothesisStatement:
            "Templates will accelerate user onboarding and initial setup",
          validationMethod: "A/B testing with and without templates",
        },
      ],
    },
    {
      id: "market",
      name: "Market & Customers",
      radius: 160,
      color: "#38B2AC", // Teal
      segments: [
        {
          id: "market-1",
          name: "Early Entrepreneurs",
          validationStatus: "validated",
          description: "First-time founders in idea validation stage",
          hypothesisStatement:
            "Early-stage entrepreneurs need this tool more than established businesses",
          validationMethod: "Market segmentation analysis",
        },
        {
          id: "market-2",
          name: "Market Size",
          validationStatus: "in-progress",
          description: "Total addressable market of early-stage entrepreneurs",
          hypothesisStatement:
            "The TAM is sufficient to support a sustainable business",
          validationMethod: "Market research and analysis",
        },
        {
          id: "market-3",
          name: "Competition",
          validationStatus: "untested",
          description:
            "Alternative business validation tools and methodologies",
          hypothesisStatement:
            "Current solutions lack visual validation capabilities",
          validationMethod: "Competitive analysis",
        },
        {
          id: "market-4",
          name: "Distribution Channels",
          validationStatus: "untested",
          description: "How we'll reach our target customers",
          hypothesisStatement:
            "Entrepreneur communities and accelerators are effective channels",
          validationMethod: "Channel testing and partner outreach",
        },
        {
          id: "market-5",
          name: "Pricing Strategy",
          validationStatus: "invalidated",
          description: "Initial one-time purchase model",
          hypothesisStatement:
            "Users will pay a one-time fee rather than subscription",
          validationMethod: "Pricing survey and willingness-to-pay analysis",
          evidence: [
            {
              id: "ev-4",
              type: "survey",
              summary:
                "70% of respondents preferred subscription over one-time purchase",
              date: "2025-02-05",
              impact: "contradicting",
            },
          ],
        },
      ],
    },
    {
      id: "business",
      name: "Business Model",
      radius: 210,
      color: "#3182CE", // Darker Blue
      segments: [
        {
          id: "business-1",
          name: "Revenue Streams",
          validationStatus: "in-progress",
          description: "How the business will generate revenue",
          hypothesisStatement:
            "Freemium model with subscription for advanced features will drive revenue",
          validationMethod: "Financial modeling and user surveys",
        },
        {
          id: "business-2",
          name: "Cost Structure",
          validationStatus: "untested",
          description: "Primary costs associated with running the business",
          hypothesisStatement:
            "Development and customer acquisition are the main cost drivers",
          validationMethod: "Cost analysis and projections",
        },
        {
          id: "business-3",
          name: "Key Partners",
          validationStatus: "untested",
          description: "Strategic partners for growth and distribution",
          hypothesisStatement:
            "Startup accelerators will be valuable distribution partners",
          validationMethod: "Partner outreach and discussions",
        },
        {
          id: "business-4",
          name: "Key Resources",
          validationStatus: "untested",
          description: "Critical resources needed for success",
          hypothesisStatement:
            "Development talent is the most critical resource",
          validationMethod: "Resource assessment and planning",
        },
        {
          id: "business-5",
          name: "Key Activities",
          validationStatus: "untested",
          description: "Most important things the business must do",
          hypothesisStatement:
            "User education is a critical activity for adoption",
          validationMethod: "Activity impact assessment",
        },
        {
          id: "business-6",
          name: "Success Metrics",
          validationStatus: "untested",
          description: "How we'll measure business success",
          hypothesisStatement:
            "User engagement with the validation process is the key metric",
          validationMethod: "Key performance indicator analysis",
        },
      ],
    },
  ],
  connections: [
    {
      id: "conn-1",
      from: "core-1",
      to: "feature-1",
      validationStatus: "validated",
      relationshipType: "supports",
      notes: "The problem directly informs the need for the visualization",
    },
    {
      id: "conn-2",
      from: "core-2",
      to: "feature-3",
      validationStatus: "in-progress",
      relationshipType: "tests",
      notes: "Connection mapping tests whether the solution concept works",
    },
    {
      id: "conn-3",
      from: "feature-1",
      to: "market-1",
      validationStatus: "validated",
      relationshipType: "supports",
      notes: "Feature validated with target market segment",
    },
    {
      id: "conn-4",
      from: "market-1",
      to: "business-1",
      validationStatus: "in-progress",
      relationshipType: "influences",
      notes: "Target market influences revenue model",
    },
    {
      id: "conn-5",
      from: "feature-2",
      to: "market-5",
      validationStatus: "invalidated",
      relationshipType: "depends-on",
      notes: "Pricing strategy depends on validation tracking feature",
    },
    {
      id: "conn-6",
      from: "core-3",
      to: "market-3",
      validationStatus: "untested",
      relationshipType: "influences",
      notes: "Unique value helps differentiate from competition",
    },
    {
      id: "conn-7",
      from: "feature-4",
      to: "business-3",
      validationStatus: "untested",
      relationshipType: "depends-on",
      notes: "Templates library may benefit from partner contributions",
    },
  ],
};

// Export a function to get all segment IDs for easier lookup
export const getAllSegmentIds = (data: ConcentricCirclesData): string[] => {
  return data.circles.flatMap((circle) =>
    circle.segments.map((segment) => segment.id)
  );
};

// Export a function to find a segment by ID
export const findSegmentById = (
  id: string,
  data: ConcentricCirclesData
): { segment: SegmentData; circle: CircleData } | null => {
  for (const circle of data.circles) {
    const segment = circle.segments.find((s) => s.id === id);
    if (segment) {
      return { segment, circle };
    }
  }
  return null;
};

// Export a function to find connections related to a segment
export const findConnectionsForSegment = (
  segmentId: string,
  data: ConcentricCirclesData
): ConnectionData[] => {
  return data.connections.filter(
    (conn) => conn.from === segmentId || conn.to === segmentId
  );
};

export default sampleDashboardData;
