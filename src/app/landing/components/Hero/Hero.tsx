'use client';

import { useEffect, useState } from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content reveal-animation">
            <div className="hero-badge"><span>🚀</span> AI-Powered Project Planning Suite</div>
            <h1 className="hero-headline">Transform Ideas into Successful Ventures</h1>
            <p className="hero-subheadline">Stop using scattered tools. Kickoff brings everything together—from business models to financial projections—in one intelligent workspace that guides you to success.</p>
            <div className="hero-cta">
              <a href="#cta" className="btn btn-primary btn-lg btn-ripple">
                <span>Start Free Trial</span>
                <span className="btn-icon">→</span>
              </a>
              <a href="#demo" className="btn btn-secondary btn-lg">
                <span>See It In Action</span>
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">94%</span>
                <span className="stat-label">Faster Planning</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Businesses Launched</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">$127M</span>
                <span className="stat-label">Funding Secured</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-container reveal-animation">
            <div className="hero-app-frame">
              <div className="hero-app-header">
                <div className="app-dots">
                  <div className="app-dot app-dot-red"></div>
                  <div className="app-dot app-dot-yellow"></div>
                  <div className="app-dot app-dot-green"></div>
                </div>
              </div>
              <div className="hero-app-content">
                <img src="/api/placeholder/800/500" alt="Kickoff Platform Dashboard" className="hero-app-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 