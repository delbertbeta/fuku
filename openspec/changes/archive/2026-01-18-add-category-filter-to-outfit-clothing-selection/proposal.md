# Proposal: Add Category Filter to Outfit Clothing Selection

## Summary

Add category filtering capability to the clothing item selection interface in outfit creation and editing pages. This will help users more easily find and select clothing items when building outfits by allowing them to filter by category (e.g., tops, pants, shoes).

## Problem

Currently, when creating or editing an outfit, all clothing items are displayed in a single list without any filtering capability. For users with many clothing items, this makes it difficult to:

- Quickly find specific types of items
- Ensure outfit composition includes items from desired categories
- Navigate through large lists of items efficiently

## Solution

Add category filter buttons to the clothing selection interface in both:

1. Outfit creation page (`/outfits/new`)
2. Outfit editing page (`/outfits/[id]`)

The filter UI will follow the same pattern used in the clothing list page (`/clothing`) with:

- "全部" (All) button to show all items
- Individual buttons for each user category (e.g., "上衣", "外套", "下装", "鞋子", custom categories)
- Active filter highlighted with blue background
- Clicking a filter updates the displayed clothing items to match that category

## Impact

**Positive:**

- Improved UX for users with many clothing items
- Faster outfit creation and editing
- Consistent UI pattern with existing clothing list page

**Negative:**

- None expected; minimal code change adding familiar pattern

## Alternatives Considered

1. **Dropdown filter**: Could be more compact but less discoverable
2. **Search + category filter**: Overkill for this use case; search already available in clothing list
3. **No filtering**: Continue with current implementation; poor UX for larger wardrobes

## Dependencies

No new dependencies. Existing APIs already support:

- `/api/clothing?category=<id>` for filtered item retrieval
- `/api/categories` for category list

## Open Questions

None
