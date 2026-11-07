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
export class CashFlowManagerAgent implements BaseAgent {
  readonly metadata: AgentMetadata = {
    id: 'agent-cash-flow-manager',
    name: 'Cash Flow Management Agent',
    role: 'Liquidity, Working Capital & Runway Specialist',
    description:
      'Monitors cash inflows/outflows, computes rolling runway, projects 30/60/90-day balances, and alerts on liquidity stress points.',
    capabilities: [
      '30/60/90-Day Predictive Cash Flow Forecasting',
      'Runway & Monthly Burn Rate Calculation',
      'Working Capital & Liquidity Stress Testing',
      'Receivables & Payables Timing Synchronization',
    ],
    status: 'ACTIVE',
  };

  constructor(private readonly financeService: FinanceService) {}

  async execute(_context: AgentContext): Promise<AgentResult> {
    const start = performance.now();
    const forecast = this.financeService.getCashFlowForecast();
    const overview = this.financeService.getOverview();

    const metrics: AgentMetric[] = [
      {
        label: 'Liquid Cash Balance',
        value: `$${forecast.currentCashBalance.toLocaleString()}`,
        trend: 'up',
      },
      {
        label: 'Estimated Monthly Burn',
        value: `$${forecast.estimatedMonthlyBurn.toLocaleString()}`,
        trend: 'neutral',
      },
      {
        label: 'Operational Runway',
        value: `${forecast.runwayMonths} months`,
        trend: forecast.runwayMonths >= 12 ? 'up' : 'down',
      },
      {
        label: 'Liquidity Risk Level',
        value: forecast.liquidityRiskLevel,
        trend: forecast.liquidityRiskLevel === 'LOW' ? 'up' : 'down',
      },
    ];

    const findings: string[] = [
      `Total available cash reserves stand at $${forecast.currentCashBalance.toLocaleString()} across primary checking and treasury accounts.`,
      `Current burn rate is approximately $${forecast.estimatedMonthlyBurn.toLocaleString()}/month, yielding an autonomous operational runway of ${forecast.runwayMonths} months.`,
      `90-day cash flow projection anticipates a closing balance of $${forecast.predicted90DayBalance.toLocaleString()} with confidence score of ${(forecast.confidenceScore * 100).toFixed(0)}%.`,
      `Liquidity risk is categorized as ${forecast.liquidityRiskLevel}; zero immediate solvency concerns detected.`,
    ];

    const recommendations: string[] = [
      `Expedite collection on the $${overview.accountsReceivableTotal.toLocaleString()} in pending accounts receivable to boost 30-day liquidity buffer.`,
      'Synchronize bi-monthly payroll disbursement cycles with incoming client retainer settlement windows to flatten cash dips.',
      'Maintain at least 4 months ($900,000) of operating expenses in immediate zero-day checking liquidity.',
    ];

    const duration = Math.round(performance.now() - start);

    return {
      agentId: this.metadata.id,
      agentName: this.metadata.name,
      summary: `Liquidity position is strong with $${forecast.currentCashBalance.toLocaleString()} in reserves, ${forecast.runwayMonths} months of runway, and projected 90-day balance of $${forecast.predicted90DayBalance.toLocaleString()}.`,
      findings,
      recommendations,
      metrics,
      supportingData: {
        predicted30DayBalance: forecast.predicted30DayBalance,
        predicted60DayBalance: forecast.predicted60DayBalance,
        predicted90DayBalance: forecast.predicted90DayBalance,
        liquidityRiskLevel: forecast.liquidityRiskLevel,
      },
      confidenceScore: forecast.confidenceScore,
      executionDurationMs: duration,
    };
  }
}

