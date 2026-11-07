import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import type {
  BudgetSummary,
  FinancialOverviewMetrics,
  TransactionModel,
} from '../types/finance.types';
import type { TabId } from './NavigationTabs';
import { Item, Stagger } from '../AnimatedTabs';

interface OverviewViewProps {
  metrics: FinancialOverviewMetrics | null;
  transactions: TransactionModel[];
  budgets: BudgetSummary | null;
  onNavigate: (tab: TabId) => void;
  onRunAudit: () => void;
  isAuditRunning: boolean;
}

const money = (n: number) =>
  `$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const shortDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const LABEL = 'text-[11px] uppercase tracking-wider text-white/50 font-semibold';

/* ---- smooth line chart (pure SVG, koi library nahi) ---- */
function smooth(pts: { x: number; y: number }[]) {
  return pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const q = pts[i - 1];
    const mx = (q.x + p.x) / 2;
    return `${d} C${mx},${q.y} ${mx},${p.y} ${p.x},${p.y}`;
  }, '');
}

function buildChart(values: number[]) {
  if (values.length < 2) return null;
  const W = 600;
  const H = 200;
  const PAD = 16;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - PAD - ((v - min) / span) * (H - PAD * 2),
  }));
  const line = smooth(pts);
  return { line, area: `${line} L${W},${H} L0,${H} Z` };
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  transactions,
  budgets,
  onNavigate,
  onRunAudit,
  isAuditRunning,
}) => {
  const sorted = useMemo(
    () => [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [transactions],
  );

  const chart = useMemo(() => {
    if (!metrics || sorted.length < 2) return null;
    let run = 0;
    const raw = sorted.map((t) => (run += t.type === 'INCOME' ? t.amount : -t.amount));
    const shift = metrics.totalCashBalance - raw[raw.length - 1];
    return buildChart(raw.map((v) => v + shift));
  }, [metrics, sorted]);

  if (!metrics) {
    return (
      <div className="py-24 text-center text-white/60">
        <div className="h-8 w-8 mx-auto border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading your wallet...</p>
      </div>
    );
  }

  const recent = [...sorted].reverse().slice(0, 4);
  const net = metrics.netIncome;

  return (
    <Stagger className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Total balance + chart */}
        <Item className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={LABEL}>Total balance</p>
                <p className="text-5xl font-extrabold tracking-tight mt-2">
                  {money(metrics.totalCashBalance)}
                </p>
                <span
                  className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    net >= 0
                      ? 'bg-white/10 text-white'
                      : 'bg-[var(--accent-soft)] text-[var(--accent-2)]'
                  }`}
                >
                  {net >= 0 ? '+' : '-'}
                  {money(net)} net income
                </span>
              </div>
              <button
                className="btn flex items-center gap-2"
                style={{ padding: '10px 18px' }}
                onClick={onRunAudit}
                disabled={isAuditRunning}
              >
                <Sparkles className={`h-4 w-4 ${isAuditRunning ? 'animate-spin' : ''}`} />
                {isAuditRunning ? 'Auditing...' : 'Run audit'}
              </button>
            </div>

            <div className="mt-6">
              {chart ? (
                <>
                  <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-48">
                    <defs>
                      <linearGradient id="bal-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#ff7a1a" stopOpacity="0.38" />
                        <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[50, 100, 150].map((y) => (
                      <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#fff" strokeOpacity="0.06" />
                    ))}
                    <motion.path
                      d={chart.area}
                      fill="url(#bal-fill)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                    <motion.path
                      d={chart.line}
                      fill="none"
                      stroke="#ff7a1a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.3, ease: 'easeInOut' }}
                    />
                  </svg>
                  <div className="flex justify-between text-[11px] text-white/40 mt-1">
                    <span>{shortDate(sorted[0].date)}</span>
                    <span>{shortDate(sorted[sorted.length - 1].date)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/40 py-16 text-center">Not enough activity for a chart yet</p>
              )}
            </div>
          </div>
        </Item>

        {/* Budgets */}
        <Item>
          <div className="card h-full">
            <div className="flex items-center justify-between mb-5">
              <p className={LABEL}>Budgets</p>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs text-[var(--accent-2)] flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {budgets ? (
              <div className="space-y-5">
                {budgets.departments.slice(0, 3).map((d) => (
                  <div key={d.department}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">{d.department}</span>
                      <span
                        className={`text-xs font-semibold ${
                          d.status === 'OVER_BUDGET' ? 'text-[var(--accent)]' : 'text-white/60'
                        }`}
                      >
                        {d.utilizationPct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          d.status === 'OVER_BUDGET' ? 'bg-[var(--accent)]' : 'bg-white/70'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, d.utilizationPct)}%` }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">Loading...</p>
            )}
          </div>
        </Item>
      </div>

      {/* 3 key stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <Item>
          <div className="card">
            <p className={LABEL}>Revenue</p>
            <p className="card-value mt-2">{money(metrics.totalRevenue)}</p>
            <p className="text-xs text-white/50 mt-1">{metrics.profitMarginPct}% profit margin</p>
          </div>
        </Item>
        <Item>
          <div className="card">
            <p className={LABEL}>Expenses</p>
            <p className="card-value mt-2">{money(metrics.totalExpenses)}</p>
            <p
              className={`text-xs mt-1 ${
                metrics.activeAnomaliesCount > 0 ? 'text-[var(--accent)]' : 'text-white/50'
              }`}
            >
              {metrics.activeAnomaliesCount} flagged
            </p>
          </div>
        </Item>
        <Item>
          <div className="card">
            <p className={LABEL}>Runway</p>
            <p className="card-value mt-2">{metrics.runwayMonths} mo</p>
            <p className="text-xs text-white/50 mt-1">Burn {money(metrics.monthlyBurnRate)}/mo</p>
          </div>
        </Item>
      </div>

      {/* Recent transactions */}
      <Item>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className={LABEL}>Recent transactions</p>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-[var(--accent-2)] flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] transition"
              >
                <div
                  className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${
                    t.type === 'INCOME' ? 'bg-white/10 text-white' : 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  }`}
                >
                  {t.type === 'INCOME' ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{t.description}</p>
                  <p className="text-xs text-white/50">
                    {t.category} &bull; {shortDate(t.date)}
                    {t.isAnomalous && <span className="text-[var(--accent)]"> &bull; Flagged</span>}
                  </p>
                </div>
                <p
                  className={`font-bold text-sm ${
                    t.type === 'INCOME' ? 'text-white' : 'text-[var(--accent)]'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}
                  {money(t.amount)}
                </p>
              </div>
            ))}
            {recent.length === 0 && <p className="text-sm text-white/40 py-6 text-center">No transactions yet</p>}
          </div>
        </div>
      </Item>
    </Stagger>
  );
};
