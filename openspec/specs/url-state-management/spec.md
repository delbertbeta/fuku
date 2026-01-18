# url-state-management Specification

## Purpose

TBD - created by archiving change add-client-side-routing. Update Purpose after archive.

## Requirements

### Requirement: Tab navigation via URL paths

The application SHALL use URL path segments to represent the active tab.

#### Scenario: User navigates to clothing tab

**Given** the user is on the main application
**When** the user clicks the "服装" (Clothing) tab
**Then** the browser URL should change to `/clothing`
**And** the clothing list should be displayed
**And** the navigation should show the clothing tab as active

#### Scenario: User navigates to outfits tab

**Given** the user is on the main application
**When** the user clicks the "穿搭" (Outfits) tab
**Then** the browser URL should change to `/outfits`
**And** the outfits list should be displayed
**And** the navigation should show the outfits tab as active

#### Scenario: User navigates to settings tab

**Given** the user is on the main application
**When** the user clicks the "设置" (Settings) tab
**Then** the browser URL should change to `/settings`
**And** the settings page should be displayed
**And** the navigation should show the settings tab as active

### Requirement: Secondary pages via URL paths

The application SHALL use URL path segments for secondary pages like forms.

#### Scenario: User navigates to add clothing form

**Given** the user is on the clothing tab
**When** the user clicks the "添加服装" (Add Clothing) button
**Then** the browser URL should change to `/clothing/new`
**And** the add clothing form should be displayed
**And** a back button should link to `/clothing`

#### Scenario: User navigates to create outfit form

**Given** the user is on the outfits tab
**When** the user clicks the "创建穿搭" (Create Outfit) button
**Then** the browser URL should change to `/outfits/new`
**And** the create outfit form should be displayed
**And** a back button should link to `/outfits`

### Requirement: Filter state via query parameters

The application SHALL use URL query parameters with category IDs for filter states.

#### Scenario: User filters clothing by category

**Given** the user is on the clothing list page
**When** the user clicks a category filter button (e.g., "上衣" with ID 1)
**Then** the browser URL should change to `/clothing?category=1`
**And** only clothing items with category_id=1 should be displayed
**And** the category filter button should show as active

#### Scenario: User clears category filter

**Given** the user has filtered clothing by category
**When** the user clicks the "全部" (All) button
**Then** the browser URL should change to `/clothing`
**And** all clothing items should be displayed
**And** no category should be selected

### Requirement: State persistence across page refresh

The application SHALL maintain navigation state when the user refreshes the page.

#### Scenario: User refreshes on clothing tab

**Given** the user is on the clothing tab
**When** the user refreshes the page
**Then** the browser should stay on `/clothing`
**And** the clothing list should be displayed
**And** the clothing tab should remain active

#### Scenario: User refreshes on clothing list with filter

**Given** the user has filtered clothing by category ID 2 (e.g., "外套")
**And** the URL is `/clothing?category=2`
**When** the user refreshes the page
**Then** the browser should stay on `/clothing?category=2`
**And** only clothing items with category_id=2 should be displayed
**And** the category filter button should remain active

#### Scenario: User refreshes on add clothing form

**Given** the user is on the add clothing form
**And** the URL is `/clothing/new`
**When** the user refreshes the page
**Then** the browser should stay on `/clothing/new`
**And** the add clothing form should be displayed

### Requirement: Root page redirect

The root page SHALL redirect authenticated users to the default tab.

#### Scenario: User visits root URL

**Given** the user is authenticated
**When** the user navigates to `/`
**Then** the browser should redirect to `/clothing`
**And** the clothing list should be displayed

### Requirement: Back and forward navigation

The application SHALL support browser back and forward navigation buttons.

#### Scenario: User uses browser back button

**Given** the user navigated from `/clothing` to `/clothing/new`
**When** the user clicks the browser back button
**Then** the browser URL should change to `/clothing`
**And** the clothing list should be displayed

#### Scenario: User uses browser forward button

**Given** the user navigated from `/clothing` to `/outfits` then clicked back
**When** the user clicks the browser forward button
**Then** the browser URL should change to `/outfits`
**And** the outfits list should be displayed

### Requirement: Direct URL access

The application SHALL support direct navigation to any URL path.

#### Scenario: User bookmarks and revisits outfits page

**Given** the user bookmarks `/outfits`
**When** the user later clicks the bookmark
**Then** the browser should navigate to `/outfits`
**And** the outfits list should be displayed
**And** the outfits tab should be active

#### Scenario: User directly navigates to add clothing form

**Given** the user types `/clothing/new` in the address bar
**When** the user navigates to that URL
**Then** the add clothing form should be displayed
**And** the user should be able to submit the form

### Requirement: Navigation component behavior

The navigation component SHALL use Next.js Link components for navigation and determine active state from the URL path.

#### Scenario: Desktop navigation displays active tab

**Given** the user is on a desktop device
**And** the current URL is `/outfits`
**When** the navigation renders
**Then** the "穿搭" (Outfits) tab should have the active styling
**And** other tabs should have inactive styling
**And** clicking any tab should use Next.js Link navigation

#### Scenario: Mobile navigation displays active tab

**Given** the user is on a mobile device
**And** the current URL is `/settings`
**When** the mobile navigation renders
**Then** the "设置" (Settings) tab should have the active styling
**And** other tabs should have inactive styling
**And** clicking any tab should use Next.js Link navigation

### Requirement: Form submission redirects

The application SHALL redirect to the appropriate list page after successful form submission.

#### Scenario: User submits clothing form successfully

**Given** the user is on `/clothing/new`
**When** the user successfully submits the clothing form
**Then** the browser should redirect to `/clothing`
**And** the clothing list should be displayed with the new item

#### Scenario: User submits outfit form successfully

**Given** the user is on `/outfits/new`
**When** the user successfully submits the outfit form
**Then** the browser should redirect to `/outfits`
**And** the outfits list should be displayed with the new outfit

### Requirement: Shared layout components

The application SHALL use shared layout components for header and navigation across all pages.

#### Scenario: Header is displayed on all pages

**Given** the user is on any authenticated page (e.g., `/clothing`, `/outfits`, `/settings`)
**When** the page renders
**Then** the header should be displayed
**And** the header should show the "Fuku" title
**And** the header should show the "退出登录" (Logout) button

#### Scenario: Navigation is consistent across pages

**Given** the user is on any authenticated page
**When** the page renders
**Then** the navigation should be displayed
**And** the navigation should be consistent in structure
**And** the active tab should reflect the current URL path
