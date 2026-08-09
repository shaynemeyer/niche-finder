'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>{children}</SessionProvider>
      {/* Inside ThemeProvider: the shadcn Toaster reads useTheme() for dark mode. */}
      <Toaster />
    </ThemeProvider>
  );
}
