# 🧠 Codex Task — `announcements` Module (Platform-Wide Announcements Feed)

## Context

This is a NestJS API for **Cinolu One Stop Support** — an innovation hub platform.
The codebase uses:
- **TypeORM** with UUID primary keys (via `AbstractEntity`)
- **RBAC** via `@musanzi/nestjs-session-auth` — use `@Rbac({ resource, action })` and `@Public()` decorators
- **File uploads** via `multer` + `FileInterceptor` + `createDiskUploadOptions` helper
- **Slug generation** via `@BeforeInsert` on entities
- **DTOs** with `class-validator`
- **Pagination** via `FilterXxxDto` with `page` field
- **Module structure**: `dto/`, `entities/`, `services/`, `*-rbac.ts`, `*.controller.ts`, `*.module.ts`

Reference modules to follow as patterns: `blog`, `events`.

---

## Task

Build the `announcements` module from scratch inside:
```
src/modules/announcements/
```

This is a lightweight, staff-published feed for platform-wide updates. It is NOT an email-blast system (that's `notifications`). Think of it as a public noticeboard.

---

## Entity: `Announcement`

Extend `AbstractEntity` (provides `id`, `created_at`, `updated_at`, `deleted_at`).

Fields:
```ts
title: string
slug: string (unique, auto-generated from title on @BeforeInsert)
body: string (type: 'text')
category: AnnouncementCategory (enum)
cover: string (nullable — stored filename for optional banner image)
is_published: boolean (default: false)
is_pinned: boolean (default: false)
published_at: Date (nullable — set when first published)
expires_at: Date (nullable — optional expiry date)

// Relations
author: User (ManyToOne)
```

```ts
export enum AnnouncementCategory {
  GENERAL = 'general',
  EVENT = 'event',
  PROGRAM = 'program',
  MAINTENANCE = 'maintenance',
  OPPORTUNITY = 'opportunity',
  URGENT = 'urgent'
}
```

---

## RBAC Policy (`announcements-rbac.ts`)

```ts
export const ANNOUNCEMENTS_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'announcements',
  grants: [
    {
      roles: [Role.STAFF, Role.ADMIN],
      actions: ['read', 'create', 'update', 'delete'],
      resources: ['announcements']
    }
  ]
};
```

> Public read is handled via `@Public()` decorators on the read endpoints — no role grant needed.

---

## Endpoints to implement

### Public (use `@Public()`)

```
GET  /announcements/published           — List published, non-expired announcements (paginated, filterable)
GET  /announcements/pinned              — List currently pinned published announcements
GET  /announcements/:slug               — Get single announcement by slug
```

### Staff/Admin only

```
POST   /announcements                   — Create announcement
GET    /announcements                   — List all announcements incl. unpublished (paginated)
GET    /announcements/:id/admin         — Get single (admin view, by id)
PATCH  /announcements/:id               — Update metadata/body
PATCH  /announcements/:id/publish       — Toggle is_published (sets published_at on first publish)
PATCH  /announcements/:id/pin           — Toggle is_pinned
PATCH  /announcements/:id/cover         — Upload cover image
DELETE /announcements/:id               — Soft delete
```

---

## File Upload (cover)

- Upload path: `./uploads/announcements`
- Use `createDiskUploadOptions('./uploads/announcements')`
- Field name: `cover`
- Accepted types: JPG, PNG, WEBP

---

## Services

Single service is sufficient given the module's simplicity:
- `AnnouncementsService` — CRUD, publish toggle, pin toggle, cover upload, public list, admin list

---

## DTOs

- `CreateAnnouncementDto` — title (string), body (string), category (AnnouncementCategory), expires_at (optional Date)
- `UpdateAnnouncementDto` — `PartialType(CreateAnnouncementDto)`
- `FilterAnnouncementsDto` — page (number), category (optional AnnouncementCategory), is_pinned (optional boolean)
- `FilterAdminAnnouncementsDto` — page (number), is_published (optional boolean), category (optional AnnouncementCategory)

---

## Module Registration

Register `AnnouncementsModule` in `src/app.module.ts`.
Register `ANNOUNCEMENTS_RBAC_POLICY` in the auth/rbac bootstrap.

---

## Implementation Notes

- **Slug generation:** `@BeforeInsert` — slugify `title`. Append timestamp suffix if collision is possible.
- **Published filter:** `GET /announcements/published` should filter `is_published = true` AND (`expires_at IS NULL OR expires_at > NOW()`).
- **First publish:** When `togglePublish` sets `is_published = true` for the first time, also set `published_at = new Date()`. Subsequent toggle-off/on should not reset `published_at`.
- **Pinned:** Pinned announcements should still be published — the service should enforce `is_published = true` as a prerequisite for pinning. Throw `BadRequestException` if trying to pin an unpublished announcement.
- **Cover upload:** `PATCH /announcements/:id/cover` uses `FileInterceptor('cover', ...)`. Store filename in `announcement.cover`.
- **Soft deletes** use `softDelete()`.
- **No email blast** — this module is feed-only. If email notifications are needed in the future, hook via a TypeORM subscriber.

---

_Generated by Willo — Cinolu API assistant_
