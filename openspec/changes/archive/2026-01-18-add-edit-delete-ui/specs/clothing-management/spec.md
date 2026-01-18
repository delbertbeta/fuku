# clothing-management Specification Delta

## MODIFIED Requirements

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
