# clothing-management Specification Delta

## MODIFIED Requirements

### Requirement: Image Upload

The system MUST allow users to upload images for clothing items.

#### Scenario: Successful Image Upload

**Given** the user selects a valid image file (JPEG, PNG, or WebP) under 10MB
**When** the user submits the clothing form
**Then** the image should be uploaded to the server
**And** a thumbnail should be generated
**And** the image path should be stored in the database
**And** the image should be displayed in the clothing list and detail view

#### Scenario: Invalid File Type

**Given** the user selects an invalid file type (e.g., .exe, .pdf)
**When** the user attempts to upload the file
**Then** the upload should be rejected
**And** an error message should indicate invalid file type

#### Scenario: File Size Limit

**Given** the user selects an image file larger than 10MB
**When** the user attempts to upload the file
**Then** the upload should be rejected
**And** an error message should indicate the file size limit

#### Scenario: Server-side Image Compression

**Given** the user uploads a 5MB image with dimensions 4000x3000px
**When** the image is processed by the server
**Then** the image should be compressed to a maximum of 1MB
**And** the image should be resized so the longest dimension does not exceed 1920px
**And** the aspect ratio should be preserved
**And** the compressed image should be saved to S3 storage

#### Scenario: Image Already Within Limits

**Given** the user uploads a 500KB image with dimensions 1200x800px
**When** the image is processed by the server
**Then** the image should not be resized
**And** the image should be saved without additional compression

#### Scenario: Landscape Image Resizing

**Given** the user uploads a 3MB image with dimensions 3000x2000px
**When** the image is processed by the server
**Then** the image should be resized to 1920x1280px (maintaining aspect ratio)
**And** the file size should be reduced to no more than 1MB

#### Scenario: Portrait Image Resizing

**Given** the user uploads a 2MB image with dimensions 1500x2500px
**When** the image is processed by the server
**Then** the image should be resized to 1152x1920px (maintaining aspect ratio)
**And** the file size should be reduced to no more than 1MB

#### Scenario: Unique Filename Generation

**Given** a user uploads an image file named "photo.jpg"
**When** the image is uploaded to storage
**Then** a unique filename should be generated using the pattern "{basename}-{timestamp}-{random}.{ext}"
**And** the file extension should be preserved from the original filename
**And** the timestamp should be the current Unix timestamp in milliseconds
**And** the random component should be 8 hex characters derived from 4 random bytes
**And** the generated filename should be stored in the database

#### Scenario: Prevent File Overwrites

**Given** User A uploads a file named "photo.jpg"
**When** User B uploads a different file also named "photo.jpg"
**Then** User B's file should be stored with a different unique filename
**And** User A's file should not be overwritten
**And** both files should be accessible via their respective URLs

#### Scenario: Multiple Uploads with Same Name

**Given** a user uploads a file named "screenshot.png" for one clothing item
**When** the user uploads another file also named "screenshot.png" for a different clothing item
**Then** both files should be stored with different unique filenames
**And** the first file should not be overwritten
**And** both clothing items should display their respective images correctly

#### Scenario: Filename Without Extension

**Given** a user uploads a file named "image" without any extension
**When** the file is processed
**Then** a unique filename should be generated following the same pattern
**And** the filename should not have an extension component
**And** the file should be stored successfully

#### Scenario: Filename with Special Characters

**Given** a user uploads a file named "照片 @#$.jpg" with special characters
**When** the file is processed
**Then** a unique filename should be generated preserving the original basename
**And** the special characters should be preserved in the basename portion
**And** the file extension should be ".jpg"
**And** the file should be stored successfully

#### Scenario: Consistent Filename Pattern Across Storage Backends

**Given** the system is configured to use S3 storage
**When** a file is uploaded
**Then** the generated filename should follow the pattern "{basename}-{timestamp}-{random}.{ext}"
**Given** the system is configured to use local storage
**When** a file is uploaded
**Then** the generated filename should follow the same pattern "{basename}-{timestamp}-{random}.{ext}"
