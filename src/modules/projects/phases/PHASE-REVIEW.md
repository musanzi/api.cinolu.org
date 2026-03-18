# 🧠 Codex Task — Phase Review & Qualification Workflow

## Context

This is a NestJS API for **Cinolu One Stop Support** — an innovation hub platform.
The codebase uses:
- **TypeORM** with UUID primary keys (via `AbstractEntity`)
- **RBAC** via `@musanzi/nestjs-session-auth` — use `@Rbac({ resource, action })` and `@Public()` decorators
- **File uploads** via `multer` + `FileInterceptor` + `createDiskUploadOptions` helper
- **DTOs** with `class-validator`
- **Pagination** via `FilterXxxDto` with `page` field
- **Module structure**: `dto/`, `entities/`, `services/`, `*-rbac.ts`, `*.controller.ts`, `*.module.ts`
- **Existing entities to extend:** `DeliverableSubmission`, `Phase`, `ProjectParticipation` — in `src/modules/projects/`

Reference modules: `projects`, `notifications`, `mentors`.

---

## Task

Implement the **Phase Review & Qualification** workflow. This spans multiple existing modules and introduces new entities. Work touches:

```
src/modules/projects/      ← extend DeliverableSubmission, Phase
src/modules/phase-reviews/ ← new module: PhaseReview
src/modules/in-app-notifications/ ← new module: InAppNotification
```

---

## Background & Design Decisions

The current `projects` module has participations, phases, deliverables, and `DeliverableSubmission` — but:
- Submissions have no status, no feedback, no reviewer.
- Phase advancement is 100% manual with no audit trail.
- Mentors are assigned to phases but have no workflow actions.
- There is no in-app notification system (only email-blast `notifications`).

This feature fixes all of that.

**Key design decisions (non-negotiable):**
1. **Phase ordering** uses `position: number` on `Phase` — NOT dates.
2. **Any staff member** can review — not limited to assigned mentors (mentors can view but staff reviews).
3. **Participants cannot resubmit** once a submission is reviewed — if `status !== PENDING`, file replacement is BLOCKED.
4. **Review scores and feedback are visible to participants IMMEDIATELY** after review creation.
5. **Notifications are in-app only** (5 trigger types — see below). No email blast from this workflow.

---

## Part 1 — Extend Existing Entities

### Extend `Phase` entity

Add field:
```ts
position: number  // ordering within a program's phases — lower = earlier
```

### Extend `DeliverableSubmission` entity

Add fields:
```ts
status: SubmissionStatus (enum, default: PENDING)
feedback: string (type: 'text', nullable)   // reviewer's inline comment
reviewed_by: User (ManyToOne, nullable)
reviewed_at: Date (nullable)
```

```ts
export enum SubmissionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}
```

> Add a migration for the new columns — do NOT rely on `synchronize`.

---

## Part 2 — New Entity: `PhaseReview`

### Entity: `PhaseReview`

Extend `AbstractEntity`.

One per (participation × phase) — enforce uniqueness.

```ts
status: PhaseReviewStatus (enum, default: PENDING)
score: number (nullable)          // 0–100
feedback: string (type: 'text', nullable)
auto_advance: boolean (default: false)
                                  // if true AND status = QUALIFIED, automatically enroll
                                  // this participant in the next phase on save
reviewed_at: Date (nullable)      // set when status transitions out of PENDING

// Relations
phase: Phase (ManyToOne)
participation: ProjectParticipation (ManyToOne)
reviewer: User (ManyToOne, nullable)   // staff member who created/last updated the review
```

```ts
export enum PhaseReviewStatus {
  PENDING = 'pending',
  QUALIFIED = 'qualified',
  DISQUALIFIED = 'disqualified',
  CONDITIONAL = 'conditional'   // qualified with conditions to meet
}
```

Add unique constraint: `@Unique(['phase', 'participation'])`.

---

## Part 3 — New Entity: `InAppNotification`

### Entity: `InAppNotification`

Extend `AbstractEntity`.

Lightweight in-app notification (separate from the existing email-blast `Notification` entity).

```ts
type: InAppNotificationType (enum)
title: string
body: string (type: 'text')
is_read: boolean (default: false)
read_at: Date (nullable)
reference_id: string (nullable)   // uuid of the related entity (review, submission, phase, etc.)
reference_type: string (nullable) // e.g. 'phase_review', 'deliverable_submission', 'phase'

// Relations
recipient: User (ManyToOne)
```

```ts
export enum InAppNotificationType {
  REVIEW_CREATED = 'review_created',         // participant: a phase review was created for you
  REVIEW_UPDATED = 'review_updated',         // participant: your phase review was updated
  SUBMISSION_REVIEWED = 'submission_reviewed', // participant: your file submission was reviewed
  PHASE_ADVANCED = 'phase_advanced',         // participant: you advanced to the next phase
  PHASE_DISQUALIFIED = 'phase_disqualified'  // participant: you were disqualified from a phase
}
```

---

## Module: `phase-reviews`

