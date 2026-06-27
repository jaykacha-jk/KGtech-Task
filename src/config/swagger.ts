import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'KGtech File Processing Service API',
    version: '1.0.0',
    description:
      'A scalable file processing service with asynchronous job queue processing using BullMQ and MongoDB.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful.' },
          data: { type: 'object', nullable: true },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: [],
          },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string', format: 'uuid' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      CreateJobRequest: {
        type: 'object',
        required: ['filename', 'size'],
        properties: {
          filename: { type: 'string', example: 'orders.csv' },
          size: { type: 'integer', example: 1024, minimum: 1 },
        },
      },
      CreateJobResponse: {
        type: 'object',
        properties: {
          jobId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          status: { type: 'string', enum: ['queued'], example: 'queued' },
        },
      },
      JobStatusResponse: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          status: {
            type: 'string',
            enum: ['queued', 'active', 'completed', 'failed'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          attempts: { type: 'integer', example: 1 },
        },
      },
      QueueStatsResponse: {
        type: 'object',
        properties: {
          waiting: { type: 'integer', example: 5 },
          active: { type: 'integer', example: 2 },
          completed: { type: 'integer', example: 15 },
          failed: { type: 'integer', example: 3 },
        },
      },
      UploadUrlRequest: {
        type: 'object',
        required: ['filename'],
        properties: {
          filename: { type: 'string', example: 'file.csv' },
          contentType: { type: 'string', example: 'text/csv' },
        },
      },
      UploadUrlResponse: {
        type: 'object',
        properties: {
          uploadUrl: { type: 'string', format: 'uri' },
          key: { type: 'string', example: 'uploads/file.csv' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'UP' },
          redis: { type: 'string', example: 'connected' },
          database: { type: 'string', example: 'connected' },
          uptime: { type: 'string', example: '3600s' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'admin123' },
        },
      },
      ErrorResponse: {
        allOf: [{ $ref: '#/components/schemas/ApiResponse' }],
        example: {
          success: false,
          message: 'Validation failed.',
          data: null,
          errors: ['filename is required'],
          meta: { requestId: 'uuid', timestamp: '2026-06-27T10:00:00.000Z' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service health status',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/HealthResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/jobs': {
      post: {
        tags: ['Jobs'],
        summary: 'Create a file processing job',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateJobRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Job created and queued',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/CreateJobResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/jobs/{id}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get job status by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Job status retrieved',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/JobStatusResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: 'Job not found' },
        },
      },
    },
    '/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Get queue statistics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Queue statistics',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/QueueStatsResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/upload-url': {
      post: {
        tags: ['Upload'],
        summary: 'Generate pre-signed S3 upload URL',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UploadUrlRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Pre-signed URL generated' },
          503: { description: 'AWS not configured' },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});
