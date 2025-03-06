'use client';

import './CTA.css';
import { 
  Sparkle, 
  Lock, 
  RocketLaunch,
  Users,
  CurrencyCircleDollar,
  ChartLineUp,
  Star
} from '@phosphor-icons/react';

export default function CTA() {
  return (
    <section className="cta-section" id="cta">
      <div className="container">
        <div className="cta-grid reveal-animation">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Project Planning?</h2>
            <p className="cta-description">
              Join thousands of successful entrepreneurs who are building better businesses with Kickoff.
              Start your free trial today and experience the power of AI-driven project planning.
            </p>
            
            <div className="cta-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <Sparkle weight="duotone" className="feature-icon-svg" />
                </div>
                <div className="feature-text">14-day free trial</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Lock weight="duotone" className="feature-icon-svg" />
                </div>
                <div className="feature-text">No credit card required</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <RocketLaunch weight="duotone" className="feature-icon-svg" />
                </div>
                <div className="feature-text">Set up in minutes</div>
              </div>
            </div>

            <div className="cta-actions">
              <a href="#" className="btn btn-primary btn-xl">
                <span>Start Free Trial</span>
                <span className="btn-icon">→</span>
              </a>
              <a href="#" className="btn btn-secondary btn-xl">Schedule Demo</a>
            </div>
          </div>

          <div className="cta-stats">
            <div className="stat-card">
              <div className="stat-value"><Users weight="duotone" className="stat-icon" /> 10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value"><CurrencyCircleDollar weight="duotone" className="stat-icon" /> $127M</div>
              <div className="stat-label">Funding Secured</div>
            </div>
            <div className="stat-card">
              <div className="stat-value"><ChartLineUp weight="duotone" className="stat-icon" /> 94%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value"><Star weight="duotone" className="stat-icon" /> 4.9/5</div>
              <div className="stat-label">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </section>
  );
} 