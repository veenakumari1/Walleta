# Autonomous Business Finance Platform - System Architecture

## 1. Executive Summary

The **Autonomous Business Finance Platform** is an industrial-grade, browser-based financial operations platform engineered for modern enterprises. Designed to automate and manage complex corporate financial operations, this Phase 1 foundation establishes a resilient, scalable, decoupled full-stack architecture.

## 2. Architectural Blueprint

```
+-------------------------------------------------------------------------+
|                              Client Browser                             |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                 React 19 + TypeScript (SPA)                       |  |
|  |  * Modern Dashboard Shell        * Responsive Tailwind CSS v4     |  |
|  |  * Strict Type Boundaries        * Typed HTTP Client (Fetch/REST) |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     | JSON / HTTPS (CORS Enabled)
                                     v
+-------------------------------------------------------------------------+
|                         Backend Application (NestJS)                    |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |  * Global Route Prefix (/api)   * ConfigModule (.env validation)  |  |
|  |  * AllExceptionsFilter          * LoggingInterceptor              |  |
|  |  * HealthController             * PrismaService (Lifecycle-aware) |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     | Prisma ORM (Connection Pool)
                                     v
+-------------------------------------------------------------------------+
|                       Data Persistence Layer                            |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |  * PostgreSQL 16 (Relational Database)                            |  |
|  |  * Prisma Schema & Declarative Migration Engine                   |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

## 3. Tier Responsibilities

### 3.1 Frontend (`/frontend`)
- **Framework**: React 19 with TypeScript in strict mode (`verbatimModuleSyntax: true`).
- **Build Engine**: Vite 8 for fast HMR and optimized production bundles.
- **Styling**: Tailwind CSS v4 using the high-performance `@tailwindcss/vite` engine.
- **API Client**: Strongly-typed HTTP layer featuring error normalization, timeout handling, and connection telemetry.

### 3.2 Backend (`/backend`)
- **Framework**: NestJS 12 running on Node.js 24 with NodeNext ECMAScript Modules (`"type": "module"`).
- **Configuration**: `@nestjs/config` for 12-factor application design, loading environment variables without hardcoding.
- **Error Handling**: `AllExceptionsFilter` converts unhandled exceptions and HTTP errors into standardized JSON payloads.
- **Observability**: `LoggingInterceptor` captures method, URI path, and request execution time in milliseconds.
- **Health System**: `GET /api/health` probes system uptime, environment, version, and database connection.

### 3.3 Database Layer (`/backend/prisma`)
- **Engine**: PostgreSQL 16 with schema isolation.
- **ORM**: Prisma ORM 6 for schema declaration, type generation, and declarative migrations.
- **Lifecycle Management**: `PrismaService` connects gracefully and shuts down cleanly on SIGTERM/SIGINT.

## 4. Security & Environment Isolation
- Credentials, connection strings, and ports are injected strictly through `.env` files.
- `.env.example` templates provide clear variable expectations for team members without leaking secrets.
- Git ignores keep secrets, credentials, build output, and local databases out of source control.

