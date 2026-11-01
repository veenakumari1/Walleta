import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { HealthCard } from './components/HealthCard';
import { ArchitectureOverview } from './components/ArchitectureOverview';
import type { BackendHealthResponse } from './types/health.types';
import { getBackendHealth } from './api/health.api';

const CURRENT_YEAR = new Date().getFullYear();

export const App: React.FC = () => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const data = await getBackendHealth();
      const duration = Math.round(performance.now() - start);
      setHealth(data);
      setLatencyMs(duration);
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      setHealth(null);
      setError(
        err instanceof Error ? err.message : 'Failed to connect to backend service',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const initialCheck = async () => {
      const start = performance.now();
      try {
        const data = await getBackendHealth();
        if (active) {
          setHealth(data);
          setLatencyMs(Math.round(performance.now() - start));
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          setHealth(null);
          setLatencyMs(Math.round(performance.now() - start));
          setError(
            err instanceof Error ? err.message : 'Failed to connect to backend service',
          );
          setIsLoading(false);
        }
      }
    };

    initialCheck();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header isBackendConnected={Boolean(health)} isLoading={isLoading} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            Phase 1 Infrastructure Initialization Active
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Autonomous Business Finance Platform
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Industrial-grade, browser-based financial operations platform. The foundation has been initialized with React, TypeScript, Vite, Tailwind CSS, NestJS, and Prisma ORM.
          </p>
        </div>

        {/* Health Telemetry Section */}
        <HealthCard
          health={health}
          error={error}
          isLoading={isLoading}
          latencyMs={latencyMs}
          onRefresh={fetchStatus}
        />

        {/* Architecture Details */}
        <ArchitectureOverview />
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {CURRENT_YEAR} Autonomous Business Finance Platform. Phase 1 Architecture.</p>
          <p className="font-mono text-slate-600">React &bull; TypeScript &bull; Vite &bull; NestJS &bull; Prisma &bull; PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
