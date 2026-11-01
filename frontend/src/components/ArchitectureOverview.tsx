import React from 'react';
import { Layout, Server, Database, GitBranch, Layers, Check } from 'lucide-react';

export const ArchitectureOverview: React.FC = () => {
  const tiers = [
    {
      title: 'Frontend Tier',
      icon: Layout,
      color: 'from-cyan-500 to-blue-500',
      badge: 'Client SPA',
      items: [
        'React 19 + TypeScript (Strict)',
        'Vite 8 Build & Hot Module Replacement',
        'Tailwind CSS v4 Utility Engine',
        'Type-safe REST API Client & Error Boundary',
        'Responsive Mobile-first Layout',
      ],
    },
    {
      title: 'Backend Tier',
      icon: Server,
      color: 'from-emerald-500 to-teal-500',
      badge: 'REST API',
      items: [
        'NestJS 12 Enterprise Architecture',
        'NodeNext ECMAScript Modules',
        'ConfigModule & Environment Isolation',
        'AllExceptionsFilter Structured Error Responses',
        'Logging Interceptor & CORS Integration',
      ],
    },
    {
      title: 'Database Tier',
      icon: Database,
      color: 'from-violet-500 to-purple-500',
      badge: 'Data Layer',
      items: [
        'PostgreSQL Database Architecture',
        'Prisma ORM 6 Schema & Client',
        'Automated Migrations Workflow',
        'Graceful Connection Pooling & Lifecycle',
        'Zero Credential Hardcoding (12-Factor Env)',
      ],
    },
    {
      title: 'DevOps & Quality',
      icon: GitBranch,
      color: 'from-amber-500 to-orange-500',
      badge: 'Tooling',
      items: [
        'Standard Git Version Control',
        'ESLint & Oxlint Static Code Analysis',
        'Prettier Code Formatting & Standards',
        'Vitest Unit & Supertest E2E Coverage',
        'Docker-ready Postgres Compose Spec',
      ],
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Initialized Architectural Blueprint (Phase 1)
          </h3>
          <p className="text-xs text-slate-400">
            Industrial-grade foundation configured and verified for autonomous finance scaling.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Ready for Phase 2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.title}
              className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${tier.color} flex items-center justify-center text-slate-950 font-bold shadow-md`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                  {tier.badge}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white mb-3">{tier.title}</h4>

              <ul className="space-y-2 text-xs text-slate-400">
                {tier.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
