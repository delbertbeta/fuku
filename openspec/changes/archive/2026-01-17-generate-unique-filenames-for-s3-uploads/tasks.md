# Tasks: Generate Unique Filenames for S3 Uploads

## Phase 1: Shared Utility Implementation

- [x] **Create shared utility module for filename generation**
  - Create `src/lib/storage/utils.ts`
  - Extract `generateUniqueFilename()` function from `src/lib/storage/local.ts`
  - Add unit tests for the utility function
  - Test various filename patterns (with/without extension, special chars, etc.)

- [x] **Update local storage to use shared utility**
  - Modify `src/lib/storage/local.ts` to import `generateUniqueFilename` from `utils.ts`
  - Remove the local `generateUniqueFilename()` function
  - Verify local storage tests still pass

## Phase 2: S3 Storage Implementation

- [x] **Update S3 storage to use unique filenames**
  - Modify `src/lib/storage/s3.ts` to import `generateUniqueFilename` from `utils.ts`
  - Update `uploadToS3()` function to generate unique filename before constructing key
  - Ensure file extensions are preserved correctly

- [x] **Test S3 upload functionality**
  - Upload multiple files with the same name to S3
  - Verify no files are overwritten
  - Verify all uploaded files are accessible via returned URLs
  - Test with various file types (jpg, png, gif, etc.)

## Phase 3: Integration Testing

- [x] **Test clothing item upload flow**
  - Create clothing items with images having identical filenames
  - Verify all items have distinct image paths in database
  - Verify all images are accessible via their URLs
  - Test both S3 and local storage backends

- [x] **Test cross-backend consistency**
  - Upload the same file to both S3 and local storage
  - Verify both generate filenames with the same pattern
  - Verify file extensions are preserved in both cases

- [x] **Test edge cases**
  - Upload files without extensions
  - Upload files with very long names
  - Upload files with special characters in names
  - Upload files with unicode characters in names

## Phase 4: Validation & Verification

- [x] **Verify backward compatibility**
  - Check that existing files in S3 remain accessible
  - Verify existing database references still work
  - Confirm no breaking changes to API contracts

- [x] **Run existing test suite**
  - Run all existing tests to ensure no regressions
  - Check for any failing tests related to file uploads
  - Fix any issues that arise

- [x] **Manual verification**
  - Manually test the upload functionality in the UI
  - Verify file URLs are working correctly
  - Check browser console for any errors

## Dependencies & Parallelization

### Parallelizable Tasks

- Phase 1 (Shared Utility) can be done independently
- Phase 2 (S3 Implementation) can be done in parallel with Phase 1 (after utility is created)
- Integration tests can be written in parallel with implementation

### Sequential Dependencies

- Phase 1 must complete before Phase 2 (S3 Implementation)
- Phase 2 must complete before Phase 3 (Integration Testing)
- Phase 3 must complete before Phase 4 (Validation)

### Estimated Timeline

- Phase 1: 1-2 hours
- Phase 2: 1-2 hours
- Phase 3: 2-3 hours
- Phase 4: 1-2 hours

**Total: 5-9 hours**

## Notes

- This is a low-risk change as it only affects new uploads
- Existing functionality and data remain unaffected
- The change is backward compatible
- No database migrations required
- No API changes required
