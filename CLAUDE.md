# CLAUDE.md

## Required Architecture

This project is a full stack TypeScript chess system with an immutable Ledger.

Claude must preserve these boundaries:

- Domain contains business concepts and must not import frameworks, SDKs, databases, HTTP clients, or UI libraries.
- Application contains use cases and ports.
- Infrastructure implements adapters for PostgreSQL, DynamoDB, chess rules, config, and admin tokens.
- Interfaces contains Nest controllers/DTOs/guards/filters and React UI.
- Shared contracts live in `packages/shared` and are used by both apps for typed API communication.
- The frontend uses Tailwind CSS utilities through the official Vite plugin.

## Non-Negotiables

- Every chess move must create append-only Ledger events in DynamoDB.
- Board state is JSON and is rendered by the frontend from backend responses.
- PostgreSQL owns match summaries, players, scoreboards, duration, wins, losses, draws, and match history.
- Admin Ledger access is protected by `ADMIN_LEDGER_PASSWORD`.
- Do not use custom CSS for UI layout/components; use Tailwind classes in JSX.
- Do not use emoji or Unicode glyph maps for chess pieces. Use the React icon component layer.

## Feature Workflow

1. Start with domain/application behavior.
2. Add or reuse ports for external dependencies.
3. Implement infrastructure adapters outside domain/application.
4. Expose behavior through Nest controllers or React components.
5. Add Jest tests for the use case or domain rule.
6. Update README and agent docs when behavior, commands, or architecture changes.

## Verification

Run `npm run lint`, `npm test`, and `npm run build` when dependencies are available.

GitHub Actions CI runs on every pull request targeting `main` and also validates `docker compose config`.

If verification cannot run, report the exact blocker.
