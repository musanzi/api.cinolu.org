## Context

Reference modules to follow as patterns: `programs`, `ventures`.

## Task

Build the `resources` module inside: src/modules/projects/resources/

## Entity: `Resource`

Extend `AbstractEntity` (provides `id`, `created_at`, `updated_at`, `deleted_at`).

Fields:

```ts
title: string
slug: string (unique, auto-generated from title on @BeforeInsert)
description: string (type: 'text')
file: string (stored filename/path — uploaded file)
category: ResourceCategory (enum)
tags: string[] (simple-array column, nullable)
download_count: number (default: 0)
is_published: boolean (default: false)

// Scope relations (mutually exclusive — a resource belongs to a project OR a phase, never both)
project: Project (ManyToOne, nullable, onDelete: SET NULL)
phase: Phase (ManyToOne, nullable, onDelete: SET NULL)
```

Category enum:

```ts
export enum ResourceCategory {
  GUIDE = 'guide',
  TEMPLATE = 'template',
  LEGAL = 'legal',
  PITCH = 'pitch',
  FINANCIAL = 'financial',
  REPORT = 'report',
  OTHER = 'other'
}
```

---

## RBAC Policy (`resources-rbac.ts`)

```ts
export const RESOURCES_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'resources',
  grants: [
    {
      roles: [Role.STAFF, Role.ADMIN],
      actions: ['manage'],
      resources: ['resources']
    }
  ]
};
```

---

### Participant-scoped (authenticated, service checks participation)

```
GET  /resources/project/:projectId     — Resources linked to a project (only project participants)
GET  /resources/phase/:phaseId         — Resources linked to a phase (only phase participants)
```

### Protected (staff / admin only via RBAC)

```
POST   /resources                      — Create resource (with file upload, field name: 'file')
                                          Body accepts optional project_id OR phase_id (not both)
PATCH  /resources/:id                  — Update metadata (title, description, category, tags)
PATCH /ressources/file/:id             — Replace the old file from the disk and update the name in the database
PATCH  /resources/:id/publish          — Toggle is_published
DELETE /resources/:id                  — Soft delete
```

---

## File Upload

- Upload path: `./uploads/resources`
- Use `createDiskUploadOptions('./uploads/resources')` (same helper used in programs/ventures)
- Field name: `file`
- Accepted types: PDF, DOCX, XLSX, PPTX, ZIP

---

## Services

Split into two services:

- `ResourcesService` — CRUD, publish toggle, scope validation, filters, pagination, participation checks
- `ResourceMediaService` — file upload handling

---

## DTOs

- `CreateResourceDto` — title, description, category (ResourceCategory), tags (optional string[]), project_id (optional UUID), phase_id (optional UUID)
- `UpdateResourceDto` — PartialType(CreateResourceDto), exclude project_id/phase_id (scope is set at creation)
- `FilterResourcesDto` — page, category (optional ResourceCategory), tags (optional string)
