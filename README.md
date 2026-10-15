<div align="center">

# 🎬 Movies Platform API

**A production-style backend for a movie streaming platform — authentication, subscriptions, payments, reviews, and cloud-based media storage.**

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?logo=typeorm&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?logo=cloudflare&logoColor=white)

</div>

---

## 📖 About

**Movies Platform API** is a RESTful backend built with **NestJS**, **PostgreSQL** and **TypeORM**. Users can register with email verification, browse movies, subscribe to premium plans, leave reviews, and save favourites. Admins and superadmins manage movies, categories, cast, and users through role-based access control.

Movie data is enriched through the **TMDB API** (search, cast and actor details), media files (posters, avatars, videos) are stored in **Cloudflare R2**, and verification emails are delivered via **Mailtrap**.

## ✨ Features

- 🔐 **Authentication** — email + OTP registration, JWT access/refresh tokens (refresh token in an `httpOnly` cookie), forgot/reset password flow
- 🛡️ **Role-based access control** — `user`, `admin`, `superadmin` roles with layered guards: `AuthGuard`, `RoleGuard`, `OwnershipGuard`, `SubscriptionGuard`
- 👤 **Users & profiles** — separate profile entity with avatar upload
- 🎥 **Movies** — full CRUD, poster upload, multiple video files per movie (different qualities / languages), category tagging, search, filtering, pagination, and suggestions
- 🎭 **Cast & actors** — add actors manually or in bulk, or import them straight from TMDB
- 🔗 **TMDB integration** — search movies on TMDB, link a movie to its TMDB ID, and fetch its cast
- ☁️ **Cloud storage** — posters, avatars and videos uploaded to Cloudflare R2 (S3-compatible)
- 🗂️ **Categories** — slug-based categories, linked to movies through an explicit junction entity
- 💳 **Subscriptions & payments** — subscription plans, purchase flow, simulated payment processing, and refunds
- ⏱️ **Scheduled jobs** — hourly cron jobs to expire or auto-renew subscriptions, and cleanup of unverified registrations every 2 hours
- ⭐ **Favourites & reviews** — personal watchlist and 1–5 star reviews (rating enforced by a database `CHECK` constraint)
- 🔒 **Subscription-gated streaming** — free vs. premium content access decided per request
- 🚦 **Rate limiting** — global throttling (100 requests/min) with stricter limits on sensitive auth routes
- 🧯 **Centralized error handling** — global exception filter with structured JSON responses
- 📝 **Logging** — Winston logger with console output and persisted error logs
- ✅ **Validation** — DTO-based request validation with `class-validator`

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [NestJS](https://nestjs.com/) 11, TypeScript |
| **Database** | PostgreSQL + TypeORM |
| **Authentication** | JWT (`jsonwebtoken`), `bcrypt`, `cookie-parser` |
| **File storage** | Cloudflare R2 via `@aws-sdk/client-s3`, Multer (in-memory) |
| **Movie metadata** | [TMDB API](https://developer.themoviedb.org/) |
| **Email** | [Mailtrap](https://mailtrap.io/) Email API |
| **Scheduling** | `@nestjs/schedule` |
| **Rate limiting** | `@nestjs/throttler` |
| **Logging** | Winston (`nest-winston`) |
| **Validation** | `class-validator`, `class-transformer` |
| **Testing** | Jest, Supertest |

## 🏗️ Project Structure

```
src/
├── auth/            # register, login, OTP, JWT, guards, cleanup cron jobs
├── users/           # users, profiles, actors
├── categories/      # movie categories
├── movies/          # movies, files, cast, reviews, admin movie management
├── subscriptions/   # subscription plans, user subscriptions, renewal cron jobs
├── payments/        # simulated payment processing and refunds
├── favourites/      # user favourites
├── filters/         # global exception filter
├── log/             # Winston configuration
├── startup/         # validation pipe config
└── utils/           # R2, TMDB, mail, OTP, token, crypto and Multer helpers
```

## 🔌 API Overview

All routes are served under the `/api` prefix (e.g. `http://localhost:3000/api/movies`).

| Module | Endpoints | Access |
| --- | --- | --- |
| **Auth** | `POST /auth/register`, `/auth/confirm-otp`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password` | Public |
| **Movies** | `GET /movies`, `GET /movies/:slug`, `GET /movies/suggestions/list` | Public (full access depends on subscription) |
| **Reviews** | `POST /movies/:movie_id/reviews`, `DELETE /movies/:movie_id/reviews/:review_id` | Authenticated / owner |
| **Favourites** | `POST /favourites`, `GET /favourites`, `DELETE /favourites/:movie_id` | Authenticated |
| **Categories** | `GET /categories`, `POST` / `PATCH` / `DELETE /categories/:id` | Public read, admin write |
| **Admin movies** | `POST/GET /admin/movies`, `PATCH/DELETE /admin/movies/:id`, `POST /admin/movies/:id/files`, `PATCH/DELETE /admin/movies/files/:fileId` | Admin, Superadmin |
| **TMDB tools** | `GET /admin/movies/tmdb/search`, `GET /admin/movies/:id/tmdb/cast`, `PATCH /admin/movies/:id/tmdb`, `POST /admin/movies/:id/add-actor(s)` | Admin, Superadmin |
| **Subscription plans** | `GET /subscription-plans`, `POST` / `PATCH` / `DELETE /subscription-plans/:id` | Public read, Superadmin write |
| **User subscriptions** | `POST /user-subscriptions/purchase`, `GET /user-subscriptions/user/:userId`, ... | Authenticated / owner |
| **Payments** | `POST /payments`, `GET /payments/:payment_id`, `PATCH /payments/:payment_id/refund` | Authenticated / owner |
| **Users** | `GET /users`, `GET/PATCH/DELETE /users/:userId`, `PATCH /users/:userId/profile`, `POST /users/admin`, `POST /users/new-actor` | Role / owner based |

## 🧩 Core Concepts

### Authentication flow
Registration creates a **pending user** and sends a 6-digit OTP by email. After the OTP is confirmed the real account is created. Login returns a short-lived **access token** and sets a long-lived **refresh token** as an `httpOnly` cookie. Unverified registrations are cleaned up automatically by a cron job.

### Guards
- **`AuthGuard`** — verifies the JWT and attaches the user to the request
- **`RoleGuard` + `@Roles()`** — restricts routes by role
- **`OwnershipGuard`** — users can only touch their own resources (profile, reviews, payments, subscriptions), unless they are admins
- **`SubscriptionGuard`** — never blocks the request, but decides whether the viewer *can watch* premium content (admins always can; users need an active subscription)

### Movies, TMDB & storage
Movies are linked to categories via a dedicated `MovieCategory` junction entity and can have multiple `MovieFile` entries. An admin can search TMDB, link a movie to a TMDB ID, and import its cast as actors. Uploaded posters, avatars and videos (up to 2 GB, MP4 / WEBM / MOV) are kept in memory by Multer and streamed to **Cloudflare R2**; only the public URL is saved in the database.

### Subscriptions & payments
Purchasing a plan creates a `UserSubscription` in `pending_payment` status. Paying (simulated — no real payment gateway) completes the payment and activates the subscription, calculating its dates from the plan's duration. An hourly cron job expires finished subscriptions, or renews them automatically when `auto_renew` is enabled.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- A PostgreSQL database (local or hosted)
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket with public access
- A [TMDB](https://www.themoviedb.org/settings/api) API Read Access Token
- A [Mailtrap](https://mailtrap.io/) API token

### Installation

```bash
git clone https://github.com/Hojiakbarxon/movies.git
cd movies
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```dotenv
PORT=3000
DB_URL=

ACCESS_TOKEN_KEY=
ACCESS_TOKEN_TIME=
REFRESH_TOKEN_KEY=
REFRESH_TOKEN_TIME=

SUPER_ADMIN_USERNAME=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

TMDB_TOKEN=

MAILTRAP_TOKEN=
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the server listens on |
| `DB_URL` | PostgreSQL connection string (`postgres://user:password@host:port/dbname`) |
| `ACCESS_TOKEN_KEY` / `ACCESS_TOKEN_TIME` | Secret and expiry for access tokens (e.g. `15m`) |
| `REFRESH_TOKEN_KEY` / `REFRESH_TOKEN_TIME` | Secret and expiry for refresh tokens (e.g. `7d`) |
| `SUPER_ADMIN_USERNAME` / `EMAIL` / `PASSWORD` | Credentials of the superadmin account created on first startup |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API credentials |
| `R2_BUCKET_NAME` | Name of the R2 bucket |
| `R2_PUBLIC_URL` | Public URL of the bucket, without a trailing slash |
| `TMDB_TOKEN` | TMDB API Read Access Token (Bearer token) |
| `MAILTRAP_TOKEN` | Mailtrap API token used to send OTP emails |

> On startup the app automatically creates a superadmin from the `SUPER_ADMIN_*` values if one doesn't exist yet.

> **Database schema:** TypeORM `synchronize` is turned off in `src/app.module.ts`. For the very first run on an empty database, temporarily set it to `true` to create the tables, then switch it back to `false`.

> **Email sender:** OTP emails are sent from the address set in `src/utils/mail.service.ts`. Change it to a sender/domain verified in your own Mailtrap account.

### Running the app

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

## 🤝 Contributing

Contributions, ideas, and feature suggestions are welcome — feel free to open an issue or submit a pull request.

## 👨‍💻 Author

**Hojiakbarxon Olimxo'jayev**
Fullstack (Backend focused) developer.

[![GitHub](https://img.shields.io/badge/GitHub-Hojiakbarxon-181717?logo=github)](https://github.com/Hojiakbarxon)

## 📄 License

UNLICENSED — private project.