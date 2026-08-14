import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 bg-linear-to-b from-blue-50 dark:from-blue-950/40 via-background to-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20 -translate-y-1/2" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              AI-Powered Niche Validation Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-tight mb-6 tracking-tight">
            Validate Any Niche
            <span className="block bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Before You Build
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Stop wasting months on ideas that won&apos;t work. Get comprehensive
            market validation reports with Reddit analysis, Google Trends,
            competition intelligence, and AI strategy — in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg shadow-blue-200 dark:shadow-blue-950"
            >
              Start Validating Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 bg-card border-2 border-border text-foreground text-lg font-semibold rounded-xl hover:border-muted-foreground/40 hover:bg-accent transition"
            >
              See How It Works
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            3 free validations/month · No credit card required · Cancel anytime
          </p>
        </div>

        {/* Mock Report Preview */}
        <div className="max-w-5xl mx-auto bg-card rounded-2xl border border-border shadow-2xl shadow-gray-200 dark:shadow-black/40 overflow-hidden">
          {/* Window bar */}
          <div className="bg-muted border-b border-border px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 bg-card border border-border rounded px-3 py-1 text-xs text-muted-foreground">
              nichefinder.com/dashboard
            </div>
          </div>
          {/* Dashboard mock */}
          <div className="p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-card-foreground">
                  Niche Report:{' '}
                  <span className="text-blue-600 dark:text-blue-400">
                    Sustainable Dog Products
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Generated in 48 seconds · March 2026
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
                  Score: 84/100
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
                  High Opportunity
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: 'Reddit Posts Analyzed',
                  value: '542',
                  color: 'text-orange-500 dark:text-orange-400',
                  bg: 'bg-orange-50 dark:bg-orange-950/60',
                },
                {
                  label: 'Monthly Search Volume',
                  value: '89K',
                  color: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-50 dark:bg-blue-950/60',
                },
                {
                  label: 'Competition Level',
                  value: 'Medium',
                  color: 'text-yellow-600 dark:text-yellow-400',
                  bg: 'bg-yellow-50 dark:bg-yellow-950/60',
                },
                {
                  label: 'Market Trend',
                  value: '+43%',
                  color: 'text-green-600 dark:text-green-400',
                  bg: 'bg-green-50 dark:bg-green-950/60',
                },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-lg p-3`}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className={`text-xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-muted rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Google Trends (12 months)
                </p>
                <div className="flex items-end gap-1 h-16">
                  {[30, 42, 38, 55, 60, 52, 68, 72, 65, 80, 85, 90].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-sm opacity-80 transition-all"
                        style={{ height: `${h}%` }}
                      />
                    ),
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Mar 2025
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Mar 2026
                  </span>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Top Pain Points
                </p>
                <div className="space-y-2">
                  {[
                    'Eco-friendly packaging',
                    'Price vs quality',
                    'Ingredient transparency',
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                      <span className="text-xs text-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
