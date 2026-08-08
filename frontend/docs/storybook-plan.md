# Storybook: implementation plan

Plan for adding Storybook to browse and interact with the dashboard components in
isolation. Not yet implemented — this is a decision record and a checklist for when
the work is picked up.

## TL;DR

**Worth doing, scoped small.** Use `@storybook/nextjs-vite` (the framework Storybook
recommends), wire Tailwind v4 and the `.dark` variant manually, and write stories only
for components with states that are currently unreachable in the running app. Skip the
Vitest addon on the first pass — it conflicts with the existing `vitest.config.mts`.

## Why

The dashboard components were split out of `app/dashboard/page.tsx` in `b4fb5ef`. Several
of their states cannot be reached by clicking around the app:

| Component                  | Unreachable today                                                     |
| -------------------------- | --------------------------------------------------------------------- |
| `SubscriptionStatusCard`   | The entire FREE branch — progress bar, limit-reached warning           |
| `RecentReports`            | Loading skeleton and the populated list                                |
| `ValidationForm`           | Field errors, root error, submitting state                             |

`SubscriptionStatusCard`'s FREE branch is invisible to an admin account, which is PRO.
`RecentReports` can only ever render its empty state until the report pipeline exists.
Each state also needs checking in light *and* dark, which currently means toggling the
theme and re-triggering the state by hand.

That is roughly 15 states reachable as a grid instead of a scavenger hunt.

**What Storybook does not replace:** it renders components in isolation, so it would not
have caught the dark-mode bug fixed in `b4fb5ef` — that one only appeared in the composed
page. Keep verifying real pages in the browser.

## Framework choice

Use **`@storybook/nextjs-vite`**, not `@storybook/nextjs`.

The [Next.js framework docs](https://storybook.js.org/docs/get-started/frameworks/nextjs)
state: "We recommend using `@storybook/nextjs-vite` for most Next.js projects," citing
faster builds, better test support, and simpler configuration. The webpack framework is
for projects with custom webpack or babel config that Vite cannot absorb — this project
has neither, and already runs Turbopack in dev.

### Version compatibility (verified against the npm registry)

`@storybook/nextjs-vite@10.5.7` declares:

```json
{
  "next": "^14.1.0 || ^15.0.0 || ^16.0.0",
  "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
  "vite": "^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0"
}
```

This project is on Next 16.3.0 and React 19.2.8 — both in range. No pinning or overrides
needed.

## Steps

### 1. Install

```bash
bunx storybook@latest init
```

Pick the Vite framework when prompted. Expect roughly 15 new devDependencies against a
current count of 16 — a real footprint increase, and the main argument against doing this.

### 2. Wire up Tailwind v4

Stories do not inherit the app's stylesheet. Import it in `.storybook/preview.ts`:

```ts
import '../app/globals.css';
```

Without this every story renders unstyled.

### 3. Wire up the dark variant — the part that is easy to get wrong

`app/globals.css:5` defines:

```css
@custom-variant dark (&:is(.dark *));
```

The `dark:` variant matches on an **ancestor** carrying `.dark`, not the element itself. A
decorator must therefore wrap the story in an element with the class, not put the class on
the story root:

```tsx
// works — .dark is an ancestor of the story
<div className="dark">
  <div className="bg-background">
    <Story />
  </div>
</div>
```

Applying `.dark` directly to the rendered component silently produces light-mode output.
`@storybook/addon-themes@10.5.7` provides `withThemeByClassName` for this; its
`parentSelector` option targets the wrapper.

Give the wrapper an explicit `bg-background`, or stories render on Storybook's own white
canvas and dark text will look broken.

### 4. Write stories

Only for components with states that are hard to reach. Suggested first pass:

- `subscription-status-card.stories.tsx` — FREE at `used: 0`, `used: 2`, `used: 3`
  (limit reached); PRO
- `recent-reports.stories.tsx` — loading, empty, populated
- `validation-form.stories.tsx` — default, field errors, root error

Skip `WelcomeHeader`, `QuickStats`, and `PendingPaymentNotice` initially. They have one
state each and no branching; stories for them would be the "test that never fails"
equivalent that `context/testing-instructions.md` warns against.

**Do not write stories for `app/dashboard/page.tsx`.** It is an async server component
calling `auth()`. The
[nextjs-vite docs](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)
say to "extract the pure component into a separate file rather than importing the full
page component into stories," since importing node-specific modules breaks the Vite build.
The `b4fb5ef` refactor already did that extraction — the six presentational components are
the correct subjects.

### 5. Add scripts

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

Add `storybook-static/` to `.gitignore`.

## Known conflict: the Vitest addon

Storybook 10 ships an addon that runs stories as Vitest browser tests. **Do not enable it
on the first pass.** The existing `vitest.config.mts` is deliberately narrow:

```ts
environment: 'node',
include: ['{app,lib}/**/*.test.ts'],
```

The addon needs a browser environment (Playwright provider) and its own include pattern.
Merging them means a workspace/projects config, which is a larger change than adding
Storybook itself, and risks disturbing a unit suite that currently passes in ~1.4s.

If story-based tests are wanted later, add them as a second Vitest project rather than
widening the existing one.

## Open questions

- Whether `next/navigation` mocking is needed. `RecentReports` and `PendingPaymentNotice`
  render `next/link`; the framework ships mocked `next/navigation`, `next/headers`, and
  `next/cache`, but this has not been tested here.
- Whether to deploy a static build for review. Only worth it if someone other than the
  author will look at it.

## Sources

- [Storybook for Next.js (Vite)](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)
- [Storybook for Next.js (Webpack)](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- [`@storybook/nextjs-vite` on npm](https://www.npmjs.com/package/@storybook/nextjs-vite)
- Peer dependency ranges above were read from the registry with
  `npm view @storybook/nextjs-vite peerDependencies`, not from documentation.
