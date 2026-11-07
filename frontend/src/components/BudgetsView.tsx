import React from 'react';
import { Lightbulb, ArrowRightLeft } from 'lucide-react';
import type { BudgetSummary } from '../types/finance.types';

interface BudgetsViewProps {
  budgets: BudgetSummary | null;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ budgets }) => {
  if (!budgets) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="h-8 w-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Analyzing departmental budget consumption and variances...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">
          Departmental Budget Allocation &amp; Variance Analysis
        </h2>
        <p className="text-xs text-slate-400">
          Automated budget burn velocity and departmental threshold management (Q4 2026)
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">Total Allocated Budget</span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            ${budgets.totalAllocated.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">Combined Q4 operational pools</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">Total Spent to Date</span>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            ${budgets.totalSpent.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Remaining: ${budgets.totalRemaining.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">Overall Utilization Rate</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {budgets.overallUtilizationPct}%
          </p>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${Math.min(100, budgets.overallUtilizationPct)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">Department Status Alerts</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">
              {budgets.overBudgetCount}
            </span>
            <span className="text-xs text-rose-300">Over-Budget</span>
            <span className="text-slate-500 font-mono">/</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {budgets.atRiskCount}
            </span>
            <span className="text-xs text-amber-300">At-Risk</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Immediate rebalancing required</p>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.departments.map((d) => (
          <div
            key={d.department}
            className={`rounded-2xl border p-5 transition ${
              d.status === 'OVER_BUDGET'
                ? 'border-rose-500/50 bg-rose-950/20'
                : d.status === 'AT_RISK'
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">{d.department}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  d.status === 'OVER_BUDGET'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : d.status === 'AT_RISK'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {d.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Spent vs Allocated:</span>
                <span className="font-mono text-white font-semibold">
                  ${d.spent.toLocaleString()} / ${d.allocated.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Consumption:</span>
                <span className="font-mono text-cyan-400 font-bold">{d.utilizationPct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    d.status === 'OVER_BUDGET'
                      ? 'bg-rose-500'
                      : d.status === 'AT_RISK'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, d.utilizationPct)}%` }}
                />
              </div>
            </div>

            {d.recommendation && (
              <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                <strong>Agent Insight:</strong> {d.recommendation}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Autonomous Reallocation & Optimization Suggestions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Autonomous Budget Planning Agent – Optimization Strategies
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          {budgets.optimizationSuggestions.map((sug, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60"
            >
              <ArrowRightLeft className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
