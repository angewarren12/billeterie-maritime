# Source Tree Analysis

## Directory Structure

```
billetterie-maritime/
├── backend/                  # Laravel API & Admin Backend (Part: backend)
│   ├── app/                  # Main Application Logic (Models, Controllers)
│   ├── bootstrap/            # Framework Bootstrap
│   ├── config/               # Application Configuration
│   ├── database/             # Migrations, Seeds, Factories
│   ├── public/               # Web Root
│   ├── resources/            # Views (Blade), Lang, Assets
│   ├── routes/               # API & Web Routes
│   ├── storage/              # Logs, Cache, Uploads
│   ├── tests/                # Feature & Unit Tests
│   └── vendor/               # Composer Dependencies
├── frontend/                 # Client Web Application (Part: frontend)
│   ├── public/               # Static Assets
│   ├── src/                  # React Source Code
│   │   ├── api/              # API Client Services
│   │   ├── assets/           # Images, Fonts
│   │   ├── components/       # Reusable UI Components
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── layouts/          # Page Layouts
│   │   ├── pages/            # Route Views
│   │   └── types/            # TypeScript Definitions
│   └── vite.config.ts        # Vite Build Configuration
└── frontend-agent/           # Agent Mobile/Scanner App (Part: frontend-agent)
    ├── src/                  # React/Capacitor Source Code
    ├── capacitor.config.ts   # Capacitor Configuration (Mobile)
    └── vite.config.ts        # Vite Build Configuration
```

## Critical Folders

### Backend (`backend/`)
- **`app/`**: Contains the core business logic.
    - **`Models/`**: Eloquent ORM models representing database tables.
    - **`Http/Controllers/`**: Hanldes incoming HTTP requests.
- **`routes/`**: Defines the application's URL endpoints.
    - **`api.php`**: Routes for the REST API consumed by frontends.
    - **`web.php`**: Routes for server-rendered pages (likely Backoffice).
- **`database/`**: Database schema management.
    - **`migrations/`**: Schema definitions.

### Frontend Client (`frontend/`)
- **`src/pages/`**: Main views for the client booking flow.
- **`src/components/`**: Building blocks of the UI.
- **`src/api/`**: Connection layer specifically to the backend API.

### Frontend Agent (`frontend-agent/`)
- **`src/`**: React application tailored for agents (scanning, validation).
- **`capacitor.config.ts`**: Indicates this project builds to a mobile application (Android/iOS) for field use.

## Integration Points
- **Backend -> Database**: Via `database/` config and Eloquent Models.
- **Frontend -> Backend**: Via REST API calls defined in `src/api` (likely Axios/Fetch).
- **Agent -> Backend**: Via REST API calls for ticket validation and synchronization.
