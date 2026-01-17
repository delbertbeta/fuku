# add-client-side-routing Design Document

## Architecture Overview

This design refactors the current single-page application (SPA) pattern into a multi-page application using Next.js App Router with proper URL state management.

## Current State

```
src/app/
├── page.tsx (single page with all tabs and views)
│   ├── HomePage (manages activeTab state)
│   ├── ClothingView (manages showForm, filter states)
│   ├── OutfitsView (manages showForm state)
│   └── SettingsView
```

### Current Issues

1. **No URL Persistence**: All navigation state is in React state, lost on refresh
2. **Monolithic Component**: All tabs in one 680+ line file
3. **No Deep Linking**: Cannot bookmark or share specific views
4. **Broken Back Button**: Browser history doesn't work for tab navigation
5. **Category Query Inefficiency**: Category filter uses text-based comparison instead of foreign key reference

## Database Schema Changes

### Current Schema

```sql
-- clothing_categories table (has id field)
CREATE TABLE IF NOT EXISTS clothing_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- clothing_items table (category is TEXT)
CREATE TABLE IF NOT EXISTS clothing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_path TEXT NOT NULL,
  price DECIMAL(10, 2),
  purchase_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);
```

### New Schema

```sql
-- clothing_categories table (unchanged)
CREATE TABLE IF NOT EXISTS clothing_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- clothing_items table (category changed to INTEGER)
CREATE TABLE IF NOT EXISTS clothing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category INTEGER NOT NULL REFERENCES clothing_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  image_path TEXT NOT NULL,
  price DECIMAL(10, 2),
  purchase_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);
```

### Migration Strategy

```typescript
function migrateCategoryToId(db: Database.Database): void {
  // Check if migration is needed (category is still TEXT)
  const columns = db.prepare("PRAGMA table_info(clothing_items)").all();
  const categoryColumn = columns.find((col: any) => col.name === "category");

  // If category is already INTEGER, migration is complete
  if (categoryColumn && categoryColumn.type === "INTEGER") {
    return;
  }

  // Create temporary table with new schema
  db.exec(`
    CREATE TABLE clothing_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category INTEGER NOT NULL REFERENCES clothing_categories(id),
      name TEXT NOT NULL,
      description TEXT,
      image_path TEXT NOT NULL,
      price DECIMAL(10, 2),
      purchase_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name)
    );
  `);

  // Migrate data: convert category TEXT to category INTEGER
  db.exec(`
    INSERT INTO clothing_items_new (
      id, user_id, category, name, description, image_path,
      price, purchase_date, created_at, updated_at
    )
    SELECT
      ci.id,
      ci.user_id,
      cc.id as category,
      ci.name,
      ci.description,
      ci.image_path,
      ci.price,
      ci.purchase_date,
      ci.created_at,
      ci.updated_at
    FROM clothing_items ci
    LEFT JOIN clothing_categories cc
      ON ci.category = cc.name AND ci.user_id = cc.user_id;
  `);

  // Drop old table and rename new table
  db.exec(`
    DROP TABLE clothing_items;
    ALTER TABLE clothing_items_new RENAME TO clothing_items;
  `);

  // Recreate indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
  `);
}
```

### Benefits of Category ID Approach

1. **Database Performance**: Integer foreign keys are faster than text comparisons
2. **Data Integrity**: Foreign key constraints prevent orphaned category references
3. **Normalization**: Follows proper database design principles
4. **URL Stability**: Category IDs don't change when category names are renamed
5. **Internationalization**: Category IDs remain the same across language changes

## Proposed Architecture

```
src/app/
├── layout.tsx (root layout)
├── page.tsx (redirect to /clothing)
├── components/
│   ├── Header.tsx (shared header)
│   ├── Navigation.tsx (shared tab navigation)
│   └── MobileNavigation.tsx (mobile bottom nav)
├── clothing/
│   ├── page.tsx (clothing list with query filter)
│   └── new/
│       └── page.tsx (add clothing form)
├── outfits/
│   ├── page.tsx (outfits list)
│   └── new/
│       └── page.tsx (create outfit form)
└── settings/
    └── page.tsx (settings with category management)
