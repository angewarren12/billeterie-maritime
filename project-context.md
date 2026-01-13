# Project Context: Billetterie Maritime

## 1. Technology Stack
- **Backend**: Laravel 10+ (API Only, JSON Resources).
- **Frontend**: React 18+ (Vite, TypeScript, TailwindCSS).
- **Mobile Agent**: Capacitor + React + WatermelonDB (Offline First).
- **Shared**: Turborepo (UI Lib, Core Types).
- **Infra**: Docker Compose, MySQL 8.

## 2. Architecture Patterns
- **Backend**: Domain-Driven Design (`app/Domain/{Feature}`).
- **Frontend**: Feature-First (`src/features/{feature}`).
- **Auth**: Laravel Sanctum (Unified Token).
- **State**: React Query (Server) + Context (Client) + WatermelonDB (Offline).

## 3. Development Rules
- **Naming**: `snake_case` (DB/PHP), `camelCase` (JS/JSON), `PascalCase` (React).
- **API**: Always return `{ data: ... }` resources.
- **Git**: Branch per feature, PR required.

## 4. Critical Constraints
- **Offline**: Agent app MUST work 100% offline (Sync later).
- **Legacy**: Don't break existing Blade Admin without plan.
