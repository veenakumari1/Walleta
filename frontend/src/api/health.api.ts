import { fetchApi } from './client';
import type { BackendHealthResponse } from '../types/health.types';

export async function getBackendHealth(): Promise<BackendHealthResponse> {
  return fetchApi<BackendHealthResponse>('/health');
}
