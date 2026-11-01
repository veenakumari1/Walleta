import React from 'react';
import { Activity, ShieldCheck, Server } from 'lucide-react';

interface HeaderProps {
  isBackendConnected: boolean;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isBackendConnected, isLoading }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Autonomous Business Finance Platform
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                Phase 1: Architecture
              </span>
            </h1>
            <p className="text-xs text-slate-400">Industrial-grade Autonomous Financial Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <Server className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Backend:</span>
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Connecting...
              </span>
            ) : isBackendConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Offline
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Strict Type Safe</span>
          </div>
        </div>
      </div>
    </header>
  );
};
