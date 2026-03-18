# 🧠 Codex Task — `badges` Module (Badges & Achievements / Gamification)

## Context

This is a NestJS API for **Cinolu One Stop Support** — an innovation hub platform.
The codebase uses:
- **TypeORM** with UUID primary keys (via `AbstractEntity`)
- **RBAC** via `@musanzi/nestjs-session-auth` — use `@Rbac({ resource, action })` and `@Public()` decorators
- **File uploads** via `multer` + `FileInterceptor` + `createDiskUploadOptions` helper
- **DTOs** with `class-validator`
- **Module structure**: `dto/`, `entities/`, `services/`, `*-rbac.ts`, `*.controller.ts`, `*.module.ts`

Reference modules to follow as patterns: `programs`, `projects` (upvotes/participation hooks).

---

## Task

Build the `badges` module from scratch inside:
```
src/modules/badges/
```

---

## Entities

### Entity: `Badge`

Extend `AbstractEntity` (provides `id`, `created_at`, `updated_at`, `deleted_at`).

Fields:
```ts
name: string (unique)
slug: string (unique, auto-generated from name on @BeforeInsert)
description: string (type: 'text')
icon: string (nullable — stored filename for badge image)
category: BadgeCategory (enum)
trigger: BadgeTrigger (enum)  // what action earns this badge automatically
trigger_threshold: number (nullable — e.g. "5 upvotes received")
is_active: boolean (default: true)
is_manual: boolean (default: false) // true = staff-awarded only, no auto-trigger

// Relations
user_badges: UserBadge[] (OneToMany)
```

Enums:
```ts
export enum BadgeCategory {
  PARTICIPATION = 'participation',
  CONTRIBUTION = 'contribution',
  MENTORING = 'mentoring',
  COMMUNITY = 'community',
  ACHIEVEMENT = 'achievement',
  SPECIAL = 'special'
}

export enum BadgeTrigger {
  PROGRAM_COMPLETION = 'program_completion',
  EVENT_ATTENDANCE = 'event_attendance',
  UPVOTES_RECEIVED = 'upvotes_received',
  REFERRAL_CONVERSION = 'referral_conversion',
  FIRST_PROJECT = 'first_project',
  FIRST_VENTURE = 'first_venture',
  MENTOR_SESSION = 'mentor_session',
  FORUM_REPLIES = 'forum_replies',
  MANUAL = 'manual'
}
```

---

### Entity: `UserBadge`

Extend `AbstractEntity`.

Represents a badge earned by a user (junction with metadata).

Fields:
```ts
awarded_at: Date (default: () => 'CURRENT_TIMESTAMP')
reason: string (nullable — custom note for manual awards)

// Relations
user: User (ManyToOne)
badge: Badge (ManyToOne)
awarded_by: User (ManyToOne, nullable — null for auto-awarded)
```

Add unique constraint: `@Unique(['user', 'badge'])` — a user earns each badge only once.

---

## RBAC Policy (`badges-rbac.ts`)

```ts
export const BADGES_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'badges',
  grants: [
    {
      roles: [Role.STAFF, Role.ADMIN],
      actions: ['read', 'create', 'update', 'delete'],
      resources: ['badges', 'userBadges']
    },
    {
      roles: [Role.USER, Role.MENTOR],
      actions: ['read'],
      resources: ['badges', 'userBadges']
    }
  ]
};
```

---

## Endpoints to implement

### Public (use `@Public()`)

```
GET  /badges                            — List all active badges (public catalogue)
GET  /badges/:id                        — Get badge detail
```

### Authenticated users

```
GET  /badges/me                         — Get my earned badges
GET  /badges/users/:userId              — Get badges earned by a specific user
```

### Staff/Admin only

```
POST   /badges                          — Create a badge definition
PATCH  /badges/:id                      — Update badge metadata
PATCH  /badges/:id/icon                 — Upload badge icon image
DELETE /badges/:id                      — Soft delete badge definition
POST   /badges/:id/award/:userId        — Manually award a badge to a user
DELETE /badges/user-badges/:userBadgeId — Revoke a badge from a user
GET    /badges/user-badges              — List all awarded badges (admin view, paginated)
```

---

## File Upload (icon)

- Upload path: `./uploads/badges`
- Use `createDiskUploadOptions('./uploads/badges')`
- Field name: `icon`
- Accepted types: PNG, SVG, WEBP, JPG

---

## Services

Split into two services:
- `BadgesService` — CRUD for badge definitions, icon upload, list/get
- `UserBadgesService` — manual award, revoke, list by user, check if user has badge, auto-award trigger

---

## DTOs

- `CreateBadgeDto` — name (string), description (string), category (BadgeCategory), trigger (BadgeTrigger), trigger_threshold (optional number), is_manual (optional boolean)
- `UpdateBadgeDto` — `PartialType(CreateBadgeDto)`
- `AwardBadgeDto` — reason (optional string)
- `FilterUserBadgesDto` — page (number), user_id (optional UUID), badge_id (optional UUID)

---

## Module Registration

Register `BadgesModule` in `src/app.module.ts`.
Register `BADGES_RBAC_POLICY` in the auth/rbac bootstrap.

---

## Implementation Notes

- **Slug generation:** `@BeforeInsert` — slugify `name` on the `Badge` entity.
- **Unique award check:** Before inserting a `UserBadge`, check if one already exists for (user, badge). If yes, throw `ConflictException` — each badge is awarded once per user.
- **Auto-trigger hooks:** `UserBadgesService.tryAutoAward(trigger: BadgeTrigger, userId: string, context?: { count?: number })` — called from other services/subscribers (e.g., after event participation, after upvote). The method finds all active non-manual badges with that trigger, checks threshold, and awards if not already earned.
  - Register this via TypeORM subscribers in: `EventParticipationSubscriber`, `ProjectParticipationUpvoteSubscriber`, `ReferralSubscriber` — or call directly from the relevant service.
- **Icon upload:** `PATCH /badges/:id/icon` uses `FileInterceptor('icon', ...)`. Store filename in `badge.icon`.
- **Soft deletes** use `softDelete()`. Soft-deleting a badge does not remove `UserBadge` records — those remain as historical data.
- **Admin list:** `GET /badges/user-badges` should support filtering by user_id and badge_id for audit purposes.

---

_Generated by Willo — Cinolu API assistant_
