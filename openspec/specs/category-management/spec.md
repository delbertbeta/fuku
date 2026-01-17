# category-management Specification

## Purpose
TBD - created by archiving change add-category-settings. Update Purpose after archive.
## Requirements
### Requirement: Category Data Model

The system MUST store clothing categories with user isolation and system/user distinction.

#### Scenario: Create Category Table

**Given** the database is initialized
**When** the clothing_categories table is created
**Then** it should have the following columns:

- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- user_id (INTEGER NOT NULL, references users(id))
- name (TEXT NOT NULL)
- is_system (BOOLEAN DEFAULT FALSE)
- created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
- updated_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
  **And** there should be a unique constraint on (user_id, name)
  **And** there should be an index on user_id

#### Scenario: Seed Default Categories

**Given** a new user is created
**When** the user's account is initialized
**Then** the following system categories should be created:

- "上衣" (top) with is_system = TRUE
- "外套" (jacket) with is_system = TRUE
- "下装" (pants) with is_system = TRUE
- "鞋子" (shoes) with is_system = TRUE
- "未分类" (uncategorized) with is_system = TRUE

### Requirement: Category Listing

The system MUST allow users to list all their clothing categories.

#### Scenario: List All Categories

**Given** the user is logged in
**When** the user fetches the categories list
**Then** all categories for the current user should be returned
**And** each category should include: id, name, is_system
**And** categories should be ordered by name alphabetically
**And** only the current user's categories should be visible

### Requirement: Category Creation

The system MUST allow users to create new custom clothing categories.

#### Scenario: Create New Category

**Given** the user is on the settings category management page
**When** the user enters "配饰" as the category name and submits
**Then** a new category should be created
**And** the category should have is_system = FALSE
**And** the category should appear in the category list
**And** the category should be available in the clothing creation form

#### Scenario: Prevent Duplicate Category Name

**Given** the user already has a category named "上衣"
**When** the user attempts to create another category named "上衣"
**Then** the creation should fail
**And** an error message should indicate the category name already exists
**And** no new category should be created

#### Scenario: Validate Category Name

**Given** the user is creating a new category
**When** the user submits an empty or whitespace-only name
**Then** the creation should fail
**And** an error message should indicate a valid name is required
**And** no new category should be created

### Requirement: Category Deletion

The system MUST allow users to delete custom categories with proper safeguards.

#### Scenario: Delete Unused Category

**Given** a custom category "配饰" exists with no associated clothing items
**When** the user deletes the category and confirms
**Then** the category should be removed from the database
**And** the category should no longer appear in any UI
**And** a success message should be displayed

#### Scenario: Delete Category With Associated Items

**Given** a custom category "配饰" exists with 5 clothing items
**When** the user deletes the category
**Then** a warning should be displayed indicating 5 items will be moved to "未分类"
**And** upon confirmation, all 5 items should have their category set to "未分类"
**And** the category should be removed from the database
**And** the items should still be visible in the clothing list under "未分类"

#### Scenario: Prevent Deletion of System Categories

**Given** the user has system categories (上衣, 外套, 下装, 鞋子, 未分类)
**When** the user attempts to delete a system category
**Then** the deletion should be prevented
**And** an error message should indicate system categories cannot be deleted
**And** the category should remain in the database

#### Scenario: Prevent Deletion of Uncategorized Category

**Given** the "未分类" category exists
**When** the user attempts to delete the "未分类" category
**Then** the deletion should be prevented
**And** an error message should indicate this category is required
**And** the category should remain in the database

### Requirement: Category Migration

The system MUST automatically migrate clothing items when their category is deleted.

#### Scenario: Migrate Items on Category Deletion

**Given** a custom category "配饰" has 3 clothing items
**When** the category is deleted
**Then** all 3 clothing items should be updated to have category = "未分类"
**And** the update should happen in a single transaction
**And** all items should be successfully migrated

#### Scenario: Migration Failure Handling

**Given** a custom category "配饰" has clothing items
**When** the category deletion is attempted but the migration fails
**Then** the entire operation should be rolled back
**And** the category should remain in the database
**And** no items should be modified
**And** an error message should be displayed

### Requirement: Category Validation in Clothing Creation

The system MUST validate that clothing items use valid categories.

#### Scenario: Validate Existing Category

**Given** the user has categories "上衣", "外套", "配饰"
**When** the user creates a clothing item with category "配饰"
**Then** the clothing item should be created successfully
**And** the category should be saved as "配饰"

#### Scenario: Reject Invalid Category

**Given** the user has categories "上衣", "外套"
**When** the user attempts to create a clothing item with category "不存在的分类"
**Then** the creation should fail
**And** an error message should indicate the category is invalid
**And** the clothing item should not be created

### Requirement: Category Display in UI

The system MUST display categories consistently across the application.

#### Scenario: Display Categories in Clothing Form

**Given** the user has categories "上衣", "外套", "配饰", "未分类"
**When** the clothing creation form is rendered
**Then** all user categories should be displayed in the category dropdown
**And** categories should be ordered alphabetically
**And** "未分类" should be included as an option

#### Scenario: Display Category Filters

**Given** the user has categories "上衣", "外套", "配饰", "未分类"
**When** the clothing list is displayed
**Then** filter buttons should be generated for each category
**And** filters should be ordered alphabetically
**And** an "全部" (All) filter should be included
**And** clicking a category filter should show only items in that category

