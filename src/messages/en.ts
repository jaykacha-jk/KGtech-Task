export const SUCCESS = {
  JOB_CREATED: 'Job created successfully.',
  JOB_QUEUED: 'Job queued successfully.',
  JOB_RETRIEVED: 'Job retrieved successfully.',
  STATS_RETRIEVED: 'Queue statistics retrieved successfully.',
  UPLOAD_URL_GENERATED: 'Pre-signed upload URL generated successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  HEALTH_OK: 'Service is healthy.',
} as const;

export const ERROR = {
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred.',
  UNAUTHORIZED: 'Unauthorized access.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  BAD_REQUEST: 'Bad request.',
  CONFLICT: 'Resource conflict.',
  AWS_NOT_CONFIGURED: 'AWS S3 is not configured.',
  REDIS_UNAVAILABLE: 'Redis is unavailable.',
  DATABASE_UNAVAILABLE: 'Database is unavailable.',
} as const;

export const VALIDATION = {
  VALIDATION_FAILED: 'Validation failed.',
  INVALID_FILENAME: 'Invalid filename provided.',
  INVALID_SIZE: 'Invalid file size provided.',
  INVALID_JOB_ID: 'Invalid job ID provided.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
} as const;

export const JOB = {
  JOB_CREATED: 'Job record created in database.',
  JOB_QUEUED: 'Job added to processing queue.',
  JOB_STARTED: 'Job processing started.',
  JOB_PROGRESS: 'Job processing in progress.',
  JOB_COMPLETED: 'Job processing completed.',
  JOB_FAILED: 'Job processing failed.',
  JOB_NOT_FOUND: 'Job not found.',
  RETRY_ATTEMPT: 'Job retry attempt initiated.',
  WORKER_STARTED: 'Worker started successfully.',
  WORKER_STOPPED: 'Worker stopped gracefully.',
  QUEUE_DRAINED: 'Queue drained — no jobs remaining.',
  QUEUE_STALLED: 'Queue stalled job detected.',
} as const;

export const MESSAGES = {
  SUCCESS,
  ERROR,
  VALIDATION,
  JOB,
} as const;

export type MessageKey = typeof MESSAGES;
