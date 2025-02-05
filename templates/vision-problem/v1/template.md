# {{projectName}} - Vision & Problem Statement

## Executive Summary
{{{executiveSummary}}}

## Problem Statement
### Core Problem
{{{coreProblem}}}

### Impact Analysis
{{#each impactAreas}}
- **{{area}}**: {{{impact}}}
{{/each}}

### Market Research Highlights
{{#with marketResearch}}
- **Market Size**: {{marketSize}}
- **Affected Users**: {{affectedUsers}}
- **Annual Cost**: {{annualCost}}
{{/with}}

## Problem Validation
{{#each validationPoints}}
### {{method}}
- **Findings**: {{{findings}}}
- **Data Points**: {{dataPoints}}
- **Confidence Level**: {{confidence}}
{{/each}}

## Market Pain Points
{{#each painPoints}}
### {{title}}
{{{description}}}

**Impact Level**: {{impactLevel}}
**Frequency**: {{frequency}}
**Current Solutions**: {{currentSolutions}}
**Gap Analysis**: {{{gapAnalysis}}}
{{/each}}

## Vision Statement
### Long-term Vision
{{{longTermVision}}}

### Short-term Goals
{{#each shortTermGoals}}
1. {{this}}
{{/each}}

## Target Market
{{#with targetMarket}}
### Primary Segment
- **Description**: {{primarySegment}}
- **Size**: {{marketSize}}
- **Growth Rate**: {{growthRate}}
- **Key Demographics**: {{keyDemographics}}

### User Personas
{{#each personas}}
#### {{name}}
- **Age Range**: {{ageRange}}
- **Role**: {{role}}
- **Pain Points**: {{painPoints}}
- **Goals**: {{goals}}
- **Buying Power**: {{buyingPower}}
{{/each}}
{{/with}}

## Solution Overview
### Unique Value Proposition
{{{valueProposition}}}

### Key Differentiators
{{#each differentiators}}
- **{{category}}**: {{{description}}}
{{/each}}

## Market Landscape
### Current Alternatives
{{#each currentAlternatives}}
#### {{name}}
- **Approach**: {{approach}}
- **Limitations**: {{limitations}}
- **Market Share**: {{marketShare}}
- **User Satisfaction**: {{userSatisfaction}}
{{/each}}

## Opportunity Analysis
### Market Opportunity
{{{marketOpportunity}}}

### Competitive Advantage
{{{competitiveAdvantage}}}

### Risk Assessment
{{#each risks}}
- **{{type}}**: {{description}}
  - Impact: {{impact}}
  - Mitigation: {{mitigation}}
{{/each}}

## Key Insights
{{#each keyInsights}}
### {{category}}
{{{description}}}
**Supporting Data**: {{supportingData}}
{{/each}}

## Action Plan
### Immediate Next Steps
{{#each nextSteps}}
1. {{action}}
   - Timeline: {{timeline}}
   - Resources: {{resources}}
   - Expected Outcome: {{outcome}}
{{/each}}

### Success Metrics
{{#each metrics}}
- **{{name}}**: {{description}}
  - Target: {{target}}
  - Measurement Method: {{measurement}}
{{/each}}

---
Generated on {{formatDate generatedAt}}
Project Stage: {{projectStage}}
Version: {{version}} 