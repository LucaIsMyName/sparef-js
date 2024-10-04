// src/utils.test.ts

import { applyDefaults, kebabCase } from './utils';

describe('utils', () => {
  describe('applyDefaults', () => {
    it('should merge options with defaults', () => {
      const defaults = { a: 1, b: 2, c: { d: 3 } };
      const options = { b: 4, c: { d: 5, e: 6 } };
      const result = applyDefaults(options, defaults);
      expect(result).toEqual({ a: 1, b: 4, c: { d: 5, e: 6 } });
    });
  });

  describe('kebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(kebabCase('backgroundColor')).toBe('background-color');
      expect(kebabCase('marginTop')).toBe('margin-top');
    });
  });
});