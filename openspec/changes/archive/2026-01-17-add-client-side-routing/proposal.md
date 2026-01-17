# add-client-side-routing Change Proposal

## Why

The current application uses React state to manage navigation (tabs, secondary pages, filters), which is lost when users refresh the page, requiring them to manually navigate back to their previous location. This results in a poor user experience and prevents bookmarking or sharing specific views.

## Summary

Implement URL-based routing for tab navigation and secondary pages to enable state persistence across page refreshes. The change will refactor the current single-page application (SPA) into multiple Next.js App Router pages with proper URL structure using path segments for navigation states and query parameters for filter states.

## What Changes

- Add URL path segments for tab navigation: `/clothing`, `/outfits`, `/settings`
- Add URL path segments for secondary pages: `/clothing/new`, `/outfits/new`
- Add URL query parameters for filter state using category IDs: `/clothing?category=1`
- Modify database schema: change `clothing_items.category` from TEXT to INTEGER (foreign key to `clothing_categories.id`)
- Create database migration to update existing data
- Update clothing API to use category ID for filtering
- Update clothing API to accept category ID in POST requests
- Refactor `src/app/page.tsx` into multiple page files
- Extract shared components: Header, Navigation, MobileNavigation
- Update root page to redirect authenticated users to `/clothing`
- Replace onClick handlers with Next.js Link components
- Remove React state-based tab switching

**BREAKING:**

- Database schema change: `clothing_items.category` field type changes from TEXT to INTEGER
- API change: clothing endpoints now use category ID instead of category name
- Frontend: category filter URLs use ID instead of name

## Impact

- **Affected specs:** New spec `url-state-management`, Modified spec `clothing-management`
- **Affected code:**
  - `src/app/page.tsx`, new files under `src/app/clothing/`, `src/app/outfits/`, `src/app/settings/`, `src/components/`
  - `src/lib/db/schema.ts` - database schema changes
  - `src/app/api/clothing/route.ts` - API changes for category filtering
  - Database migration required

## Context

Currently, the main application uses React state (`useState`) to manage:

- Active tab (clothing, outfits, settings)
- Secondary page states (e.g., clothing form, outfit creation)
- Filter states (category selection)

These states are lost when the user refreshes the page, resulting in a poor user experience where users must navigate back to their previous location manually.

## Goals

1. **Tab Navigation via URL**: Use path segments (`/clothing`, `/outfits`, `/settings`) to represent active tab
2. **Secondary Pages via URL**: Use path segments for secondary pages (`/clothing/new`, `/outfits/new`)
3. **Filter State via Query**: Use query parameters with category IDs for filter states (e.g., `/clothing?category=1`)
4. **Database Schema Update**: Change `clothing_items.category` from TEXT to INTEGER referencing `clothing_categories.id`
5. **State Persistence**: Maintain user's navigation context across page refreshes
6. **Multi-Page Architecture**: Refactor from single page to multiple page files
7. **API Consistency**: Update clothing API to use category IDs

## Non-Goals

- Implementing deep linking to individual clothing/outfit items (not requested)
- Changing authentication or middleware behavior
- Modifying category names or category management logic

## Impact

### User Impact

- Users will have persistent navigation state across page refreshes
- Users can bookmark specific tabs and pages
- Browser back/forward buttons will work correctly for navigation

### Developer Impact

- Codebase becomes more maintainable with clear page boundaries
- Easier to add new pages and routes in the future
- Better separation of concerns between page components

### Breaking Changes

- **Database Schema**: `clothing_items.category` field changes from TEXT to INTEGER
- **API**: `GET /api/clothing?category=<name>` changes to `GET /api/clothing?category=<id>`
- **API**: `POST /api/clothing` now expects category ID in form data instead of category name
- **Frontend**: Category filter URLs change from name-based to ID-based (e.g., `?category=1` instead of `?category=上衣`)

## Scope

The following capabilities will be added/modified:

### New Capabilities

1. **URL State Management**: New routing behavior for navigation state
2. **Clothing Page**: Dedicated page for clothing management at `/clothing`
3. **Outfits Page**: Dedicated page for outfit management at `/outfits`
4. **Settings Page**: Dedicated page for settings at `/settings`
5. **Clothing Form Page**: New page for adding clothing at `/clothing/new`
6. **Outfit Form Page**: New page for creating outfits at `/outfits/new`

### Modified Capabilities

1. **Clothing Management**:
   - Database schema: Change category field from TEXT to INTEGER
   - API: Update GET endpoint to filter by category ID
   - API: Update POST endpoint to accept category ID
   - Frontend: Use category IDs in query parameters
2. **UI**: Update navigation components to use Next.js Link and router
3. **Outfit Management**: Ensure URL state reflects current view

## Proposed Solution

### Architecture

```
src/app/
├── layout.tsx (existing - header/navigation)
├── page.tsx (existing - redirect to default tab)
├── clothing/
│   ├── page.tsx (clothing list with filter)
│   └── new/
│       └── page.tsx (add clothing form)
├── outfits/
│   ├── page.tsx (outfits list)
│   └── new/
│       └── page.tsx (create outfit form)
└── settings/
    └── page.tsx (settings with category management)
```

### Key Design Decisions

1. **Path vs Query**: Use path segments for primary navigation (tab, secondary pages) and query parameters for transient state (filters)
2. **Shared Components**: Extract common layout components (header, navigation) to maintain consistency
3. **Client Components**: Keep existing client-side data fetching patterns
4. **Middleware**: No changes needed - continues to protect all routes

### Migration Strategy

1. Create new page files for each tab
2. Extract shared components (header, navigation bar)
3. Move existing view logic to respective page files
4. Update navigation to use Link components
5. Remove state-based tab switching
6. Add query parameter handling for filters
7. Update root page to redirect to `/clothing`
8. Test navigation and refresh behavior

## Alternatives Considered

### Alternative 1: Single Page with URL Sync

Keep the single page structure but sync URL with state using `useEffect` and `router.push`.

**Pros**: Less refactoring, smaller changes
**Cons**: More complex state synchronization, harder to maintain, still monolithic

**Decision**: Rejected in favor of multi-page architecture for better maintainability

### Alternative 2: Query Parameters for Everything

Use query parameters for all state (e.g., `/?tab=clothing&view=list&filter=上衣`).

**Pros**: Simpler URL structure, easier to implement
**Cons**: Less semantic URLs, harder to bookmark, doesn't follow Next.js best practices

**Decision**: Rejected as user explicitly requested path-based routing for navigation

## Dependencies

- Next.js App Router (already in use)
- Existing API routes (no changes needed)
- Existing middleware (no changes needed)

## Success Criteria

1. ✅ All tab navigation updates the URL path
2. ✅ All secondary page navigation updates the URL path
3. ✅ Category filters use query parameters
4. ✅ Refreshing any page maintains the current view
5. ✅ Browser back/forward buttons work correctly
6. ✅ All existing functionality continues to work
7. ✅ No visual or functional regressions

## Risks and Mitigations

| Risk                                      | Likelihood | Impact | Mitigation                                   |
| ----------------------------------------- | ---------- | ------ | -------------------------------------------- |
| Breaking existing functionality           | Low        | High   | Comprehensive testing, incremental migration |
| Loss of component state during navigation | Medium     | Medium | Test all form submissions and data flows     |
| Middleware conflicts                      | Low        | Low    | Verify middleware works with new routes      |
| URL complexity                            | Low        | Low    | Keep URLs simple and semantic                |

## Open Questions

None at this time.
