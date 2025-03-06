'use client';

import { useState } from 'react';
import './Comparison.css';
import { 
  NotePencil,
  Rocket,
  X,
  Check,
  ArrowRight
} from '@phosphor-icons/react';

const comparisonData = {
  traditional: {
    title: 'Traditional Planning',
    description: 'The old way of project planning',
    items: [
      {
        text: 'Multiple disconnected tools and spreadsheets',
        tooltip: 'Juggling between different apps and platforms'
      },
      {
        text: 'Manual data entry and updates',
        tooltip: 'Time-consuming manual work and prone to errors'
      },
      {
        text: 'Generic templates and frameworks',
        tooltip: 'One-size-fits-all approach that lacks customization'
      },
      {
        text: 'Limited market insights',
        tooltip: 'Relying on outdated or incomplete market data'
      },
      {
        text: 'Time-consuming research',
        tooltip: 'Hours spent gathering and analyzing information'
      },
      {
        text: 'Static financial projections',
        tooltip: 'Inflexible models that quickly become outdated'
      },
      {
        text: 'Isolated decision making',
        tooltip: 'Limited collaboration and siloed thinking'
      }
    ]
  },
  kickoff: {
    title: 'Kickoff Platform',
    description: 'The intelligent way forward',
    items: [
      {
        text: 'All-in-one integrated workspace',
        tooltip: 'Everything you need in one seamless platform'
      },
      {
        text: 'Real-time data synchronization',
        tooltip: 'Always up-to-date information across your project'
      },
      {
        text: 'AI-powered customization',
        tooltip: 'Tailored recommendations and insights for your specific needs'
      },
      {
        text: 'Live market data integration',
        tooltip: 'Real-time market insights and competitive analysis'
      },
      {
        text: 'Automated research & insights',
        tooltip: 'AI-powered research that saves you hours of work'
      },
      {
        text: 'Dynamic financial modeling',
        tooltip: 'Adaptive financial projections that evolve with your business'
      },
      {
        text: 'Data-driven collaboration',
        tooltip: 'Team collaboration enhanced by shared insights'
      }
    ]
  }
};

export default function Comparison() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <section className="comparison-section" id="comparison">
      <div className="container">
        <div className="section-header reveal-animation">
          <span className="section-badge">Why Switch</span>
          <h2 className="section-title">The Smarter Way to Plan</h2>
          <p className="section-description">
            See how Kickoff transforms the traditional project planning experience into a streamlined, intelligent process.
          </p>
        </div>

        <div className="comparison-grid reveal-animation">
          <div className="comparison-card traditional">
            <div className="comparison-header">
              <div className="comparison-icon">
                <NotePencil weight="duotone" className="comparison-icon-svg" />
              </div>
              <div>
                <h3>{comparisonData.traditional.title}</h3>
                <p className="comparison-subtitle">{comparisonData.traditional.description}</p>
              </div>
            </div>
            <ul className="comparison-list">
              {comparisonData.traditional.items.map((item, index) => (
                <li 
                  key={index} 
                  className="comparison-item"
                  onMouseEnter={() => setHoveredItem(`traditional-${index}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="item-icon">
                    <X weight="bold" className="item-icon-svg" />
                  </span>
                  <div className="item-content">
                    <span>{item.text}</span>
                    {hoveredItem === `traditional-${index}` && (
                      <div className="item-tooltip">{item.tooltip}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="comparison-vs">VS</div>

          <div className="comparison-card kickoff">
            <div className="comparison-header">
              <div className="comparison-icon">
                <Rocket weight="duotone" className="comparison-icon-svg" />
              </div>
              <div>
                <h3>{comparisonData.kickoff.title}</h3>
                <p className="comparison-subtitle">{comparisonData.kickoff.description}</p>
              </div>
            </div>
            <ul className="comparison-list">
              {comparisonData.kickoff.items.map((item, index) => (
                <li 
                  key={index} 
                  className="comparison-item"
                  onMouseEnter={() => setHoveredItem(`kickoff-${index}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="item-icon">
                    <Check weight="bold" className="item-icon-svg" />
                  </span>
                  <div className="item-content">
                    <span>{item.text}</span>
                    {hoveredItem === `kickoff-${index}` && (
                      <div className="item-tooltip">{item.tooltip}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="comparison-cta reveal-animation">
          <a href="#cta" className="btn btn-primary btn-lg">
            <span>Get Started Now</span>
            <ArrowRight weight="bold" className="btn-icon" />
          </a>
        </div>
      </div>
    </section>
  );
} 