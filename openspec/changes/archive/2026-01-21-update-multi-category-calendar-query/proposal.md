# Change: Enable multi-category clothing and calendar query state

## Why

Users want a single clothing item to belong to multiple categories, and calendar month navigation should be reflected in the URL so back navigation restores the previous month.

## What Changes

- Allow clothing items to associate with multiple categories via a join table and update creation/editing flows.
- Update category filtering and listing to handle multi-category assignments.
- Persist calendar month in the URL query string and read it on load for back/forward navigation.

## Impact

- Affected specs: clothing-management, category-management, url-state-management
- Affected code: clothing CRUD API, category deletion/migration logic, clothing create/edit UI, calendar page routing
