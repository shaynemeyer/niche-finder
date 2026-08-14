---
name: react-ts
description: Review and improve React + TypeScript code quality in frontend/ (add "fix" to apply changes)
---

Review `frontend/app/`, `frontend/components/`, and `frontend/lib/` for general React and
TypeScript code quality. This skill checks patterns that apply to any React + TypeScript
codebase — not this repo's specific library choices.

**This repo's stack conventions (which form/table/state/toast library, file organization,
database access layering, theme tokens) live in `context/coding-standards.md`, not here.**
Cross-check findings against it, and defer to it whenever a finding is about *which* library
or pattern this repo has standardized on rather than general code quality.

## Checks

### File and folder organization
See `context/coding-standards.md`'s "File and folder organization" section for where a
component belongs (route-group folder vs shared, `components/ui/` as shadcn-only output,
kebab-case files, PascalCase named exports). Flag anything that doesn't match it.

### TypeScript
- `any` types — replace with proper types or `unknown`
- Missing return types on non-trivial functions
- Unnecessary type assertions (`as SomeType`) that could be avoided with proper typing
- Non-null assertions (`!`) without a clear reason
- Props not typed, or typed with a hand-rolled interface where a narrower/more precise type
  (e.g. extending an element's own prop type) would do

### React
- Class components — convert to functional
- `'use client'` on a component that doesn't need hooks or event handlers
- State or side effects not using hooks
- Components doing more than one job — flag for extraction
- Reusable logic not extracted into a custom hook
- Missing or incorrect dependency arrays in `useEffect` / `useCallback` / `useMemo`
- `key` prop missing or using array index on dynamic lists

### Error handling
- A catch block that logs but doesn't return/throw — every code path should resolve, not
  swallow silently
- Internal error detail (exception message, stack) surfaced to the client instead of a
  generic message

### General
- Commented-out code blocks
- Unused imports
- `console.log` statements left in
- `@ts-ignore` or `@ts-expect-error` without explanation
- Comments explaining *what* the code does instead of *why*

---

## Mode

**Default (no argument / "check"):**
- Scan `frontend/app/`, `frontend/components/`, and `frontend/lib/` and report all findings
- Group findings by category
- Do not modify any files

**If asked to "fix":**
- First report all findings grouped by category with numbered items
- Ask: "Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')"
- Wait for confirmation before changing anything
- Apply only the approved fixes
- Report what changed
