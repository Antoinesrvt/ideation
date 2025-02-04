export const AI_PROMPTS = {
  analyze: `As a startup advisor, analyze the following content for the {moduleId} module, {stepId} step:

{content}

Consider the following context:
- Industry: {industry}
- Business Model: {businessModel}
- Target Market: {targetMarket}

Provide:
1. Specific suggestions for improvement
2. Completeness check
3. Industry-specific recommendations
4. Consistency with previous modules

Format the response as structured JSON matching the AIAnalysis type.`,

  research: `As a market research expert, provide insights for a {industry} startup focusing on:

Query: {query}
Context: {projectContext}

Include:
1. Recent market trends
2. Competitor analysis
3. Industry-specific metrics
4. Credible sources

Format the response as structured JSON matching the AIResearchData type.`,

  contextual: `Based on the previous responses in {moduleId}:

{previousResponses}

Provide contextual suggestions for {stepId} considering:
1. Consistency with previous answers
2. Industry best practices
3. Common pitfalls to avoid
4. Opportunities for improvement

Format the response as structured JSON matching the AIContextSuggestion type.`
} 