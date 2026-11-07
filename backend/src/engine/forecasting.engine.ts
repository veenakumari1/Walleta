import { Injectable } from '@nestjs/common';
import {
  CashFlowForecast,
  CashFlowPoint,
  InvoiceModel,
  TransactionModel,
} from '../finance/finance.types.js';

@Injectable()
export class ForecastingEngine {
  generateForecast(
    currentCashBalance: number,
    history: TransactionModel[],
    invoices: InvoiceModel[],
  ): CashFlowForecast {
    // 1. Group historical transactions into daily net cash flows
    const dateMap = new Map<string, { inflow: number; outflow: number }>();

    for (const tx of history) {
      const dateStr = tx.date.split('T')[0];
      const entry = dateMap.get(dateStr) ?? { inflow: 0, outflow: 0 };
      if (tx.type === 'INCOME') {
        entry.inflow += tx.amount;
      } else {
        entry.outflow += tx.amount;
      }
      dateMap.set(dateStr, entry);
    }

    const sortedDates = Array.from(dateMap.keys()).sort();
    let runningBalance = currentCashBalance;

    // Calculate historical points
    const historicalPoints: CashFlowPoint[] = sortedDates.map((date) => {
      const { inflow, outflow } = dateMap.get(date)!;
      const net = inflow - outflow;
      return {
        date,
        inflow,
        outflow,
        netCashFlow: net,
        projectedBalance: runningBalance,
        isProjected: false,
      };
    });

    // 2. Compute 30-day baseline burn rate and revenue run rate
    const totalOutflow = history
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalInflow = history
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const daysTracked = Math.max(15, sortedDates.length);
    const dailyAvgExpense = totalOutflow / daysTracked;
    const dailyAvgIncome = totalInflow / daysTracked;
    const estimatedMonthlyBurn = Math.round(dailyAvgExpense * 30);
    const estimatedMonthlyIncome = Math.round(dailyAvgIncome * 30);

    // 3. Project 90 days forward, incorporating scheduled receivables and payables
    const forecastPoints: CashFlowPoint[] = [];
    let projectedCash = currentCashBalance;
    const now = new Date();

    const pendingInvoices = invoices.filter((i) => i.status === 'PENDING' || i.status === 'AWAITING_APPROVAL');

    for (let day = 1; day <= 90; day++) {
      const targetDate = new Date(now.getTime() + day * 24 * 3600 * 1000);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Base daily estimates
      let dayInflow = dailyAvgIncome;
      let dayOutflow = dailyAvgExpense;

      // Add scheduled invoice receivables
      const receivablesDue = pendingInvoices
        .filter((i) => i.type === 'RECEIVABLE' && i.dueDate.startsWith(dateStr))
        .reduce((sum, i) => sum + i.amount, 0);

      // Add scheduled invoice payables
      const payablesDue = pendingInvoices
        .filter((i) => i.type === 'PAYABLE' && i.dueDate.startsWith(dateStr))
        .reduce((sum, i) => sum + i.amount, 0);

      dayInflow += receivablesDue;
      dayOutflow += payablesDue;

      projectedCash += (dayInflow - dayOutflow);

      if (day % 5 === 0 || day === 30 || day === 60 || day === 90) {
        forecastPoints.push({
          date: dateStr,
          inflow: Math.round(dayInflow),
          outflow: Math.round(dayOutflow),
          netCashFlow: Math.round(dayInflow - dayOutflow),
          projectedBalance: Math.round(projectedCash),
          isProjected: true,
        });
      }
    }

    const _netMonthlyBurn = Math.max(1, estimatedMonthlyBurn - estimatedMonthlyIncome);
    const runwayMonths = parseFloat((currentCashBalance / (estimatedMonthlyBurn || 1)).toFixed(1));

    const p30 = forecastPoints.find((p) => p.date === new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0])?.projectedBalance ?? Math.round(currentCashBalance + (estimatedMonthlyIncome - estimatedMonthlyBurn));
    const p60 = Math.round(currentCashBalance + 2 * (estimatedMonthlyIncome - estimatedMonthlyBurn));
    const p90 = Math.round(currentCashBalance + 3 * (estimatedMonthlyIncome - estimatedMonthlyBurn));

    let liquidityRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (runwayMonths < 6 || p90 < 200000) {
      liquidityRiskLevel = 'HIGH';
    } else if (runwayMonths < 12 || p90 < 500000) {
      liquidityRiskLevel = 'MEDIUM';
    }

    return {
      currentCashBalance,
      historicalPoints: historicalPoints.slice(-15),
      forecastPoints,
      predicted30DayBalance: p30,
      predicted60DayBalance: p60,
      predicted90DayBalance: p90,
      estimatedMonthlyBurn,
      runwayMonths,
      confidenceScore: 0.88,
      liquidityRiskLevel,
    };
  }
}

