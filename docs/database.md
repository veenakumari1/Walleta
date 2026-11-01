# Database Configuration & Prisma ORM

## Database Stack
- **Database Engine**: PostgreSQL 16+
- **ORM**: Prisma ORM 6.19+
- **Connection Protocol**: PostgreSQL Wire Protocol with Connection Pooling

---

## Environment Variable Schema
The database connection string is supplied via the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_NAME>?schema=<DB_SCHEMA>
```

### Development Default:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autonomous_finance_dev?schema=public
```

---

## Prisma Schema Definition (`backend/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// Baseline system health record model to verify DB connectivity and schema migrations
model SystemHealth {
  id        String   @id @default(uuid())
  status    String   @default("healthy")
  checkedAt DateTime @default(now())
  metadata  Json?

  @@map("system_health")
}
```

---

## Database Management Commands

Run from the `backend/` directory or root workspace:

| Action | Root Command | Backend Command |
|---|---|---|
| Generate Prisma Client | `npm run prisma:generate` | `npx prisma generate` |
| Apply Migrations (Dev) | `npm run prisma:migrate` | `npx prisma migrate dev` |
| Deploy Migrations (Prod) | `npm --prefix backend run prisma:deploy` | `npx prisma migrate deploy` |
| Open Prisma Studio (GUI) | `npm run prisma:studio` | `npx prisma studio` |

---

## Starting PostgreSQL with Docker
A pre-configured `docker-compose.yml` is provided in the repository root:

```bash
# Start PostgreSQL container in background
docker compose up -d

# Check PostgreSQL logs
docker compose logs -f postgres

# Stop PostgreSQL container
docker compose down
```

