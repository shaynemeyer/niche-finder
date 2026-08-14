'use client';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { PlanBadge } from '@/components/dashboard/plan-badge';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  // Refetches usage on navigation, so the count reflects a validation that
  // was just run.
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The layout is a client component and the session carries no usage figure —
  // per-month data does not belong in a JWT. /api/usage exists for exactly
  // this caller. Null until it resolves, so the badge renders without a count
  // rather than blocking the sidebar.
  const [usage, setUsage] = useState<{
    used: number;
    limit: number | null;
  } | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;
    fetch('/api/usage')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setUsage(data);
      })
      .catch(() => {
        // A missing count is not worth surfacing — the badge just omits it.
      });

    return () => {
      cancelled = true;
    };
  }, [status, pathname]);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/signin');
    router.refresh();
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Admins have a normal account and can use this area, so they need a way
  // back. Everyone else is redirected by proxy.ts and must not see the link.
  const isAdmin = session?.user?.role === 'ADMIN';

  // Absent while the session loads; treated as free so the CTA appears rather
  // than flashing in after hydration.
  const isPro = session?.user?.subscription?.planType === 'PRO';


  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-5 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                NicheFinder
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition"
                >
                  <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground/80 group-hover:text-foreground">
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="my-2 border-t border-border" />
                <Link
                  href="/admin"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition"
                >
                  <ShieldCheck className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-500" />
                  <span className="text-foreground/80 group-hover:text-foreground">
                    Admin area
                  </span>
                </Link>
              </>
            )}
          </nav>

          <PlanBadge
            isPro={isPro}
            used={usage?.used ?? 0}
            limit={usage?.limit ?? null}
          />

          {/* User section */}
          <div className="shrink-0 border-t border-border p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {session.user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="ml-1 p-2 rounded-lg hover:bg-accent transition"
                title="Sign out"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-card border-b border-border px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              NicheFinder
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}

        {mobileMenuOpen && (
          <div className="bg-card border-b border-border">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center px-3 py-2 text-base font-medium rounded-lg text-foreground hover:bg-accent"
                  >
                    <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
                    {item.name}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="my-2 border-t border-border" />
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center px-3 py-2 text-base font-medium rounded-lg text-foreground hover:bg-accent"
                  >
                    <ShieldCheck className="mr-3 h-5 w-5 text-muted-foreground" />
                    Admin area
                  </Link>
                </>
              )}

              <PlanBadge
                isPro={isPro}
                used={usage?.used ?? 0}
                limit={usage?.limit ?? null}
                onNavigate={() => setMobileMenuOpen(false)}
              />

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full group flex items-center px-3 py-2 text-base font-medium rounded-lg hover:bg-accent text-destructive"
              >
                <LogOut className="mr-4 h-6 w-6" />
                Sign out
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
