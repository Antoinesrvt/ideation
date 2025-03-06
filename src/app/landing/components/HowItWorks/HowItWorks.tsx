'use client';

import './HowItWorks.css';
import { 
  Target,
  ChartBar,
  ArrowsClockwise,
  RocketLaunch
} from '@phosphor-icons/react';

const steps = [
  {
    number: '01',
    icon: <Target weight="duotone" className="step-icon-svg" />,
    title: 'Define Your Vision',
    description: 'Start with your core idea and let our AI help you refine it into a clear, actionable vision.',
    features: [
      'Business model canvas',
      'Market opportunity analysis',
      'Vision statement generator'
    ]
  },
  {
    number: '02',
    icon: <ChartBar weight="duotone" className="step-icon-svg" />,
    title: 'Analyze & Plan',
    description: 'Leverage real-time data and AI insights to develop a comprehensive strategy and execution plan.',
    features: [
      'Competitive analysis',
      'Financial modeling',
      'Risk assessment'
    ]
  },
  {
    number: '03',
    icon: <ArrowsClockwise weight="duotone" className="step-icon-svg" />,
    title: 'Validate & Iterate',
    description: 'Test your assumptions and refine your approach with our validation tools and market feedback.',
    features: [
      'Hypothesis testing',
      'Customer feedback tools',
      'Pivot recommendations'
    ]
  },
  {
    number: '04',
    icon: <RocketLaunch weight="duotone" className="step-icon-svg" />,
    title: 'Launch & Scale',
    description: 'Execute your plan with confidence, tracking progress and adapting to new opportunities.',
    features: [
      'Project timeline',
      'Resource allocation',
      'Growth tracking'
    ]
  }
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header reveal-animation">
          <span className="section-badge">The Process</span>
          <h2 className="section-title">How Kickoff Works</h2>
          <p className="section-description">
            Our structured approach combines AI-powered insights with proven methodologies to take you from idea to execution.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card reveal-animation">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-icon">
                  <span>{step.icon}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <ul className="step-features">
                  {step.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>{feature}</li>
                  ))}
                </ul>
              </div>
              {index < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        <div className="how-it-works-cta reveal-animation">
          <a href="#demo" className="btn btn-primary btn-lg">
            <span>See It In Action</span>
            <span className="btn-icon">→</span>
          </a>
        </div>
      </div>
    </section>
  );
} 