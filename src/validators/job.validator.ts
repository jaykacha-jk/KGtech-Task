import { z } from 'zod';
import { FILENAME_REGEX, MAX_FILENAME_LENGTH } from '../constants/queue.constants';
import { env } from '../config/env';

export const createJobBodySchema = z.object({
  filename: z
    .string({ error: 'filename is required' })
    .min(1, 'filename cannot be empty')
    .max(MAX_FILENAME_LENGTH, `filename must not exceed ${MAX_FILENAME_LENGTH} characters`)
    .regex(FILENAME_REGEX, 'filename contains invalid characters'),
  size: z
    .number({ error: 'size must be a number' })
    .int('size must be an integer')
    .positive('size must be a positive number')
    .max(env.MAX_FILE_SIZE_BYTES, `size must not exceed ${env.MAX_FILE_SIZE_BYTES} bytes`),
});

export const jobIdParamSchema = z.object({
  id: z.string().min(1, 'job id is required'),
});

export const uploadUrlBodySchema = z.object({
  filename: z
    .string({ error: 'filename is required' })
    .min(1, 'filename cannot be empty')
    .max(MAX_FILENAME_LENGTH)
    .regex(FILENAME_REGEX, 'filename contains invalid characters'),
  contentType: z.string().optional(),
});

export const loginBodySchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
});

export const authHeaderSchema = z.object({
  authorization: z
    .string({ error: 'Authorization header is required' })
    .regex(/^Bearer\s+.+/i, 'Authorization header must be a Bearer token'),
});

export type CreateJobBody = z.infer<typeof createJobBodySchema>;
export type JobIdParam = z.infer<typeof jobIdParamSchema>;
export type UploadUrlBody = z.infer<typeof uploadUrlBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
