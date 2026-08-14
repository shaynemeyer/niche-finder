import { Footer } from '@/components/home/footer';
import { HeroSection } from '@/components/home/hero-section';

import { FinalCta } from '@/components/home/final-cta';
import { Navbar } from '@/components/home/navbar';
import { PricingSection } from '@/components/home/pricing-section';
import { FAQ } from '@/components/home/faq';
import { Testimonials } from '@/components/home/testimonials';
import { UseCases } from '@/components/home/use-cases';
import { StatsBar } from '@/components/home/stats-bar';
import { FeaturesSection } from '@/components/home/features-section';
import { HowItWorks } from '@/components/home/how-it-works';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <UseCases />
      <PricingSection />
      <Testimonials />
      <FAQ />
      <FinalCta />
      <Footer />
    </div>
  );
}
