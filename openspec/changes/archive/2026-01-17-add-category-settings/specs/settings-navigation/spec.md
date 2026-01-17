# Spec Delta: Settings Navigation

## ADDED Requirements

### Requirement: Settings Tab Navigation

The system MUST provide a settings tab in the main application navigation.

#### Scenario: Access Settings Tab

**Given** the user is logged in and on the main page
**When** the user clicks the "设置" button in the navigation
**Then** the settings view should be displayed
**And** the "设置" tab should be highlighted as active

#### Scenario: Settings Tab in Top Navigation (Desktop)

**Given** the user is on a desktop viewport (width >= 768px)
**When** the main page is rendered
**Then** the top navigation should display three tabs: "服装", "穿搭", "设置"
**And** the tabs should be evenly spaced
**And** the active tab should be visually distinguished

#### Scenario: Settings Tab in Bottom Navigation (Mobile)

**Given** the user is on a mobile viewport (width < 768px)
**When** the main page is rendered
**Then** the bottom navigation should display three tabs: "服装", "穿搭", "设置"
**And** each tab should take equal width
**And** the active tab should be visually distinguished with a different color

### Requirement: Settings View Layout

The settings view MUST display category management in a clean, organized layout.

#### Scenario: Settings View Header

**Given** the user navigates to the settings tab
**When** the settings view is rendered
**Then** a page title "设置" should be displayed
**And** the title should be consistent with other tabs' styling

#### Scenario: Category Management Section

**Given** the user is on the settings tab
**When** the settings view is rendered
**Then** a "衣物品类" (Clothing Categories) section should be displayed
**And** the section should have a clear heading
**And** the section should display all user categories

#### Scenario: Add Category Form

**Given** the user is on the settings tab
**When** the settings view is rendered
**Then** an "添加品类" (Add Category) form should be visible
**And** the form should include:

- A text input for category name
- A submit button labeled "添加"
  **And** the form should be positioned above the category list

### Requirement: Settings Tab Accessibility

The settings tab navigation MUST be accessible and usable with keyboard navigation.

#### Scenario: Keyboard Navigation

**Given** the user is on the main page
**When** the user tabs through the navigation
**Then** the focus should move sequentially through "服装", "穿搭", "设置"
**And** pressing Enter on a focused tab should activate it
**And** the active tab should be visually indicated for screen readers

#### Scenario: Touch Targets

**Given** the user is on a mobile device
**When** the settings tab is displayed
**Then** the tab should have a minimum touch target size of 44x44 pixels
**And** the tap area should be clearly defined
**And** visual feedback should be provided on tap

### Requirement: Settings Tab Responsiveness

The settings tab MUST work consistently across different screen sizes.

#### Scenario: Desktop Layout

**Given** the user is on a desktop viewport (width >= 1024px)
**When** the settings view is displayed
**Then** the content should be centered with maximum width
**And** the category list should use a clean table or list layout
**And** spacing should be optimized for mouse interaction

#### Scenario: Mobile Layout

**Given** the user is on a mobile viewport (width < 640px)
**When** the settings view is displayed
**Then** the content should use full screen width
**And** the category list should use a compact, touch-friendly layout
**And** spacing should be optimized for touch interaction
