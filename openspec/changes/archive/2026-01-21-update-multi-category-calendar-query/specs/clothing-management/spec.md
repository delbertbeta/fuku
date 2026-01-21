## MODIFIED Requirements

### Requirement: Clothing Item Categories

Clothing items MUST be associated with one or more categories via a join table between clothing items and clothing categories.

#### Scenario: Create clothing with multiple category IDs

**Given** the user is on the clothing creation form
**When** the user selects category IDs 1 and 3
**Then** the clothing item should be created successfully
**And** the clothing item should have associations for category_id=1 and category_id=3

#### Scenario: Category ID validation

**Given** the user is creating a clothing item
**When** the user submits a form with an invalid category ID
**Then** validation should fail
**And** an appropriate error message should be returned
**And** the clothing item should not be created

### Requirement: Clothing Item Filtering

Clothing items MUST be filterable by category ID using the clothing-category associations.

#### Scenario: Filter clothing by category ID

**Given** the user is on the clothing list page
**When** the API is called with `?category=1`
**Then** only clothing items associated with category_id=1 should be returned
**And** results should include the primary category name for display

#### Scenario: Get all clothing without filter

**Given** the user is on the clothing list page
**When** the API is called without category parameter
**Then** all clothing items should be returned
**And** results should include category names for each item

## ADDED Requirements

### Requirement: Clothing Item Category Display

The clothing item list and detail views MUST display all associated category names.

#### Scenario: Display clothing item with multiple categories

**Given** a clothing item is associated with categories "上衣" and "外套"
**When** the user views the clothing list or detail page
**Then** both category names should be displayed
**And** the categories should be visually distinct
