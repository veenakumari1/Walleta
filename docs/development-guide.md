# Development Guide

## Prerequisites
- **Node.js**: v20+ (v24 LTS recommended)
- **npm**: v10+ (v11 recommended)
- **Git**: v2+
- **Docker** *(Optional, recommended for PostgreSQL)*: Docker Desktop / Docker Engine

---

## 1. Quick Start

### Step 1: Clone and Inspect
```bash
git clone <repository-url>
cd autonomous-business-finance
```

### Step 2: Configure Environment Variables
```bash
# Backend environment setup
cp backend/.env.example backend/.env

# Frontend environment setup
cp frontend/.env.example frontend/.env
```

### Step 3: Start PostgreSQL (Optional for Phase 1 Health Probe)
```bash
docker compose up -d
```

### Step 4: Run Development Servers

In two separate terminals:

```bash
# Terminal 1: Backend API (port 3000)
cd backend
npm run start:dev

# Terminal 2: Frontend SPA (port 5173)
cd frontend
npm run dev
```

Alternatively, from the root folder:
```bash
npm run dev:backend
npm run dev:frontend
```

Open your browser at `http://localhost:5173` to view the platform.

---

## 2. Quality Assurance & Code Standards

### Linting & Formatting

Both frontend and backend are configured with strict linting rules and Prettier:

```bash
# Run linting across both projects
npm run lint

# Run formatting across both projects
npm run format

# Backend specific lint
npm run lint:backend

# Frontend specific lint
npm run lint:frontend
```

### Running Tests

```bash
# Run backend unit tests (Vitest)
npm run test:backend

# Run backend end-to-end tests (Supertest + Vitest)
npm run test:backend:e2e
```

### Production Build

```bash
# Build both frontend and backend
npm run build
```

