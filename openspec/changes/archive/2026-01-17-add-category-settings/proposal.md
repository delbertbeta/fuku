# Add Category Settings Tab

## Summary

Add a new "Settings" tab to the main application interface that allows users to manage clothing categories. The settings tab provides functionality to add and delete custom categories. When a category that has associated clothing items is deleted, those items are automatically moved to an undeletable "uncategorized" category as a fallback.

## Motivation

Currently, the application uses hardcoded clothing categories (top, jacket, pants, shoes) which limits users' flexibility. Users may want to customize categories based on their personal wardrobe organization needs (e.g., adding categories like "accessories", "swimwear", "formal wear"). The settings tab allows users to manage these categories without requiring code changes, providing a more personalized and flexible wardrobe management experience.

## Proposed Changes

### Capabilities

- **Settings Navigation**: Add a third tab "设置" (Settings) to the main navigation alongside "服装" (Clothing) and "穿搭" (Outfits)
- **Category Management UI**: Provide an interface within the settings tab for users to:
  - View all available clothing categories
  - Add new custom categories
  - Delete categories (with safeguards for categories in use)
- **Category Data Persistence**: Store user-defined categories in the database with proper user isolation
- **Category Migration Logic**: When a category with associated clothing items is deleted:
  - Automatically update those items to use the "uncategorized" category
  - Display a warning message indicating how many items will be reclassified
- **Uncategorized Category**: Provide a built-in, undeletable "uncategorized" category that serves as the fallback when categories are deleted

### Scope

- **Database Changes**:
  - Add `clothing_categories` table to store user-defined categories
  - Add `is_system` flag to distinguish built-in categories from user-defined ones
  - Update `clothing_items` category references to handle category deletion
- **API Changes**:
  - Add `/api/categories` endpoints (GET, POST, DELETE)
  - Update category validation in `/api/clothing` to use user-defined categories
  - Add category migration logic when deleting categories
- **UI Changes**:
  - Add "设置" tab to main navigation
  - Create category management interface
  - Update clothing form to dynamically load categories
  - Update clothing list filters to use dynamic categories
- **Initial Data Migration**: On first load, seed default categories (top, jacket, pants, shoes, uncategorized) as system categories

### Out of Scope

- Category ordering/sorting
- Category descriptions or icons
- Category-based statistics or analytics
- Batch operations on multiple categories
- Import/export category configurations
- Category permissions or sharing between users

## Alternatives Considered

- **Keep Hardcoded Categories**: Simplest approach but limits flexibility; users cannot customize
- **Configuration File**: Add a config file for categories; requires server changes and doesn't support per-user customization
- **Admin Panel Only**: Manage categories only in admin interface; less user-friendly and requires additional authentication
- **Inline Category Management**: Add category creation/delete directly in the clothing form; could clutter the UI and make the form more complex

## Risks & Mitigations

- **Data Loss Risk**: Deleting categories with many items could be confusing
  - Mitigation: Always use "uncategorized" as a safe fallback; show warning with item count before deletion
- **Category Validation**: Clothing forms may reference deleted categories
  - Mitigation: Backend validates category existence on form submission; frontend fetches fresh categories
- **UI Complexity**: Adding another tab could clutter the navigation
  - Mitigation: Keep the settings interface simple and focused; use clear, minimal UI patterns
- **Database Migration**: Existing clothing items with hardcoded categories
  - Mitigation: Migration script to create system categories matching current hardcoded values

## Success Criteria

- Users can access a new "设置" tab from the main navigation
- Users can add new custom clothing categories
- Users can delete categories (except the "uncategorized" category)
- When deleting a category with associated clothing items, items are moved to "uncategorized"
- The clothing creation form dynamically displays all available categories
- Category filters in the clothing list reflect current categories
- Default categories (top, jacket, pants, shoes, uncategorized) are seeded on first use
- All category operations are properly isolated per user
