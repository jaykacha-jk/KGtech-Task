import { createJobBodySchema, jobIdParamSchema } from '../../src/validators/job.validator';

describe('job.validator', () => {
  describe('createJobBodySchema', () => {
    it('accepts valid payload', () => {
      const result = createJobBodySchema.safeParse({ filename: 'orders.csv', size: 1024 });
      expect(result.success).toBe(true);
    });

    it('rejects empty filename', () => {
      const result = createJobBodySchema.safeParse({ filename: '', size: 1024 });
      expect(result.success).toBe(false);
    });

    it('rejects invalid filename characters', () => {
      const result = createJobBodySchema.safeParse({ filename: '../bad.csv', size: 1024 });
      expect(result.success).toBe(false);
    });

    it('rejects non-positive size', () => {
      const result = createJobBodySchema.safeParse({ filename: 'a.csv', size: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe('jobIdParamSchema', () => {
    it('accepts non-empty id', () => {
      const result = jobIdParamSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' });
      expect(result.success).toBe(true);
    });

    it('rejects empty id', () => {
      const result = jobIdParamSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });
  });
});
