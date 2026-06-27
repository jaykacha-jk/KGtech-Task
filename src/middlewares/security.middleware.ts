import { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { MESSAGES } from '../messages/en';
import { buildErrorResponse } from '../helpers/response.helper';
import { getRequestMeta } from './requestId.middleware';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types/express.types';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const meta = getRequestMeta(req);
    const response = buildErrorResponse('Too many requests', ['Rate limit exceeded'], meta);
    return res.status(429).json(response);
  },
});

export const jobCreationRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const meta = getRequestMeta(req);
    const response = buildErrorResponse('Too many requests', ['Job creation rate limit exceeded'], meta);
    return res.status(429).json(response);
  },
});

export const optionalAuthMiddleware: RequestHandler = (req, res, next) => {
  if (!env.AUTH_ENABLED) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    const meta = getRequestMeta(req);
    const response = buildErrorResponse(MESSAGES.ERROR.UNAUTHORIZED, [], meta);
    return res.status(401).json(response);
  }

  try {
    const token = authHeader.split(' ')[1];
    (req as AuthenticatedRequest).user = authService.verifyToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
};
