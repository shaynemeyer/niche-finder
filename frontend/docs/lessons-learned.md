# Lessons learned

Bugs and traps that cost real time, with enough detail to avoid paying twice. Add to this
when something surprises you — not when something merely takes a while.

## The pipeline passed every test while being completely broken

Three bugs sat between `POST /api/validate` and a real report. All three were invisible to
87 unit tests and 20 E2E specs, because **every one degraded to the fallback template
instead of erroring**. The dashboard looked fine. Reports completed. Only the missing score
hinted at anything, and that is easy to read as a genuine low-demand niche.

| #   | Bug                                                                            | Symptom                                 | Found by             |
| --- | ------------------------------------------------------------------------------ | --------------------------------------- | -------------------- |
| 1   | Test asserted a `gpt-4-turbo` default after the models changed to `gpt-5-nano` | A failing test nobody had triaged       | Reading the suite    |
| 2   | `temperature: 0.7` sent to gpt-5                                               | 400 on every model, chain exhausted     | Running a validation |
| 3   | `MAX_TOKENS: 800`                                                              | Reasoning ate the budget, empty content | Running a validation |

**The lesson: mocks confirm the code does what you wrote, not that what you wrote is
right.** Both real bugs were in the boundary with a third-party API — exactly where mocks
assert your assumptions back at you. One live run found what 107 tests could not.

Practical rule: after any change to a service that calls an external API, run it against
the real thing once before trusting the suite.

## Fallbacks hide failures — make them loud

`OpenAIService` falls back to a built-in template when every model fails. That is good
behaviour: a Trends outage should not take down the product. But it converts a hard failure
into a soft one, and a soft failure is one nobody investigates.

Two things made this survivable and are worth preserving:

- **`isFallback` on the payload.** Without it there is no way to tell template output from
  analysis after the fact.
- **Withholding the score when `isFallback` is true.** The fallback computes a plausible
  0–100 heuristic from trends data alone. Storing it would have rendered a real-looking
  score on a boilerplate report, and nothing would have looked wrong.

If you add another fallback path, add the flag with it.

## gpt-5 models are reasoning models

Two settings follow, and both fail silently rather than loudly:

**`temperature` is rejected.** Only the default of 1 is accepted; any explicit value returns
a 400. There is no value that works, so the parameter is simply absent.

**`max_completion_tokens` covers reasoning plus output, reasoning first.** Measured against
`gpt-5-nano` at this project's prompt size:

| Budget | `finish_reason` | Reasoning tokens | Content    |
| ------ | --------------- | ---------------- | ---------- |
| 800    | `length`        | 800 (all of it)  | empty      |
| 4000   | `stop`          | 2240             | 1200 chars |

Even `"reply with the word ok"` spends 64 reasoning tokens. Budget for reasoning first and
the response second, and treat `finish_reason: "length"` with empty content as "the cap was
too low", not "the API is down".

## Error messages should name the cause

`throw new Error('No response from OpenAI')` sent the investigation toward the network. The
API had responded perfectly well — it had simply run out of budget mid-reasoning. The
message now reads `reasoning used the whole 800-token budget`, which points at the fix.

When an error is thrown at a boundary you do not control, include the piece of the response
that explains it.

## A green test is not evidence until you have seen it fail

Twice in one session a test passed for the wrong reason:

- A mutation applied with `perl -0pi` silently did not match, so "the test still passes"
  meant nothing.
- A Playwright run reused a **stale server on port 3000** left over from a manual
  `bun run start`, so the suite tested a build from before the fix and failed against code
  that was already correct.

Before trusting a test that guards something important, break the thing it guards and watch
it fail. Every security- or correctness-critical test in this repo has been mutation-tested
that way. And kill port 3000 before an E2E run if you have started a server by hand —
Playwright's `reuseExistingServer` will happily attach to it.

## Framework specifics that cost time

**`notFound()` responds 200, not 404,** in a streamed dynamic route. Next returns 404 only
for non-streamed responses. An E2E spec asserting the status will fail even when the
behaviour is correct — assert on the rendered content instead.

**`PageProps<'/route'>` is generated from the route manifest.** A brand-new route fails
typecheck with `does not satisfy the constraint 'AppRoutes'` until a build has seen the
file. Run the build once, then re-check; the code was never wrong.

**`CardTitle` renders a `div`.** It is not a heading, so `getByRole('heading', …)` will not
find it and screen readers get no page title. Render a real `h1` where the page needs one.

**The Prisma client is generated as CommonJS** (`moduleFormat = "cjs"`), because
`package.json` declares no `"type": "module"`. ESM output could not be imported from
Playwright specs at all. `lib/generated/prisma` is gitignored, so pulling a schema change
needs `bunx prisma generate` — the schema alone does not update a local client.
