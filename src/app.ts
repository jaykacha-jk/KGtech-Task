import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { env } from './config/env';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import { getFileProcessingQueue } from './config/bullmq';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { globalRateLimiter } from './middlewares/security.middleware';
import routes from './routes/index.routes';

export const createApp = (): Application => {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
      customProps: (req) => ({ requestId: req.requestId }),
    }),
  );

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',') }));
  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(globalRateLimiter);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  if (env.NODE_ENV !== 'test') {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [new BullMQAdapter(getFileProcessingQueue())],
      serverAdapter,
    });

    app.use('/admin/queues', serverAdapter.getRouter());
  }

  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
