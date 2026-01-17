# add-client-side-routing Tasks

## Phase 0: Database Migration and API Updates

### Task 0.1: Create database migration function

- [ ] Read `src/lib/db/schema.ts`
- [ ] Create `migrateCategoryToId()` function
- [ ] Add logic to convert TEXT category values to INTEGER category_id
- [ ] Update clothing_items table schema (ALTER TABLE or recreate)
- [ ] Add foreign key constraint to clothing_categories.id
- [ ] Test migration on existing data

### Task 0.2: Update database schema initialization

- [ ] Read `src/lib/db/schema.ts`
- [ ] Modify `clothing_items` table creation to use INTEGER for category column
- [ ] Add foreign key constraint: `category INTEGER NOT NULL REFERENCES clothing_categories(id)`
- [ ] Add call to migration function in `initializeSchema()`
- [ ] Test schema initialization with fresh database
- [ ] Test schema initialization with existing data

### Task 0.3: Update clothing GET API to use category ID

- [ ] Read `src/app/api/clothing/route.ts`
- [ ] Update GET endpoint to accept category ID instead of category name
- [ ] Modify query to filter by category_id when category parameter is provided
- [ ] Update query to JOIN with clothing_categories to get category name
- [ ] Test GET with category ID parameter
- [ ] Test GET without category parameter

### Task 0.4: Update clothing POST API to use category ID

- [ ] Read `src/app/api/clothing/route.ts`
- [ ] Update category validation to check category ID exists
- [ ] Update INSERT statement to use category_id instead of category name
- [ ] Update response to include category name from JOIN
- [ ] Test POST with valid category ID
- [ ] Test POST with invalid category ID (should fail)

### Task 0.5: Test API endpoints

- [ ] Test GET `/api/clothing` returns all items with category names
- [ ] Test GET `/api/clothing?category=1` returns filtered items
- [ ] Test POST `/api/clothing` with category ID creates item successfully
- [ ] Verify no data loss after migration
- [ ] Verify all existing tests still pass

## Phase 1: Extract Shared Components

### Task 1.1: Create Header component

- [ ] Create `src/components/Header.tsx`
- [ ] Extract header JSX from `src/app/page.tsx` (lines 41-55)
- [ ] Ensure component includes title and logout button
- [ ] Test component renders correctly

### Task 1.2: Create Desktop Navigation component

- [ ] Create `src/components/Navigation.tsx`
- [ ] Extract desktop navigation JSX from `src/app/page.tsx` (lines 57-92)
- [ ] Replace `onClick` handlers with `Link` components from `next/link`
- [ ] Implement active state based on `usePathname` hook
- [ ] Add `md:hidden` class to hide on mobile
- [ ] Test navigation updates URL and shows active tab

### Task 1.3: Create Mobile Navigation component

- [ ] Create `src/components/MobileNavigation.tsx`
- [ ] Extract mobile navigation JSX from `src/app/page.tsx` (lines 100-127)
- [ ] Replace `onClick` handlers with `Link` components from `next/link`
- [ ] Implement active state based on `usePathname` hook
- [ ] Add `md:flex` class to show on desktop
- [ ] Add `md:hidden` class to hide on mobile
- [ ] Test navigation updates URL and shows active tab

### Task 1.4: Update root layout

- [ ] Read `src/app/layout.tsx`
- [ ] Import and add Header component
- [ ] Import and add Navigation component
- [ ] Import and add MobileNavigation component
- [ ] Test components render on page

## Phase 2: Create Page Files

### Task 2.1: Create clothing list page

- [ ] Create directory `src/app/clothing/`
- [ ] Create `src/app/clothing/page.tsx`
- [ ] Copy ClothingView component (lines 132-238) to new file
- [ ] Remove shared UI (header, navigation)
- [ ] Add `"use client"` directive if needed
- [ ] Ensure component renders correctly

### Task 2.2: Create clothing form page

- [ ] Create directory `src/app/clothing/new/`
- [ ] Create `src/app/clothing/new/page.tsx`
- [ ] Copy ClothingForm component (lines 241-361) to new file
- [ ] Update component to redirect to `/clothing` on success
- [ ] Add back button linking to `/clothing`
- [ ] Test form submission redirects correctly

### Task 2.3: Create outfits list page

- [ ] Create directory `src/app/outfits/`
- [ ] Create `src/app/outfits/page.tsx`
- [ ] Copy OutfitsView component (lines 363-494) to new file
- [ ] Remove shared UI (header, navigation)
- [ ] Add `"use client"` directive if needed
- [ ] Ensure component renders correctly

### Task 2.4: Create outfit form page

- [ ] Create directory `src/app/outfits/new/`
- [ ] Create `src/app/outfits/new/page.tsx`
- [ ] Extract outfit creation form from OutfitsView (lines 400-449)
- [ ] Update component to redirect to `/outfits` on success
- [ ] Add back button linking to `/outfits`
- [ ] Test form submission redirects correctly

### Task 2.5: Create settings page

- [ ] Create directory `src/app/settings/`
- [ ] Create `src/app/settings/page.tsx`
- [ ] Copy SettingsView and CategoryManagement (lines 496-686) to new file
- [ ] Remove shared UI (header, navigation)
- [ ] Add `"use client"` directive if needed
- [ ] Ensure component renders correctly

## Phase 3: Update Navigation

