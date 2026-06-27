import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, isAwsConfigured } from '../config/aws';
import { env } from '../config/env';
import { ServiceUnavailableError } from '../exceptions/app.errors';
import { MESSAGES } from '../messages/en';
import { UploadUrlDto } from '../types/api.types';
import { sanitizeFilename } from '../utils/common.utils';

export class UploadService {
  async generateUploadUrl(filename: string, contentType?: string): Promise<UploadUrlDto> {
    if (!isAwsConfigured()) {
      throw new ServiceUnavailableError(MESSAGES.ERROR.AWS_NOT_CONFIGURED);
    }

    const safeFilename = sanitizeFilename(filename);
    const key = `${env.AWS_S3_UPLOAD_PREFIX}/${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: contentType ?? 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: env.AWS_S3_PRESIGNED_URL_EXPIRES_IN,
    });

    return { uploadUrl, key };
  }
}

export const uploadService = new UploadService();
