import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Cpu,
  Clock,
  Radio,
  Server,
} from 'lucide-react';
import type { BackendHealthResponse } from '../types/health.types';

interface HealthCardProps {
  health: BackendHealthResponse | null;
  error: string | null;
  isLoading: boolean;
  latencyMs: number | null;
  onRefresh: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  health,
  error,
  isLoading,
  latencyMs,
  onRefresh,
}) => {
  const isHealthy = health?.status === 'ok';
  const isDegraded = health?.status === 'degraded';

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs === 0) return `${mins}m ${secs}s`;
    return `${hrs}h ${remMins}m ${secs}s`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isHealthy
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isDegraded
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : isDegraded ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">System Health & API Telemetry</h2>
            <p className="text-xs text-slate-400">
              Live status ping from NestJS REST API endpoint (<code className="text-cyan-400">GET /api/health</code>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {latencyMs !== null && (
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Radio className="h-3.5 w-3.5 text-cyan-400" />
              {latencyMs}ms
            </span>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl bg-rose-950/40 border border-rose-800/60 p-4 text-xs text-rose-300">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Connection Error</p>
              <p className="mt-1 font-mono text-slate-300">{error}</p>
              <p className="mt-2 text-slate-400">
                To start the backend API, open a terminal and run:{' '}
                <code className="text-cyan-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                  cd backend &amp;&amp; npm run start:dev
                </code>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core API Service */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <Server className="h-4 w-4 text-cyan-400" />
              Backend Service
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              v{health?.version ?? '0.1.0'}
            </span>
          </div>
          <p className="text-sm font-semibold text-white">
            {health?.service ?? (isLoading ? 'Detecting...' : 'Disconnected')}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                health ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs text-slate-400 capitalize">
              {health?.status ?? (isLoading ? 'Connecting...' : 'Unavailable')}
            </span>
          </div>
        </div>

        {/* Database Layer */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-emerald-400" />
              PostgreSQL (Prisma)
            </span>
            <span className="text-[11px] text-slate-500 uppercase">
              {health?.database.provider ?? 'postgres'}
            </span>
          </div>
          <p className="text-sm font-semibold text-white">
            {health?.database.status === 'connected' ? 'Connected' : 'Configured / Standby'}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                health?.database.status === 'connected'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-xs text-slate-400">
              {health?.database.status === 'connected'
                ? 'Healthy'
                : 'Ready for DB instance'}
            </span>
          </div>
        </div>

        {/* Uptime */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-400" />
              Uptime
            </span>
          </div>
          <p className="text-sm font-semibold text-white font-mono">
            {health ? formatUptime(health.uptimeSeconds) : '—'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {health ? `Since start (${health.uptimeSeconds}s)` : 'No active session'}
          </p>
        </div>

        {/* Environment */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-violet-400" />
              Environment
            </span>
          </div>
          <p className="text-sm font-semibold text-white uppercase font-mono">
            {health?.environment ?? 'development'}
          </p>
          <p className="mt-2 text-xs text-slate-500 truncate" title={health?.timestamp}>
            {health ? new Date(health.timestamp).toLocaleTimeString() : 'Awaiting heartbeat'}
          </p>
        </div>
      </div>
    </div>
  );
};
