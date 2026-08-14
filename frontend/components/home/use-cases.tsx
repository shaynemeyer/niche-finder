import {
  Brain,
  FileText,
  Globe,
  Lightbulb,
  TrendingUp,
  Users,
} from 'lucide-react';

export function UseCases() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60 border border-green-100 dark:border-green-900 rounded-full mb-4 uppercase tracking-wider">
            Who It&apos;s For
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Built for Every
            <span className="block text-green-600 dark:text-green-400">
              Idea Maker
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: 'Entrepreneurs & Founders',
              description:
                'Validate your startup idea before spending months building. Know your market, competition, and potential revenue before writing a single line of code.',
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-50 dark:bg-blue-950/60',
            },
            {
              icon: FileText,
              title: 'Content Creators & Bloggers',
              description:
                'Find profitable content niches with growing audiences and strong monetization potential before investing time in creating a content library.',
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-50 dark:bg-purple-950/60',
            },
            {
              icon: Globe,
              title: 'E-commerce Sellers',
              description:
                'Research product niches, understand buyer psychology from Reddit, and identify gaps before choosing what to sell on Amazon, Shopify, or Etsy.',
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-950/60',
            },
            {
              icon: Brain,
              title: 'Agency & Consultants',
              description:
                'Deliver faster, data-backed market research to your clients. Generate professional niche reports in minutes instead of spending days on manual research.',
              color: 'text-orange-500 dark:text-orange-400',
              bg: 'bg-orange-50 dark:bg-orange-950/60',
            },
            {
              icon: TrendingUp,
              title: 'Investors & Analysts',
              description:
                'Quickly assess the market potential of an industry vertical or emerging niche. Get clear signal on demand, competition, and growth trajectory.',
              color: 'text-pink-600 dark:text-pink-400',
              bg: 'bg-pink-50 dark:bg-pink-950/60',
            },
            {
              icon: Lightbulb,
              title: 'Side Project Builders',
              description:
                "Don't waste your limited free time on ideas with no market. Validate your side project in 60 seconds and invest your energy only where it counts.",
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-950/60',
            },
          ].map((useCase) => (
            <div
              key={useCase.title}
              className="flex gap-4 p-6 bg-card border border-border rounded-xl hover:border-muted-foreground/30 hover:shadow-md transition-all group"
            >
              <div
                className={`w-12 h-12 ${useCase.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
              >
                <useCase.icon className={`w-6 h-6 ${useCase.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-card-foreground mb-1">
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
