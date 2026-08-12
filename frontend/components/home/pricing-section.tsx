import { PricingCard } from '@/components/home/pricing-card';

export function PricingSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-muted-foreground">
          Start free, upgrade when you need more
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard
          title="Free"
          price="$0"
          period="/month"
          features={[
            '3 niche validations per month',
            'Basic Reddit analysis (top 50 posts)',
            'Google Trends overview',
            'AI summary (500 words)',
            'View public reports',
          ]}
          buttonText="Start Free"
          buttonHref="/register"
        />
        <PricingCard
          title="Pro"
          price="$29"
          period="/month"
          featured
          features={[
            'Unlimited validations',
            'Deep Reddit analysis (500+ posts)',
            'Advanced Trends data',
            'Full AI reports (2000+ words)',
            'Export to PDF/Markdown',
            'Save unlimited reports',
            'Email alerts for trending niches',
          ]}
          buttonText="Upgrade to Pro"
          buttonHref="/register"
        />
      </div>
    </section>
  );
}
