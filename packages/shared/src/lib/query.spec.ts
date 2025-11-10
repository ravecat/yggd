import { describe, test, expect } from '@jest/globals';
import { deserializeQueryParams, serializeQueryParams } from './query.js';

describe('Query utilities', () => {
  describe('deserializeQueryParams', () => {
    test('handles simple keys', () => {
      const result = deserializeQueryParams({ sort: 'title' });
      
      expect(result).toEqual({ sort: 'title' });
    });

    test('handles nested keys with bracket notation', () => {
      const result = deserializeQueryParams({
        'page[limit]': '10',
        'page[offset]': '20',
      });
      
      expect(result).toEqual({
        page: { limit: 10, offset: 20 },
      });
    });

    test('handles deep nesting', () => {
      const result = deserializeQueryParams({
        'filter[title][contains]': 'test',
        'filter[author][eq]': 'john',
      });
      
      expect(result).toEqual({
        filter: {
          title: { contains: 'test' },
          author: { eq: 'john' },
        },
      });
    });

    test('converts numeric strings to numbers', () => {
      const result = deserializeQueryParams({
        'page[limit]': '10',
        count: '42',
      });
      
      expect(result).toEqual({
        page: { limit: 10 },
        count: 42,
      });
    });

    test('converts boolean strings to booleans', () => {
      const result = deserializeQueryParams({
        active: 'true',
        deleted: 'false',
      });
      
      expect(result).toEqual({
        active: true,
        deleted: false,
      });
    });

    test('handles arrays with bracket notation', () => {
      const result = deserializeQueryParams({
        'tags[]': ['javascript', 'typescript'],
      });
      
      expect(result).toEqual({
        tags: ['javascript', 'typescript'],
      });
    });

    test('converts array values appropriately', () => {
      const result = deserializeQueryParams({
        'ids[]': ['1', '2', '3'],
        'flags[]': ['true', 'false'],
      });
      
      expect(result).toEqual({
        ids: [1, 2, 3],
        flags: [true, false],
      });
    });

    test('skips undefined values', () => {
      const result = deserializeQueryParams({
        sort: 'title',
        filter: undefined,
      });
      
      expect(result).toEqual({ sort: 'title' });
      expect(result).not.toHaveProperty('filter');
    });

    test('handles mixed simple and nested keys', () => {
      const result = deserializeQueryParams({
        sort: '-created_at',
        'page[limit]': '10',
        'page[offset]': '0',
      });
      
      expect(result).toEqual({
        sort: '-created_at',
        page: { limit: 10, offset: 0 },
      });
    });

    test('handles empty strings', () => {
      const result = deserializeQueryParams({
        search: '',
      });
      
      expect(result).toEqual({ search: '' });
    });

    test('handles whitespace in numeric strings', () => {
      const result = deserializeQueryParams({
        count: '  42  ',
      });
      
      expect(result).toEqual({ count: 42 });
    });
  });

  describe('serializeQueryParams', () => {
    test('handles simple keys', () => {
      const result = serializeQueryParams({ sort: 'title' });
      
      expect(result).toEqual([['sort', 'title']]);
    });

    test('handles nested objects with bracket notation', () => {
      const result = serializeQueryParams({
        page: { limit: 10, offset: 20 },
      });
      
      expect(result).toEqual([
        ['page[limit]', '10'],
        ['page[offset]', '20'],
      ]);
    });

    test('handles deep nesting', () => {
      const result = serializeQueryParams({
        filter: {
          title: { contains: 'test' },
          author: { eq: 'john' },
        },
      });
      
      expect(result).toEqual([
        ['filter[title][contains]', 'test'],
        ['filter[author][eq]', 'john'],
      ]);
    });

    test('converts numbers to strings', () => {
      const result = serializeQueryParams({
        page: { limit: 10 },
        count: 42,
      });
      
      expect(result).toEqual([
        ['page[limit]', '10'],
        ['count', '42'],
      ]);
    });

    test('converts booleans to strings', () => {
      const result = serializeQueryParams({
        active: true,
        deleted: false,
      });
      
      expect(result).toEqual([
        ['active', 'true'],
        ['deleted', 'false'],
      ]);
    });

    test('handles arrays with bracket notation', () => {
      const result = serializeQueryParams({
        tags: ['javascript', 'typescript'],
      });
      
      expect(result).toEqual([
        ['tags[]', 'javascript'],
        ['tags[]', 'typescript'],
      ]);
    });

    test('skips null values', () => {
      const result = serializeQueryParams({
        sort: 'title',
        filter: null,
      });
      
      expect(result).toEqual([['sort', 'title']]);
    });

    test('skips undefined values', () => {
      const result = serializeQueryParams({
        sort: 'title',
        filter: undefined,
      });
      
      expect(result).toEqual([['sort', 'title']]);
    });

    test('skips null values in arrays', () => {
      const result = serializeQueryParams({
        tags: ['js', null, 'ts', undefined],
      });
      
      expect(result).toEqual([
        ['tags[]', 'js'],
        ['tags[]', 'ts'],
      ]);
    });

    test('handles mixed simple and nested keys', () => {
      const result = serializeQueryParams({
        sort: '-created_at',
        page: { limit: 10, offset: 0 },
      });
      
      expect(result).toEqual([
        ['sort', '-created_at'],
        ['page[limit]', '10'],
        ['page[offset]', '0'],
      ]);
    });

    test('handles empty strings', () => {
      const result = serializeQueryParams({
        search: '',
      });
      
      expect(result).toEqual([['search', '']]);
    });
  });

  describe('roundtrip serialization', () => {
    test('deserialize -> serialize produces equivalent result', () => {
      const original = {
        sort: '-created_at',
        'page[limit]': '10',
        'page[offset]': '0',
        'filter[title][contains]': 'test',
        'tags[]': ['js', 'ts'],
      };

      const deserialized = deserializeQueryParams(original);
      const serialized = serializeQueryParams(deserialized);

      expect(deserialized).toEqual({
        sort: '-created_at',
        page: { limit: 10, offset: 0 },
        filter: { title: { contains: 'test' } },
        tags: ['js', 'ts'],
      });

      expect(serialized).toEqual([
        ['sort', '-created_at'],
        ['page[limit]', '10'],
        ['page[offset]', '0'],
        ['filter[title][contains]', 'test'],
        ['tags[]', 'js'],
        ['tags[]', 'ts'],
      ]);
    });
  });
});
