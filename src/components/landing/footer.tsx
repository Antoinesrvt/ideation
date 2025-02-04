"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Documentation", href: "/docs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Community", href: "/community" },
    { label: "Help Center", href: "/help" },
    { label: "Partners", href: "/partners" },
    { label: "Status", href: "/status" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Rocket className="h-6 w-6" />
              <span className="font-bold text-xl">StartupLaunch</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Empowering entrepreneurs to validate and launch successful
              startups with AI-powered insights and expert guidance.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h3 className="font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-8 text-center text-muted-foreground">
          <p>
            © {new Date().getFullYear()} StartupLaunch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
