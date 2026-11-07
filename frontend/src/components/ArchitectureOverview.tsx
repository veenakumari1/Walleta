import React from 'react';
import { Layout, Server, Database, GitBranch, Layers, Check } from 'lucide-react';
import { Item, Stagger } from '../AnimatedTabs';

const tiers = [
  {
    title: 'Frontend Tier',
    icon: Layout,
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

export const ArchitectureOverview: React.FC = () => {
  return (
    <Stagger className="mt-8 space-y-5">
      <Item>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--accent)]" />
              Initialized Architectural Blueprint (Phase 1)
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Industrial-grade foundation configured and verified for autonomous finance scaling.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[var(--accent-2)]">
            Ready for Phase 2
          </span>
        </div>
      </Item>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Item key={tier.title}>
              <div className="card h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70">
                    {tier.badge}
                  </span>
                </div>

                <h4 className="font-bold text-white mb-3">{tier.title}</h4>

                <ul className="space-y-2.5 text-xs text-white/60">
                  {tier.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Item>
          );
        })}
      </div>
    </Stagger>
  );
};