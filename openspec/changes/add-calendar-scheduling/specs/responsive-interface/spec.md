## MODIFIED Requirements

### Requirement: Responsive Navigation

Navigation MUST adapt to the device and screen size.

#### Scenario: Bottom Tab Bar (Mobile)

**Given** the user is on a mobile device
**When** the main navigation is displayed
**Then** navigation should be a bottom tab bar
**And** there should be tabs for "Clothing", "Outfits", and "Calendar"
**And** active tab should be visually distinguished

#### Scenario: Top Navigation (Desktop)

**Given** the user is on a desktop device
**When** the main navigation is displayed
**Then** navigation should be a top navigation bar
**And** there should be navigation links for "Clothing", "Outfits", and "Calendar"
**And** user profile/logout options should be accessible

#### Scenario: Navigation Consistency

**Given** the user is on any device
**When** navigating between pages
**Then** the current page/section should be clearly indicated
**And** navigation should be consistent across all pages
**And** back navigation should be available from detail pages
