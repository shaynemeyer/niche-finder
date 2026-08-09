import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();

// Mocked at the data layer: the handler owns validation, error mapping and the
// response. The nested write shape belongs to lib/data/users.test.ts.
vi.mock('@/lib/data/users', () => ({
  createUser: (...args: unknown[]) => create(...args),
}));

import { Prisma } from '@/lib/generated/prisma/client';
import { POST } from './route';

function postRequest(body: unknown) {
  return new Request('http://localhost:3000/api/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: 'Test User',
  email: 'new@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

beforeEach(() => {
  create.mockReset();
});

describe('POST /api/register', () => {
  it('creates the user and returns 201', async () => {
    create.mockResolvedValue({ id: 'user-1', email: validBody.email });

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledOnce();
  });

  it('hashes the password before it reaches the data layer', async () => {
    create.mockResolvedValue({ id: 'user-1', email: validBody.email });

    await POST(postRequest(validBody));

    // The handler hashes; lib/data stores whatever it is given.
    const [name, email, password] = create.mock.calls[0];
    expect(name).toBe(validBody.name);
    expect(email).toBe(validBody.email);
    expect(password).not.toBe(validBody.password);
    expect(password).toMatch(/^\$2[aby]\$/);
  });

  it('returns 400 when the body fails validation', async () => {
    const response = await POST(postRequest({ ...validBody, email: 'not-an-email' }));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('returns 400 when the body is not JSON', async () => {
    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      body: 'not json',
    });

    expect((await POST(request)).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('returns 409 when the email is already registered', async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.9.1',
      }),
    );

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(409);
  });

  it('returns a generic 500 without leaking internal detail', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    create.mockRejectedValue(new Error('connection refused at 10.0.0.5:5432'));

    const response = await POST(postRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('10.0.0.5');
  });
});
