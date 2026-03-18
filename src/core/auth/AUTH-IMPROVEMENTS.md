# 🧠 Codex Task — `auth` Improvements (OAuth, Password Reset, Email Verification)

## Context

This is a NestJS API for **Cinolu One Stop Support** — an innovation hub platform.
The codebase uses:
- **TypeORM** with UUID primary keys (via `AbstractEntity`)
- **Session-based auth** via `@musanzi/nestjs-session-auth`
- **RBAC** via `@Rbac({ resource, action })` and `@Public()` decorators
- **DTOs** with `class-validator`
- Existing auth lives in `src/core/auth/`

Reference modules to follow: `src/core/auth/`, `src/modules/users/`.

---

## Task

Extend the existing `core/auth` module with:
1. **Password reset flow** (forgot password → email token → reset)
2. **Email verification on register**
3. **Google OAuth** (Passport.js strategy)

All new files go inside `src/core/auth/` (existing folder).

---

## New Entities

### Entity: `AuthToken`

Extend `AbstractEntity`.

Used for both password reset and email verification tokens.

```ts
token: string (unique)           // cryptographically random hex/uuid token
type: AuthTokenType (enum)
expires_at: Date
used_at: Date (nullable)

// Relations
user: User (ManyToOne)
```

```ts
export enum AuthTokenType {
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification'
}
```

---

### Extend `User` entity

Add fields to the existing `User` entity:

```ts
email_verified: boolean (default: false)
google_id: string (nullable, unique)   // Google OAuth subject ID
```

---

## Endpoints to implement

All new endpoints under `/auth` prefix — add to the existing `AuthController` (or a separate `AuthExtController`).

### Public (use `@Public()`)

```
POST  /auth/forgot-password             — Request password reset email
POST  /auth/reset-password              — Reset password using token
GET   /auth/verify-email/:token         — Verify email address from link
GET   /auth/google                      — Redirect to Google OAuth consent screen
GET   /auth/google/callback             — Google OAuth callback (redirects on success)
```

---

## Services

Add to / extend existing `AuthService` (or create sub-services):
- `AuthPasswordService` — forgot password, reset password, token generation/validation
- `AuthEmailVerificationService` — issue verification token, verify token
- `AuthGoogleService` — validate Google profile, find-or-create user, link Google ID

---

## DTOs

- `ForgotPasswordDto` — email (string, `@IsEmail()`)
- `ResetPasswordDto` — token (string), new_password (string, min length 8), confirm_password (string) — add custom validator to check they match
- `VerifyEmailDto` — (token comes from URL param, no body needed)
- `GoogleCallbackDto` — internal, used to type the Google profile from Passport

---

## Password Reset Flow

```
1. POST /auth/forgot-password { email }
   → Find user by email (silently succeed even if not found — prevent enumeration)
   → Generate token: crypto.randomBytes(32).toString('hex')
   → Persist AuthToken { type: PASSWORD_RESET, token, expires_at: now + 1h, user }
   → Send email with reset link: {FRONTEND_URL}/reset-password?token=<token>
   → (Use existing mailer/nodemailer — follow pattern in notifications module)

2. POST /auth/reset-password { token, new_password, confirm_password }
   → Find AuthToken where token = :token AND type = PASSWORD_RESET AND used_at IS NULL
   → Throw UnauthorizedException if not found
   → Throw UnauthorizedException if expires_at < now
   → Hash new_password with bcrypt (follow existing password hashing in auth service)
   → Update user.password
   → Set authToken.used_at = new Date()
   → Save both in a transaction
```

---

## Email Verification Flow

```
1. On user registration (hook into existing register endpoint or subscriber):
   → Generate AuthToken { type: EMAIL_VERIFICATION, expires_at: now + 24h }
   → Send verification email with link: {FRONTEND_URL}/verify-email?token=<token>

2. GET /auth/verify-email/:token
   → Find AuthToken where token = :token AND type = EMAIL_VERIFICATION AND used_at IS NULL
   → Throw UnauthorizedException if not found or expired
   → Set user.email_verified = true
   → Set authToken.used_at = new Date()
   → Redirect to frontend success page (or return JSON { verified: true })
```

---

## Google OAuth Flow

```
Dependencies to add:
  npm install passport passport-google-oauth20 @nestjs/passport
  npm install -D @types/passport-google-oauth20

1. Create GoogleStrategy (src/core/auth/strategies/google.strategy.ts)
   → Extends PassportStrategy(Strategy, 'google')
   → Scopes: ['email', 'profile']
   → validate(accessToken, refreshToken, profile) → calls AuthGoogleService.findOrCreate(profile)

2. AuthGoogleService.findOrCreate(profile):
   → Look up user by google_id = profile.id
   → If not found, look up by profile.emails[0].value
   → If still not found, create new User { email, name, google_id, google_image, email_verified: true }
   → If found by email, link google_id to existing account
   → Return user

3. GET /auth/google → @UseGuards(AuthGuard('google')) — triggers redirect
4. GET /auth/google/callback → @UseGuards(AuthGuard('google')) → establish session → redirect to frontend

Config (in .env):
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
  FRONTEND_URL=http://localhost:4200
```

---

## Module Registration

- `AuthToken` entity must be registered in `TypeOrmModule.forFeature([..., AuthToken])` inside `AuthModule`.
- Add `google_id` and `email_verified` columns via a TypeORM migration (do NOT use `synchronize: true` in production).
- `PassportModule` and `GoogleStrategy` must be registered in `AuthModule`.

---

## Implementation Notes

- **Token expiry cleanup:** Consider a cron job or scheduled task to delete expired unused tokens periodically. Use `@nestjs/schedule` if already available, otherwise document the need.
- **Password hashing:** Follow the existing bcrypt pattern in the codebase — do NOT introduce a second hashing library.
- **Session establishment after OAuth:** After Google callback, call the existing session creation mechanism (same as regular login) so the user gets a session cookie.
- **Prevent duplicate google_id:** Add `unique: true` on `google_id` column in User entity.
- **Email sending:** Follow the existing mailer pattern (check `notifications` module for how emails are sent). Create templates for reset and verification emails.
- **Security:** Reset and verification tokens must be single-use (`used_at IS NULL` check) and time-limited.

---

_Generated by Willo — Cinolu API assistant_
