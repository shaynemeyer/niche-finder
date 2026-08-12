import { Footer } from '@/components/home/footer';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { Navbar } from '@/components/home/navbar';
import { PricingSection } from '@/components/home/pricing-section';

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