```

## URL Structure Design

### Primary Navigation (Path Segments)

| URL             | Description             | Component               |
| --------------- | ----------------------- | ----------------------- |
| `/`             | Redirect to `/clothing` | `page.tsx`              |
| `/clothing`     | Clothing list page      | `clothing/page.tsx`     |
| `/clothing/new` | Add clothing form       | `clothing/new/page.tsx` |
| `/outfits`      | Outfits list page       | `outfits/page.tsx`      |
| `/outfits/new`  | Create outfit form      | `outfits/new/page.tsx`  |
| `/settings`     | Settings page           | `settings/page.tsx`     |

### Secondary State (Query Parameters)

| URL                    | Description                  | State                     |
| ---------------------- | ---------------------------- | ------------------------- |
| `/clothing`            | All clothing items (default) | No filter                 |
| `/clothing?category=1` | Filtered by category ID      | `category=1` (e.g., 上衣) |
| `/clothing?category=2` | Filtered by category ID      | `category=2` (e.g., 外套) |

### Routing Examples

```
User Flow                    URL Changes
────────────────────────────────────────────────
1. Visit /login             → /login
2. Login successfully       → /clothing
3. Switch to Outfits tab    → /outfits
4. Create new outfit        → /outfits/new
5. Submit form              → /outfits
6. Switch to Settings       → /settings
7. Refresh page            → /settings (maintained!)
8. Click Clothing tab       → /clothing
9. Filter by category ID 1 (上衣) → /clothing?category=1
10. Refresh page            → /clothing?category=1 (maintained!)
```

## Component Refactoring

### Shared Components

#### Header Component

```typescript
// components/Header.tsx
- Renders application title and logout button
- No navigation (separated)
- Client component
```

#### Navigation Component

```typescript
// components/Navigation.tsx
- Renders desktop top navigation
- Uses Next.js Link for tab switching
- Active state based on current path
- Hidden on mobile (md:hidden)
```

#### MobileNavigation Component

```typescript
// components/MobileNavigation.tsx
- Renders bottom tab bar for mobile
- Uses Next.js Link for tab switching
- Active state based on current path
- Hidden on desktop (md:flex)
```

### Page Components

#### Root Page

```typescript
// page.tsx
- Check authentication (redirect to /login if not authenticated)
- Redirect authenticated users to /clothing
- No UI rendering
```

#### Clothing Page

```typescript
// clothing/page.tsx
- Read category from URL search params
- Fetch clothing items with filter
- Render clothing list
- Category filter buttons update query params
- "Add" button links to /clothing/new
```

#### Clothing New Page

```typescript
// clothing/new/page.tsx
- Render add clothing form
- On success: redirect to /clothing
- "Back" button links to /clothing
```

#### Outfits Page

```typescript
// outfits/page.tsx
- Fetch outfits list
- Render outfits
- "Create" button links to /outfits/new
```

#### Outfits New Page

```typescript
// outfits/new/page.tsx
- Render create outfit form
- Fetch clothing items for selection
- On success: redirect to /outfits
- "Back" button links to /outfits
```

#### Settings Page

```typescript
// settings/page.tsx
- Render settings with category management
- No sub-pages needed
```

## State Management Strategy

### From State to URL

| Current State                | New URL Representation |
| ---------------------------- | ---------------------- |
| `activeTab = "clothing"`     | Path: `/clothing`      |
| `activeTab = "outfits"`      | Path: `/outfits`       |
| `activeTab = "settings"`     | Path: `/settings`      |
| `showForm = true` (clothing) | Path: `/clothing/new`  |
| `showForm = true` (outfits)  | Path: `/outfits/new`   |
| `filter = 1` (category ID)   | Query: `?category=1`   |

### URL Reading Pattern

```typescript
// In clothing/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function ClothingPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  // Fetch items with category filter (if categoryId provided)...
}
```

### URL Updating Pattern

```typescript
// Using Link for navigation
import Link from 'next/link';

<Link href="/clothing?category=1" className="...">
  上衣
</Link>

// Or useRouter for programmatic navigation
import { useRouter, useSearchParams } from 'next/navigation';

const router = useRouter();
const searchParams = useSearchParams();

