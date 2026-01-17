# Spec: Clothing Management

## ADDED Requirements

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

Clothing items MUST be categorized into one of the predefined types.

#### Scenario: Category Selection

**Given** the user is creating a clothing item
**When** the user selects "top" as the category
**Then** the category should be saved as "top"
**And** the item should be filterable by the "top" category

#### Scenario: Valid Categories Only

**Given** the user is on the clothing creation form
**When** the category options are displayed
**Then** only the following options should be available: "top", "jacket", "pants", "shoes"
**And** no other categories should be selectable

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

### Requirement: Clothing Item Listing

The system MUST allow users to view a list of their clothing items.

#### Scenario: View All Clothing Items

**Given** the user has created multiple clothing items
**When** the user navigates to the clothing list page
**Then** all clothing items should be displayed
**And** each item should show the image, name, and category
**And** items should be ordered by creation date (newest first)

#### Scenario: Filter by Category

**Given** the user has clothing items in multiple categories
**When** the user selects the "top" category filter
**Then** only clothing items with category "top" should be displayed
**And** the filter indicator should be visible

#### Scenario: Clear Category Filter

**Given** the user has filtered clothing items by category
**When** the user clears the filter
**Then** all clothing items should be displayed again

### Requirement: Clothing Item Details

The system MUST allow users to view detailed information about a specific clothing item.

#### Scenario: View Clothing Details

**Given** a clothing item exists with name "Blue Shirt", category "top", price "$29.99", and purchase date "2024-01-15"
**When** the user navigates to the clothing item detail page
**Then** the full-size image should be displayed
**And** the name, category, price, and purchase date should be shown
**And** the description should be displayed if present

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
