import { Request, Response } from 'express';
import { jobService } from '../services/job.service';
import { statsService } from '../services/stats.service';
import { healthService } from '../services/health.service';
import { uploadService } from '../services/upload.service';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../helpers/asyncHandler.helper';
import { buildSuccessResponse, sendResponse } from '../helpers/response.helper';
import { getRequestMeta } from '../middlewares/requestId.middleware';
import { MESSAGES } from '../messages/en';
import {
  CreateJobBody,
  JobIdParam,
  LoginBody,
  UploadUrlBody,
} from '../validators/job.validator';

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const meta = getRequestMeta(req);
  const body = req.body as CreateJobBody;
  const data = await jobService.createJob(body);

  sendResponse(
    res,
    201,
    buildSuccessResponse(MESSAGES.SUCCESS.JOB_QUEUED, data, meta),
  );
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const meta = getRequestMeta(req);
  const { id } = req.params as JobIdParam;
  const data = await jobService.getJobById(id);

  sendResponse(
    res,
    200,
    buildSuccessResponse(MESSAGES.SUCCESS.JOB_RETRIEVED, data, meta),
  );
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const meta = getRequestMeta(_req);
  const data = await statsService.getQueueStats();

  sendResponse(
    res,
    200,
    buildSuccessResponse(MESSAGES.SUCCESS.STATS_RETRIEVED, data, meta),
  );
});

export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  const meta = getRequestMeta(req);
  const data = await healthService.getHealth();

  sendResponse(
    res,
    200,
    buildSuccessResponse(MESSAGES.SUCCESS.HEALTH_OK, data, meta),
  );
});

export const generateUploadUrl = asyncHandler(async (req: Request, res: Response) => {
  const meta = getRequestMeta(req);
  const body = req.body as UploadUrlBody;
  const data = await uploadService.generateUploadUrl(body.filename, body.contentType);

  sendResponse(
    res,
    200,
    buildSuccessResponse(MESSAGES.SUCCESS.UPLOAD_URL_GENERATED, data, meta),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const meta = getRequestMeta(req);
  const body = req.body as LoginBody;
  const data = authService.login(body.username, body.password);

  sendResponse(
    res,
    200,
    buildSuccessResponse(MESSAGES.SUCCESS.LOGIN_SUCCESS, data, meta),
  );
});
