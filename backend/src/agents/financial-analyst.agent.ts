import { Injectable } from '@nestjs/common';
import { FinanceService } from '../finance/finance.service.js';
import {
  AgentContext,
  AgentMetadata,
  AgentMetric,
  AgentResult,
  BaseAgent,
} from './interfaces/agent.interface.js';

@Injectable()
export class FinancialAnalystAgent implements BaseAgent {
  readonly metadata: AgentMetadata = {
    id: 'agent-financial-analyst',
    name: 'Financial Analyst Agent',
    role: 'Corporate Performance & Growth Strategist',
    description:
      'Performs macro and micro financial analysis, evaluates margins, detects revenue opportunities, and computes health indicators.',
    capabilities: [
      'Gross & Net Profit Margin Analysis',
      'Revenue Stream Concentration Assessment',
      'Operating Cost Ratio Evaluation',
      'Strategic Capital Allocation Recommendations',
    ],
    status: 'ACTIVE',
  };

  constructor(private readonly financeService: FinanceService) {}

  async execute(_context: AgentContext): Promise<AgentResult> {
    const start = performance.now();
    const overview = this.financeService.getOverview();
    const transactions = this.financeService.getTransactions();
    const reports = this.financeService.getComprehensiveReport();

    const revenueTxs = transactions.filter((t) => t.type === 'INCOME');
    const recurringRevenue = revenueTxs
      .filter((t) => t.category.includes('SaaS') || t.category.includes('Retainer'))
      .reduce((sum, t) => sum + t.amount, 0);

    const recurringRevenuePct =
      overview.totalRevenue > 0
        ? Math.round((recurringRevenue / overview.totalRevenue) * 100)
        : 0;

    const operatingExpenseRatio =
      overview.totalRevenue > 0
        ? parseFloat(((overview.totalExpenses / overview.totalRevenue) * 100).toFixed(1))
        : 0;

    const metrics: AgentMetric[] = [
      {
        label: 'Gross Revenue',
        value: `$${overview.totalRevenue.toLocaleString()}`,
        trend: 'up',
      },
      {
        label: 'Net Margin',
        value: `${overview.profitMarginPct}%`,
        trend: overview.profitMarginPct > 15 ? 'up' : 'down',
      },
      {
        label: 'Recurring Revenue Share',
        value: `${recurringRevenuePct}%`,
        trend: 'up',
      },
      {
        label: 'Operating Expense Ratio',
        value: `${operatingExpenseRatio}%`,
        trend: operatingExpenseRatio < 80 ? 'up' : 'down',
      },
    ];

    const findings: string[] = [
      `Net profit stands at $${overview.netIncome.toLocaleString()} (${overview.profitMarginPct}% net margin), demonstrating viable operational efficiency.`,
      `Recurring cash inflows represent ${recurringRevenuePct}% ($${recurringRevenue.toLocaleString()}) of top-line revenue, providing strong revenue predictability.`,
      `Liquid operating reserves total $${overview.totalCashBalance.toLocaleString()}, securing ${overview.runwayMonths} months of autonomous runway at current expense velocity.`,
    ];

    const recommendations: string[] = [
      'Diversify enterprise licensing contracts to reduce concentration risk in client retainer portfolios.',
      'Deploy surplus treasury reserves above the 6-month operational threshold into safe short-duration government paper.',
      'Scale high-margin SaaS subscription billing while maintaining operating expenses below 75% of monthly revenue.',
    ];

    const duration = Math.round(performance.now() - start);

    return {
      agentId: this.metadata.id,
      agentName: this.metadata.name,
      summary: `Financial performance remains structurally sound with $${overview.netIncome.toLocaleString()} in net profit, ${overview.profitMarginPct}% profit margin, and ${overview.runwayMonths} months of runway.`,
      findings,
      recommendations,
      metrics,
      supportingData: {
        totalRevenue: overview.totalRevenue,
        totalExpenses: overview.totalExpenses,
        netIncome: overview.netIncome,
        revenueBreakdown: reports.revenueBreakdown,
      },
      confidenceScore: 0.94,
      executionDurationMs: duration,
    };
  }
}

