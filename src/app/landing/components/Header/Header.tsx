'use client';

import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <header className={isScrolled ? 'scrolled' : ''}>
        <div className="container header-container">
          <div className="logo-container">
            <a href="#" className="logo">
              <div className="logo-hex"></div>
              <div className="logo-inner">K</div>
            </a>
            <a href="#" className="brand-name">Kickoff</a>
          </div>
          
          <nav>
            <ul className="nav-links">
              <li><a href="#features" className="nav-link">Features</a></li>
              <li><a href="#how-it-works" className="nav-link">How It Works</a></li>
              <li><a href="#demo" className="nav-link">Demo</a></li>
              <li><a href="#pricing" className="nav-link">Pricing</a></li>
            </ul>
          </nav>
          
          <div className="header-actions">
            <a href="#" className="header-action-link">Login</a>
            <a href="#cta" className="btn btn-primary">Start Free Trial</a>
          </div>
          
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav-links">
          <li><a href="#features" className="mobile-nav-link" onClick={closeMobileMenu}>Features</a></li>
          <li><a href="#how-it-works" className="mobile-nav-link" onClick={closeMobileMenu}>How It Works</a></li>
          <li><a href="#demo" className="mobile-nav-link" onClick={closeMobileMenu}>Demo</a></li>
          <li><a href="#pricing" className="mobile-nav-link" onClick={closeMobileMenu}>Pricing</a></li>
        </ul>
        
        <div className="mobile-header-actions">
          <a href="#" className="btn btn-secondary" onClick={closeMobileMenu}>Login</a>
          <a href="#cta" className="btn btn-primary" onClick={closeMobileMenu}>Start Free Trial</a>
        </div>
      </div>
    </>
  );
} 