export class AppError extends Error {
  public readonly isOperational: boolean;

  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly errors: string[] = [],
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpError extends AppError {
  constructor(message: string, statusCode: number, errors: string[] = []) {
    super(message, statusCode, errors);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, errors: string[] = []) {
    super(message, 422, errors);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, errors: string[] = []) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, errors: string[] = []) {
    super(message, 401, errors);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, errors: string[] = []) {
    super(message, 403, errors);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, errors: string[] = []) {
    super(message, 404, errors);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, errors: string[] = []) {
    super(message, 409, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, errors: string[] = []) {
    super(message, 500, errors, false);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message: string, errors: string[] = []) {
    super(message, 503, errors);
  }
}
