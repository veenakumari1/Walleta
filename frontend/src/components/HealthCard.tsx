import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { BackendHealthResponse } from '../types/health.types';

interface HealthCardProps {
  health: BackendHealthResponse | null;
  error: string | null;
  isLoading: boolean;
  latencyMs: number | null;
  onRefresh: () => void;
}

const LABEL = 'text-[11px] uppercase tracking-wider text-white/50 font-semibold';

export const HealthCard: React.FC<HealthCardProps> = ({
  health,
  error,
  isLoading,
  latencyMs,
  onRefresh,
}) => {
  const isHealthy = health?.status === 'ok';

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs === 0) return `${mins}m ${secs}s`;
    return `${hrs}h ${remMins}m`;
  };

  const stats = [
    { label: 'Service', value: health?.service ?? (isLoading ? 'Detecting...' : 'Disconnected') },
    {
      label: 'Database',
      value: health?.database.status === 'connected' ? 'Connected' : 'Standby',
    },
    { label: 'Uptime', value: health ? formatUptime(health.uptimeSeconds) : '—' },
    { label: 'Environment', value: (health?.environment ?? 'development').toUpperCase() },
  ];

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              isHealthy ? 'bg-white animate-pulse' : 'bg-[var(--accent)]'
            }`}
          />
          <div>
            <h2 className="font-bold text-lg leading-tight">
              {isLoading ? 'Checking...' : isHealthy ? 'All systems running' : 'Backend unreachable'}
            </h2>
            {latencyMs !== null && <p className="text-xs text-white/50">{latencyMs}ms response</p>}
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="btn flex items-center gap-2"
          style={{ padding: '9px 18px', fontSize: 13 }}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 p-4 rounded-2xl bg-[var(--accent-soft)] text-sm">
          <p className="font-semibold text-[var(--accent-2)]">Connection error</p>
          <p className="text-white/70 mt-1 break-words">{error}</p>
          <p className="text-white/50 text-xs mt-2">
            Start the backend: <code className="text-white">cd backend &amp;&amp; npm run start:dev</code>
          </p>
        </div>
      )}

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/[0.05]">
            <p className={LABEL}>{s.label}</p>
            <p className="font-semibold mt-1.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
