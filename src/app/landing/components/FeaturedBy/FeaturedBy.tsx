'use client';

import './FeaturedBy.css';

export default function FeaturedBy() {
  return (
    <section className="featured-by">
      <div className="container">
        <h5 className="featured-title">Trusted By Industry Leaders</h5>
        <div className="logos-container">
          <img src="/api/placeholder/100/40" alt="TechCrunch" className="logo-item" />
          <img src="/api/placeholder/100/40" alt="Forbes" className="logo-item" />
          <img src="/api/placeholder/100/40" alt="Entrepreneur" className="logo-item" />
          <img src="/api/placeholder/100/40" alt="Inc Magazine" className="logo-item" />
          <img src="/api/placeholder/100/40" alt="Startup Daily" className="logo-item" />
        </div>
      </div>
    </section>
  );
} 