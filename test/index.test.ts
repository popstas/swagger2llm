import { generateSummary } from '../src/index';
import { describe, it, expect } from 'vitest';

const spec = {
  openapi: '3.0.0',
  paths: {
    '/users': {
      get: { summary: 'List users' },
      post: { summary: 'Create user' }
    }
  }
};

describe('generateSummary', () => {
  it('level 1 returns paths', async () => {
    const result = await generateSummary(spec, 1);
    expect(result.trim()).toBe('GET /users\nPOST /users');
  });

  it('level 2 includes summary', async () => {
    const result = await generateSummary(spec, 2);
    expect(result.trim()).toBe('GET /users - List users\nPOST /users - Create user');
  });
});
