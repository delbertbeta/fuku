# clothing-management Specification

## Purpose

TBD - created by archiving change establish-outfit-platform. Update Purpose after archive.
## Requirements
### Requirement: Clothing Item Creation

The system MUST allow users to create new clothing items with required and optional information.

#### Scenario: Create Clothing with Required Fields Only

**Given** the user is on the clothing creation form
**When** the user provides an image, selects a category (top, jacket, pants, shoes), and enters a name
**Then** the clothing item should be created successfully
**And** the item should be displayed in the clothing list
**And** optional fields should be empty or null

#### Scenario: Create Clothing with All Fields

**Given** the user is on the clothing creation form
**When** the user provides an image, category, name, description, price, and purchase date
**Then** the clothing item should be created with all fields populated
**And** all information should be displayed correctly in the detail view

#### Scenario: Create Clothing Without Required Fields

**Given** the user is on the clothing creation form
**When** the user submits the form without an image or category
**Then** validation should fail
**And** appropriate error messages should indicate missing required fields
**And** the clothing item should not be created

### Requirement: Clothing Item Categories

Clothing items MUST be categorized using foreign key references to the clothing_categories table.

#### Scenario: Create clothing with category ID

**Given** the user is on the clothing creation form
**When** the user selects a category with ID 1
**Then** the clothing item should be created with category_id=1
**And** the item should be associated with the correct category

#### Scenario: Category ID validation

**Given** the user is creating a clothing item
**When** the user submits a form with an invalid category ID
**Then** validation should fail
**And** an appropriate error message should be returned
**And** the clothing item should not be created

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

### Requirement: Clothing Item Listing

The system MUST allow users to view a list of their clothing items with comprehensive information.

#### Scenario: View All Clothing Items

**Given** the user has created multiple clothing items with various attributes
**When** the user navigates to the clothing list page
**Then** all clothing items should be displayed
**And** each item should show the image, name, category, description (if present), and price (if present)
**And** items should be ordered by creation date (newest first)

### Requirement: Clothing Item Details

The system MUST allow users to view detailed information about a specific clothing item.

#### Scenario: View Clothing Details

**Given** a clothing item exists with name "Blue Shirt", category "top", price "$29.99", and purchase date "2024-01-15"
**When** the user navigates to the clothing item detail page
**Then** the full-size image should be displayed
**And** the name, category, price, and purchase date should be shown
**And** the description should be displayed if present

#### Scenario: Navigate to Clothing Detail Page

**Given** the user is on the clothing list page
**When** the user clicks on a clothing item card
**Then** the user should be navigated to the detail page `/clothing/[id]`
**And** the detail page should load with the item's data
**And** the card should have a hover effect indicating it is clickable

#### Scenario: Display Loading State on Detail Page

**Given** the user navigates to a clothing detail page
**When** the page is loading data from the API
**Then** a loading indicator should be displayed
**And** the user should see a clear loading message

### Requirement: Clothing Item Editing

The system MUST allow users to update existing clothing items.

#### Scenario: Edit Clothing Item

**Given** a clothing item exists with name "Old Name"
**When** the user updates the name to "New Name" and saves
**Then** the clothing item should be updated
**And** the changes should be reflected in the list and detail view

#### Scenario: Update Optional Fields

**Given** a clothing item exists without a price
**When** the user adds a price of "$49.99" and saves
**Then** the price should be stored and displayed

#### Scenario: Display Edit Form with Pre-populated Data

**Given** the user is on a clothing detail page for an existing item
**When** the page loads
**Then** all editable fields should be pre-populated with current item data
**And** the form should be ready for editing
**And** a "Save" button should be available to submit changes
**And** a "Cancel" button should be available to discard changes

#### Scenario: Validate Required Fields on Edit

**Given** the user is editing a clothing item
**When** the user clears the name field and attempts to save
**Then** a validation error should be displayed
**And** the item should not be updated
**And** the error message should indicate that name is required

#### Scenario: Display Success Message After Edit

**Given** the user successfully edits a clothing item
**When** the save operation completes
**Then** a success message should be displayed
**And** the updated data should be visible in the form

#### Scenario: Cancel Edit Operation

**Given** the user has made unsaved changes to a clothing item
**When** the user clicks the "Cancel" button
**Then** the form should revert to the original item data
**And** no changes should be saved
**And** the user should remain on the detail page

### Requirement: Clothing Item Deletion

The system MUST allow users to delete clothing items with confirmation.

#### Scenario: Delete Clothing Item

**Given** a clothing item exists and is not part of any outfit
**When** the user deletes the item and confirms
**Then** the clothing item should be removed from the database
**And** the associated image file should be deleted
**And** the item should no longer appear in lists

#### Scenario: Prevent Deletion When Used in Outfit

