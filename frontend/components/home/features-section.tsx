import {
  AlertTriangle,
  Brain,
  DollarSign,
  FileText,
  Globe,
  Lightbulb,
  MessageSquare,
  Target,
  TrendingUp,
} from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-full mb-4 uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Everything to Validate
            <span className="block text-blue-600 dark:text-blue-400">
              Your Market Idea
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Eight powerful research modules that give you a complete picture of
            any niche market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: MessageSquare,
              color: 'text-orange-500 dark:text-orange-400',
              bg: 'bg-orange-50 dark:bg-orange-950/60',
              border: 'border-orange-100 dark:border-orange-900',
              title: 'Reddit Community Analysis',
              description:
                'Deep dive into 500+ posts and comments across relevant subreddits. Discover real user pain points, sentiment trends, and unmet demands directly from your target audience.',
              tags: ['Pain Points', 'Sentiment', 'Demand Signals'],
            },
            {
              icon: TrendingUp,
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-50 dark:bg-blue-950/60',
              border: 'border-blue-100 dark:border-blue-900',
              title: 'Google Trends Intelligence',
              description:
                'Track 12-month search volume trends, seasonal patterns, regional interest, and rising related queries to understand if your niche is growing or dying.',
              tags: ['Growth Trends', 'Seasonal Data', 'Regional Interest'],
            },
            {
              icon: Brain,
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-50 dark:bg-purple-950/60',
              border: 'border-purple-100 dark:border-purple-900',
              title: 'AI Market Analysis',
              description:
                'Claude AI synthesizes all data to generate 2000+ word strategic reports with opportunity scoring, risk assessment, and tailored recommendations for your specific niche.',
              tags: ['Opportunity Score', 'Risk Analysis', 'Strategy'],
            },
            {
              icon: Target,
              color: 'text-red-500 dark:text-red-400',
              bg: 'bg-red-50 dark:bg-red-950/60',
              border: 'border-red-100 dark:border-red-900',
              title: 'Competition Intelligence',
              description:
                "Understand the competitive landscape — who the key players are, what's missing in the market, and where you can carve out a defensible position.",
              tags: ['Market Gaps', 'Competitor Map', 'Positioning'],
            },
            {
              icon: DollarSign,
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-950/60',
              border: 'border-green-100 dark:border-green-900',
              title: 'Monetization Strategies',
              description:
                "Get AI-generated monetization blueprints: product ideas, pricing models, affiliate opportunities, and service packages tailored to your niche's audience.",
              tags: ['Revenue Models', 'Pricing', 'Products'],
            },
            {
              icon: Globe,
              color: 'text-cyan-600 dark:text-cyan-400',
              bg: 'bg-cyan-50 dark:bg-cyan-950/60',
              border: 'border-cyan-100 dark:border-cyan-900',
              title: 'Go-To-Market Playbook',
              description:
                'Receive a step-by-step market entry strategy including content angles, distribution channels, audience targeting, and early traction tactics.',
              tags: ['Launch Plan', 'Channels', 'Audience'],
            },
            {
              icon: AlertTriangle,
              color: 'text-yellow-600 dark:text-yellow-400',
              bg: 'bg-yellow-50 dark:bg-yellow-950/60',
              border: 'border-yellow-100 dark:border-yellow-900',
              title: 'Risk Assessment',
              description:
                'Identify potential pitfalls before you invest — market saturation, seasonal drops, regulatory concerns, and low monetization ceiling all flagged upfront.',
              tags: ['Saturation Risk', 'Seasonality', 'Pitfalls'],
            },
            {
              icon: Lightbulb,
              color: 'text-pink-600 dark:text-pink-400',
              bg: 'bg-pink-50 dark:bg-pink-950/60',
              border: 'border-pink-100 dark:border-pink-900',
              title: 'Content & SEO Insights',
              description:
                'Discover high-intent topics, trending questions, and content gaps your audience is actively searching for but not finding answers to.',
              tags: ['Content Ideas', 'SEO Gaps', 'Trending Topics'],
            },
            {
              icon: FileText,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-950/60',
              border: 'border-indigo-100 dark:border-indigo-900',
              title: 'Exportable Full Reports',
              description:
                'Every report is saved to your dashboard. Export as PDF or Markdown, share with your team, or reference anytime as your business evolves.',
              tags: ['PDF Export', 'Markdown', 'History'],
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`bg-card rounded-xl border ${feature.border} p-6 hover:shadow-lg transition-shadow group`}
            >
              <div
                className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 ${feature.bg} ${feature.color} font-medium rounded-full`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
