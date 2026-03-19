# CINOLU API

Backend API for the CINOLU platform, built with **NestJS**, **TypeORM**, and **MariaDB**.

It powers the core platform features around authentication, users, programs, projects, events, ventures, mentors, blog content, notifications, highlights, stats, galleries, and static assets.

## Stack

- **Framework:** NestJS 11
- **Language:** TypeScript
- **Database:** MariaDB
- **ORM:** TypeORM
- **Authentication:** Session auth, Passport, JWT, Google OAuth
- **Email:** Nodemailer + `@nestjs-modules/mailer`
- **File handling:** Multer
- **Validation:** class-validator + class-transformer

## Core Features

- Modular NestJS architecture
- Session-based authentication with role-based access control
- Google OAuth integration
- JWT support for token-based flows
- Database migrations with TypeORM
- Static file serving
- Email sending support
- Global request validation
- CORS enabled for frontend integration

## Project Structure

```text
src/
├── app.module.ts
├── main.ts
├── core/
│   ├── auth/
│   ├── helpers/
│   ├── interceptors/
│   └── types/
├── modules/
│   ├── blog/
│   ├── events/
│   ├── highlights/
│   ├── mentors/
│   ├── notifications/
│   ├── programs/
│   ├── projects/
│   ├── stats/
│   ├── subprograms/
│   ├── users/
│   └── ventures/
└── shared/
    ├── config/
    ├── database/
    ├── email/
    ├── galleries/
    ├── jwt/
    └── static/
```

## Requirements

Before running the project, make sure you have:

- **Node.js** 18+
- **pnpm**
- **MariaDB** database

## Installation

```bash
pnpm install
```

## Environment Variables

Create a `.env` file in the project root.

A starter template is available in `.env.example`.

### Example

```env
PORT=8000

DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=

SESSION_SECRET=
SESSION_RESAVE=
SESSION_SAVE_UNINITIALIZED=

GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/redirect
FRONTEND_URI=http://localhost:4200
```

### Notes

- `PORT` defaults to `3000` in code when not provided.
- Google OAuth callback is configured through `GOOGLE_REDIRECT_URI`.
- Session behavior depends on the session-related environment variables.

## Running the API

### Development

```bash
pnpm start:dev
```

### Debug mode

```bash
pnpm start:debug
```

### Production

```bash
pnpm build
pnpm start:prod
```

### Standard start

```bash
pnpm start
```

By default, local development commonly runs on:

- `http://localhost:8000`

## Available Scripts

```bash
pnpm build         # Build the application
pnpm start         # Start the app
pnpm start:dev     # Start in watch mode
pnpm start:debug   # Start in debug + watch mode
pnpm start:prod    # Run compiled output from dist/
pnpm lint          # Lint and auto-fix files
pnpm format        # Format source files
pnpm test          # Run tests
pnpm test:watch    # Run tests in watch mode
pnpm test:cov      # Generate coverage report
pnpm test:debug    # Run tests in debug mode
```

## Database Migrations

### Generate a migration

```bash
pnpm db:migrate --name=your_migration_name
```

### Run migrations

```bash
pnpm db:up
```

### Revert the last migration

```bash
pnpm db:down
```

Migration files are stored in:

```text
src/shared/database/migrations/
```

## API Modules

This API is organized into domain modules.

### Authentication

- `/auth`

### Users and Roles

- `/users`
- `/roles`

### Programs

- `/programs`
- `/program-categories`
- `/subprograms`

### Projects

- `/projects`
- `/project-categories`
- `/phases`
- `/deliverables`
- `/resources`

### Events

- `/events`
- `/event-categories`

### Mentors

- `/mentors`
- `/expertises`

### Ventures

- `/ventures`
- `/products`

### Blog

- `/articles`
- `/comments`
- `/tags`

### Other Platform Modules

- `/highlights`
- `/notifications`
- `/stats`

## Runtime Behavior

A few relevant runtime details from the current app setup:

- Global validation is enabled with NestJS `ValidationPipe`
- CORS is enabled with credentials support
- Session middleware is enabled through `express-session`
- Passport is initialized for authentication flows
- Global guards are applied for session auth and RBAC
- A global transform interceptor is registered at application level

## Development Notes

- The project uses **TypeORM CLI** through a pnpm script.
- Husky is configured via the `prepare` script.
- Static assets and galleries are handled through dedicated shared modules.
- The codebase follows a modular structure that keeps domain logic separated and scalable.

## License

This project is marked as **UNLICENSED**.

## Author

**Wilfried M**
