import type { PlanType, Role } from '@/lib/generated/prisma/client';

type SessionSubscription = {
  planType: PlanType;
  isActive: boolean;
  endDate: Date | null;
} | null;

declare module '@auth/core/types' {
  /** Returned by `authorize`, and available as `user` in the `jwt` callback. */
  interface User {
    role?: Role;
    subscription?: SessionSubscription;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
    subscription?: SessionSubscription;
  }
}
