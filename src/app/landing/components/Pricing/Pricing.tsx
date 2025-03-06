'use client';

import { useState } from 'react';
import './Pricing.css';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for solo entrepreneurs and small projects',
    price: {
      monthly: 29,
      annual: 24
    },
    features: [
      'Business Model Canvas',
      'Basic Market Analysis',
      'Financial Projections',
      'AI Assistant (Limited)',
      '1 Team Member',
      '2 Active Projects',
      'Email Support'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Professional',
    description: 'Ideal for growing businesses and teams',
    price: {
      monthly: 79,
      annual: 69
    },
    features: [
      'Everything in Starter, plus:',
      'Advanced Market Intelligence',
      'Custom Financial Models',
      'Unlimited AI Assistance',
      '5 Team Members',
      '10 Active Projects',
      'Priority Support'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    description: 'For organizations requiring maximum power',
    price: {
      monthly: 199,
      annual: 169
    },
    features: [
      'Everything in Professional, plus:',
      'Custom Integrations',
      'Advanced Analytics',
      'Dedicated AI Training',
      'Unlimited Team Members',
      'Unlimited Projects',
      'Dedicated Support'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="section-header reveal-animation">
          <span className="section-badge">Pricing</span>
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-description">
            Start free and scale as you grow. All plans come with a 14-day trial.
          </p>
        </div>

        <div className="pricing-toggle reveal-animation">
          <span className={!isAnnual ? 'active' : ''}>Monthly</span>
          <button 
            className={`toggle-switch ${isAnnual ? 'annual' : 'monthly'}`}
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label="Toggle pricing period"
          >
            <span className="toggle-slider" />
          </button>
          <span className={isAnnual ? 'active' : ''}>
            Annual
            <span className="save-badge">Save 20%</span>
          </span>
        </div>

        <div className="pricing-grid reveal-animation">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">
                  {isAnnual ? plan.price.annual : plan.price.monthly}
                </span>
                <span className="period">
                  /month
                  {isAnnual && <span className="billed-annually">billed annually</span>}
                </span>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a 
                href="#cta" 
                className={`btn btn-lg ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="pricing-guarantee reveal-animation">
          <div className="guarantee-icon">🛡️</div>
          <div className="guarantee-content">
            <h4>14-Day Money-Back Guarantee</h4>
            <p>Try Kickoff risk-free. If you're not satisfied, get a full refund within the first 14 days.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 