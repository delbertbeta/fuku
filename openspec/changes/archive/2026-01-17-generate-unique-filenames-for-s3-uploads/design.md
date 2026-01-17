# Design: Generate Unique Filenames for S3 Uploads

## Overview

This design document explains the implementation approach for generating unique filenames when uploading files to S3, ensuring consistency with the local storage implementation and preventing file overwrites.

## Current Implementation Analysis

### S3 Storage (`src/lib/storage/s3.ts`)

```typescript
const key = `${prefix}${filename}`;
```

- Currently uses the original filename directly
- No uniqueness guarantee
- Prone to collisions

### Local Storage (`src/lib/storage/local.ts`)

```typescript
function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `${basename}-${timestamp}-${random}${ext}`;
}
```

- Generates unique filenames using timestamp + random bytes
- Preserves file extension
- Pattern: `{original-name}-{timestamp}-{random}.{ext}`

## Implementation Strategy

### Option A: Duplicate Logic in S3 Module

Create a `generateUniqueFilename()` function in `s3.ts` similar to the one in `local.ts`.

**Pros:**

- Self-contained, no cross-module dependencies
- Easy to understand and maintain

**Cons:**

- Code duplication
- Two implementations that could diverge over time

### Option B: Extract to Shared Utility Module

Move `generateUniqueFilename()` to a new shared utility file (e.g., `src/lib/storage/utils.ts`) and import it in both modules.

**Pros:**

- Single source of truth
- Consistent behavior across backends
- Easier to test and maintain

**Cons:**

- Additional module/file
- Slight increase in complexity

### Recommendation: Option B

Extract the `generateUniqueFilename()` function to a shared utility module. This ensures consistent behavior, reduces duplication, and makes testing easier. The shared utility approach aligns with the goal of maintaining identical behavior across storage backends.

## Proposed File Structure

```
src/lib/storage/
├── index.ts          (existing, exports uploadImage)
├── s3.ts             (modified, imports from utils.ts)
├── local.ts          (modified, imports from utils.ts)
└── utils.ts          (new, exports generateUniqueFilename)
```

## Implementation Details

### New File: `src/lib/storage/utils.ts`

```typescript
import path from "path";
import crypto from "crypto";

export function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `${basename}-${timestamp}-${random}${ext}`;
}
```

### Modified: `src/lib/storage/s3.ts`

```typescript
import { generateUniqueFilename } from "./utils";

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
  const uniqueFilename = generateUniqueFilename(filename); // NEW
  const key = `${prefix}${uniqueFilename}`; // MODIFIED

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
```

### Modified: `src/lib/storage/local.ts`

```typescript
import { generateUniqueFilename } from "./utils";

// Remove local generateUniqueFilename function
// Import from utils.ts instead

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

  const uniqueFilename = generateUniqueFilename(filename); // MODIFIED
  const filePath = path.join(uploadPath, uniqueFilename);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${uniqueFilename}`;
}
```

## Filename Format

**Pattern**: `{basename}-{timestamp}-{random}{extension}`

**Example**: `photo-1737100000000-a1b2c3d4.jpg`

**Components**:

- `basename`: Original filename without extension (max 255 chars)
- `timestamp`: Unix timestamp in milliseconds (13 digits)
- `random`: 8 hex characters from 4 random bytes
- `extension`: Original file extension including dot (e.g., `.jpg`)

**Collision Probability**:

- Timestamp provides 1/1000s precision
- 8 hex chars = 2^32 ≈ 4.3 billion combinations per millisecond
- Practically impossible to collide under normal usage

## Edge Cases

### Empty or Missing Extension

If filename has no extension, `path.extname()` returns empty string, and `path.basename()` returns the full filename. Result: `{filename}-{timestamp}-{random}`

### Very Long Filenames

Long basenames are preserved. S3 supports object keys up to 1024 bytes, so this is not a concern.

### Special Characters in Filename

Original filename characters are preserved in the basename. S3 supports Unicode in object keys, so no special handling needed.

## Backward Compatibility

### Existing Files

- Files already in S3 remain unchanged
- Existing database references to file paths remain valid
- No migration required

### New Uploads

- All new uploads receive unique filenames
- No breaking changes to API contracts
- No changes required in frontend or API routes

## Testing Strategy

1. **Unit Tests for `generateUniqueFilename()`**:
   - Test with various filename patterns
   - Test with files without extensions
   - Test with special characters
   - Verify uniqueness across multiple rapid calls

2. **Integration Tests for S3 Upload**:
   - Upload multiple files with same name
   - Verify all files are stored without overwrites
   - Verify file extensions are preserved

3. **Cross-Backend Consistency Tests**:
   - Upload same file to both S3 and local storage
   - Verify both generate filenames with same pattern

## Performance Considerations

- `Date.now()` is O(1)
- `crypto.randomBytes(4)` is fast and non-blocking
- `path.extname()` and `path.basename()` are O(n) where n is filename length
- Overall impact: negligible (< 1ms per upload)

## Security Considerations

- Random bytes use cryptographically secure RNG
- Timestamp reveals upload time (acceptable for most use cases)
- No security vulnerabilities introduced

## Future Enhancements (Out of Scope)

- Configurable filename generation strategy
- Content-based deduplication
- Filename sanitization for restricted characters
- Metadata storage of original filename