const handleFilter = (categoryId: number | null) => {
  const params = new URLSearchParams(searchParams);
  if (categoryId) {
    params.set('category', categoryId.toString());
  } else {
    params.delete('category');
  }
  router.push(`/clothing?${params.toString()}`);
};
```

## Data Flow

### Authentication Flow (Unchanged)

```
/middleware.ts → Check session cookie
  ↓
Not authenticated → /login or /register
  ↓
Authenticated → Allow access to all routes
```

### Navigation Flow (New)

```
User clicks tab
  ↓
Next.js Link component
  ↓
Browser URL updates
  ↓
New page component renders
  ↓
Read URL params (query/path)
  ↓
Fetch data with filters
  ↓
Render UI
```

### Form Submission Flow (Updated)

```
User submits form
  ↓
POST to API endpoint
  ↓
Success response
  ↓
router.push('/tab-name') or router.back()
  ↓
Browser URL updates
  ↓
List page re-renders with fresh data
```

## Migration Steps

### Phase 0: Database Migration and API Updates

1. Create database migration function in `src/lib/db/schema.ts`
2. Update `clothing_items` table schema (TEXT to INTEGER)
3. Add foreign key constraint to `clothing_categories.id`
4. Update `GET /api/clothing` to filter by category ID
5. Update `POST /api/clothing` to accept category ID
6. Test API endpoints with new category ID behavior

### Phase 1: Extract Shared Components

1. Create `components/Header.tsx` from existing header
2. Create `components/Navigation.tsx` from desktop nav
3. Create `components/MobileNavigation.tsx` from mobile nav
4. Update root layout to include shared components

### Phase 2: Create Page Files

1. Create `clothing/page.tsx` with ClothingView logic
2. Create `clothing/new/page.tsx` with ClothingForm logic
3. Create `outfits/page.tsx` with OutfitsView logic
4. Create `outfits/new/page.tsx` with outfit creation logic
5. Create `settings/page.tsx` with SettingsView logic

### Phase 3: Update Navigation

1. Replace onClick handlers with Link components
2. Update navigation to read active state from path
3. Remove activeTab state from components

### Phase 4: Add Query Parameter Support

1. Update clothing page to read category from searchParams
2. Update filter buttons to use Link with query params
3. Test filter persistence across refresh

### Phase 5: Update Root Page

1. Remove existing HomePage component
2. Add redirect to `/clothing`
3. Remove old tab state management

### Phase 6: Cleanup

1. Delete old view components from page.tsx
2. Remove unused imports
3. Test all navigation flows

## Testing Strategy

### Manual Testing Checklist

- [ ] Tab navigation works and updates URL
- [ ] Mobile and desktop navigation both work
- [ ] Category filter updates URL query param
- [ ] Refresh maintains tab state
- [ ] Refresh maintains filter state
- [ ] Back/forward browser buttons work
- [ ] Add clothing form submits and redirects
- [ ] Create outfit form submits and redirects
- [ ] Authentication flow unchanged
- [ ] Middleware still protects routes
- [ ] No console errors

### Edge Cases

- [ ] Direct URL access (e.g., bookmark /outfits/new)
- [ ] Invalid query parameters (ignore gracefully)
- [ ] Empty category filter (show all)
- [ ] Form submission errors (stay on page)

## Performance Considerations

### Client-Side Navigation

- ✅ Next.js Link provides client-side navigation (no full page reload)
- ✅ Shared layout components are not remounted
- ✅ Data refetching only when needed
- ✅ Better SEO with semantic URLs

### Bundle Size

- Minimal increase from splitting components
- Next.js automatically code-splits by route
- Shared components deduplicated by framework

## Future Enhancements

### Potential Future Work

1. **Item Detail Pages**: Add `/clothing/[id]` for individual clothing items
2. **Outfit Detail Pages**: Add `/outfits/[id]` for individual outfits
3. **Edit Pages**: Add `/clothing/[id]/edit` and `/outfits/[id]/edit`
4. **Advanced Filters**: Support multiple filters (e.g., `?category=上衣&color=black`)
5. **Pagination**: Add page state to URL (e.g., `/clothing?page=2`)

### Design Extensibility

The multi-page architecture makes these enhancements straightforward:

- Simply add new route directories and page files
- Reuse existing navigation and layout components
- Extend query parameter pattern for more complex state
