import Link from 'next/link';
import { BookSearch } from 'lucide-react';

import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Navbar() {
  return (
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
  );
}
