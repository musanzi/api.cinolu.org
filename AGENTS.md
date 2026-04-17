# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the application code. Keep domain modules in `src/features/<domain>/` with the usual Nest split: `controllers/`, `services/`, `dto/`, `entities/`, and optional `subscribers/`. Shared infrastructure lives in `src/shared/` for config, database, email, galleries, JWT, and static assets. Cross-cutting auth and helpers belong in `src/core/`. Tests live in `test/` and generally mirror feature names, for example `test/events/events.service.spec.ts`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies.
- `pnpm start:dev`: run the API in watch mode for local development.
- `pnpm build`: compile NestJS output into `dist/`.
- `pnpm start:prod`: run the compiled app from `dist/main`.
- `pnpm lint`: run ESLint and apply safe fixes across `src/` and `test/`.
- `pnpm format`: format TypeScript sources with Prettier.
- `pnpm test`, `pnpm test:watch`, `pnpm test:cov`: run Jest once, in watch mode, or with coverage.
- `pnpm db:up` / `pnpm db:down`: apply or revert TypeORM migrations in `src/shared/database/migrations/`.

## Coding Style & Naming Conventions

Use TypeScript with 2-space indentation, single quotes, semicolons, and 120-character lines, matching `.prettierrc`. Prefer Nest naming conventions: `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs as `*.dto.ts`, and entities as `*.entity.ts`. Use PascalCase for classes, camelCase for methods and variables, and kebab-case in migration names such as `1776090322317-opportunities.ts`.

## Testing Guidelines

Jest with `ts-jest` is the active test stack. Name specs `*.spec.ts` and keep them under `test/<feature>/`. Add or update tests for every service, controller, or migration-related behavior change. No global coverage threshold is enforced in config, so contributors should at least run the affected spec files locally before opening a PR.
