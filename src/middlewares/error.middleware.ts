import { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, InternalServerError } from '../exceptions/app.errors';
import { buildErrorResponse } from '../helpers/response.helper';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { MESSAGES } from '../messages/en';
import { getRequestMeta } from './requestId.middleware';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const meta = getRequestMeta(req);

  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    error = new InternalServerError(MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
  }

  if (error.statusCode >= 500) {
    logger.error({ err, requestId: meta.requestId }, error.message);
  } else {
    logger.warn(
      { err: { message: error.message, errors: error.errors }, requestId: meta.requestId },
      error.message,
    );
  }

  const response: Record<string, unknown> = {
    ...buildErrorResponse(error.message, error.errors, meta),
  };

  if (env.NODE_ENV === 'development' && !error.isOperational && err instanceof Error) {
    response.stack = err.stack;
  }

  return res.status(error.statusCode).json(response);
};

export const notFoundHandler: RequestHandler = (req, res) => {
  const meta = getRequestMeta(req);
  const response = buildErrorResponse(
    MESSAGES.ERROR.NOT_FOUND,
    [`Route ${req.originalUrl} not found`],
    meta,
  );
  return res.status(404).json(response);
};
