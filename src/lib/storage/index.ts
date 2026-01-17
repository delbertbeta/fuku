import { uploadToS3, isS3Configured } from './s3';
import { uploadToLocal } from './local';

export type StorageType = 's3' | 'local';

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const storageType: StorageType =
    (process.env.IMAGE_STORAGE_TYPE as StorageType) || 'local';

  if (storageType === 's3') {
    if (!isS3Configured()) {
      throw new Error('S3 is not configured');
    }
    return uploadToS3(buffer, filename, contentType);
  }

  return uploadToLocal(buffer, filename);
}
