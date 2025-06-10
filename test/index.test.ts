import { generateSummary } from '../src/index';
import { describe, it, expect } from 'vitest';

const spec = {
  openapi: '3.0.0',
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        description: 'Return a list of users',
        parameters: [
          { name: 'page', in: 'query', description: 'Page number', required: false }
        ]
      },
      post: {
        summary: 'Create user',
        description: 'Add a new user'
      }
    }
  }
};

describe('generateSummary', () => {
  it('level 1 includes descriptions', async () => {
    const result = await generateSummary(spec, 1);
    expect(result.trim()).toBe(
      'GET /users - List users: Return a list of users\nPOST /users - Create user: Add a new user'
    );
  });

  it('level 2 adds parameters', async () => {
    const result = await generateSummary(spec, 2);
    expect(result.trim()).toBe(
      'GET /users - List users: Return a list of users\n  param page (query) - Page number\nPOST /users - Create user: Add a new user'
    );
  });
});
