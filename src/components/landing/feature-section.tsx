"use client";

import { motion } from "framer-motion";
import { Lightbulb, Target, Rocket, Users } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Idea Validation",
    description:
      "AI-powered analysis to validate your startup idea against market trends and potential.",
  },
  {
    icon: Target,
    title: "Market Research",
    description:
      "Deep insights into your target market, competitors, and industry dynamics.",
  },
  {
    icon: Users,
    title: "Customer Discovery",
    description:
      "Tools and frameworks to identify and validate your target customer segments.",
  },
  {
    icon: Rocket,
    title: "Launch Strategy",
    description:
      "Step-by-step guidance to transform your validated idea into a successful launch.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to Validate Your Startup
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform combines AI-powered insights with proven methodologies
            to help you validate and launch your startup idea.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-lg p-6 shadow-lg"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
