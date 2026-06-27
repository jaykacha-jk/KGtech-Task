export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
}

export interface CreateJobDto {
  filename: string;
  size: number;
}

export interface JobResponseDto {
  jobId: string;
  status: string;
  createdAt?: string;
  completedAt?: string | null;
  attempts?: number;
}

export interface QueueStatsDto {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface UploadUrlDto {
  uploadUrl: string;
  key: string;
}

export interface HealthDto {
  status: string;
  redis: string;
  database: string;
  uptime: string;
  timestamp: string;
}
