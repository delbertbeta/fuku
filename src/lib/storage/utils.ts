import path from "path";
import crypto from "crypto";

export function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `${basename}-${timestamp}-${random}${ext}`;
}
