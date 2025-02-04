"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Validate Your Startup Idea with{" "}
            <span className="text-primary">AI-Powered Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your business concept into a validated startup using our
            intelligent platform. Get real-time feedback, market insights, and
            expert guidance.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/onboarding")}
              className="group"
            >
              Start Validating
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]" />
      </div>
    </section>
  );
}
