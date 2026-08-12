import { FileText, Search, Sparkles, TrendingUp } from 'lucide-react';

import { FeatureCard } from '@/components/home/feature-card';

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Everything You Need to Validate Your Idea
        </h2>
        <p className="text-xl text-muted-foreground">
          Comprehensive market research in minutes, not weeks
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
          title="Reddit Analysis"
          description="Deep dive into community discussions, pain points, and user sentiment across relevant subreddits."
        />
        <FeatureCard
          icon={<TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />}
          title="Google Trends"
          description="Track search volume, growth trends, and seasonal patterns to understand market demand."
        />
        <FeatureCard
          icon={<Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
          title="AI Insights"
          description="Get comprehensive market analysis, opportunity assessments, and strategic recommendations."
        />
        <FeatureCard
          icon={<FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />}
          title="Full Reports"
          description="Competition analysis, monetization ideas, and go-to-market strategies all in one place."
        />
      </div>
    </section>
  );
}
