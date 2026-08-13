// Session Max Age
export const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Validations a FREE-tier user may run per month. Not enforced server-side yet.
export const FREE_TIER_MONTHLY_LIMIT = 3;

// Monthly price of the PRO plan in whole dollars, matching the landing page's
// pricing card. No billing model exists yet, so MRR is derived from this
// rather than read from a real subscription charge.
export const PRO_MONTHLY_PRICE = 29;
