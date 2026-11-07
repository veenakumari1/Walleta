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
export class FinancialReportingAgent implements BaseAgent {
  readonly metadata: AgentMetadata = {
    id: 'agent-financial-reporting',
    name: 'Financial Reporting Agent',
    role: 'Executive Financial Summaries & Compliance Specialist',
    description:
      'Compiles formal periodic financial statements, P&L calculations, KPI summaries, and audit-ready reports.',
    capabilities: [
      'P&L Statement Generation',
      'Executive Briefing Preparation',
      'KPI Scorecard Compilation',
      'Audit Trail & Verification Package Delivery',
    ],
    status: 'ACTIVE',
  };

  constructor(private readonly financeService: FinanceService) {}

  async execute(_context: AgentContext): Promise<AgentResult> {
    const start = performance.now();
    const report = this.financeService.getComprehensiveReport();
    const overview = report.metrics;

    const metrics: AgentMetric[] = [
      {
        label: 'Net Operating Income',
        value: `$${overview.netIncome.toLocaleString()}`,
        trend: 'up',
      },
      {
        label: 'Profit Margin',
        value: `${overview.profitMarginPct}%`,
        trend: 'up',
      },
      {
        label: 'Liquid Reserves',
        value: `$${overview.totalCashBalance.toLocaleString()}`,
        trend: 'up',
      },
      {
        label: 'Operational Runway',
        value: `${overview.runwayMonths} mo`,
        trend: 'up',
      },
    ];

    const findings: string[] = [
      `Period covered: ${report.period} (Generated: ${new Date(report.generatedAt).toLocaleDateString()}).`,
      `Total recognized revenue: $${overview.totalRevenue.toLocaleString()} across 3 primary streams.`,
      `Total recognized operating expenses: $${overview.totalExpenses.toLocaleString()}.`,
      `Net earnings generated: $${overview.netIncome.toLocaleString()} representing ${overview.profitMarginPct}% net profit margin.`,
      `Outstanding Receivables (AR): $${overview.accountsReceivableTotal.toLocaleString()} | Outstanding Payables (AP): $${overview.accountsPayableTotal.toLocaleString()}.`,
    ];

    const duration = Math.round(performance.now() - start);

    return {
      agentId: this.metadata.id,
      agentName: this.metadata.name,
      summary: report.executiveSummary,
      findings,
      recommendations: report.strategicRecommendations,
      metrics,
      supportingData: {
        reportTitle: report.title,
        revenueBreakdown: report.revenueBreakdown,
        expenseBreakdown: report.expenseBreakdown,
        kpiData: overview,
      },
      confidenceScore: 0.98,
      executionDurationMs: duration,
    };
  }
}

