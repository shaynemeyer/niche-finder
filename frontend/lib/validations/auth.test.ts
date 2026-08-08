import { describe, expect, it } from 'vitest';

import { registerSchema, signInSchema } from './auth';

describe('signInSchema', () => {
  it('accepts a valid credential pair', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'anything',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'anything',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty password without imposing a length rule', () => {
    // Sign-in only checks presence — length rules belong to registration,
    // so existing accounts with shorter passwords can still sign in.
    expect(signInSchema.safeParse({ email: 'user@example.com', password: '' }).success).toBe(false);
    expect(signInSchema.safeParse({ email: 'user@example.com', password: 'short' }).success).toBe(
      true,
    );
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('accepts a complete registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a name', () => {
    expect(registerSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('enforces the 8 character password minimum', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: '1234567', confirmPassword: '1234567' })
        .success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...valid, password: '12345678', confirmPassword: '12345678' })
        .success,
    ).toBe(true);
  });

  it('enforces the 72 character password maximum', () => {
    // bcrypt silently truncates beyond 72 bytes, so the schema caps it
    // rather than letting two different passwords hash identically.
    const at72 = 'a'.repeat(72);
    const over = 'a'.repeat(73);

    expect(
      registerSchema.safeParse({ ...valid, password: at72, confirmPassword: at72 }).success,
    ).toBe(true);
    expect(
      registerSchema.safeParse({ ...valid, password: over, confirmPassword: over }).success,
    ).toBe(false);
  });

  it('rejects mismatched passwords and reports it on confirmPassword', () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'different123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });
});
