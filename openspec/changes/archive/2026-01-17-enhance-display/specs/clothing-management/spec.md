# clothing-management Specification Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Clothing Item Listing

The system MUST allow users to view a list of their clothing items with comprehensive information.

#### Scenario: View All Clothing Items

**Given** the user has created multiple clothing items with various attributes
**When** the user navigates to the clothing list page
**Then** all clothing items should be displayed
**And** each item should show the image, name, category, description (if present), and price (if present)
**And** items should be ordered by creation date (newest first)
