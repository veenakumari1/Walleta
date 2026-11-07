import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type {
  BudgetSummary,
  FinancialOverviewMetrics,
  TransactionModel,
} from '../types/finance.types';
import type { TabId } from './NavigationTabs';

interface OverviewViewProps {
  metrics: FinancialOverviewMetrics | null;
  transactions: TransactionModel[];
  budgets: BudgetSummary | null;
  onNavigate: (tab: TabId) => void;
  onRunAudit: () => void;
  isAuditRunning: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  transactions,
  budgets,
  onNavigate,
  onRunAudit,
  isAuditRunning,
}) => {
  if (!metrics) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="h-8 w-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading real-time financial telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulation / Data Transparency Notice */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-100">
              Active Financial Engine Mode: Centralized Simulation &amp; Real Model Operations
            </span>
            <p className="mt-1 text-amber-300/80 leading-relaxed">
              Because external Plaid/ERP banking credentials are not configured in this environment,
              high-fidelity enterprise financial telemetry is simulated. All mathematical
              calculations, Z-score anomaly detections, 90-day cash flow projections, and
              multi-agent coordination run deterministically on real live data.
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0">
          Simulated Data Flag: TRUE
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash Balance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Liquid Cash Reserves</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            ${metrics.totalCashBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{metrics.runwayMonths} mo</span>
            <span>autonomous runway</span>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Gross Revenue (Inflow)</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-cyan-400 font-semibold">{metrics.profitMarginPct}%</span>
            <span>net profit margin</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Operating Expenses (Outflow)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            ${metrics.totalExpenses.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-rose-400 font-semibold">{metrics.activeAnomaliesCount}</span>
            <span>flagged spending anomalies</span>
          </div>
        </div>

        {/* Net Operating Earnings */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Net Operating Income</span>
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            +${metrics.netIncome.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Burn: ~${metrics.monthlyBurnRate.toLocaleString()}/mo</span>
          </div>
        </div>
      </div>

      {/* Secondary Working Capital Metrics & Actions Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Working Capital Banner */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                Working Capital &amp; Settlement Position
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Trailing 30-Day Window</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-xs text-slate-400">Accounts Receivable (AR)</span>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">
                  ${metrics.accountsReceivableTotal.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pending client retainer &amp; licensing invoices
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-xs text-slate-400">Accounts Payable (AP)</span>
                <p className="text-xl font-bold text-amber-400 font-mono mt-1">
                  ${metrics.accountsPayableTotal.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {metrics.pendingApprovalsCount} invoice(s) awaiting human approval gate
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Multi-Agent Sandboxed Governance Active</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('assistant')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              >
                Ask Assistant
              </button>
              <button
                onClick={onRunAudit}
                disabled={isAuditRunning}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isAuditRunning ? 'animate-spin' : ''}`} />
                <span>{isAuditRunning ? 'Auditing...' : 'Run Autonomous Multi-Agent Audit'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Department Budget Burn Snapshot */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Department Budgets</h3>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {budgets ? (
            <div className="space-y-3.5">
              {budgets.departments.slice(0, 4).map((d) => (
                <div key={d.department}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">{d.department}</span>
                    <span
                      className={`font-mono ${
                        d.status === 'OVER_BUDGET'
                          ? 'text-rose-400 font-bold'
                          : d.status === 'AT_RISK'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {d.utilizationPct}% (${d.spent.toLocaleString()} / $
                      {d.allocated.toLocaleString()})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
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
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Loading budget data...</p>
          )}
        </div>
      </div>

      {/* Recent Ledger Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">
              Live feed processed through Autonomous Categorization Engine
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Ledger</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/20 transition">
                  <td className="py-3 font-mono text-slate-400">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 font-medium text-white flex items-center gap-2">
                    {t.description}
                    {t.isAnomalous && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                        Anomaly Flagged
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300">{t.category}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.type === 'INCOME'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td
                    className={`py-3 text-right font-mono font-semibold ${
                      t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
