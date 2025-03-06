'use client';

import './Features.css';
import { 
  Rocket, 
  Brain, 
  ChartBar,
  Robot,
  Database,
  LineSegments
} from '@phosphor-icons/react';

const features = [
  {
    icon: <Rocket weight="duotone" className="feature-icon-svg" />,
    title: 'Project Acceleration',
    description: 'Launch your projects faster with our streamlined workflows and automated setup processes.',
    list: [
      'Automated project scaffolding',
      'Pre-configured templates',
      'Integrated deployment tools',
      'Real-time collaboration',
      'Progress tracking'
    ],
    type: 'default'
  },
  {
    icon: <Brain weight="duotone" className="feature-icon-svg" />,
    title: 'AI Strategy Advisor',
    description: 'Like having a seasoned consultant at your side 24/7, our AI offers personalized guidance exactly when you need it.',
    list: [
      'Industry-specific recommendations',
      'Competitive positioning analysis',
      'Risk identification and mitigation',
      'Opportunity discovery engine',
      'Contextual learning system'
    ],
    type: 'ai'
  },
  {
    icon: <Database weight="duotone" className="feature-icon-svg" />,
    title: 'Evidence-Based Decisions',
    description: 'Replace guesswork with real insights powered by comprehensive market data and predictive analytics.',
    list: [
      'Real-time market intelligence',
      'Predictive financial scenarios',
      'Competitive landscape mapping',
      'Customer segment profiling',
      'Trend analysis and forecasting'
    ],
    type: 'data'
  }
];

export default function Features() {
  return (
    <section className="why-section" id="features">
      <div className="container">
        <div className="section-header reveal-animation">
          <span className="section-badge">Why Kickoff</span>
          <h2 className="section-title">Your Complete Project Command Center</h2>
          <p className="section-description">From initial concept to execution, we unite all the tools you need in one intuitive platform that thinks with you.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card glass-card ${feature.type}-icon reveal-animation`}
            >
              <div className="feature-icon">
                <div className="feature-icon-bg"></div>
                <span>{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-list">
                {feature.list.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 