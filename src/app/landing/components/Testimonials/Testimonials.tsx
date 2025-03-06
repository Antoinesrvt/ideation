'use client';

import { useState } from 'react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    quote: "Kickoff transformed how we approach project planning. The AI insights helped us identify opportunities we would have missed otherwise.",
    author: "Sarah Chen",
    role: "Founder & CEO",
    company: "TechVision Inc.",
    image: "/api/placeholder/64/64",
    stats: {
      metric: "40%",
      label: "Faster Time to Market"
    }
  },
  {
    id: 2,
    quote: "The financial modeling capabilities are incredible. We saved weeks of work and got better insights than our previous manual process.",
    author: "Marcus Rodriguez",
    role: "CFO",
    company: "Growth Ventures",
    image: "/api/placeholder/64/64",
    stats: {
      metric: "$2.5M",
      label: "Funding Secured"
    }
  },
  {
    id: 3,
    quote: "Having an AI consultant available 24/7 made all the difference. It's like having a seasoned advisor always ready to help.",
    author: "Emily Watson",
    role: "Product Director",
    company: "Innovation Labs",
    image: "/api/placeholder/64/64",
    stats: {
      metric: "90%",
      label: "Decision Confidence"
    }
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-header reveal-animation">
          <span className="section-badge">Success Stories</span>
          <h2 className="section-title">From Our Community</h2>
          <p className="section-description">
            See how entrepreneurs and business leaders are achieving their goals with Kickoff.
          </p>
        </div>

        <div className="testimonials-container reveal-animation">
          <button 
            className="testimonial-nav prev" 
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            ←
          </button>

          <div className="testimonials-content">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`testimonial-card ${index === activeIndex ? 'active' : ''}`}
                style={{ 
                  transform: `translateX(${(index - activeIndex) * 100}%)`,
                  opacity: index === activeIndex ? 1 : 0
                }}
              >
                <div className="testimonial-quote">"{testimonial.quote}"</div>
                
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="author-image" 
                  />
                  <div className="author-info">
                    <div className="author-name">{testimonial.author}</div>
                    <div className="author-role">{testimonial.role}</div>
                    <div className="author-company">{testimonial.company}</div>
                  </div>
                </div>

                <div className="testimonial-stats">
                  <div className="stat-value">{testimonial.stats.metric}</div>
                  <div className="stat-label">{testimonial.stats.label}</div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="testimonial-nav next" 
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>

        <div className="testimonial-indicators">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 