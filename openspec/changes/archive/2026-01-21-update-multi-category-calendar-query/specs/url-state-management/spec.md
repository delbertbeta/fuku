## MODIFIED Requirements

### Requirement: State persistence across page refresh

The application SHALL maintain navigation state when the user refreshes the page.

#### Scenario: User refreshes on calendar with month in query

**Given** the user is on the calendar tab
**And** the URL is `/calendar?date=2025-03`
**When** the user refreshes the page
**Then** the browser should stay on `/calendar?date=2025-03`
**And** the calendar should display March 2025

## ADDED Requirements

### Requirement: Calendar month via query parameters

The application SHALL store the current calendar month in the URL query parameter `date`.

#### Scenario: User changes calendar month

**Given** the user is viewing the calendar
**When** the user navigates to the next or previous month
**Then** the browser URL should change to `/calendar?date=YYYY-MM`
**And** the calendar should display the selected month

#### Scenario: User uses browser back button in calendar

**Given** the user navigated from `/calendar?date=2025-03` to `/calendar?date=2025-04`
**When** the user clicks the browser back button
**Then** the browser URL should change to `/calendar?date=2025-03`
**And** the calendar should display March 2025
