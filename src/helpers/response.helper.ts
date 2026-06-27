import { Response } from 'express';
import { ApiResponse } from '../types/api.types';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ApiResponse<T>,
): Response => {
  return res.status(statusCode).json(payload);
};

export const buildSuccessResponse = <T>(
  message: string,
  data: T,
  meta: ApiResponse['meta'],
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  errors: [],
  meta,
});

export const buildErrorResponse = (
  message: string,
  errors: string[],
  meta: ApiResponse['meta'],
): ApiResponse<null> => ({
  success: false,
  message,
  data: null,
  errors,
  meta,
});
