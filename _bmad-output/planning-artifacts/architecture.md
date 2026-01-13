---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments: [
  'file:///C:/Users/ThinkPad/.gemini/antigravity/scratch/billetterie-maritime/_bmad-output/analysis/brainstorming-session-2026-01-12.md',
  'file:///C:/Users/ThinkPad/.gemini/antigravity/scratch/billetterie-maritime/_bmad-output/project-knowledge/index.md',
  'file:///C:/Users/ThinkPad/.gemini/antigravity/brain/f815ed12-f6e9-4ac6-a717-1ddaaaf0fc41/uploaded_image_1768214541323.png'
]
workflowType: 'architecture'
project_name: 'billetterie-maritime'
user_name: 'warren'
date: '2026-01-12'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Backend**: Transition to Domain-Driven Design (Clean Architecture) with Service Layer and Repositories. Unified Auth (Sanctum) for all clients.
- **Frontend**: Create a Shared UI Library for consistent design across Client and Agent apps. Migrate Admin to React using Strangler Fig pattern.
- **Agent**: Implement Local-First Architecture (SQLite) for robust offline sync.
- **Features**: Notification Center, Audit Logs, Real-time Search.

**Non-Functional Requirements:**
- **Performance**: Lazy loading, Code splitting, Optimized API resources.
- **Reliability**: Seamless offline synchronization for Agents.
- **Security**: Centralized Authentication and Audit logging.

**Scale & Complexity:**
- **Primary Domain**: Hybrid (Web + Mobile + API).
- **Complexity**: High (Distributed System with Offline constraints).
- **Components**: Backend (Laravel), Frontend (React), Agent (Capacitor/React), Shared Lib.

### Technical Constraints & Dependencies
- **Brownfield**: Must maintain existing functionality during migration.
- **Infrastructure**: On-premise deployment (Docker required).
- **Tech Stack**: Laravel, React, Capacitor.

### Cross-Cutting Concerns Identified
- **Authentication**: Single Source of Truth (Sanctum).
- **Data Synchronization**: Complex offline-online sync logic.
- **UI Consistency**: Shared Design System.

## Starter Template Evaluation (Tech Stack for New Modules)

### Selected Technologies
- **Shared UI**: **Turborepo** + Vite Library Mode
- **Admin Frontend**: **Custom React (Vite)** + TailwindCSS
- **Local Database**: **WatermelonDB**

**Rationale for Selection:**
- **Turborepo**: Best-in-class monorepo management for Brownfield projects.
- **Custom Admin**: Ensures 100% consistency with Client App via Shared Lib, avoiding framework lock-in (vs React-Admin).
- **WatermelonDB**: Superior performance and sync capabilities for offline-first React apps compared to raw SQLite.

**Architectural Decisions Provided:**
- **Language**: TypeScript (Strict).
- **Styling**: TailwindCSS (Shared Config).
- **Language**: TypeScript (Strict).
- **Styling**: TailwindCSS (Shared Config).
- **State**: React Context / WatermelonDB (Offline).

## Core Architectural Decisions

### Data Architecture
- **Primary Database**: MySQL (for centralized data).
- **Offline Database**: WatermelonDB (SQLite adapter) for Agent App to support reliable offline-first operations.
- **Migration Strategy**: Use standard Laravel migrations. No breaking schema changes without maintenance window.

### Authentication & Security
- **Authentication**: Laravel Sanctum (Unified Token Auth). Replaces Blade sessions for Admin.
- **Authorization**: `spatie/laravel-permission` for centralized RBAC.
- **Audit**: Log critical write actions to `audit_logs` table.

### API & Communication Patterns
- **Protocol**: RESTful API.
- **Response Format**: Standardized `JsonResource` (JSON:API style).
- **Versioning**: URI Versioning (`/api/v1/...`).

### Frontend Architecture
- **Structure**: Monorepo managed by Turborepo.
- **Shared Library**: Core UI components and utilities.
- **Admin**: Custom React App (Vite + Tailwind) gradually replacing Blade views (Strangler Fig).

