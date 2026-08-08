import { describe, expect, it } from 'vitest';

import { validateNicheSchema } from './report';

describe('validateNicheSchema', () => {
  it('accepts a niche and keyword', () => {
    const result = validateNicheSchema.safeParse({
      niche: 'AI productivity tools for writers',
      keyword: 'AI writing assistant',
    });

    expect(result.success).toBe(true);
  });

  it('enforces the minimum lengths', () => {
    expect(
      validateNicheSchema.safeParse({ niche: 'ab', keyword: 'valid' }).success,
    ).toBe(false);
    expect(
      validateNicheSchema.safeParse({ niche: 'valid niche', keyword: 'a' })
        .success,
    ).toBe(false);
  });

  it('rejects values past the VarChar(255) column limit', () => {
    const result = validateNicheSchema.safeParse({
      niche: 'a'.repeat(256),
      keyword: 'valid keyword',
    });

    expect(result.success).toBe(false);
  });

  it('reports the error on the field that failed', () => {
    const result = validateNicheSchema.safeParse({ niche: 'ab', keyword: 'ok' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['niche']);
    }
  });
});
