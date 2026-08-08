## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create new branch for feature, fix, etc
3. **Implement** - Implement the feature/fix that I create in @context/current-feature.md
4. **Test** - Verify it works in the browser. Write Vitest unit tests for new server-side logic
   and Playwright specs for new user flows — see @context/testing-instructions.md. Run
   `bun run test:run`, `bun run test:e2e`, `bun run build`, and `bunx tsc --noEmit` from
   `frontend/` and fix any errors
5. **Iterate** - Iterate and change things if needed
6. **Commit** - Only after build passes and everything works
7. **Merge** - Merge to main
8. **Delete Branch** - Delete branch after merge
9. **Review** - Review AI-generated code periodically and on demand.
10. Mark as completed in @context/current-feature.md and add to history

Do NOT commit without permission and until the build passes. If build fails, fix the issues first.

## Dev commands

All commands run from `frontend/`. Package manager is **bun** (pinned `bun@1.3.8`).

| Command | Description |
| --- | --- |
| `bun dev` | Dev server on http://localhost:3000 |
| `bun run build` | Production build — must pass before any commit |
| `bun run lint` | ESLint |
| `bunx tsc --noEmit` | Typecheck (no package script) |
| `bun run test:run` | Vitest unit tests (once) |
| `bun run test` | Vitest in watch mode |
| `bun run test:e2e` | Playwright E2E — needs `.env.test` |
| `bunx prisma migrate dev --name <name>` | Create + apply a migration, regenerates the client |
| `bunx prisma generate` | Regenerate the client into `lib/generated/prisma` |
| `bunx prisma validate` | Validate `schema.prisma` |
| `bunx prisma db seed` | Run `prisma/seed.ts` |
| `bunx prisma studio` | Browse data |

Use `bun run build` / `bun run lint`, not `bun build` / `bun lint` — the short forms invoke
Bun's own builtins instead of the package scripts.

## Branching

We will create a new branch for every feature/fix. Name branch **feature/[feature]** or **fix/[fix]**, etc. Ask to delete the branch once merged.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Claude" in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)