```
src/modules/phase-reviews/
  dto/
    create-phase-review.dto.ts
    update-phase-review.dto.ts
    bulk-qualify.dto.ts
    filter-phase-reviews.dto.ts
  entities/
    phase-review.entity.ts
  services/
    phase-reviews.service.ts
    phase-advance.service.ts
  phase-reviews-rbac.ts
  phase-reviews.controller.ts
  phase-reviews.module.ts
```

## Module: `in-app-notifications`

```
src/modules/in-app-notifications/
  dto/
    filter-notifications.dto.ts
  entities/
    in-app-notification.entity.ts
  services/
    in-app-notifications.service.ts
  in-app-notifications-rbac.ts
  in-app-notifications.controller.ts
  in-app-notifications.module.ts
```

---

## RBAC Policies

### `phase-reviews-rbac.ts`

```ts
export const PHASE_REVIEWS_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'phase-reviews',
  grants: [
    {
      roles: [Role.STAFF, Role.ADMIN],
      actions: ['read', 'create', 'update', 'delete'],
      resources: ['phaseReviews', 'deliverableSubmissions']
    },
    {
      roles: [Role.MENTOR],
      actions: ['read'],
      resources: ['phaseReviews', 'deliverableSubmissions']
    },
    {
      roles: [Role.USER],
      actions: ['read'],
      resources: ['phaseReviews', 'deliverableSubmissions']
    }
  ]
};
```

### `in-app-notifications-rbac.ts`

```ts
export const IN_APP_NOTIFICATIONS_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'in-app-notifications',
  grants: [
    {
      roles: [Role.STAFF, Role.ADMIN, Role.USER, Role.MENTOR],
      actions: ['read', 'update', 'delete'],
      resources: ['inAppNotifications']
    }
  ]
};
```

---

## Endpoints to implement

### Deliverable Submission Review (extend existing projects routes)

```
PATCH  /deliverables/submissions/:id/review
       — Staff reviews a single file submission
       — Body: { status: SubmissionStatus, feedback?: string }
       — Sets reviewed_by (session user), reviewed_at
       — Blocks if submission.status !== PENDING
       — Triggers InAppNotification type: SUBMISSION_REVIEWED to participation.user

GET    /deliverables/:deliverableId/:participationId/submission
       — Get the submission for a specific deliverable + participation
       — Staff sees full review data; participant sees own submission only
```

### Phase Review Endpoints

```
POST   /phases/:phaseId/participations/:participationId/review
       — Create or update (upsert) a phase review
       — Body: CreatePhaseReviewDto
       — Sets reviewer = session user
       — If review already exists, update it (no duplicate — one per participation×phase)
       — If status changes from PENDING → QUALIFIED/DISQUALIFIED/CONDITIONAL, set reviewed_at
       — If auto_advance = true AND status = QUALIFIED → trigger PhaseAdvanceService
       — Triggers InAppNotification:
           REVIEW_CREATED (first creation) or REVIEW_UPDATED (subsequent)
           PHASE_ADVANCED if auto_advance advanced them
           PHASE_DISQUALIFIED if status = DISQUALIFIED

GET    /phases/:phaseId/reviews
       — List all PhaseReviews for a phase (staff/admin)
       — Include participant info, submission count, review status
       — Paginated

GET    /phases/:phaseId/reviews/summary
       — Aggregate: { qualified: n, disqualified: n, conditional: n, pending: n, avg_score: n }
       — Staff/admin only

POST   /phases/:phaseId/reviews/bulk-qualify
       — Bulk create/update reviews for multiple participations
       — Body: BulkQualifyDto { entries: [{ participation_id, status, score?, feedback?, auto_advance? }] }
       — Executes in a single transaction
       — Triggers notifications for each participant
       — Staff/admin only
```

### In-App Notifications Endpoints

```
GET    /in-app-notifications/me
       — List my notifications (paginated, newest first)
       — Optionally filter by is_read=false for unread only

GET    /in-app-notifications/me/unread-count
       — Returns { count: number } for badge display

PATCH  /in-app-notifications/:id/read
       — Mark single notification as read (sets is_read=true, read_at=now)
       — Only recipient may mark their own notification

PATCH  /in-app-notifications/me/read-all
       — Mark ALL my notifications as read in one query

DELETE /in-app-notifications/:id
       — Delete own notification (soft delete)
```

---

## Services

### `PhaseReviewsService`
- `upsertReview(phaseId, participationId, dto, reviewerId)` — create or update, set reviewed_at on first non-PENDING status
- `findAllForPhase(phaseId, filterDto)` — paginated list with participant + submission info
- `getSummary(phaseId)` — aggregate counts and avg score
- `bulkQualify(phaseId, dto, reviewerId)` — transaction, calls upsertReview in loop, collects notifications

### `PhaseAdvanceService`
- `advanceToNextPhase(participationId, currentPhaseId)` — finds the next phase by `position` (lowest position > current), creates a new `ProjectParticipation` for the user in the next phase (or enrolls in existing participation). Returns new participation.
- Called internally by `PhaseReviewsService` when `auto_advance = true AND status = QUALIFIED`.

