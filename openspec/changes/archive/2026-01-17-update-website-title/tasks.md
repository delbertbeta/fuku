# Update Website Title to "Fuku" - Tasks

1. Update root layout metadata title
   - File: `src/app/layout.tsx`
   - Change `metadata.title` from "穿搭平台" to "Fuku"
   - Verify: Run dev server and check browser tab displays "Fuku"

2. Update UI specification
   - File: `openspec/specs/ui/spec.md`
   - Update `Root layout language setting` requirement
   - Change document title expectation to "Fuku"
   - Verify: Run `openspec validate ui --type spec`

3. Verify metadata description
   - Ensure `metadata.description` remains "管理您的衣橱和穿搭"
   - Verify: Check page source/meta tags after changes
