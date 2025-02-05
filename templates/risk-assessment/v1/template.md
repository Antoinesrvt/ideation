# {{projectName}} - Risk Assessment

## Executive Summary
{{{executiveSummary}}}

## Risk Overview
### Risk Profile Summary
{{#with riskProfile}}
- **Overall Risk Level**: {{overallLevel}}
- **Critical Risks**: {{criticalCount}}
- **High Risks**: {{highCount}}
- **Medium Risks**: {{mediumCount}}
- **Low Risks**: {{lowCount}}
{{/with}}

### Risk Categories
{{#each riskCategories}}
#### {{category}}
- **Risk Level**: {{level}}
- **Impact Areas**: {{impactAreas}}
- **Key Concerns**: {{keyConcerns}}
{{/each}}

## Market Risks
{{#each marketRisks}}
### {{name}}
#### Risk Analysis
- **Description**: {{{description}}}
- **Probability**: {{probability}}
- **Impact**: {{impact}}
- **Risk Score**: {{riskScore}}

#### Current Status
- **Trend**: {{trend}}
- **Early Warning Indicators**: {{indicators}}
- **Current Controls**: {{controls}}

#### Mitigation Strategy
- **Prevention**: {{prevention}}
- **Response Plan**: {{response}}
- **Recovery Plan**: {{recovery}}

#### Monitoring
- **Metrics**: {{metrics}}
- **Frequency**: {{frequency}}
- **Responsible Party**: {{responsible}}
{{/each}}

## Technical Risks
{{#each technicalRisks}}
### {{name}}
#### Risk Analysis
- **Description**: {{{description}}}
- **Probability**: {{probability}}
- **Impact**: {{impact}}
- **Risk Score**: {{riskScore}}

#### Technical Details
- **Affected Systems**: {{systems}}
- **Dependencies**: {{dependencies}}
- **Technical Debt**: {{technicalDebt}}

#### Mitigation Strategy
- **Technical Solutions**: {{solutions}}
- **Fallback Options**: {{fallback}}
- **Testing Requirements**: {{testing}}

#### Monitoring
- **Metrics**: {{metrics}}
- **Alerts**: {{alerts}}
- **Response Time**: {{responseTime}}
{{/each}}

## Operational Risks
{{#each operationalRisks}}
### {{name}}
#### Risk Analysis
- **Description**: {{{description}}}
- **Probability**: {{probability}}
- **Impact**: {{impact}}
- **Risk Score**: {{riskScore}}

#### Operational Impact
- **Affected Processes**: {{processes}}
- **Resource Impact**: {{resourceImpact}}
- **Efficiency Impact**: {{efficiencyImpact}}

#### Mitigation Strategy
- **Process Changes**: {{processChanges}}
- **Resource Planning**: {{resourcePlanning}}
- **Training Needs**: {{training}}

#### Monitoring
- **KPIs**: {{kpis}}
- **Review Frequency**: {{reviewFrequency}}
- **Reporting**: {{reporting}}
{{/each}}

## Financial Risks
{{#each financialRisks}}
### {{name}}
#### Risk Analysis
- **Description**: {{{description}}}
- **Probability**: {{probability}}
- **Impact**: {{impact}}
- **Risk Score**: {{riskScore}}

#### Financial Impact
- **Potential Loss**: {{potentialLoss}}
- **Impact Timeline**: {{timeline}}
- **Recovery Cost**: {{recoveryCost}}

#### Mitigation Strategy
- **Financial Controls**: {{controls}}
- **Insurance Coverage**: {{insurance}}
- **Contingency Fund**: {{contingency}}

#### Monitoring
- **Financial Metrics**: {{metrics}}
- **Audit Requirements**: {{audit}}
- **Reporting Frequency**: {{reporting}}
{{/each}}

## Legal & Compliance Risks
{{#each legalRisks}}
### {{name}}
#### Risk Analysis
- **Description**: {{{description}}}
- **Probability**: {{probability}}
- **Impact**: {{impact}}
- **Risk Score**: {{riskScore}}

#### Legal Implications
- **Regulatory Requirements**: {{requirements}}
- **Potential Penalties**: {{penalties}}
- **Compliance Gaps**: {{gaps}}

#### Mitigation Strategy
- **Compliance Measures**: {{measures}}
- **Legal Counsel**: {{counsel}}
- **Documentation**: {{documentation}}

#### Monitoring
- **Compliance Checks**: {{checks}}
- **Audit Schedule**: {{auditSchedule}}
- **Reporting Requirements**: {{reporting}}
{{/each}}

## Strategic Risks
{{#each strategicRisks}}
### {{name}}
#### Risk Analysis
- **Description**: {{{description}}}
- **Probability**: {{probability}}
- **Impact**: {{impact}}
- **Risk Score**: {{riskScore}}

#### Strategic Impact
- **Business Objectives**: {{objectives}}
- **Market Position**: {{marketPosition}}
- **Competitive Advantage**: {{competitiveAdvantage}}

#### Mitigation Strategy
- **Strategic Adjustments**: {{adjustments}}
- **Alternative Strategies**: {{alternatives}}
- **Timeline**: {{timeline}}

#### Monitoring
- **Strategic Metrics**: {{metrics}}
- **Review Process**: {{review}}
- **Stakeholder Communication**: {{communication}}
{{/each}}

## Risk Dependencies
{{#each riskDependencies}}
### {{primary}} → {{dependent}}
- **Relationship**: {{relationship}}
- **Cascade Effect**: {{cascadeEffect}}
- **Combined Impact**: {{combinedImpact}}
- **Joint Mitigation**: {{jointMitigation}}
{{/each}}

## Contingency Plans
{{#each contingencyPlans}}
### {{scenario}}
#### Trigger Conditions
- **Primary Triggers**: {{primaryTriggers}}
- **Secondary Indicators**: {{secondaryIndicators}}
- **Activation Threshold**: {{threshold}}

#### Response Plan
- **Immediate Actions**: {{immediateActions}}
- **Communication Plan**: {{communication}}
- **Resource Requirements**: {{resources}}

#### Recovery Steps
- **Recovery Process**: {{process}}
- **Timeline**: {{timeline}}
- **Success Criteria**: {{criteria}}
{{/each}}

## Risk Management Process
### Monitoring & Review
{{#with monitoringProcess}}
- **Review Frequency**: {{frequency}}
- **Responsible Parties**: {{responsible}}
- **Reporting Structure**: {{reporting}}
- **Escalation Path**: {{escalation}}
{{/with}}

### Risk Assessment Updates
{{#with assessmentUpdates}}
- **Update Triggers**: {{triggers}}
- **Review Process**: {{process}}
- **Documentation**: {{documentation}}
- **Stakeholder Communication**: {{communication}}
{{/with}}

## Appendix
### Risk Assessment Methodology
{{#with methodology}}
- **Risk Scoring**: {{scoring}}
- **Probability Scale**: {{probabilityScale}}
- **Impact Scale**: {{impactScale}}
- **Risk Matrix**: {{riskMatrix}}
{{/with}}

### Historical Risk Data
{{#each historicalData}}
#### {{period}}
- **Risk Profile**: {{profile}}
- **Major Incidents**: {{incidents}}
- **Lessons Learned**: {{lessons}}
{{/each}}

---
Generated on {{formatDate generatedAt}}
Version: {{version}}
Last Review: {{lastReview}}
Next Review: {{nextReview}} 