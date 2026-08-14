import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <span className="text-2xl font-extrabold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mb-3">
              NicheFinder
            </span>
            <p className="text-sm leading-relaxed">
              AI-powered niche validation platform. Validate any market idea in
              under 60 seconds.
            </p>
          </div>
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-foreground transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition">
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/register"
                  className="hover:text-foreground transition"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="hover:text-foreground transition"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#faq" className="hover:text-foreground transition">
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@nichecopy"
                  className="hover:text-foreground transition"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; {currentYear} NicheFinder. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-foreground transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
