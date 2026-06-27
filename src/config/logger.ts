import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino/file',
      options: { destination: 1 },
    },
  }),
  redact: {
    paths: ['req.headers.authorization', 'password', 'token', 'AWS_SECRET_ACCESS_KEY'],
    censor: '[REDACTED]',
  },
});

export const createChildLogger = (bindings: Record<string, unknown>) => logger.child(bindings);
