import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-br from-blue-600 to-purple-700 dark:from-blue-500 dark:to-purple-600 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-5" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-5" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                Start validating in seconds
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Stop Guessing.
              <span className="block">Start Knowing.</span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">
              Join hundreds of builders who validate their niche ideas with real
              data before investing time and money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl hover:bg-blue-50 transition shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/signin"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold text-lg rounded-xl hover:bg-white/20 transition"
              >
                Sign In
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              3 free validations · No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
