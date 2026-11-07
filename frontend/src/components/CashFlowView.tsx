import React from 'react';
import { ShieldCheck, Calendar, Activity } from 'lucide-react';
import type { CashFlowForecast } from '../types/finance.types';

interface CashFlowViewProps {
  forecast: CashFlowForecast | null;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({ forecast }) => {
  if (!forecast) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="h-8 w-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Calculating 90-day cash flow projections and liquidity stress models...</p>
      </div>
    );
  }

  const isRiskHigh = forecast.liquidityRiskLevel === 'HIGH';
  const isRiskMedium = forecast.liquidityRiskLevel === 'MEDIUM';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">
          Cash Flow Monitoring &amp; 90-Day Predictive Forecasting
        </h2>
        <p className="text-xs text-slate-400">
          Linear regression model integrating trailing 30-day run-rate and scheduled AP/AR invoice
          commitments
        </p>
      </div>

      {/* Projections Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Cash */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">Current Cash Position</span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            ${forecast.currentCashBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero-day verified balance</span>
          </div>
        </div>

        {/* 30-Day Projected */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">+30 Day Projected Balance</span>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            ${forecast.predicted30DayBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            <span>Includes scheduled receivables</span>
          </div>
        </div>

        {/* 60-Day Projected */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">+60 Day Projected Balance</span>
          <p className="text-2xl font-extrabold text-blue-400 font-mono mt-1">
            ${forecast.predicted60DayBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            <span>Mid-term liquidity horizon</span>
          </div>
        </div>

        {/* 90-Day Projected */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400">+90 Day Projected Balance</span>
          <p className="text-2xl font-extrabold text-violet-400 font-mono mt-1">
            ${forecast.predicted90DayBalance.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isRiskHigh
                  ? 'bg-rose-500/20 text-rose-300'
                  : isRiskMedium
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              Risk: {forecast.liquidityRiskLevel}
            </span>
            <span className="text-slate-500">Runway: {forecast.runwayMonths} mo</span>
          </div>
        </div>
      </div>

      {/* Projection Horizon Visualization */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              Forecast Trajectory Points &amp; Scheduled Settlement Flow
            </h3>
            <p className="text-xs text-slate-400">
              Sampled 5-day intervals across the forward 90-day planning cycle
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            Confidence: {(forecast.confidenceScore * 100).toFixed(0)}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                <th className="py-3 px-4 font-medium">Timeline Date</th>
                <th className="py-3 px-4 font-medium">Model Type</th>
                <th className="py-3 px-4 font-medium text-right">Inflow (In)</th>
                <th className="py-3 px-4 font-medium text-right">Outflow (Out)</th>
                <th className="py-3 px-4 font-medium text-right">Net Cash Flow</th>
                <th className="py-3 px-4 font-medium text-right">Projected Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {forecast.forecastPoints.map((pt) => (
                <tr key={pt.date} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 text-slate-300 font-sans">{pt.date}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Predictive Model
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    +${pt.inflow.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-400">
                    -${pt.outflow.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      pt.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