### `InAppNotificationsService`
- `create(type, recipientId, title, body, referenceId?, referenceType?)` — internal method used by all trigger points
- `findMine(userId, filterDto)` — paginated
- `countUnread(userId)` — for badge
- `markRead(id, userId)` — validate ownership
- `markAllRead(userId)` — bulk update
- `remove(id, userId)` — soft delete with ownership check

---

## DTOs

### Phase Reviews

- `CreatePhaseReviewDto`:
  ```ts
  status: PhaseReviewStatus (required)
  score: number (optional, min: 0, max: 100)
  feedback: string (optional)
  auto_advance: boolean (optional, default: false)
  ```
- `UpdatePhaseReviewDto` — `PartialType(CreatePhaseReviewDto)`
- `BulkQualifyDto`:
  ```ts
  entries: BulkQualifyEntryDto[]

  // BulkQualifyEntryDto:
  participation_id: string (UUID)
  status: PhaseReviewStatus
  score?: number
  feedback?: string
  auto_advance?: boolean
  ```
- `FilterPhaseReviewsDto` — page (number), status (optional PhaseReviewStatus)
- `ReviewSubmissionDto`:
  ```ts
  status: SubmissionStatus (required — ACCEPTED or REJECTED)
  feedback: string (optional)
  ```

### In-App Notifications

- `FilterNotificationsDto` — page (number), is_read (optional boolean)

---

## Module Registration

- Register `PhaseReviewsModule` and `InAppNotificationsModule` in `src/app.module.ts`.
- Register both RBAC policies in the auth/rbac bootstrap.
- `PhaseReviewsModule` must import `ProjectsModule` (or the relevant TypeORM features) to access `Phase`, `ProjectParticipation`, `DeliverableSubmission`.
- `InAppNotificationsModule` should be exported so other modules (PhaseReviewsModule, etc.) can inject `InAppNotificationsService`.

---

## Implementation Notes & Gotchas

### Phase Ordering
- `position` on `Phase` determines order. To find the "next phase", query:
  ```ts
  repo.findOne({
    where: { program: { id: currentPhase.program.id }, position: MoreThan(currentPhase.position) },
    order: { position: 'ASC' }
  })
  ```
- If no next phase exists (`null`), log and return without throwing — the participant has completed all phases.

### Resubmit Blocking
- In the existing deliverable submission upload endpoint (in `projects` module), add a guard:
  ```ts
  if (existingSubmission && existingSubmission.status !== SubmissionStatus.PENDING) {
    throw new ForbiddenException('Submission has already been reviewed and cannot be replaced.');
  }
  ```

### Upsert Review
- Use `findOne` to check if a `PhaseReview` already exists for (phase, participation).
- If found: update fields + determine if this is an update (for notification type).
- If not found: create new (for REVIEW_CREATED notification).
- Always use a TypeORM transaction when also triggering phase advancement.

### Auto-Advance Transaction
- `bulkQualify` must wrap all upserts + phase advancements + notification creations in a **single transaction** to ensure atomicity.
- Use `QueryRunner` (follow existing project participation pattern):
  ```ts
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    // ... all operations
    await queryRunner.commitTransaction();
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
  }
  ```

### Notification Ownership
- `PATCH /in-app-notifications/:id/read` and `DELETE /in-app-notifications/:id` — always verify `notification.recipient.id === sessionUserId`. Throw `ForbiddenException` if not.

### Summary Endpoint
- Use a raw TypeORM query or QueryBuilder for the summary:
  ```ts
  SELECT 
    COUNT(*) FILTER (WHERE status = 'qualified') AS qualified,
    COUNT(*) FILTER (WHERE status = 'disqualified') AS disqualified,
    COUNT(*) FILTER (WHERE status = 'conditional') AS conditional,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending,
    AVG(score) AS avg_score
  FROM phase_review
  WHERE phase_id = :phaseId
  ```
  (Adapt for MySQL if needed — use `SUM(CASE WHEN ...)` instead of FILTER.)

### Visibility of Review Data
- Participants (`Role.USER`) may read their own `PhaseReview` (scoped by participation owner).
- Staff may read any review.
- Add a `canViewReview(userId, review)` helper in the service.

### Soft Deletes
- `InAppNotification` uses `DeleteDateColumn` from `AbstractEntity` — use `softDelete()`.
- `PhaseReview` uses soft deletes as well — but consider whether you want true deletion or just status changes for audit trails.

### Existing Projects Module Impact
- The following files in `src/modules/projects/` will need modification:
  - `entities/deliverable-submission.entity.ts` — add 3 new columns + relation
  - `entities/phase.entity.ts` — add `position` column
  - `services/deliverable-submissions.service.ts` — add review method + resubmit block
  - `projects.controller.ts` or a new sub-controller — add the two new submission endpoints
- Be careful not to break existing deliverable submission flow — only add, do not remove.

---

_Generated by Willo — Cinolu API assistant_
