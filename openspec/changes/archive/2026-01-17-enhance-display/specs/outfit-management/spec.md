# outfit-management Specification Delta

## ADDED Requirements

### Requirement: Outfit Name Input During Creation

The outfit creation form MUST provide a text input field for users to enter the outfit name.

#### Scenario: User Enters Outfit Name

**Given** the user is on the outfit creation page
**When** the user enters "Summer Casual" in the name input field
**Then** the input value should be displayed
**And** the input field should allow up to a reasonable length (e.g., 100 characters)
**And** the name should be validated to ensure it is not empty when submitting

#### Scenario: Name Field Validation

**Given** the user is on the outfit creation page
**When** the user attempts to submit the form without entering a name
**Then** validation should fail
**And** an error message should indicate that the outfit name is required
**And** the outfit should not be created

#### Scenario: Submit with Valid Name

**Given** the user is on the outfit creation page
**When** the user enters a valid name "Weekend Brunch", selects clothing items, and submits
**Then** the outfit should be created with the provided name
**And** the outfit should appear in the list with the correct name

### Requirement: Display Clothing Item Details in Outfit List

The outfit list page MUST display detailed information about each clothing item in the outfit, including category and price when available.

#### Scenario: Display Clothing Item Category

**Given** an outfit contains a top item named "Blue T-Shirt" with category "上装"
**When** the user views the outfit list page
**Then** the outfit card should display "上装" as the category label for that item
**And** the category should be clearly visible under or near the item thumbnail

#### Scenario: Display Clothing Item Price

**Given** an outfit contains pants item named "Jeans" with price 89.00
**When** the user views the outfit list page
**Then** the outfit card should display "¥89.00" or "$89.00" for that item
**And** the price should be visually distinct but not distracting

#### Scenario: Display Multiple Clothing Items with Full Details

**Given** an outfit contains a top ("Blue T-Shirt", category: "上装", price: 29.99), pants ("Jeans", category: "下装", price: 89.00), and shoes ("Sneakers", category: "鞋子", price: 129.00)
**When** the user views the outfit list page
**Then** all three items should be displayed with their respective categories
**And** all three items should display their prices
**And** the information should be organized in a clear, scannable layout

## MODIFIED Requirements

### Requirement: Outfit Creation

The system MUST allow users to create outfit combinations by selecting multiple clothing items and providing a name.

#### Scenario: Create Outfit with Clothing Items and Name

**Given** the user is on the outfit creation page
**When** the user enters a name, selects 2 or more clothing items, and submits
**Then** an outfit should be created with a unique ID
**And** the outfit should have the provided name
**And** the selected clothing items should be associated with the outfit
**And** the outfit should appear in the outfit list with the correct name

### Requirement: Outfit Listing

The system MUST allow users to view all their created outfits with detailed clothing information.

#### Scenario: View All Outfits with Details

**Given** the user has created multiple outfits
**When** the user navigates to the outfit list page
**Then** all outfits should be displayed
**And** each outfit card should show the outfit name and description (if present)
**And** each outfit card should show clothing item thumbnails with their names, categories, and prices
**And** outfits should be ordered by creation date (newest first)

#### Scenario: Outfit Item Details Display

**Given** an outfit contains multiple clothing items
**When** the outfit list is displayed
**Then** a preview should show thumbnails of the clothing items
**And** each item should display its name, category, and price (if available)
**And** up to 4 items should be fully visible in the preview
**And** if more than 4 items exist, a "+X more" indicator should be shown
