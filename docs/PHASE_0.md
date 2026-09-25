# Phase 0 — Project Foundation

**Completed:** Phase 0

## What Was Delivered

- Repository structure (modular monolith)
- Frontend: Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
- Backend: Express + TypeScript
- Database: PostgreSQL + Prisma ORM (full schema)
- Environment configuration (.env / .env.example)
- Base design system (shadcn/ui with Inter font)
- Application shell (landing page with role cards)
- Seed infrastructure (stub ready for data)
- Development/build/test tooling (Vitest + Supertest)
- Module directory stubs for all spec modules

## Technology Stack (Locked)

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend     | Node.js, Express, TypeScript      |
| Database    | PostgreSQL, Prisma ORM            |
| Cache       | Redis (ioredis, optional)         |
| Auth        | JWT + bcrypt (Phase 1)            |
| Validation  | Zod                               |
| Charts      | Recharts                          |
| Testing     | Vitest + Supertest                |
| API Docs    | OpenAPI/Swagger                   |
| Package Mgr | npm (workspaces)                  |
