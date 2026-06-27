import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

export const getRequestMeta = (req: Express.Request) => ({
  requestId: req.requestId ?? randomUUID(),
  timestamp: new Date().toISOString(),
});
