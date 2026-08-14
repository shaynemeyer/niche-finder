import Link from 'next/link';
import { ArrowRight, BookSearch } from 'lucide-react';

import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <BookSearch className="mr-1 h-7 w-7 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NicheFinder
            </span>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                FAQ
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/signin"
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground font-medium transition px-3 py-2 rounded-lg hover:bg-accent"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-sm shadow-blue-200 dark:shadow-blue-950"
            >
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
