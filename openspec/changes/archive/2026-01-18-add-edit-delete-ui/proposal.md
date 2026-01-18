# Proposal: Add Edit and Delete UI for Clothing and Outfits

## Summary

Add user interface components for editing and deleting clothing items and outfits. Users will be able to click on a clothing item or outfit card to navigate to a detail/edit page where they can view full details, edit information, or delete the item.

## Motivation

Currently, the backend API supports editing and deleting clothing items and outfits (via PUT and DELETE endpoints), but there is no user interface for these operations. Users can only view items in the list and create new ones, but cannot modify or delete existing items.

This change will enable users to:

1. View detailed information about a clothing item or outfit
2. Edit item properties (name, description, price, category, etc.)
3. Delete items with confirmation
4. Access these features through an intuitive card-click interaction

## Background

### Current State

- **API Layer**: Fully implemented with GET, PUT, DELETE for both clothing and outfits (`/api/clothing/[id]` and `/api/outfits/[id]`)
- **Spec Requirements**: The specifications already include requirements for:
  - Clothing Item Editing (`clothing-management:185`)
  - Clothing Item Deletion (`clothing-management:202`)
  - Outfit Editing (`outfit-management:103`)
  - Outfit Deletion (`outfit-management:135`)
- **UI Layer**:
  - List pages exist (`/clothing/page.tsx`, `/outfits/page.tsx`)
  - Cards display basic information but are not clickable
  - No detail/edit pages exist (`/clothing/[id]/page.tsx`, `/outfits/[id]/page.tsx`)

### Existing Specifications

The following requirements already exist in the specifications but lack UI implementation:

**Clothing Management**:

- `Requirement: Clothing Item Details` (line 173)
- `Requirement: Clothing Item Editing` (line 185)
- `Requirement: Clothing Item Deletion` (line 202)

**Outfit Management**:

- `Requirement: Outfit Details` (line 83)
- `Requirement: Outfit Editing` (line 103)
- `Requirement: Outfit Deletion` (line 135)

## Proposed Changes

### 1. Create Clothing Detail/Edit Page

Create `/clothing/[id]/page.tsx` with the following features:

- Display full-size image and all item details
- Edit form with fields for name, category, description, price, purchase date
- Image upload capability (optional)
- Delete button with confirmation dialog
- "Save Changes" and "Cancel" buttons

### 2. Create Outfit Detail/Edit Page

Create `/outfits/[id]/page.tsx` with the following features:

- Display outfit name, description, and all clothing items
- Edit form for outfit name and description
- Clothing item selection interface (add/remove items)
- Delete button with confirmation dialog
- "Save Changes" and "Cancel" buttons

### 3. Update List Pages

- Make clothing and outfit cards clickable
- Wrap cards with `<Link>` components to navigate to detail pages
- Add visual hover effects to indicate interactivity

### 4. Enhance Specifications

Add UI-specific scenarios to existing requirements to detail the user interaction flow.

## Scope

### In Scope

1. Creation of clothing detail/edit page at `/clothing/[id]/page.tsx`
2. Creation of outfit detail/edit page at `/outfits/[id]/page.tsx`
3. Modification of list pages to add navigation links
4. Addition of UI-specific scenarios to specifications

### Out of Scope

1. Backend API changes (already implemented)
2. Image editing (cropping, filters, etc.)
3. Bulk editing or deletion
4. Undo/redo functionality
5. Versioning or history tracking

## Design Considerations

### User Experience

- **Card Navigation**: Cards should have a clear hover effect to indicate they are clickable
- **Edit Mode**: The detail page will combine viewing and editing in a single interface for simplicity
- **Confirmation**: Delete operations require user confirmation to prevent accidental deletions
- **Validation**: Form inputs should validate on submit and display appropriate error messages

### Error Handling

- Handle cases where items don't exist (404)
- Handle cases where users try to edit/delete items that don't belong to them (403/404)
- Handle cases where clothing items are used in outfits (prevent deletion with clear message)

### Technical Implementation

- Use Next.js App Router dynamic routes (`[id]`)
- Reuse existing API endpoints (GET, PUT, DELETE)
- Follow existing component patterns and styling (Tailwind CSS)
- Maintain user data isolation (already enforced by API)

## Alternatives Considered

### Alternative 1: Separate View and Edit Pages

Create separate `/clothing/[id]/view` and `/clothing/[id]/edit` pages.

**Pros**: Cleaner separation of concerns
**Cons**: More code duplication, extra navigation steps for users

**Decision**: Not chosen - single page approach is simpler for users

### Alternative 2: Inline Editing on List Page

Add edit/delete buttons directly on cards in the list page.

**Pros**: Fewer pages, faster access
**Cons**: Limited space for forms, cluttered interface, poor mobile experience

**Decision**: Not chosen - detail page provides better UX for editing complex items

### Alternative 3: Modal/Popup for Editing

Open a modal when clicking a card to edit.

**Pros**: Stays on list page
**Cons**: More complex state management, poor mobile UX, harder to implement with Next.js

**Decision**: Not chosen - dedicated page is simpler and more reliable

## Open Questions

None - the requirements are clear and the implementation path is straightforward.

## Related Issues

None - this is a feature addition to complete the CRUD operations for clothing and outfit management.

## Success Criteria

1. Users can click on a clothing item card to view and edit details
2. Users can click on an outfit card to view and edit details
3. Users can delete clothing items with confirmation
4. Users can delete outfits with confirmation
5. All form validations work correctly
6. Error messages are clear and helpful
7. The UI is consistent with existing design patterns
8. Mobile experience is responsive and usable
