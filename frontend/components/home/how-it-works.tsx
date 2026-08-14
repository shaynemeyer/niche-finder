import { BarChart3, Search, Zap } from 'lucide-react';

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-linear-to-b from-muted to-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900 rounded-full mb-4 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            From Idea to Insight
            <span className="block text-purple-600 dark:text-purple-400">
              in 3 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No research background needed. Enter your idea, let our AI do the
            heavy lifting.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-900 dark:via-purple-900 dark:to-green-900 -translate-y-1/2 mx-16" />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Search,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-600 dark:bg-blue-500',
                title: 'Enter Your Niche Idea',
                description:
                  'Type any niche topic — a product category, service idea, content vertical, or business concept. Be as broad or specific as you want.',
                example:
                  'e.g. "minimalist home office furniture" or "online piano lessons for adults"',
              },
              {
                step: '02',
                icon: Zap,
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-600 dark:bg-purple-500',
                title: 'AI Runs Deep Research',
                description:
                  'Our AI simultaneously analyzes Reddit communities, Google Trends data, market competition, and synthesizes everything into structured intelligence.',
                example: 'Scans 500+ posts · Trends data · Competitor mapping',
              },
              {
                step: '03',
                icon: BarChart3,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-600 dark:bg-green-500',
                title: 'Get Your Full Report',
                description:
                  'Receive a comprehensive validation report with an opportunity score, key insights, strategic recommendations, and actionable next steps.',
                example:
                  'Score: 84/100 · High Opportunity · Ready in ~60 seconds',
              },
            ].map((step, idx) => (
              <div
                key={step.step}
                className="relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-8 text-center"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 ${step.bg} text-white text-sm font-bold rounded-full`}
                  >
                    {idx + 1}
                  </span>
                </div>
                <div
                  className={`w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2`}
                >
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {step.description}
                </p>
                <p
                  className={`text-xs font-medium ${step.color} bg-muted rounded-lg px-3 py-2`}
                >
                  {step.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
