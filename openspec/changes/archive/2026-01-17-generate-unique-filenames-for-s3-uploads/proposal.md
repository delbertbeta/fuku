# Generate Unique Filenames for S3 Uploads

## Summary

Modify the S3 upload functionality to generate unique filenames instead of using the original filename. This prevents file overwrites when multiple users upload files with the same name or when a single user uploads multiple files with identical names.

## Motivation

Currently, when uploading images to S3, the system uses the original filename directly (e.g., `photo.jpg`). This creates a risk of file overwrites in several scenarios:

1. **Multiple users uploading files with the same name**: If two different users both upload a file named `photo.jpg`, the second upload will overwrite the first user's file
2. **Single user uploading multiple files with the same name**: Users may have multiple photos with identical names (e.g., multiple screenshots named `Screenshot.png`) from different sources
3. **Collisions in shared storage**: Even with per-user prefixes, collisions can occur if the prefix configuration changes or is not properly set

The local storage implementation already has this protection through the `generateUniqueFilename()` function in `src/lib/storage/local.ts`. For consistency and to ensure the same safety guarantees across storage backends, S3 uploads should also use unique filenames.

## Proposed Changes

### Capabilities

- **Unique Filename Generation**: Generate a unique filename for every file uploaded to S3 using a combination of timestamp and random characters, similar to the local storage implementation
- **Filename Extension Preservation**: Maintain the original file extension to ensure proper content type handling and browser compatibility
- **Consistent Storage Behavior**: Ensure S3 and local storage backends have identical behavior regarding filename uniqueness

### Scope

- **Code Changes**:
  - Update `src/lib/storage/s3.ts` to generate unique filenames before uploading
  - Reuse or adapt the `generateUniqueFilename()` function from `src/lib/storage/local.ts`
- **No Breaking Changes**: This change is backward compatible since existing files in S3 will remain accessible; only new uploads will get unique filenames

### Out of Scope

- Renaming existing files in S3
- Adding configuration options to control filename generation strategy
- Changing the S3 key/prefix structure beyond filename generation
- Implementing file deduplication based on content hash

## Alternatives Considered

- **Do Nothing**: Accept the risk of file overwrites; unacceptable due to data loss potential
- **Use Content Hash**: Generate filename based on file content hash (e.g., SHA-256); would prevent duplicate uploads but adds computational overhead and doesn't solve the overwriting problem for different files with the same name
- **User-Based Prefixing**: Rely solely on S3 prefix for separation; doesn't solve intra-user collisions and depends on proper prefix configuration
- **UUID Filenames**: Use full UUIDs instead of timestamp+random; UUIDs are longer and less human-readable while providing collision resistance that's overkill for this use case

## Risks & Mitigations

- **Breaking Existing Links**: Any external references to specific S3 URLs might break if they assumed predictable filenames
  - Mitigation: This is not an issue since the application stores and retrieves file paths from the database, not hardcoded URLs
- **Filename Readability**: Generated filenames (e.g., `photo-1737100000000-a1b2c3d4.jpg`) are less readable than original names
  - Mitigation: Original filename metadata can still be stored in the database if needed for display purposes
- **Collision Probability**: Even with timestamp+random, there's a tiny probability of collision
  - Mitigation: Using Date.now() (milliseconds) + 8 random hex chars provides 2^32 (~4 billion) combinations per millisecond, making collisions practically impossible

## Success Criteria

- Every file uploaded to S3 gets a unique filename that includes timestamp and random characters
- File extensions are preserved correctly
- Multiple uploads of files with the same name do not overwrite each other
- S3 upload behavior is consistent with local upload behavior
- Existing functionality (file upload, display, deletion) continues to work without modifications
- No breaking changes to existing S3-hosted files
