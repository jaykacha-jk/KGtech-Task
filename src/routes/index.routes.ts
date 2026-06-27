import { Router } from 'express';
import {
  createJob,
  generateUploadUrl,
  getHealth,
  getJobById,
  getStats,
  login,
} from '../controllers/job.controller';
import { validate } from '../validators/validate.middleware';
import {
  createJobBodySchema,
  jobIdParamSchema,
  loginBodySchema,
  uploadUrlBodySchema,
} from '../validators/job.validator';
import {
  jobCreationRateLimiter,
  optionalAuthMiddleware,
} from '../middlewares/security.middleware';

const router = Router();

router.get('/health', getHealth);

router.post('/auth/login', validate({ body: loginBodySchema }), login);

router.post(
  '/jobs',
  optionalAuthMiddleware,
  jobCreationRateLimiter,
  validate({ body: createJobBodySchema }),
  createJob,
);

router.get(
  '/jobs/:id',
  optionalAuthMiddleware,
  validate({ params: jobIdParamSchema }),
  getJobById,
);

router.get('/stats', optionalAuthMiddleware, getStats);

router.post(
  '/upload-url',
  optionalAuthMiddleware,
  validate({ body: uploadUrlBodySchema }),
  generateUploadUrl,
);

export default router;
