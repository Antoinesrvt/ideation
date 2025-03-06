'use client';

import { useEffect } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import FeaturedBy from './components/FeaturedBy/FeaturedBy';
import Features from './components/Features/Features';
import Comparison from './components/Comparison/Comparison';
import HowItWorks from './components/HowItWorks/HowItWorks';
import Demo from './components/Demo/Demo';
import Testimonials from './components/Testimonials/Testimonials';
import Pricing from './components/Pricing/Pricing';
import CTA from './components/CTA/CTA';
import Footer from './components/Footer/Footer';

import './styles/global.css';
import './styles/variables.css';
import './styles/animations.css';

export default function LandingPage() {
  useEffect(() => {
    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal-animation');
    
    const checkReveal = () => {
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
          element.classList.add('active');
        }
      });
    };
    
    // Initial check
    checkReveal();
    
    // Check on scroll
    window.addEventListener('scroll', checkReveal);
    
    return () => {
      window.removeEventListener('scroll', checkReveal);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Floating Elements - Moved to top level as in original HTML */}
      <div className="floating-elements">
        <div className="floating-element float-1"></div>
        <div className="floating-element float-2"></div>
        <div className="floating-element float-3"></div>
      </div>

      <Header />
      <main>
        <Hero />
        <FeaturedBy />
        <Features />
        <Comparison />
        <HowItWorks />
        <Demo />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
} 