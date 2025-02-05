# {{projectName}} - Business Model Canvas

## Executive Summary
{{{executiveSummary}}}

## Value Proposition
### Core Value
{{{coreValue}}}

### Key Benefits
{{#each benefits}}
- **{{title}}**: {{{description}}}
  - Value Created: {{valueCreated}}
  - Differentiation: {{differentiation}}
{{/each}}

### Problem-Solution Fit
{{#each problemSolutions}}
- **Problem**: {{problem}}
  - Solution: {{{solution}}}
  - Value Delivered: {{valueDelivered}}
{{/each}}

## Customer Segments
{{#each customerSegments}}
### {{name}}
#### Profile
- **Description**: {{{profile}}}
- **Size**: {{size}}
- **Growth Potential**: {{growthPotential}}

#### Needs Analysis
- **Pain Points**: {{painPoints}}
- **Gains Sought**: {{gains}}
- **Current Alternatives**: {{alternatives}}

#### Value Received
- **Primary Benefits**: {{primaryBenefits}}
- **Secondary Benefits**: {{secondaryBenefits}}
- **Cost-Benefit Ratio**: {{costBenefitRatio}}

#### Acquisition Strategy
- **Channels**: {{channels}}
- **Cost of Acquisition**: {{acquisitionCost}}
- **Lifetime Value**: {{ltv}}
{{/each}}

## Revenue Streams
{{#each revenueStreams}}
### {{name}}
#### Model Details
- **Type**: {{type}}
- **Pricing Model**: {{pricingModel}}
- **Payment Structure**: {{paymentStructure}}

#### Financial Metrics
- **Revenue Potential**: {{revenuePotential}}
- **Profit Margin**: {{profitMargin}}
- **Growth Rate**: {{growthRate}}

#### Optimization
- **Pricing Strategy**: {{pricingStrategy}}
- **Scalability**: {{scalability}}
- **Revenue Drivers**: {{revenueDrivers}}
{{/each}}

## Channels
{{#each channels}}
### {{type}}
#### Overview
- **Description**: {{{description}}}
- **Channel Type**: {{channelType}}
- **Reach**: {{reach}}

#### Economics
- **Cost Structure**: {{costStructure}}
- **Revenue Share**: {{revenueShare}}
- **Efficiency Metrics**: {{efficiency}}

#### Customer Journey
- **Touch Points**: {{touchPoints}}
- **Conversion Rate**: {{conversionRate}}
- **Customer Experience**: {{customerExperience}}

#### Integration
- **Systems Required**: {{systems}}
- **Partner Requirements**: {{partnerRequirements}}
- **Implementation Timeline**: {{timeline}}
{{/each}}

## Customer Relationships
{{#each customerRelationships}}
### {{type}}
#### Strategy
- **Description**: {{{description}}}
- **Relationship Type**: {{relationshipType}}
- **Engagement Level**: {{engagementLevel}}

#### Metrics
- **Acquisition Cost**: {{acquisitionCost}}
- **Retention Rate**: {{retentionRate}}
- **Customer Satisfaction**: {{satisfaction}}

#### Management
- **Retention Strategy**: {{retentionStrategy}}
- **Support Model**: {{supportModel}}
- **Feedback Loop**: {{feedbackLoop}}

#### Development
- **Growth Strategy**: {{growthStrategy}}
- **Loyalty Program**: {{loyaltyProgram}}
- **Upsell Opportunities**: {{upsellOpportunities}}
{{/each}}

## Key Resources
{{#each keyResources}}
### {{category}}
#### Resources
{{#each items}}
- **{{name}}**
  - Description: {{description}}
  - Type: {{type}}
  - Criticality: {{criticality}}
  - Cost: {{cost}}
  - Scalability: {{scalability}}
{{/each}}

#### Management
- **Acquisition Strategy**: {{acquisitionStrategy}}
- **Maintenance Plan**: {{maintenancePlan}}
- **Risk Mitigation**: {{riskMitigation}}
{{/each}}

## Key Activities
{{#each keyActivities}}
### {{name}}
#### Overview
- **Description**: {{{description}}}
- **Importance**: {{importance}}
- **Frequency**: {{frequency}}

#### Requirements
- **Resources**: {{requiredResources}}
- **Skills**: {{requiredSkills}}
- **Technology**: {{requiredTechnology}}

#### Performance
- **Success Metrics**: {{successMetrics}}
- **Quality Standards**: {{qualityStandards}}
- **Monitoring**: {{monitoring}}

#### Optimization
- **Efficiency Measures**: {{efficiency}}
- **Automation Potential**: {{automation}}
- **Improvement Areas**: {{improvements}}
{{/each}}

## Key Partnerships
{{#each partnerships}}
### {{name}}
#### Partnership Details
- **Type**: {{type}}
- **Strategic Importance**: {{strategicImportance}}
- **Duration**: {{duration}}

#### Value Exchange
- **Value Provided**: {{valueProvided}}
- **Value Received**: {{valueReceived}}
- **Resource Sharing**: {{resourceSharing}}

#### Management
- **Governance Model**: {{governance}}
- **Communication Plan**: {{communication}}
- **Performance Metrics**: {{metrics}}

#### Risk Management
- **Dependencies**: {{dependencies}}
- **Risk Factors**: {{riskFactors}}
- **Mitigation Plan**: {{mitigation}}
{{/each}}

## Cost Structure
{{#with costStructure}}
### Fixed Costs
{{#each fixedCosts}}
#### {{name}}
- **Amount**: {{amount}}
- **Frequency**: {{frequency}}
- **Scalability**: {{scalability}}
{{/each}}

### Variable Costs
{{#each variableCosts}}
#### {{name}}
- **Base Amount**: {{amount}}
- **Scaling Factor**: {{scalingFactor}}
- **Cost Drivers**: {{costDrivers}}
{{/each}}

### Economies of Scale
{{#each economiesOfScale}}
- **{{type}}**: {{{description}}}
  - Impact: {{impact}}
  - Timeline: {{timeline}}
{{/each}}

### Cost Optimization
- **Current Initiatives**: {{currentInitiatives}}
- **Potential Savings**: {{potentialSavings}}
- **Implementation Plan**: {{implementationPlan}}
{{/with}}

## Competitive Advantages
{{#each competitiveAdvantages}}
### {{title}}
#### Advantage Details
- **Description**: {{{description}}}
- **Type**: {{type}}
- **Strength**: {{strength}}

#### Sustainability
- **Duration**: {{duration}}
- **Defense Strategy**: {{defenseStrategy}}
- **Required Investment**: {{investment}}

#### Market Impact
- **Customer Value**: {{customerValue}}
- **Market Position**: {{marketPosition}}
- **Competitor Response**: {{competitorResponse}}
{{/each}}

## Scalability & Growth
### Growth Strategy
{{{growthStrategy}}}

### Scaling Plans
{{#each scalingPlans}}
#### {{phase}}
- **Timeline**: {{timeline}}
- **Requirements**: {{requirements}}
- **Expected Outcomes**: {{outcomes}}
{{/each}}

### Resource Requirements
{{#each resourceRequirements}}
- **{{category}}**: {{requirements}}
  - Current: {{current}}
  - Target: {{target}}
  - Gap: {{gap}}
{{/each}}

## Key Metrics
{{#each keyMetrics}}
### {{name}}
#### Metric Details
- **Description**: {{description}}
- **Category**: {{category}}
- **Frequency**: {{frequency}}

#### Targets
- **Current**: {{current}}
- **Target**: {{target}}
- **Timeline**: {{timeline}}

#### Measurement
- **Method**: {{measurement}}
- **Data Sources**: {{dataSources}}
- **Reporting**: {{reporting}}
{{/each}}

---
Generated on {{formatDate generatedAt}}
Business Model Version: {{version}}
Last Updated: {{lastUpdated}} 