### Infrastructure & Deployment
- **Containerization**: Docker Compose for uniform Dev/Prod environments.
- **Deployment**: On-premise capable (Docker).

## Implementation Patterns & Consistency Rules

### Naming Patterns
- **Database**: `snake_case` (e.g., `user_trips`, `is_active`).
- **PHP/Backend**: `snake_case` for variables, `camelCase` for methods, `PascalCase` for classes.
- **JS/JSON**: `camelCase` for properties and variables (e.g., `userTrips`, `isActive`).
- **React Components**: `PascalCase` (e.g., `TripCard`).
- **Files**: `kebab-case` (e.g., `trip-card.tsx`, `auth-service.ts`) except for Components (`TripCard.tsx`).

### Structure Patterns
- **React Feature-First**: Group by feature, not type.
  - `src/features/booking/components`
  - `src/features/booking/hooks`
  - `src/features/booking/services`
- **Laravel Domains**: `app/Domain/Booking/...` (Models, Services, DTOs).

### API Formats
- **Success**: `{ data: { ... } }` or `{ data: [ ... ], meta: { ... } }`
- **Error**: `{ message: "Human readable", errors: { field: ["Specific error"] } }`
- **Date**: ISO 8601 Strings (`YYYY-MM-DDTHH:mm:ssZ`) in JSON.

### State Management
- **Server State**: Use React Query (web) or WatermelonDB Sync (agent).
- **Client State**: Small Contexts or Local State. Avoid global Redux unless necessary.

## Project Structure & Boundaries

### Complete Project Directory Structure
```
billetterie-maritime/
├── backend/
│   ├── app/
│   │   ├── Domain/                 # [NEW] Domain Logic (Models, DTOs, Actions)
│   │   │   ├── Booking/
│   │   │   └── Pricing/
│   │   ├── Http/
│   │   │   └── Resources/          # API Resources
│   └── tests/
│       ├── Feature/                # Feature Tests
│       └── Unit/                   # Unit Tests
├── frontend/ (Client)
│   ├── src/
│   │   ├── features/               # [NEW] Feature-based modules
│   │   │   ├── booking/
│   │   │   └── auth/
│   │   ├── components/             # Shared UI Components
│   │   └── lib/                    # Configuration (Axios, Query)
├── frontend-agent/ (Mobile)
│   ├── src/
│   │   ├── database/               # [NEW] WatermelonDB Schema
│   │   ├── sync/                   # Sync Logic
│   │   └── features/               # Agent Features (Scan, Sale)
├── packages/ (Monorepo Shared)     # [NEW]
│   ├── ui/                         # Shared UI Library (React + Tailwind)
│   └── core/                       # Shared Types & Logic
└── docker/                         # Docker Configuration
```

### Architectural Boundaries
- **API Boundary**: Backend exposes REST API via `routes/api.php`. Frontend consumes via Axios instances in `src/lib/api.ts`.
- **Domain Boundary**: All business logic resides in `app/Domain/`. Controllers are thin.
- **Package Boundary**: Reusable UI/Logic moves to `packages/` to be shared between `frontend` and `frontend-agent`.

## Architecture Validation Results

### Coherence Validation ✅
- **Decision Compatibility**: WatermelonDB is the perfect match for the "Offline-First" Agent requirement. Turborepo supports the "Shared UI" decision clearly.
- **Pattern Consistency**: "Feature-First" structure in frontend aligns with "Domain-Driven" backend.

### Implementation Readiness ✅
- **Completeness**: All critical paths (Auth, Sync, Structure) are defined.
- **Actionable**: Developers can start `turborepo init` and `packages/ui` creation immediately.

### Architecture Completeness Checklist
- [x] Requirements Analysis (Brainstorming + Context)
- [x] Architectural Decisions (Sanctum, Watermelon, Docker)
- [x] Implementation Patterns (Naming, API Standard)
- [x] Project Structure (Domain, Features, Packages)

**Overall Status**: READY FOR IMPLEMENTATION 🚀






