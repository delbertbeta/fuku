## MODIFIED Requirements

### Requirement: Category Deletion

The system MUST allow users to delete custom categories with proper safeguards.

#### Scenario: Delete Category With Associated Items

**Given** a custom category "配饰" exists with 5 clothing items
**When** the user deletes the category
**Then** a warning should be displayed indicating 5 items will be moved to "未分类"
**And** upon confirmation, all 5 items should be associated with "未分类"
**And** the category should be removed from the database
**And** the items should still be visible in the clothing list under "未分类"

### Requirement: Category Migration

The system MUST automatically migrate clothing items when their category is deleted.

#### Scenario: Migrate Items on Category Deletion

**Given** a custom category "配饰" has 3 clothing items
**When** the category is deleted
**Then** all 3 clothing items should be associated with "未分类"
**And** the update should happen in a single transaction
**And** all items should be successfully migrated

#### Scenario: Migration Failure Handling

**Given** a custom category "配饰" has clothing items
**When** the category deletion is attempted but the migration fails
**Then** the entire operation should be rolled back
**And** the category should remain in the database
**And** no items should be modified
**And** an error message should be displayed
