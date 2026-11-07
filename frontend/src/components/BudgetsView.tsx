import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import type { BudgetSummary } from '../types/finance.types';
import { Item, Stagger } from '../AnimatedTabs';

interface BudgetsViewProps {
  budgets: BudgetSummary | null;
}

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const LABEL = 'text-[11px] uppercase tracking-wider text-white/50 font-semibold';

export const BudgetsView: React.FC<BudgetsViewProps> = ({ budgets }) => {
  if (!budgets) {
    return (
      <div className="py-24 text-center text-white/60">
        <div className="h-8 w-8 mx-auto border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading budgets...</p>
      </div>
    );
  }

  const alerts = budgets.overBudgetCount + budgets.atRiskCount;

  return (
    <Stagger className="space-y-5">
      <Item>
        <p className={`text-sm ${alerts > 0 ? 'text-[var(--accent-2)]' : 'text-white/50'}`}>
          {alerts > 0
            ? `${budgets.overBudgetCount} over budget, ${budgets.atRiskCount} at risk`
            : 'All departments are on track'}
        </p>
      </Item>

      {/* 3 key numbers */}
      <div className="grid gap-5 md:grid-cols-3">
        <Item>
          <div className="card">
            <p className={LABEL}>Allocated</p>
            <p className="card-value mt-2">{money(budgets.totalAllocated)}</p>
            <p className="text-xs text-white/50 mt-1">Total budget pool</p>
          </div>
        </Item>
        <Item>
          <div className="card">
            <p className={LABEL}>Spent</p>
            <p className="card-value mt-2 text-[var(--accent)]">{money(budgets.totalSpent)}</p>
            <p className="text-xs text-white/50 mt-1">{money(budgets.totalRemaining)} remaining</p>
          </div>
        </Item>
        <Item>
          <div className="card">
            <p className={LABEL}>Utilization</p>
            <p className="card-value mt-2">{budgets.overallUtilizationPct}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, budgets.overallUtilizationPct)}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </Item>
      </div>

      {/* Departments */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {budgets.departments.map((d) => {
          const hot = d.status === 'OVER_BUDGET';
          return (
            <Item key={d.department}>
              <div className="card h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">{d.department}</h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      hot || d.status === 'AT_RISK'
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-2)]'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {d.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-2xl font-extrabold">{d.utilizationPct}%</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {money(d.spent)} of {money(d.allocated)}
                </p>

                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${hot ? 'bg-[var(--accent)]' : 'bg-white/70'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, d.utilizationPct)}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                {d.recommendation && (
                  <p className="text-xs text-white/50 mt-4 line-clamp-2">{d.recommendation}</p>
                )}
              </div>
            </Item>
          );
        })}
      </div>

      {/* Suggestions (top 3) */}
      {budgets.optimizationSuggestions.length > 0 && (
        <Item>
          <div className="card">
            <p className={`${LABEL} mb-4`}>Suggestions</p>
            <div className="space-y-2">
              {budgets.optimizationSuggestions.slice(0, 3).map((sug, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] text-sm text-white/70">
                  <ArrowRightLeft className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </Item>
      )}
    </Stagger>
  );
};
