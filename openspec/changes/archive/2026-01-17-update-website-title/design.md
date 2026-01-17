# Update Website Title to "Fuku" - Design

## Architecture

This change is straightforward and affects only the UI layer:

1. **Root Layout Metadata** (`src/app/layout.tsx`)
   - Update `metadata.title` from "穿搭平台" to "Fuku"
   - Description can remain in Chinese: "管理您的衣橱和穿搭"

2. **UI Specification** (`openspec/specs/ui/spec.md`)
   - Update `Root layout language setting` requirement
   - Change document title expectation from "in Chinese" to "Fuku"

## Implementation Notes

- Next.js uses the metadata API to inject `<title>` and `<meta>` tags
- Change is immediate upon rebuild
- No state management or backend changes needed
- Browser tab will display "Fuku" instead of "穿搭平台"
