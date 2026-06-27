import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../exceptions/app.errors';
import { MESSAGES } from '../messages/en';

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
  headers?: ZodType;
};

export const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    const errors: string[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...result.error.issues.map((i) => i.message));
      } else {
        req.body = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...result.error.issues.map((i) => i.message));
      } else {
        req.params = result.data as typeof req.params;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...result.error.issues.map((i) => i.message));
      } else {
        req.query = result.data as typeof req.query;
      }
    }

    if (schemas.headers) {
      const result = schemas.headers.safeParse(req.headers);
      if (!result.success) {
        errors.push(...result.error.issues.map((i) => i.message));
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError(MESSAGES.VALIDATION.VALIDATION_FAILED, errors));
    }

    return next();
  };
