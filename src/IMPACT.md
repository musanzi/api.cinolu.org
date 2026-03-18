# 🧠 Codex Task — `impact` Module (Impact Tracking / Reporting)

## Context

This is a NestJS API for **Cinolu One Stop Support** — an innovation hub platform.
The codebase uses:
- **TypeORM** with UUID primary keys (via `AbstractEntity`)
- **RBAC** via `@musanzi/nestjs-session-auth` — use `@Rbac({ resource, action })` and `@Public()` decorators
- **DTOs** with `class-validator`
- **Pagination** via `FilterXxxDto` with `page` field
- **Module structure**: `dto/`, `entities/`, `services/`, `*-rbac.ts`, `*.controller.ts`, `*.module.ts`

Reference modules to follow as patterns: `ventures`, `projects`, `stats`.

---

## Task

Build the `impact` module from scratch inside:
```
src/modules/impact/
```

---

## Entities

### Entity: `ImpactReport`

Extend `AbstractEntity` (provides `id`, `created_at`, `updated_at`, `deleted_at`).

Fields:
```ts
title: string
period: ImpactPeriod (enum)
year: number
quarter: number (nullable — 1–4, only relevant when period = QUARTERLY)
jobs_created: number (default: 0)
revenue_generated: number (default: 0)  // in USD or local currency
beneficiaries: number (default: 0)
description: string (type: 'text')
metrics: object (type: 'json', nullable)  // flexible KPI bag: { [key: string]: number | string }
is_verified: boolean (default: false)
verified_at: Date (nullable)

// Relations
submitted_by: User (ManyToOne)
verified_by: User (ManyToOne, nullable)
linked_venture: Venture (ManyToOne, nullable)
linked_project: Project (ManyToOne, nullable)
```

Enums:
```ts
export enum ImpactPeriod {
  ANNUAL = 'annual',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}
```

---

### Entity: `ImpactMetricDefinition`

Extend `AbstractEntity`.

Allows staff to define standard KPI names/types so reports use consistent keys.

Fields:
```ts
key: string (unique)   // e.g. "women_entrepreneurs"
label: string          // e.g. "Women Entrepreneurs Supported"
unit: string (nullable) // e.g. "count", "USD", "%"
description: string (type: 'text', nullable)
is_active: boolean (default: true)
```

---

## RBAC Policy (`impact-rbac.ts`)

```ts
export const IMPACT_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'impact',
  grants: [
    {
      roles: [Role.STAFF, Role.ADMIN],
      actions: ['read', 'create', 'update', 'delete'],
      resources: ['impactReports', 'impactMetrics']
    },
    {
      roles: [Role.USER, Role.MENTOR],
      actions: ['create', 'read'],
      resources: ['impactReports']
    }
  ]
};
```

---

## Endpoints to implement

### Public (use `@Public()`)

```
GET  /impact/reports/public             — List verified reports (public showcase, paginated)
GET  /impact/reports/:id                — Get single report detail
```

### Authenticated (venture/project owner)

```
POST   /impact/reports                  — Submit impact report
GET    /impact/reports/me               — My submitted reports
PATCH  /impact/reports/:id              — Update own unverified report
DELETE /impact/reports/:id              — Delete own unverified report (soft)
```

### Staff/Admin only

```
GET    /impact/reports                  — List all reports (paginated, filterable)
PATCH  /impact/reports/:id/verify       — Verify a report (sets is_verified, verified_at, verified_by)
PATCH  /impact/reports/:id/unverify     — Unverify (revert)
GET    /impact/reports/summary          — Aggregate stats: total jobs, revenue, beneficiaries
POST   /impact/metrics                  — Create metric definition
GET    /impact/metrics                  — List all metric definitions
PATCH  /impact/metrics/:id              — Update metric definition
DELETE /impact/metrics/:id              — Soft delete metric definition
```

---

## Services

Split into two services:
- `ImpactReportsService` — CRUD, verify/unverify, public list, my reports, aggregate summary
- `ImpactMetricsService` — CRUD for metric definitions

---

## DTOs

- `CreateImpactReportDto` — title (string), period (ImpactPeriod), year (number), quarter (optional 1–4), jobs_created (optional number), revenue_generated (optional number), beneficiaries (optional number), description (string), metrics (optional object), linked_venture_id (optional UUID), linked_project_id (optional UUID)
- `UpdateImpactReportDto` — `PartialType(CreateImpactReportDto)`
- `FilterImpactReportsDto` — page (number), year (optional number), period (optional ImpactPeriod), is_verified (optional boolean), submitted_by_id (optional UUID)
- `CreateMetricDefinitionDto` — key (string), label (string), unit (optional string), description (optional string)
- `UpdateMetricDefinitionDto` — `PartialType(CreateMetricDefinitionDto)`

---

## Module Registration

Register `ImpactModule` in `src/app.module.ts`.
Register `IMPACT_RBAC_POLICY` in the auth/rbac bootstrap.

---

## Implementation Notes

- **Ownership enforcement:** `PATCH /impact/reports/:id` and `DELETE /impact/reports/:id` — only the `submitted_by` user or STAFF/ADMIN may modify. Throw `ForbiddenException` otherwise.
- **Immutable once verified:** If `is_verified = true`, reject edits with `ConflictException('Report is already verified')`. Staff must unverify first.
- **Verify endpoint:** Sets `is_verified = true`, `verified_at = new Date()`, `verified_by` = session user. Unverify clears all three.
- **Summary endpoint:** `GET /impact/reports/summary` — use `SELECT SUM(jobs_created), SUM(revenue_generated), SUM(beneficiaries) FROM impact_report WHERE is_verified = true` (can be year-filtered).
- **metrics JSON field:** Typed as `Record<string, number | string>` in TypeScript — stored as JSON column in DB. Validate that provided keys match active `ImpactMetricDefinition` keys (optional but recommended).
- **Linked entity:** At least one of `linked_venture_id` or `linked_project_id` should be provided — add a custom validator or service-level check.
- **Soft deletes** use `softDelete()`.

---

_Generated by Willo — Cinolu API assistant_
