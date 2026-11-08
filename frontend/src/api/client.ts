import type { ApiError } from '../types/health.types';
import { mockFetch } from './mockServer';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000/api';

// Demo mode is ON by default (no backend needed).
// To use the real backend, set VITE_DEMO_MODE=false
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export class ApiClientError extends Error {
  statusCode?: number;
  details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (DEMO_MODE) {
    try {
      return await mockFetch<T>(endpoint, options);
    } catch (error) {
      throw new ApiClientError(error instanceof Error ? error.message : 'Demo API error');
    }
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string> | undefined),
      },
    });

    if (!response.ok) {
      let errorBody: ApiError | null = null;
      try {
        errorBody = await response.json();
      } catch {
        // Response was not JSON
      }

      const message =
        errorBody?.message ?? `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;

      throw new ApiClientError(
        Array.isArray(message) ? message.join(', ') : message,
        response.status,
        errorBody,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiClientError(
        `Unable to reach backend API at ${url}. Ensure the NestJS server is running.`,
      );
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : 'An unknown network error occurred',
    );
  }
}