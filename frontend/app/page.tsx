import Link from 'next/link';
import {
  ArrowRight,
  BookSearch,
  FileText,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      {/* Navigation */}
      <nav className="border-b bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookSearch className="mr-1 h-7 w-7 text-purple-600 dark:text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NicheFinder
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/signin"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Validate Your Niche with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Research
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Stop guessing. Get comprehensive market validation reports with
            Reddit analysis, Google Trends data, competition insights, and
            AI-generated strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2 text-lg font-semibold"
            >
              Start Validating Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border-2 border-border text-foreground rounded-lg hover:bg-accent transition text-lg font-semibold"
            >
              Learn More
            </Link>
          </div>
          <p className="mt-4 text-muted-foreground">
            3 free validations per month. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Pricing Section */}
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

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; {currentYear} NicheFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition border border-border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  buttonText,
  buttonHref,
  featured = false,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`p-8 bg-card rounded-xl shadow-sm hover:shadow-md transition border ${
        featured ? 'border-primary ring-2 ring-primary' : 'border-border'
      }`}
    >
      {featured && (
        <div className="text-primary text-sm font-semibold mb-2">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold text-card-foreground mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-5xl font-bold text-card-foreground">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={buttonHref}
        className={`block w-full py-3 px-6 rounded-lg text-center font-semibold transition ${
          featured
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
