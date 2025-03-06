'use client';

import './Footer.css';
import { 
  TwitterLogo,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  DiscordLogo,
  Heart
} from '@phosphor-icons/react';

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Enterprise', href: '#' },
      { label: 'Security', href: '#' }
    ]
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'API Reference', href: '#' }
    ]
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Partners', href: '#' }
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR', href: '#' },
      { label: 'Accessibility', href: '#' }
    ]
  }
};

const socialLinks = [
  { icon: <TwitterLogo weight="duotone" className="social-icon-svg" />, label: 'Twitter', href: '#' },
  { icon: <FacebookLogo weight="duotone" className="social-icon-svg" />, label: 'Facebook', href: '#' },
  { icon: <InstagramLogo weight="duotone" className="social-icon-svg" />, label: 'Instagram', href: '#' },
  { icon: <LinkedinLogo weight="duotone" className="social-icon-svg" />, label: 'LinkedIn', href: '#' },
  { icon: <DiscordLogo weight="duotone" className="social-icon-svg" />, label: 'Discord', href: '#' }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <div className="logo-hex"></div>
              <div className="logo-inner">K</div>
            </a>
            <a href="#" className="brand-name">Kickoff</a>
            <p className="brand-description">
              Transform your project planning with AI-powered insights and streamlined collaboration.
            </p>
            <div className="social-links">
              {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  className="social-link"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          <nav className="footer-nav">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="footer-nav-section">
                <h4 className="nav-title">{section.title}</h4>
                <ul className="nav-list">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} Kickoff. All rights reserved.
          </div>
          <div className="footer-meta">
            <span>Made with <Heart weight="fill" className="heart-icon" /> for entrepreneurs</span>
            <span className="separator">•</span>
            <span>San Francisco, CA</span>
          </div>
        </div>
      </div>
    </footer>
  );
} 