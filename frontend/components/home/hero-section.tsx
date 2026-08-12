import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
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
  );
}
