# Project Overview

**Project Name:** billetterie-maritime
**Type:** Brownfield / Multi-part Monorepo
**Generated:** 2026-01-12

## Executive Summary
The **billetterie-maritime** project is a comprehensive maritime ticketing system comprising a central backend, a customer-facing web client, and a mobile-optimized agent application for field operations (ticket scanning, boarding).

## Technology Stack

| Component | Technology | Role |
|-----------|------------|------|
| **Backend** | Laravel (PHP) | Central API, Database Management, Admin Backoffice |
| **Frontend** | React (TS) + Vite | Customer Booking & Information Portal |
| **Agent App** | React (TS) + Capacitor | Mobile App for Boarding Agents (Scanning) |
| **Database** | MySQL (Inferred) | Relational Data Storage |

## Architecture Classification
**Pattern:** Distributed Client-Server
The system follows a classic **API-Centric** architecture where the Laravel backend serves as the single source of truth, exposing RESTful endpoints consumed by multiple independent client applications (Web Client and Agent App).

## Repository Structure
The project is organized as a **Monorepo** with distinct folders for each major component:
- `backend/`: API and Administration
- `frontend/`: Customer Web Interface
- `frontend-agent/`: Field Agent Interface
