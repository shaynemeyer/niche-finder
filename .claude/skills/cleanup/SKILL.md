---
name: cleanup
description: Clean up project housekeeping tasks (add "run" to execute fixes)
---

Review the codebase for cleanup tasks:

1. Make sure feature history is in order from oldest to newest, and that
   @context/current-feature.md holds at most one entry under `## History` — anything older belongs
   in @context/feature-history.md
2. Find unnecessary console.log statements in src/
3. Find unused imports
4. Check for stale TODO comments
5. Find orphaned/unused files
6. Check that context files match actual project state
7. Check if the .env.production has the same variables (not always the same value) as the .env. If something is missing, tell me.
8. Find `@ts-ignore` comments that might be stale

**Mode: pass "run" to execute fixes, or "check" (default) to only report.**

If no argument or argument is "check":

- Only report findings, don't modify anything
- List what WOULD be cleaned up

If the argument is "run" or "fix":

- First, report all findings with numbered items
- Then ask: "Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')"
- Wait for user response before making any changes
- Only fix the items the user specifies
- Report what you changed