### Task 3.1: Update clothing list navigation

- [ ] Read `src/app/clothing/page.tsx`
- [ ] Change "添加服装" button from `onClick` to `<Link href="/clothing/new">`
- [ ] Ensure button still has correct styling
- [ ] Test navigation to form page

### Task 3.2: Update outfits list navigation

- [ ] Read `src/app/outfits/page.tsx`
- [ ] Change "创建穿搭" button from `onClick` to `<Link href="/outfits/new">`
- [ ] Ensure button still has correct styling
- [ ] Test navigation to form page

### Task 3.3: Update clothing form navigation

- [ ] Read `src/app/clothing/new/page.tsx`
- [ ] Change back button from `onClick` to `<Link href="/clothing">`
- [ ] Ensure back button has correct styling
- [ ] Test navigation back to list

### Task 3.4: Update outfit form navigation

- [ ] Read `src/app/outfits/new/page.tsx`
- [ ] Change back button from `onClick` to `<Link href="/outfits">`
- [ ] Ensure back button has correct styling
- [ ] Test navigation back to list

## Phase 4: Add Query Parameter Support

### Task 4.1: Update clothing page to read query params

- [ ] Read `src/app/clothing/page.tsx`
- [ ] Import `useSearchParams` from `next/navigation`
- [ ] Read `category` from search params on mount
- [ ] Initialize `filter` state from search params
- [ ] Test page loads with query param

### Task 4.2: Update category filter buttons

- [ ] Read `src/app/clothing/page.tsx`
- [ ] Replace category filter buttons with `<Link>` components
- [ ] Update filter buttons to generate URLs with query params using category IDs
- [ ] "全部" button links to `/clothing`
- [ ] Category buttons link to `/clothing?category={category.id}`
- [ ] Test clicking filters updates URL
- [ ] Ensure categories are fetched with IDs from API

### Task 4.3: Test filter persistence

- [ ] Navigate to `/clothing?category=1`
- [ ] Verify filter shows the correct category as active
- [ ] Refresh page
- [ ] Verify filter still shows the same category as active

## Phase 5: Update Root Page

### Task 5.1: Update root page to redirect

- [ ] Read `src/app/page.tsx`
- [ ] Remove all existing JSX (the entire HomePage component)
- [ ] Add client component that checks authentication
- [ ] Redirect authenticated users to `/clothing` using `useEffect` and `router.push`
- [ ] Keep authentication check logic
- [ ] Test page redirects to `/clothing`

### Task 5.2: Remove old state management

- [ ] Remove `activeTab` state
- [ ] Remove `ClothingView`, `OutfitsView`, `SettingsView` components
- [ ] Remove unused imports
- [ ] Verify page still works

## Phase 6: Cleanup and Verification

### Task 6.1: Remove old navigation JSX

- [ ] Ensure all old navigation JSX has been removed from `page.tsx`
- [ ] Verify navigation is now handled by shared components

### Task 6.2: Remove unused code

- [ ] Search for and remove any unused state variables
- [ ] Search for and remove any unused functions
- [ ] Clean up imports

### Task 6.3: Test all navigation flows

- [ ] Test tab navigation (clothing → outfits → settings)
- [ ] Verify URL updates correctly for each tab
- [ ] Test form navigation (list → new → list)
- [ ] Verify URL updates correctly for forms
- [ ] Test category filters
- [ ] Verify query params update correctly

### Task 6.4: Test state persistence

- [ ] Navigate to `/outfits` and refresh - verify stays on outfits
- [ ] Navigate to `/settings` and refresh - verify stays on settings
- [ ] Navigate to `/clothing?category=外套` and refresh - verify filter persists
- [ ] Navigate to `/clothing/new` and refresh - verify stays on form

### Task 6.5: Test browser navigation

- [ ] Navigate between tabs
- [ ] Click browser back button - verify correct page
- [ ] Click browser forward button - verify correct page

### Task 6.6: Test direct URL access

- [ ] Type `/clothing` in address bar - verify loads correctly
- [ ] Type `/outfits/new` in address bar - verify loads correctly
- [ ] Type `/settings?category=test` - verify loads and ignores invalid query

### Task 6.7: Test form submissions

- [ ] Add clothing item - verify redirects to `/clothing`
- [ ] Create outfit - verify redirects to `/outfits`
- [ ] Verify new items appear in lists

### Task 6.8: Test authentication flow

- [ ] Logout - verify redirects to `/login`
- [ ] Login - verify redirects to `/clothing`
- [ ] Verify middleware still protects routes

### Task 6.9: Test responsive design

- [ ] Test desktop navigation - verify top nav works
- [ ] Test mobile navigation - verify bottom nav works
- [ ] Test on various screen sizes

### Task 6.10: Run linting

- [ ] Run `npm run lint`
- [ ] Fix any linting errors
- [ ] Ensure no new warnings

### Task 6.11: Run build

- [ ] Run `npm run build`
- [ ] Fix any build errors
- [ ] Ensure build succeeds

## Dependencies

- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 3 must complete before Phase 4
- Phase 4 must complete before Phase 5
- Phase 5 must complete before Phase 6
- Tasks within each phase can be done in parallel where independent

## Validation

Each task should be validated by:

1. Visual inspection of the rendered component
2. Testing the described functionality
3. Checking for console errors
4. Verifying URL updates as expected
