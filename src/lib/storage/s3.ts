import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateUniqueFilename } from "./utils";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.S3_ENDPOINT,
});

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME not configured");
  }

  const prefix = process.env.S3_PREFIX || "uploads/";
  const uniqueFilename = generateUniqueFilename(filename);
  const key = `${prefix}${uniqueFilename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const cdnUrl = process.env.S3_CDN_URL;
  const endpoint =
    process.env.S3_ENDPOINT ||
    `https://s3.${process.env.S3_REGION}.amazonaws.com`;

  if (cdnUrl) {
    return `${cdnUrl}/${key}`;
  }
  return `${endpoint}/${bucketName}/${key}`;
}

export function isS3Configured(): boolean {
  return !!(
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  );
}
