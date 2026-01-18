# outfit-management Specification Delta

## ADDED Requirements

### Requirement: Category Filter in Outfit Clothing Selection

The system MUST allow users to filter clothing items by category when selecting items for outfits.

#### Scenario: Display Category Filters in Outfit Creation

**Given** the user is on the outfit creation page
**When** the clothing selection interface loads
**Then** a filter bar should be displayed with category buttons
**And** the filter bar should include an "全部" (All) button
**And** the filter bar should include buttons for each user category
**And** the "全部" button should be active by default

#### Scenario: Filter Clothing Items by Category in Outfit Creation

**Given** the user is on the outfit creation page
**When** the user clicks a category filter button
**Then** only clothing items in that category should be displayed
**And** the selected filter should be highlighted
**And** any previously selected clothing items should remain selected

#### Scenario: Clear Category Filter in Outfit Creation

**Given** the user has selected a category filter
**When** the user clicks the "全部" button
**Then** all clothing items should be displayed again
**And** any previously selected clothing items should remain selected

#### Scenario: Display Category Filters in Outfit Editing

**Given** the user is on the outfit editing page
**When** the clothing selection interface loads
**Then** a filter bar should be displayed with category buttons
**And** the filter bar should include an "全部" (All) button
**And** the filter bar should include buttons for each user category
**And** the "全部" button should be active by default

#### Scenario: Filter Clothing Items by Category in Outfit Editing

**Given** the user is on the outfit editing page
**When** the user clicks a category filter button
**Then** only clothing items in that category should be displayed
**And** the selected filter should be highlighted
**And** any previously selected clothing items should remain selected

#### Scenario: Clear Category Filter in Outfit Editing

**Given** the user has selected a category filter
**When** the user clicks the "全部" button
**Then** all clothing items should be displayed again
**And** any previously selected clothing items should remain selected

#### Scenario: Selected Items Persist When Filtering

**Given** the user has selected clothing items across multiple categories
**When** the user changes the category filter
**Then** the previously selected items should remain selected
**And** the selection count should reflect all selected items
**And** items not visible in the current filter should still be counted as selected

#### Scenario: Empty Category Display

**Given** the user selects a category with no clothing items
**When** the category filter is applied
**Then** an empty state message should be displayed
**And** the message should indicate no items exist in this category
