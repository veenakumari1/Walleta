import React from 'react';
import { ShieldCheck, Calendar, Activity } from 'lucide-react';
import type { CashFlowForecast } from '../types/finance.types';

interface CashFlowViewProps {
  forecast: CashFlowForecast | null;
}

const LABEL = 'text-[11px] uppercase tracking-wider text-white/50 font-semibold';
const PILL = 'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide';

export const CashFlowView: React.FC<CashFlowViewProps> = ({ forecast }) => {
  if (!forecast) {
    return (
      <div className="py-16 text-center text-white/50">
        <div className="h-8 w-8 mx-auto border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Calculating 90-day cash flow projections and liquidity stress models...</p>
      </div>
    );
  }

  const isRiskHigh = forecast.liquidityRiskLevel === 'HIGH';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">
          Cash Flow Monitoring &amp; 90-Day Predictive Forecasting
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Linear regression model integrating trailing 30-day run-rate and scheduled AP/AR invoice
          commitments
        </p>
      </div>

      {/* Projection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className={LABEL}>Current Cash Position</p>
          <p className="text-2xl font-extrabold text-white mt-2 tabular-nums">
            ${forecast.currentCashBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/50">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            <span>Zero-day verified balance</span>
          </div>
        </div>

        <div className="card">
          <p className={LABEL}>+30 Day Projected</p>
          <p className="text-2xl font-extrabold text-white mt-2 tabular-nums">
            ${forecast.predicted30DayBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/50">
            <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Includes scheduled receivables</span>
          </div>
        </div>

        <div className="card">
          <p className={LABEL}>+60 Day Projected</p>
          <p className="text-2xl font-extrabold text-white mt-2 tabular-nums">
            ${forecast.predicted60DayBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/50">
            <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Mid-term liquidity horizon</span>
          </div>
        </div>

        <div className="card">
          <p className={LABEL}>+90 Day Projected</p>
          <p className="text-2xl font-extrabold text-[var(--accent-2)] mt-2 tabular-nums">
            ${forecast.predicted90DayBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
            <span
              className={`${PILL} ${
                isRiskHigh ? 'bg-[var(--accent-soft)] text-[var(--accent-2)]' : 'bg-white/10 text-white/70'
              }`}
            >
              Risk: {forecast.liquidityRiskLevel}
            </span>
            <span>Runway: {forecast.runwayMonths} mo</span>
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--accent)]" />
              Forecast Trajectory Points &amp; Scheduled Settlement Flow
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Sampled 5-day intervals across the forward 90-day planning cycle
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[var(--accent-2)]">
            Confidence: {(forecast.confidenceScore * 100).toFixed(0)}%
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white/[0.03]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/[0.05] text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Timeline Date</th>
                <th className="py-3 px-4 font-semibold">Model Type</th>
                <th className="py-3 px-4 font-semibold text-right">Inflow</th>
                <th className="py-3 px-4 font-semibold text-right">Outflow</th>
                <th className="py-3 px-4 font-semibold text-right">Net Cash Flow</th>
                <th className="py-3 px-4 font-semibold text-right">Projected Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 tabular-nums">
              {forecast.forecastPoints.map((pt) => (
                <tr key={pt.date} className="hover:bg-white/[0.04] transition">
                  <td className="py-3 px-4 text-white/70">{pt.date}</td>
                  <td className="py-3 px-4">
                    <span className={`${PILL} bg-white/10 text-white/60 normal-case tracking-normal font-semibold`}>
                      Predictive Model
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white/80">
                    +${pt.inflow.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--accent-2)]">
                    -${pt.outflow.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      pt.netCashFlow >= 0 ? 'text-white' : 'text-[var(--accent-2)]'
                    }`}
                  >
                    {pt.netCashFlow >= 0 ? '+' : '-'}${Math.abs(pt.netCashFlow).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-white font-bold">
                    ${pt.projectedBalance.toLocaleString()}
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