# Tasks: Add Category Settings Tab

## Phase 1: Database Schema & Migration

- [x] **Design database schema for categories**
  - Create `clothing_categories` table with fields: id, user_id, name, is_system, created_at, updated_at
  - Add unique constraint on (user_id, name)
  - Add index on user_id
  - Design migration for existing data

- [x] **Implement database migration**
  - Create migration script to add `clothing_categories` table
  - Add foreign key from clothing_items to clothing_categories (or keep as TEXT with validation)
  - Seed default system categories (top, jacket, pants, shoes, uncategorized) for existing users
  - Write rollback script

## Phase 2: Backend API - Category Management

- [x] **Create category API endpoints**
  - GET /api/categories - list all categories for current user
  - POST /api/categories - create new category
  - DELETE /api/categories/[id] - delete category
  - Add Zod validation for all endpoints
  - Implement user isolation in all queries

- [x] **Implement category deletion with migration**
  - Add logic to check if category has associated clothing items
  - When deleting, update clothing_items to set category = "uncategorized"
  - Return count of affected items in response
  - Prevent deletion of system categories (is_system = true)

- [x] **Update clothing API for dynamic categories**
  - Modify POST /api/clothing to validate category against user's categories
  - Remove hardcoded category enum validation
  - Update GET /api/clothing to use dynamic category filtering
  - Add error handling for invalid categories

## Phase 3: Frontend - Settings Tab Navigation

- [x] **Add settings tab to main navigation**
  - Update HomePage component to include "settings" in activeTab state
  - Add "设置" button to top navigation bar
  - Add "设置" button to bottom navigation (mobile)
  - Implement tab switching logic for settings view

- [x] **Create SettingsView component**
  - Create basic settings page layout
  - Add section for category management
  - Ensure responsive design matches existing tabs

## Phase 4: Frontend - Category Management UI

- [x] **Build category list component**
  - Display all user categories in a list
  - Show category name
  - Display indicator for system categories
  - Show count of items in each category (optional)

- [x] **Implement add category form**
  - Input field for new category name
  - Validation for empty names and duplicates
  - Add button with loading state
  - Display success/error messages

- [x] **Implement delete category functionality**
  - Add delete button for non-system categories
  - Show confirmation dialog with item count
  - Warning message if category has associated items
  - Display success/error messages
  - Prevent deletion of "uncategorized" category

- [x] **Integrate category management with clothing flow**
  - Update ClothingForm to fetch categories from API
  - Dynamically render category select options
  - Update clothing list filter buttons to use categories
  - Handle category fetch errors gracefully

## Phase 5: Testing & Validation

- [x] **Test category CRUD operations**
  - Create category and verify it appears in list
  - Try to create duplicate category (should fail)
  - Delete unused category (should succeed)
  - Try to delete system category (should fail)

- [x] **Test category deletion with associated items**
  - Create category and add clothing items to it
  - Delete category and verify items move to "uncategorized"
  - Verify warning message shows correct item count
  - Check that items are properly reclassified

- [x] **Test clothing form with dynamic categories**
  - Create new category and verify it appears in clothing form
  - Create clothing item with new category
  - Edit clothing item to change category
  - Delete category and verify clothing items update

- [x] **Test category filters in clothing list**
  - Verify all category filters display correctly
  - Test filtering by each category
  - Verify "uncategorized" filter works
  - Test that deleted categories don't appear in filters

- [x] **Test user isolation**
  - Create categories for different users
  - Verify users cannot see each other's categories
  - Verify user cannot create categories with same name as system categories

## Phase 6: Documentation & Polish

- [ ] **Update documentation**
  - Document category management feature
  - Add API documentation for category endpoints
  - Update database schema documentation
  - Document migration process

- [x] **UX improvements**
  - Add loading states for category operations
  - Improve error messages to be user-friendly
  - Add empty state for category list (when no custom categories)
  - Optimize performance for category fetching

## Dependencies & Parallelization

### Parallelizable Tasks

- Phase 1 (Database) can be done independently
- Phase 2 (Backend API) can be done in parallel with Phase 3 (Frontend Navigation)
- Category list and add form can be developed in parallel
- Testing tasks can be done incrementally

### Sequential Dependencies

- Phase 1 must complete before Phase 2 (Backend API)
- Phase 2 must complete before Phase 4 (Category Management UI)
- Phase 4 must complete before Phase 5 (Testing)
- Frontend Navigation (Phase 3) can start before Phase 2 completes

### Estimated Timeline

- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 1 day
- Phase 4: 3-4 days
- Phase 5: 2-3 days
- Phase 6: 1 day

**Total: 10-14 days** depending on testing depth
