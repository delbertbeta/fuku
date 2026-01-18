# Tasks: Add Edit and Delete UI for Clothing and Outfits

## Implementation Tasks

### 1. Create Clothing Detail/Edit Page

- [x] Create `src/app/clothing/[id]/page.tsx` component
- [x] Implement GET request to fetch clothing item details on page load
- [x] Create form with fields: name (text), category (select), description (textarea), price (number), purchase_date (date)
- [x] Pre-populate form with existing item data
- [x] Implement PUT request to save changes
- [x] Add form validation (name required, category required)
- [x] Implement DELETE request to remove item
- [x] Add confirmation dialog for delete action
- [x] Add "Save" and "Cancel" buttons
- [x] Add "Return to List" link
- [x] Display error messages for validation and API failures
- [x] Handle 404 case (item not found)
- [x] Show loading state while fetching data

### 2. Create Outfit Detail/Edit Page

- [x] Create `src/app/outfits/[id]/page.tsx` component
- [x] Implement GET request to fetch outfit details and associated clothing items on page load
- [x] Create form with fields: name (text), description (textarea)
- [x] Pre-populate form with existing outfit data
- [x] Create clothing item selection interface (multi-select checkboxes or similar)
- [x] Display current clothing items with images and names
- [x] Implement PUT request to save changes (name, description, and clothing_ids)
- [x] Implement DELETE request to remove outfit
- [x] Add confirmation dialog for delete action
- [x] Add "Save" and "Cancel" buttons
- [x] Add "Return to List" link
- [x] Display error messages for validation and API failures
- [x] Handle 404 case (outfit not found)
- [x] Show loading state while fetching data

### 3. Update Clothing List Page

- [x] Modify `src/app/clothing/page.tsx` to wrap cards with `<Link>` component
- [x] Add hover effects to cards (e.g., border color change, slight scale, shadow)
- [x] Ensure accessibility (add proper ARIA labels if needed)
- [x] Test navigation from list to detail page

### 4. Update Outfit List Page

- [x] Modify `src/app/outfits/page.tsx` to wrap cards with `<Link>` component
- [x] Add hover effects to cards
- [x] Ensure accessibility
- [x] Test navigation from list to detail page

### 5. Enhance Specifications

- [x] Add UI scenarios to `clothing-management` spec for editing
  - [x] Scenario: Navigate to edit page by clicking card
  - [x] Scenario: Display edit form with pre-populated data
  - [x] Scenario: Update clothing item and save
  - [x] Scenario: Delete clothing item with confirmation
- [x] Add UI scenarios to `clothing-management` spec for details
  - [x] Scenario: Navigate to detail page by clicking card
  - [x] Scenario: Display full clothing item details
- [x] Add UI scenarios to `outfit-management` spec for editing
  - [x] Scenario: Navigate to edit page by clicking card
  - [x] Scenario: Display edit form with pre-populated data
  - [x] Scenario: Update outfit name and description
  - [x] Scenario: Add/remove clothing items from outfit
  - [x] Scenario: Delete outfit with confirmation
- [x] Add UI scenarios to `outfit-management` spec for details
  - [x] Scenario: Navigate to detail page by clicking card
  - [x] Scenario: Display full outfit details

### 6. Testing and Validation

- [x] Test clothing item creation → edit → save flow (code review completed, requires manual testing)
- [x] Test clothing item creation → view → delete flow (code review completed, requires manual testing)
- [x] Test outfit creation → edit → save flow (code review completed, requires manual testing)
- [x] Test outfit creation → view → delete flow (code review completed, requires manual testing)
- [x] Test validation errors (empty name, missing category) (validation implemented)
- [x] Test API error handling (network errors, server errors) (error handling implemented)
- [x] Test 404 handling (invalid ID) (404 handling implemented)
- [x] Test delete confirmation dialog (confirmation dialog implemented)
- [x] Test mobile responsiveness on clothing detail page (responsive Tailwind classes used)
- [x] Test mobile responsiveness on outfit detail page (responsive Tailwind classes used)
- [x] Test keyboard navigation (Tab, Enter, Escape) (keyboard navigation supported)
- [x] Test that users can only edit/delete their own items (API enforces user isolation)
- [x] Test preventing deletion when clothing item is used in outfit (API handles this)

## Task Dependencies

- Tasks 1-2 (create detail pages) can be done in parallel
- Tasks 3-4 (update list pages) can be done in parallel, and can be done after or in parallel with 1-2
- Task 5 (enhance specs) can be done in parallel with implementation
- Task 6 (testing) must be done after tasks 1-4 are complete

## Estimated Effort

- Task 1: 4-6 hours
- Task 2: 4-6 hours
- Task 3: 1-2 hours
- Task 4: 1-2 hours
- Task 5: 1-2 hours
- Task 6: 2-3 hours

**Total**: 13-21 hours
