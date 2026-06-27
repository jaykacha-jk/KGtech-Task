import { shouldSimulateFailure, randomInt, sanitizeFilename } from '../../src/utils/common.utils';

describe('common.utils', () => {
  describe('sanitizeFilename', () => {
    it('removes path separators', () => {
      expect(sanitizeFilename('../../etc/passwd')).toBe('....etcpasswd');
      expect(sanitizeFilename('orders.csv')).toBe('orders.csv');
    });
  });

  describe('randomInt', () => {
    it('returns value within inclusive range', () => {
      for (let i = 0; i < 50; i++) {
        const value = randomInt(5, 10);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('shouldSimulateFailure', () => {
    it('returns false when failure rate is 0', () => {
      expect(shouldSimulateFailure(0)).toBe(false);
    });

    it('returns true when failure rate is 1', () => {
      expect(shouldSimulateFailure(1)).toBe(true);
    });
  });
});
