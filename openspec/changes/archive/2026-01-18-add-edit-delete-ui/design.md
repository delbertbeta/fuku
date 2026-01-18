# Design: Add Edit and Delete UI for Clothing and Outfits

## Overview

This design document details the implementation approach for adding edit and delete capabilities to the clothing and outfit management user interface.

## Architecture

### Page Structure

```
/clothing/
  ├── page.tsx           (list page - update to add links)
  └── [id]/              (new)
      └── page.tsx       (detail/edit page - new)

/outfits/
  ├── page.tsx           (list page - update to add links)
  └── [id]/              (new)
      └── page.tsx       (detail/edit page - new)
```

### Component Architecture

**Clothing Detail/Edit Page**:

- Main component: `ClothingDetailPage` (server component or client component based on interactivity)
- Sub-components (optional, for code organization):
  - `ClothingForm`: Form with input fields
  - `DeleteConfirmDialog`: Modal for delete confirmation

**Outfit Detail/Edit Page**:

- Main component: `OutfitDetailPage`
- Sub-components (optional):
  - `OutfitForm`: Form for name and description
  - `ClothingSelector`: Multi-select interface for clothing items
  - `DeleteConfirmDialog`: Modal for delete confirmation

## Data Flow

### Loading a Clothing Item for Edit

```
User clicks card
  → Navigate to /clothing/[id]
  → GET /api/clothing/[id]
  → Display data in form
  → User modifies fields
  → User clicks Save
  → PUT /api/clothing/[id] with updated data
  → Display success/error message
  → Navigate back to list (optional)
```

### Deleting a Clothing Item

```
User clicks Delete button
  → Show confirmation dialog
  → User confirms
  → DELETE /api/clothing/[id]
  → Navigate back to list
  → Show success toast/message
```

### Loading an Outfit for Edit

```
User clicks card
  → Navigate to /outfits/[id]
  → GET /api/outfits/[id]
  → Display outfit data in form
  → Fetch all user's clothing items for selection: GET /api/clothing
  → User modifies fields or selects/deselects items
  → User clicks Save
  → PUT /api/outfits/[id] with updated data (name, description, clothing_ids)
  → Display success/error message
  → Navigate back to list (optional)
```

## UI/UX Design

### Visual Hierarchy

**Detail/Edit Pages**:

1. Page title with breadcrumb navigation (List > Item Name)
2. Image display (large, prominent)
3. Form fields (organized logically)
4. Action buttons (Save, Cancel, Delete)
5. Error/success messages

### Form Layout

**Clothing Form**:

```
┌─────────────────────────────────┐
│ Image Preview                   │
│ [Upload new image (optional)]   │
├─────────────────────────────────┤
│ Name: [___________________] *   │
│ Category: [dropdown] *           │
│ Description:                    │
│ [_____________________________] │
│ [_____________________________] │
│ Price: [___]                   │
│ Purchase Date: [___]            │
├─────────────────────────────────┤
│ [Save] [Cancel]  [Delete]      │
└─────────────────────────────────┘
```

**Outfit Form**:

```
┌─────────────────────────────────┐
│ Name: [___________________] *   │
│ Description:                    │
│ [_____________________________] │
│ [_____________________________] │
├─────────────────────────────────┤
│ Selected Items:                 │
│ [x] Item 1                      │
│ [x] Item 2                      │
│                                │
│ Available Items:               │
│ [ ] Item 3                      │
│ [ ] Item 4                      │
├─────────────────────────────────┤
│ [Save] [Cancel]  [Delete]      │
└─────────────────────────────────┘
```

### Card Hover Effects

List page cards will use Tailwind CSS hover effects:

- Border color: `hover:border-blue-500`
- Shadow: `hover:shadow-lg`
- Transform: `hover:scale-105`
- Cursor: `cursor-pointer`
- Transition: `transition-all duration-200`

### Delete Confirmation Dialog

A simple modal with:

- Warning message: "Are you sure you want to delete this item?"
- Item name displayed for clarity
- "Cancel" button (closes dialog)
- "Delete" button (red color, executes deletion)

### Color Scheme

Consistent with existing design:

- Primary actions (Save): Blue (`bg-blue-500`)
- Destructive actions (Delete): Red (`bg-red-500`)
- Cancel: Gray (`bg-gray-300`)
- Success messages: Green
- Error messages: Red

## Technical Decisions

### Why Client Components for Detail Pages?

