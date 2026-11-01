export interface DatabaseHealth {
  status: 'connected' | 'disconnected';
  provider: string;
  error?: string;
}

export interface BackendHealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  database: DatabaseHealth;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}