**Given** a clothing item is part of one or more outfits
**When** the user attempts to delete the item
**Then** deletion should be prevented
**And** an error message should indicate the item is in use
**And** a list of outfits using the item should be displayed

#### Scenario: Show Delete Confirmation Dialog

**Given** the user is viewing a clothing item
**When** the user clicks the "Delete" button
**Then** a confirmation dialog should be displayed
**And** the dialog should show the item name
**And** the dialog should have a warning message
**And** the dialog should have "Cancel" and "Delete" buttons
**And** the "Delete" button should use red styling

#### Scenario: Cancel Delete Operation

**Given** the delete confirmation dialog is displayed
**When** the user clicks the "Cancel" button or presses Escape
**Then** the dialog should be closed
**And** the item should not be deleted
**And** the user should remain on the detail page

#### Scenario: Navigate to List After Delete

**Given** the user successfully deletes a clothing item
**When** the delete operation completes
**Then** the user should be navigated back to the clothing list page
**And** a success message should be displayed
**And** the deleted item should not appear in the list

### Requirement: Clothing Search

The system MUST allow users to search for clothing items by name.

#### Scenario: Search Clothing Items

**Given** the user has clothing items named "Blue Shirt", "Red Pants", "Blue Pants"
**When** the user searches for "Blue"
**Then** only "Blue Shirt" and "Blue Pants" should be displayed
**And** "Red Pants" should be excluded

#### Scenario: Clear Search Results

**Given** the user has performed a search
**When** the user clears the search field
**Then** all clothing items should be displayed again

### Requirement: Mobile-Friendly Image Display

Clothing images MUST be displayed optimally on mobile devices.

#### Scenario: Responsive Image Grid

**Given** the user is on a mobile device (width < 640px)
**When** the clothing list is displayed
**Then** images should be displayed in a single column
**And** each card should use the full width of the screen

#### Scenario: Desktop Image Grid

**Given** the user is on a desktop device (width >= 1024px)
**When** the clothing list is displayed
**Then** images should be displayed in a multi-column grid
**And** cards should be evenly distributed

### Requirement: Clothing Item Filtering

Clothing items MUST be filterable by category ID.

#### Scenario: Filter clothing by category ID

**Given** the user is on the clothing list page
**When** the API is called with `?category=1`
**Then** only clothing items with category_id=1 should be returned
**And** results should include category name joined from clothing_categories table

#### Scenario: Get all clothing without filter

**Given** the user is on the clothing list page
**When** the API is called without category parameter
**Then** all clothing items should be returned
**And** results should include category name for each item

### Requirement: Database schema migration

The database schema MUST migrate clothing_items.category from TEXT to INTEGER.

#### Scenario: Migrate existing category data

**Given** the clothing_items table has category values as TEXT
**When** the migration runs
**Then** each TEXT category value should be converted to the corresponding category_id
**And** foreign key constraint should be added to clothing_categories.id
**And** no data should be lost during migration

#### Scenario: Schema column type change

**Given** the clothing_items table exists
**When** the schema is updated
**Then** the category column should be INTEGER type
**And** the column should reference clothing_categories.id
**And** NOT NULL constraint should be maintained

### Requirement: API category ID handling

The clothing API MUST accept and return category IDs instead of category names.

#### Scenario: GET clothing with category filter uses ID

**Given** the API receives a GET request
**When** the query parameter `category` is present (e.g., `?category=1`)
**Then** the API should filter by category_id=1
**And** results should include category name for display

#### Scenario: POST clothing accepts category ID

**Given** the API receives a POST request to create clothing
**When** the form data includes a category field with an ID
**Then** the API should validate the category ID exists for the user
**And** the clothing item should be created with the category_id

#### Scenario: POST clothing returns category info

**Given** the API creates a clothing item
**When** the request is successful
**Then** the response should include the clothing item with category_id
**And** the response should include the category name for display

### Requirement: Display Clothing Item Additional Info

The clothing item listing page MUST display additional information about each item including description and price when available.

#### Scenario: Display Clothing Item with Description and Price

**Given** a clothing item exists with name "Blue Shirt", description "A comfortable cotton shirt", and price 29.99
**When** the user views the clothing list page
**Then** the item card should display the description (possibly truncated if too long)
**And** the item card should display the price "¥29.99" or "$29.99"
**And** the description and price should be visually distinct from the item name

#### Scenario: Display Clothing Item without Optional Fields

**Given** a clothing item exists with only name and category (no description or price)
**When** the user views the clothing list page
**Then** the item card should display normally without showing empty description or price
**And** the layout should remain consistent with items that have additional fields

#### Scenario: Responsive Display of Additional Info

**Given** a clothing item has description and price
**When** the user views the clothing list on a mobile device (width < 640px)
**Then** the description should be displayed with appropriate length limit (e.g., 50 characters)
**And** all information should remain legible and properly spaced

