# AGENTS.md

## Project Context

- Project: Chess With Ledger
- Stack: React + Vite + TypeScript, Tailwind CSS, NestJS + TypeScript, PostgreSQL, DynamoDB Local, Docker Compose, Jest.
- Purpose: local turn-based multiplayer chess where every match action is stored in an immutable Ledger.

## Architecture Rules

- Preserve Clean Architecture boundaries:
  - `domain`: business concepts and invariants. No Nest, React, database, HTTP, or SDK imports.
  - `application`: use cases and ports. It orchestrates behavior and depends on abstractions.
  - `infrastructure`: adapters for PostgreSQL, DynamoDB, chess engine, config, and tokens.
  - `interfaces`: HTTP controllers, guards, DTOs, filters, React pages, hooks, and components.
  - `packages/shared`: typed API contracts shared by frontend and backend.
- Dependency direction must stay: `interfaces -> application -> domain` and `infrastructure -> application`.
- Use `chess.js` behind `ChessRulesEngine`; do not hand-roll chess legality rules.
- The Ledger is append-only. Do not add update/delete behavior for ledger events unless the product requirement changes.
- PostgreSQL stores relational/statistical data. DynamoDB stores immutable ledger events and board snapshots.

## Commands

- Install: `npm install`
- Dev stack with Docker: `cp .env.example .env` then `npm run docker:up`
- Local dev without app containers: start Postgres/DynamoDB with Docker, then `npm run dev`
- Build: `npm run build`
- Tests: `npm test`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint`

## Testing

- Add or update Jest tests for domain/application behavior.
- Mock infrastructure through ports/interfaces.
- Do not test business behavior by importing database adapters.
- Run `npm run lint`, `npm test`, and `npm run build` before declaring work complete when dependencies are installed.
- CI runs these checks plus `docker compose config` on every pull request targeting `main`.

## Frontend Rules

- Use Tailwind utilities for UI styling. Do not add custom component CSS for layout or visual styling.
- Keep `apps/web/src/styles.css` as the Tailwind entrypoint only.
- Use `react-icons/gi` for chess pieces. Do not render chess pieces with emoji or Unicode glyph maps.
- Keep board, pieces, controls, history, captured pieces, and admin ledger views componentized.
- Do not put chess rules in React components. The UI renders backend JSON and submits typed commands.

## Change Discipline

- Inspect existing files before editing.
- Preserve user changes.
- Keep docs updated when commands, architecture, env vars, or behavior changes.
- Work on feature branches and open PRs into `main`.
- Do not merge a PR until GitHub Actions CI is green.
