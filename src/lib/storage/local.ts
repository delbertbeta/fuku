import fs from "fs/promises";
import path from "path";
import { generateUniqueFilename } from "./utils";

const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || "./public/uploads";

export async function uploadToLocal(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const uploadPath = path.join(process.cwd(), UPLOAD_DIR);

  try {
    await fs.access(uploadPath);
  } catch {
    await fs.mkdir(uploadPath, { recursive: true });
  }

  const uniqueFilename = generateUniqueFilename(filename);
  const filePath = path.join(uploadPath, uniqueFilename);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${uniqueFilename}`;
}
