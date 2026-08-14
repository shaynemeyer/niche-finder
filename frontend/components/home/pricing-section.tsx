import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 bg-linear-to-b from-muted to-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-full mb-4 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free. Upgrade only when you&apos;re ready.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-card-foreground mb-1">
                Free
              </h3>
              <p className="text-sm text-muted-foreground">
                Perfect to try it out
              </p>
            </div>
            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-extrabold text-card-foreground">
                $0
              </span>
              <span className="text-muted-foreground mb-2">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                '3 niche validations per month',
                'Reddit analysis (top 50 posts)',
                'Google Trends overview',
                'AI summary report (~500 words)',
                'Overall opportunity score',
                'View public reports',
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full py-3 px-6 text-center text-sm font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition"
            >
              Start for Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-blue-600 dark:bg-blue-500 rounded-2xl border border-blue-700 dark:border-blue-400 shadow-xl shadow-blue-200 dark:shadow-blue-950 p-8 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <p className="text-sm text-blue-200 mb-6">For serious builders</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-extrabold text-white">$29</span>
                <span className="text-blue-300 mb-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited niche validations',
                  'Deep Reddit analysis (500+ posts)',
                  'Advanced Trends data & forecasting',
                  'Full AI report (2000+ words)',
                  'Competition deep-dive',
                  'Monetization strategy report',
                  'Go-to-market playbook',
                  'Export to PDF & Markdown',
                  'Save unlimited reports',
                  'Priority processing',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-100">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 px-6 text-center text-sm font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-xl transition"
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
