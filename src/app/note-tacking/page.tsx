"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Shield,
  Brain,
  Zap,
  Network,
  Layers,
  Settings,
  Sparkles,
  Check,
  ChevronRight,
} from "lucide-react";

const ComplexitySlider = () => {
  const [complexity, setComplexity] = useState(1);

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg">
      <div className="flex justify-between mb-6">
        {["Simple", "Organized", "Advanced"].map((label, index) => (
          <button
            key={label}
            onClick={() => setComplexity(index + 1)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              complexity === index + 1
                ? "bg-[#1E0F40] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-[#F8F9FE] rounded-lg p-6">
        {complexity === 1 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#1E0F40]">
              Start Simple
            </h4>
            <p>Just write. No setup needed.</p>
            <div className="h-40 bg-white rounded-lg border border-purple-100 p-4">
              {/* Simple note interface mockup */}
              <div className="h-6 w-3/4 bg-gray-100 rounded mb-3"></div>
              <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
            </div>
          </div>
        )}

        {complexity === 2 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#1E0F40]">
              Add Structure
            </h4>
            <p>Organize with tags, links, and spaces.</p>
            <div className="h-40 bg-white rounded-lg border border-purple-100 p-4">
              {/* Organized interface mockup */}
              <div className="flex gap-2 mb-3">
                <div className="h-6 w-20 bg-[#0ED4FF]/20 rounded"></div>
                <div className="h-6 w-20 bg-[#0ED4FF]/20 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-gray-100 rounded"></div>
            </div>
          </div>
        )}

        {complexity === 3 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#1E0F40]">Power User</h4>
            <p>Advanced workflows and custom systems.</p>
            <div className="h-40 bg-white rounded-lg border border-purple-100 p-4">
              {/* Advanced interface mockup */}
              <div className="grid grid-cols-2 gap-2">
                <div className="h-32 bg-gray-100 rounded"></div>
                <div className="space-y-2">
                  <div className="h-6 w-full bg-[#0ED4FF]/20 rounded"></div>
                  <div className="h-6 w-full bg-[#FFB84D]/20 rounded"></div>
                  <div className="h-6 w-full bg-purple-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function EnhancedLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] relative overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[#1E0F40]"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#0ED4FF]"
            style={{
              width: Math.random() * 300 + 100 + "px",
              height: Math.random() * 300 + 100 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5,
              transform: `translate(-50%, -50%)`,
            }}
          ></div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-purple-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-wider text-[#1E0F40]">
            CYPHER
          </div>
          <div className="flex gap-8 items-center">
            <a
              href="#features"
              className="text-[#1E0F40] hover:text-[#0ED4FF] transition-colors"
            >
              Features
            </a>
            <a
              href="#complexity"
              className="text-[#1E0F40] hover:text-[#0ED4FF] transition-colors"
            >
              Flexibility
            </a>
            <button className="bg-[#1E0F40] text-white px-6 py-2 rounded-lg hover:bg-[#0ED4FF] transition-colors">
              Start Writing
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-6xl font-bold text-[#1E0F40] mb-6 leading-tight tracking-tight">
                Simple by default.
                <span className="bg-gradient-to-r from-[#1E0F40] to-[#0ED4FF] text-transparent bg-clip-text">
                  {" "}
                  Powerful when needed.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform chaos into clarity. Start writing instantly, then
                evolve your system as you grow. Cypher adapts to your way of
                thinking, from quick notes to complex knowledge systems.
              </p>
              <div className="flex gap-4">
                <button className="group bg-[#1E0F40] text-white px-8 py-4 rounded-lg hover:bg-[#0ED4FF] transition-all flex items-center gap-2">
                  Start Writing
                  <ArrowRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </button>
                <button className="border-2 border-[#1E0F40] text-[#1E0F40] px-8 py-4 rounded-lg hover:bg-[#1E0F40] hover:text-white transition-colors">
                  See Examples
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E0F40] to-[#0ED4FF] rounded-2xl transform rotate-2"></div>
              <div className="relative bg-white rounded-xl p-8 transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="h-80 bg-[#F8F9FE] rounded-lg flex items-center justify-center">
                  <Network size={100} className="text-[#1E0F40] opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complexity Section */}
      <section id="complexity" className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1E0F40] mb-4">
            Grows with your needs
          </h2>
          <p className="text-xl text-gray-600">
            From quick notes to complex systems, Cypher adapts to your workflow
          </p>
        </div>
        <ComplexitySlider />
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1E0F40] to-[#2A1B4D] text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Power through simplicity
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Start Instantly",
                description: "No setup required. Just open and start writing.",
              },
              {
                icon: Brain,
                title: "Intelligent Connections",
                description:
                  "Discover insights through automated knowledge linking and visualization.",
              },
              {
                icon: Layers,
                title: "Add Structure",
                description: "Organize naturally with tags, links, and spaces.",
              },
              {
                icon: Settings,
                title: "Custom Systems",
                description:
                  "Build powerful workflows that match your thinking process.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <feature.icon size={32} className="text-[#0ED4FF] mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
                <ChevronRight className="mt-4 text-[#0ED4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1E0F40] mb-12">
            Trusted by innovative teams worldwide
          </h2>
          <div className="grid grid-cols-4 gap-12 items-center opacity-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#1E0F40] mb-6">
            Decode your potential today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands who've found their perfect balance of simplicity and
            power with Cypher.
          </p>
          <button className="bg-[#1E0F40] text-white px-8 py-4 rounded-lg hover:bg-[#0ED4FF] transition-colors font-semibold">
            Start Writing Free
          </button>
        </div>
      </section>
    </div>
  );
}
