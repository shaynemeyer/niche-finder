'use client';

import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ThemeToggle } from '@/components/theme-toggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/signin');
    router.refresh();
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    {
      name: 'Payment Requests',
      href: '/admin/payment-requests',
      icon: Receipt,
    },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col grow border-r border-border bg-card overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center shrink-0 px-4 py-5 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-500" />
              <div>
                <span className="text-xl font-bold text-foreground">
                  Admin Panel
                </span>
                <p className="text-xs text-muted-foreground">NicheFinder</p>
              </div>
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
                  <Icon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-500" />
                  <span className="text-foreground/80 group-hover:text-foreground">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="shrink-0 border-t border-border p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-600 dark:bg-red-700 flex items-center justify-center text-white font-semibold">
                  {session.user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {session.user?.name}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
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
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-500" />
            <span className="text-lg font-bold text-foreground">
              Admin Panel
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
                    <Icon className="mr-4 h-6 w-6 text-muted-foreground" />
                    {item.name}
                  </Link>
                );
              })}

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
