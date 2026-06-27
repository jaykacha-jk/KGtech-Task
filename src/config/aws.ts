import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

let s3Client: S3Client | null = null;

export const isAwsConfigured = (): boolean => {
  return Boolean(
    env.AWS_REGION && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET,
  );
};

export const getS3Client = (): S3Client => {
  if (!isAwsConfigured()) {
    throw new Error('AWS S3 is not configured');
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: env.AWS_REGION!,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  return s3Client;
};
