import { Injectable } from '@nestjs/common';
import {
  FinancialOverviewMetrics,
  InvoiceModel,
  TransactionModel,
} from '../finance/finance.types.js';

export interface FinancialReportPayload {
  title: string;
  period: string;
  generatedAt: string;
  metrics: FinancialOverviewMetrics;
  revenueBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
  executiveSummary: string;
  strategicRecommendations: string[];
}

@Injectable()
export class ReportGeneratorEngine {
  generate(
    transactions: TransactionModel[],
    invoices: InvoiceModel[],
    totalCashBalance: number,
  ): FinancialReportPayload {
    let totalRevenue = 0;
    let totalExpenses = 0;
    const revenueBreakdown: Record<string, number> = {};
    const expenseBreakdown: Record<string, number> = {};
    let anomaliesCount = 0;

    for (const tx of transactions) {
      if (tx.isAnomalous) anomaliesCount++;

      if (tx.type === 'INCOME') {
        totalRevenue += tx.amount;
        revenueBreakdown[tx.category] = (revenueBreakdown[tx.category] ?? 0) + tx.amount;
      } else {
        totalExpenses += tx.amount;
        expenseBreakdown[tx.category] = (expenseBreakdown[tx.category] ?? 0) + tx.amount;
      }
    }

    const netIncome = totalRevenue - totalExpenses;
    const profitMarginPct = totalRevenue > 0 ? parseFloat(((netIncome / totalRevenue) * 100).toFixed(1)) : 0;
    const monthlyBurnRate = Math.round(totalExpenses);
    const runwayMonths = monthlyBurnRate > 0 ? parseFloat((totalCashBalance / monthlyBurnRate).toFixed(1)) : 99.9;

    const accountsReceivableTotal = invoices
      .filter((i) => i.type === 'RECEIVABLE' && i.status !== 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);

    const accountsPayableTotal = invoices
      .filter((i) => i.type === 'PAYABLE' && i.status !== 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingApprovalsCount = invoices.filter((i) => i.requiresApproval && i.status === 'AWAITING_APPROVAL').length;

    const metrics: FinancialOverviewMetrics = {
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMarginPct,
      totalCashBalance,
      monthlyBurnRate,
      runwayMonths,
      accountsReceivableTotal,
      accountsPayableTotal,
      pendingApprovalsCount,
      activeAnomaliesCount: anomaliesCount,
      isSimulatedData: true,
    };

    const executiveSummary = `Business operations yielded $${totalRevenue.toLocaleString()} in gross revenue against $${totalExpenses.toLocaleString()} in operational costs, delivering net earnings of $${netIncome.toLocaleString()} (${profitMarginPct}% profit margin). With cash reserves at $${totalCashBalance.toLocaleString()}, the organization maintains ${runwayMonths} months of liquid runway. Active receivables total $${accountsReceivableTotal.toLocaleString()} across enterprise clients, while current accounts payable stand at $${accountsPayableTotal.toLocaleString()}.`;

    const strategicRecommendations = [
      'Accelerate collection cycles for outstanding accounts receivable ($130,000 pending) via automated reminders.',
      'Audit discretionary travel and unapproved hardware vendor expenses flagged by the anomaly engine.',
      'Rebalance Sales department Q4 budget allocation to account for higher client acquisition commission velocity.',
      'Maintain treasury reserve allocations in yield-bearing assets to preserve purchasing power against operational burn.',
    ];

    return {
      title: 'Autonomous Executive Financial Briefing',
      period: 'Trailing 30-Day Financial Performance',
      generatedAt: new Date().toISOString(),
      metrics,
      revenueBreakdown,
      expenseBreakdown,
      executiveSummary,
      strategicRecommendations,
    };
  }
}

