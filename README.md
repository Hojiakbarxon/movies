# 🎬 Movies Platform API

A NestJS + PostgreSQL (TypeORM) backend for a movie streaming platform — users can browse movies, subscribe to premium plans, leave reviews, save favorites, and stream based on their subscription tier. Admins and superadmins manage content, categories, and users through role-based access control.

## Features

- **Authentication** — email/OTP-based registration, JWT access + refresh tokens (cookie-based), password reset
- **Role-based access control** — `user`, `admin`, `superadmin` roles with route-level and ownership-level guards
- **Users & Profiles** — separate profile entity, avatar upload via Multer
- **Movies** — CRUD with poster upload, multi-quality video files, category tagging via a dedicated junction entity
- **Categories** — slug-based, many movies per category
- **Subscriptions & Payments** — subscription plans, purchase flow, simulated payment processing, auto-renewal via cron job
- **Favorites & Reviews** — per-user favorites list, star-rated reviews with ownership checks
- **Subscription-gated streaming** — free vs. premium content access enforced via guard
- **Centralized error handling** — global exception filter with structured JSON responses
- **Logging** — Winston-based logging, console output + persisted error logs
- **Validation** — DTO-based request validation with `class-validator`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [NestJS](https://nestjs.com/) 11 |
| Database | PostgreSQL |
| ORM | TypeORM |
| Auth | JWT (`jsonwebtoken`), bcrypt |
| File uploads | Multer |
| Email | Nodemailer |
| Scheduling | `@nestjs/schedule` (cron jobs) |
| Logging | Winston (`nest-winston`) |
| Validation | `class-validator`, `class-transformer` |

## Project Structure

```
src/
├── auth/            # register, login, OTP, JWT, guards (auth/role/ownership/subscription)
├── users/            # users + profiles
├── categories/        # movie categories
├── movies/            # movies, movie files, reviews, admin movie management
├── subscriptions/       # subscription plans + user subscriptions
├── payments/          # simulated payment processing
├── favourites/          # user favorites
├── filters/           # global exception filter
├── log/              # Winston configuration
├── startup/           # validation pipe config
└── utils/            # shared helpers (Crypto, Conflict, Token, mail, OTP, Multer configs)
```

## Getting Started

### Prerequisites

- Node.js (LTS)
- PostgreSQL running locally or accessible via connection string

### Installation

```bash
git clone < https://github.com/Hojiakbarxon/movies.git >
cd movies
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the app listens on |
| `DB_URL` | PostgreSQL connection string (`postgres://user:pass@host:port/dbname`) |
| `MAIL_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | SMTP account email |
| `MAIL_PASS` | SMTP account password / app password |
| `ACCESS_TOKEN_KEY` | JWT secret for access tokens |
| `ACCESS_TOKEN_TIME` | Access token expiry |
| `REFRESH_TOKEN_KEY` | JWT secret for refresh tokens |
| `REFRESH_TOKEN_TIME` | Refresh token expiry |
| `SUPER_ADMIN_USERNAME` | Seeded superadmin username |
| `SUPER_ADMIN_EMAIL` | Seeded superadmin email |
| `SUPER_ADMIN_PASSWORD` | Seeded superadmin password |

> On startup, the app automatically seeds a superadmin account from these credentials if one doesn't already exist.

### Running the app

```bash
# development (watch mode)
npm run start:dev

# production build
npm run build
npm run start:prod
```

The API is served under the `/api` global prefix, e.g. `http://localhost:3000/api/movies`.

Uploaded files (avatars, posters, movie files) are served statically from `/uploads`.

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Core Modules Overview

### Auth
Registration flow uses a pending-user + OTP confirmation step before an account is created. Login issues a short-lived access token and a long-lived refresh token (stored as an `httpOnly` cookie). Route protection is layered:
- `AuthGuard` — verifies the JWT and attaches the user to the request
- `RoleGuard` + `@Roles()` — restricts routes by role
- `OwnershipGuard` — ensures a user can only modify their own resources (reviews, payments, profile) unless they're an admin/superadmin
- `SubscriptionGuard` — gates premium content behind an active subscription

### Movies
Movies belong to categories through a dedicated `MovieCategory` junction entity (explicit `ManyToOne`/`OneToMany` relations rather than an implicit `ManyToMany`), and can have multiple `MovieFile` entries for different qualities/languages. Admin-only movie management lives in a separate `admin/movies` controller.

### Subscriptions & Payments
Purchasing a plan creates a `UserSubscription` in `pending_payment` status with no dates set. Paying (simulated — no real gateway) marks the payment `completed` and activates the subscription, which is when `start_date`/`end_date` are calculated from the plan's `duration_days`. An hourly cron job expires subscriptions past their `end_date`, or auto-renews them (new payment + reactivation) if `auto_renew` is set.

### Favorites & Reviews
Simple per-user relations to movies — favorites for a personal watchlist, reviews with a 1–5 rating enforced at the database level via a `CHECK` constraint.

## License

UNLICENSED — private project.

## Partnership
I am really excited to work on new features with YOU, feel free to contribute

## Owner
Hojiakbarxon Olimxo'jayev