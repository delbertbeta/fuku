## MODIFIED Requirements

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

## ADDED Requirements

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
