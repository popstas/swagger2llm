import { generateSummary, stripExamples } from '../src/index';
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
        ],
        examples: { a: { foo: 'bar' } }
      },
      post: {
        summary: 'Create user',
        description: 'Add a new user'
      }
    },
    '/posts': {
      get: { summary: 'List posts', description: 'Return posts' }
    }
  }
};

describe('generateSummary', () => {
  it('level 1 includes descriptions', async () => {
    const result = await generateSummary(spec, 1);
    expect(result.trim()).toBe(
      [
        'GET /users - List users: Return a list of users',
        'POST /users - Create user: Add a new user',
        '',
        'GET /posts - List posts: Return posts'
      ].join('\n')
    );
  });

  it('level 2 adds parameters', async () => {
    const result = await generateSummary(spec, 2);
    expect(result.trim()).toBe(
      [
        'GET /users - List users: Return a list of users',
        '  param page (query) - Page number',
        'POST /users - Create user: Add a new user',
        '',
        'GET /posts - List posts: Return posts'
      ].join('\n')
    );
  });

  it('stripExamples removes examples', () => {
    const copy: any = JSON.parse(JSON.stringify(spec));
    stripExamples(copy);
    expect(copy.paths['/users'].get.examples).toBeUndefined();
  });

  it('no llm just truncates long text', async () => {
    const longDesc = 'x'.repeat(400);
    const longSpec = { paths: { '/long': { get: { description: longDesc } } } };
    const result = await generateSummary(longSpec, 1, { useLlm: false });
    expect(result.trim().length).toBeLessThanOrEqual(120 + 'GET /long: '.length);
  });
});
