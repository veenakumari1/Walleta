# API Specification - Phase 1

## Base URL
- Development: `http://localhost:3000/api`

## CORS Policy
Allowed origins in development:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Credentials: `true`

---

## Health Check Endpoint

### `GET /api/health`
Probes the operational status of the backend API and attached database persistence layer.

#### Response: Status 200 OK
When the service is running (database may be connected or in standby):

```json
{
  "status": "ok",
  "service": "autonomous-business-finance-backend",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-11-01T07:30:00.000Z",
  "uptimeSeconds": 142,
  "database": {
    "status": "connected",
    "provider": "postgresql"
  }
}
```

#### Degraded Response (When database is unreachable):
```json
{
  "status": "degraded",
  "service": "autonomous-business-finance-backend",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-11-01T07:30:00.000Z",
  "uptimeSeconds": 142,
  "database": {
    "status": "disconnected",
    "provider": "postgresql",
    "error": "Can't reach database server at localhost:5432"
  }
}
```

---

## Standard Error Response Format
All HTTP exceptions and unexpected errors caught by `AllExceptionsFilter` return a uniform JSON schema:

```json
{
  "statusCode": 404,
  "timestamp": "2026-11-01T07:30:00.000Z",
  "path": "/api/unknown-route",
  "method": "GET",
  "error": "NotFoundException",
  "message": "Cannot GET /api/unknown-route"
}
```

