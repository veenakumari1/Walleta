# Autonomous Business Finance Platform

Industrial-grade, browser-based autonomous business finance platform initialized with modern, enterprise-tier full-stack architecture.

[![Frontend: React + Vite + Tailwind CSS](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208%20%7C%20Tailwind%204-61DAFB.svg)](frontend/)
[![Backend: NestJS 12](https://img.shields.io/badge/Backend-NestJS%2012%20%7C%20TypeScript-E0234E.svg)](backend/)
[![ORM: Prisma 6](https://img.shields.io/badge/ORM-Prisma%206-2D3748.svg)](backend/prisma/)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg)](docker-compose.yml)
[![Lint & Format: ESLint + Prettier](https://img.shields.io/badge/Code%20Style-ESLint%20%2B%20Prettier-informational.svg)](.prettierrc)

---

## Architecture Overview

```
autonomous-business-finance/
├── frontend/                     # React 19 + TypeScript + Vite 8 + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                  # Typed REST API client & health check callers
│   │   ├── components/           # UI components (Header, HealthCard, ArchitectureOverview)
│   │   ├── types/                # Strict TypeScript contracts & API models
│   │   ├── App.tsx               # Main application component
│   │   ├── index.css             # Tailwind v4 theme & global styles
│   │   └── main.tsx              # React DOM bootstrap
│   ├── .env.example              # Frontend environment template (VITE_API_BASE_URL)
│   ├── eslint.config.js          # ESLint 10 + TypeScript-ESLint configuration
│   ├── tsconfig.json             # TypeScript project references
│   └── vite.config.ts            # Vite 8 + Tailwind CSS plugin config
│
├── backend/                      # NestJS 12 + TypeScript (NodeNext ESM) + REST API
│   ├── prisma/
│   │   └── schema.prisma         # Prisma ORM PostgreSQL schema
│   ├── src/
│   │   ├── common/               # Global filters (AllExceptionsFilter) & interceptors (Logging)
│   │   ├── config/               # @nestjs/config environment definitions & loaders
│   │   ├── health/               # GET /api/health controller, service, & unit specs
│   │   ├── prisma/               # PrismaService connection lifecycle & database probe
│   │   ├── app.module.ts         # Root NestJS application module
│   │   └── main.ts               # Application entry point with CORS & global prefix
│   ├── test/                     # End-to-end test suite (Supertest + Vitest)
│   ├── .env.example              # Backend environment template (PORT, DATABASE_URL, CORS)
│   ├── nest-cli.json             # NestJS CLI configuration
│   └── tsconfig.json             # TypeScript NodeNext configuration
│
├── docs/                         # Technical documentation & architectural specs
│   ├── api-specification.md      # REST API contracts, response payloads, error models
│   ├── architecture.md           # Full system architecture blueprint & tier breakdown
│   ├── database.md               # PostgreSQL setup, Prisma ORM lifecycle, migrations
│   └── development-guide.md      # Developer onboarding, testing, & scripts reference
│
├── docker-compose.yml            # Containerized PostgreSQL 16 local instance
├── .gitignore                    # Root Git ignore rules (secrets, dependencies, logs)
├── .prettierrc                   # Uniform code formatting rules across workspace
├── package.json                  # Root orchestration scripts for full-stack workflow
└── README.md                     # Project documentation & setup instructions
```

---

## Technology Stack

### Frontend
- **React 19** & **TypeScript** (Strict Mode, `verbatimModuleSyntax`)
- **Vite 8** (Lightning-fast HMR and bundle optimizer)
- **Tailwind CSS v4** (`@tailwindcss/vite` first-party engine)
- **Lucide Icons** (Clean, accessible UI symbology)

### Backend
- **Node.js 24 LTS** & **NestJS 12**
- **TypeScript** configured with NodeNext ECMAScript Modules (`"type": "module"`)
- **ConfigModule** for decoupled, secure 12-factor configuration
- **AllExceptionsFilter** for uniform JSON error responses
- **LoggingInterceptor** for HTTP timing observability

### Database & Persistence
- **PostgreSQL 16**
- **Prisma ORM 6** (`@prisma/client` + `prisma` CLI)
- Declarative schema migrations and type generation

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20+ or v24 LTS
- [npm](https://www.npmjs.com/) v10+
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) *(optional, recommended for PostgreSQL)*

### 2. Clone and Configure
```bash
# Clone the repository
git clone <repository-url>
cd autonomous-business-finance

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start PostgreSQL (Optional for Phase 1)
```bash
docker compose up -d
```

### 4. Install Dependencies & Generate Prisma Client
```bash
# Backend dependencies & Prisma client
cd backend
npm install
npm run prisma:generate

# Frontend dependencies
cd ../frontend
npm install
```

### 5. Launch Development Servers

#### Option A: Root Workspace Orchestration (Recommended)
From the root repository directory:
```bash
# Start backend in dev watch mode (port 3000)
npm run dev:backend

# In a second terminal, start frontend dev server (port 5173)
npm run dev:frontend
```

#### Option B: Standalone Project Launch
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit the application at [http://localhost:5173](http://localhost:5173).

---

## Health Check API Endpoint

The platform provides a production-grade system health telemetry endpoint:

### Request
```http
GET http://localhost:3000/api/health
Accept: application/json
```

### Response Example (`200 OK`)
```json
{
  "status": "ok",
  "service": "autonomous-business-finance-backend",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-11-01T07:34:00.000Z",
  "uptimeSeconds": 312,
  "database": {
    "status": "connected",
    "provider": "postgresql"
  }
}
```

*Note: If PostgreSQL has not yet been started, the health check gracefully returns `status: "degraded"` with `database.status: "disconnected"` without crashing the server.*

---

## Verification & Quality Assurance

### Linting & Formatting
```bash
# Run linting across both frontend and backend
npm run lint

# Run Prettier code formatting
npm run format
```

### Automated Testing
```bash
# Run backend unit tests (Vitest)
npm run test:backend

# Run backend end-to-end tests (Supertest + Vitest)
npm run test:backend:e2e
```

### Production Build
```bash
# Compile and build both applications
npm run build
```

---

## Phase 1 Scope & Boundary

> **Important Boundary**: Phase 1 is strictly dedicated to infrastructure, environment initialization, database ORM setup, type contracts, and inter-tier communication. 
> Financial calculation modules, AI agent integrations, accounting engines, and transaction workflows are strictly reserved for subsequent phases.