Both detail/edit pages will be client components because:

1. They require form state management
2. Need to handle user interactions (typing, clicking, selecting)
3. Need to make API calls on form submission
4. Need to handle loading and error states
5. Need to manage modal state for delete confirmation

### Data Fetching Strategy

Use client-side data fetching with `useEffect`:

- Fetch item details on component mount
- Display loading state while fetching
- Handle errors (404, 500, network)
- Allow manual retry on error

Alternative considered: Server components with server actions

- Pros: Better for initial page load
- Cons: More complex to implement interactive forms
- Decision: Client components are simpler and sufficient for this use case

### Form State Management

Use React `useState` for form fields:

- Individual state for each field or single state object
- Validation on submit (or onChange for immediate feedback)
- Reset to initial values on cancel

No external form library (Formik, React Hook Form) to minimize dependencies.

### Delete Confirmation

Use a simple state-based modal:

- `showDeleteConfirm` boolean state
- Render conditionally based on state
- No external library (no extra dependencies)

### Styling Approach

- Use Tailwind CSS for all styling (consistent with existing code)
- No CSS modules or styled-components
- Reuse existing utility classes and patterns
- Follow existing spacing, typography, and color conventions

## Error Handling

### API Error Handling

```typescript
try {
  const response = await fetch(`/api/clothing/${id}`, { method: 'PUT', ... });
  if (!response.ok) {
    const error = await response.json();
    setErrorMessage(error.error || 'An error occurred');
    return;
  }
  // Success handling
} catch (error) {
  setErrorMessage('Network error. Please try again.');
}
```

### Validation Error Display

- Display errors inline below each field
- Use red text color (`text-red-500`)
- Clear error messages (e.g., "Name is required", "Price must be a positive number")

### 404 Handling

If item/outfit not found:

- Show clear error message: "Item not found"
- Provide link to return to list page
- No retry option (ID is invalid or doesn't exist)

## Security Considerations

### User Data Isolation

Already enforced by API layer:

- API checks `user_id` on all requests
- Users can only access/edit/delete their own items
- No additional UI-level checks needed

### CSRF Protection

Next.js App Router provides built-in CSRF protection for API routes.

### Input Validation

- Client-side validation for better UX
- Server-side validation (already in API)
- Sanitize inputs before submission (basic validation)

## Accessibility

### Keyboard Navigation

- Form fields are focusable with Tab
- Buttons are focusable and activatable with Enter/Space
- Modal is focus trap (close with Escape key)
- Proper tab order

### Screen Reader Support

- Use proper ARIA labels where needed
- Use semantic HTML (form, label, button)
- Error messages associated with form fields
- Focus management in modal

### Color Contrast

- Follow WCAG AA guidelines (already using Tailwind default colors)
- Ensure text is readable on colored backgrounds

## Performance Considerations

### Code Splitting

- Next.js automatically code splits pages by route
- No manual code splitting needed

### Image Optimization

- Use existing image optimization (server-side compression already implemented)
- Consider lazy loading for clothing item thumbnails (if many items)

### Data Caching

- No client-side caching (simple implementation)
- Data is refetched on page load
- Can be optimized later if performance issues arise

## Future Enhancements (Out of Scope)

1. Image cropping/editing before upload
2. Bulk editing (multiple items at once)
3. Undo/redo functionality
4. Version history for items
5. Advanced filtering and sorting
6. Tags or labels for clothing items
7. Outfit suggestions based on weather/occasion
8. Image-based clothing item search

## Testing Strategy

### Manual Testing Checklist

1. Navigate to detail page by clicking card
2. View all item details correctly
3. Edit form fields and save
4. See updated data reflected
5. Delete item with confirmation
6. Verify item removed from list
7. Test validation errors
8. Test error handling (404, 500, network)
9. Test mobile responsiveness
10. Test keyboard navigation

### Edge Cases to Test

1. Edit item while simultaneously being edited elsewhere (last write wins)
2. Delete item that is used in an outfit (API should handle this)
3. Navigate to detail page with invalid ID
4. Very long names or descriptions
5. Special characters in names
6. Images with unusual aspect ratios
7. Empty states (no description, no price)

## Rollout Plan

1. Implement clothing detail/edit page
2. Test clothing page thoroughly
3. Implement outfit detail/edit page
4. Test outfit page thoroughly
5. Update list pages to add navigation
6. Final integration testing
7. Deploy

No database migrations needed (already implemented).
