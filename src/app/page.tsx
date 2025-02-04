import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/feature-section";
import { CTASection } from "@/components/landing/cta-section";
import { MainNav } from "@/components/landing/main-nav";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
