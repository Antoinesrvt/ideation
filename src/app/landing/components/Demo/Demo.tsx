'use client';

import { useState } from 'react';
import './Demo.css';

const demoFeatures = [
  {
    id: 'canvas',
    title: 'Business Model Canvas',
    description: 'Interactive canvas with AI suggestions and real-time collaboration.',
    image: '/api/placeholder/800/500',
    color: 'primary'
  },
  {
    id: 'market',
    title: 'Market Analysis',
    description: 'Real-time market data and competitor insights at your fingertips.',
    image: '/api/placeholder/800/500',
    color: 'secondary'
  },
  {
    id: 'financial',
    title: 'Financial Modeling',
    description: 'Dynamic financial projections that adapt to your inputs.',
    image: '/api/placeholder/800/500',
    color: 'accent'
  }
];

export default function Demo() {
  const [activeFeature, setActiveFeature] = useState(demoFeatures[0].id);

  return (
    <section className="demo-section" id="demo">
      <div className="container">
        <div className="section-header reveal-animation">
          <span className="section-badge">Platform Demo</span>
          <h2 className="section-title">See Kickoff in Action</h2>
          <p className="section-description">
            Experience how our intelligent platform streamlines your project planning process.
          </p>
        </div>

        <div className="demo-container reveal-animation">
          <div className="demo-tabs">
            {demoFeatures.map((feature) => (
              <button
                key={feature.id}
                className={`demo-tab ${activeFeature === feature.id ? 'active' : ''} ${feature.color}`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </button>
            ))}
          </div>

          <div className="demo-preview">
            <div className="demo-frame">
              <div className="demo-frame-header">
                <div className="frame-dots">
                  <div className="frame-dot"></div>
                  <div className="frame-dot"></div>
                  <div className="frame-dot"></div>
                </div>
              </div>
              <div className="demo-frame-content">
                {demoFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`demo-screen ${activeFeature === feature.id ? 'active' : ''}`}
                  >
                    <img src={feature.image} alt={feature.title} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="demo-cta reveal-animation">
          <a href="#cta" className="btn btn-primary btn-lg">
            <span>Start Free Trial</span>
            <span className="btn-icon">→</span>
          </a>
          <a href="#" className="btn btn-secondary btn-lg">
            <span>Schedule Demo</span>
          </a>
        </div>
      </div>
    </section>
  );
} 