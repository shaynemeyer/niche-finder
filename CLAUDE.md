# CLAUDE.md

Guidance for Claude Code when working in this repository.

The application lives in `frontend/` — all source, tests, and commands are there, so `cd
frontend` before running anything. Read [`frontend/CLAUDE.md`](frontend/CLAUDE.md) for
stack-specific traps: Next.js 16 renamed Middleware to Proxy, Tailwind v4 has no config file,
and Prisma 7's driver adapter ignores `?schema=` in the connection string.

Authentication is built and tested; the report pipeline is not. Treat anything past auth as
greenfield.

## Context Files

Read the following to get the full context of the project:

@context/project-overview.md
@context/coding-standards.md
@context/ai-interaction.md
@context/testing-instructions.md
@context/current-feature.md
