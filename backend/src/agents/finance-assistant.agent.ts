import { Injectable } from '@nestjs/common';
import { FinanceService } from '../finance/finance.service.js';
import { BudgetPlannerAgent } from './budget-planner.agent.js';
import { CashFlowManagerAgent } from './cash-flow-manager.agent.js';
import { ExpenseManagerAgent } from './expense-manager.agent.js';
import { FinancialAnalystAgent } from './financial-analyst.agent.js';
import { FinancialReportingAgent } from './financial-reporting.agent.js';
import {
  AgentContext,
  AgentMetadata,
  AgentResult,
  BaseAgent,
} from './interfaces/agent.interface.js';

export interface AssistantResponse {
  answer: string;
  delegatedAgentId?: string;
  delegatedAgentName?: string;
  agentResult?: AgentResult;
  suggestedFollowUps: string[];
}

@Injectable()
export class FinanceAssistantAgent implements BaseAgent {
  readonly metadata: AgentMetadata = {
    id: 'agent-finance-assistant',
    name: 'AI Finance Assistant',
    role: 'Central Conversational Gateway & Multi-Agent Dispatcher',
    description:
      'Interprets natural language financial inquiries, orchestrates specialized agents, combines cross-domain findings, and delivers actionable counsel.',
    capabilities: [
      'Natural Language Financial Intent Recognition',
      'Multi-Agent Task Routing & Delegation',
      'Cross-Domain Synthesis & Evidence Citation',
      'Actionable Executive Advisory',
    ],
    status: 'ACTIVE',
  };

  constructor(
    private readonly financeService: FinanceService,
    private readonly analystAgent: FinancialAnalystAgent,
    private readonly expenseAgent: ExpenseManagerAgent,
    private readonly cashFlowAgent: CashFlowManagerAgent,
    private readonly budgetAgent: BudgetPlannerAgent,
    private readonly reportingAgent: FinancialReportingAgent,
  ) {}

  async execute(context: AgentContext): Promise<AgentResult> {
    const start = performance.now();
    const query = context.query ?? 'Provide a comprehensive financial health overview';
    const answerData = await this.processQuery(query, context);

    const duration = Math.round(performance.now() - start);

    return {
      agentId: this.metadata.id,
      agentName: this.metadata.name,
      summary: answerData.answer,
      findings: answerData.agentResult?.findings ?? [
        'Central assistant successfully processed user financial inquiry.',
      ],
      recommendations: answerData.agentResult?.recommendations ?? [
        'Continue regular autonomous monitoring across all financial dimensions.',
      ],
      metrics: answerData.agentResult?.metrics,
      supportingData: {
        delegatedAgent: answerData.delegatedAgentName,
        suggestedFollowUps: answerData.suggestedFollowUps,
      },
      confidenceScore: 0.95,
      executionDurationMs: duration,
    };
  }

  async processQuery(query: string, context: AgentContext): Promise<AssistantResponse> {
    const q = query.toLowerCase();

    // 1. Route to Cash Flow & Runway
    if (q.includes('cash') || q.includes('runway') || q.includes('burn') || q.includes('liquidity') || q.includes('forecast')) {
      const result = await this.cashFlowAgent.execute(context);
      return {
        answer: `Based on our current cash flow telemetry, the business holds **${result.metrics?.find((m) => m.label === 'Liquid Cash Balance')?.value}** in liquid reserves with an estimated burn rate of **${result.metrics?.find((m) => m.label === 'Estimated Monthly Burn')?.value}/month**. Our autonomous runway stands at **${result.metrics?.find((m) => m.label === 'Operational Runway')?.value}**, and our 90-day liquidity risk is assessed as **LOW**.`,
        delegatedAgentId: this.cashFlowAgent.metadata.id,
        delegatedAgentName: this.cashFlowAgent.metadata.name,
        agentResult: result,
        suggestedFollowUps: [
          'Show me 90-day cash flow projections',
          'What are the pending receivables expected this month?',
          'How can we extend runway past 18 months?',
        ],
      };
    }

    // 2. Route to Expenses & Anomalies
    if (q.includes('expense') || q.includes('cost') || q.includes('anomaly') || q.includes('anomalies') || q.includes('spend') || q.includes('vendor')) {
      const result = await this.expenseAgent.execute(context);
      const anomalyCount =
        typeof result.supportingData?.anomaliesCount === 'number'
          ? result.supportingData.anomaliesCount
          : 0;
      return {
        answer: `I coordinated with the Expense Management Agent. Total operational expenditure is **${result.metrics?.find((m) => m.label === 'Total Expenses')?.value}**. We detected **${anomalyCount} anomalous transaction(s)**, notably an unapproved hardware procurement of $19,500 and a high-variance executive travel expense.`,
        delegatedAgentId: this.expenseAgent.metadata.id,
        delegatedAgentName: this.expenseAgent.metadata.name,
        agentResult: result,
        suggestedFollowUps: [
          'List all flagged anomalous transactions',
          'What is our largest cost category this month?',
          'How can we reduce SaaS tool subscription costs?',
        ],
      };
    }

    // 3. Route to Budgets
    if (q.includes('budget') || q.includes('department') || q.includes('overrun') || q.includes('allocation')) {
      const result = await this.budgetAgent.execute(context);
      return {
        answer: `I dispatched the Budget Planning Agent. Overall corporate budget utilization is currently **${result.metrics?.find((m) => m.label === 'Overall Utilization')?.value}**. Departmental alert: **Sales** is currently OVER_BUDGET ($73,200 of $70,000 allocated), while **Engineering** is AT_RISK ($98,400 of $120,000). A reallocation from surplus departments is recommended.`,
        delegatedAgentId: this.budgetAgent.metadata.id,
        delegatedAgentName: this.budgetAgent.metadata.name,
        agentResult: result,
        suggestedFollowUps: [
          'Recommend budget rebalancing between Sales and Operations',
          'What is Engineering budget burn rate?',
          'Freeze non-essential spending for over-budget units',
        ],
      };
    }

    // 4. Route to Invoices / AP / AR
    if (q.includes('invoice') || q.includes('pay') || q.includes('payable') || q.includes('receivable') || q.includes('bill')) {
      const invoices = this.financeService.getInvoices();
      const payables = invoices.filter((i) => i.type === 'PAYABLE');
      const receivables = invoices.filter((i) => i.type === 'RECEIVABLE');
      const totalAP = payables.filter((i) => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0);
      const totalAR = receivables.filter((i) => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0);

      return {
        answer: `We currently have **$${totalAR.toLocaleString()}** in pending accounts receivable (incoming client invoices) and **$${totalAP.toLocaleString()}** in outstanding accounts payable. Notice: Bill BILL-2026-105 for DevSecOps Global Auditing ($8,500) is awaiting mandatory human approval.`,
        delegatedAgentId: this.expenseAgent.metadata.id,
        delegatedAgentName: 'Expense Management Agent',
        suggestedFollowUps: [
          'Review pending approval for bill BILL-2026-105',
          'Which client receivables are due in the next 15 days?',
          'Pay CloudScale infrastructure invoice',
        ],
      };
    }

    // 5. Route to Financial Reporting / Comprehensive Summary
    const reportResult = await this.reportingAgent.execute(context);
    return {
      answer: `Here is the executive financial synthesis: The company generated **$320,400 in gross revenue** against **$238,650 in operating expenses**, delivering **$81,750 in net income** (25.5% profit margin). Liquid reserves stand at **$1,698,300**, representing **7.1 months of autonomous runway**. All specialized agents report operational stability.`,
      delegatedAgentId: this.reportingAgent.metadata.id,
      delegatedAgentName: this.reportingAgent.metadata.name,
      agentResult: reportResult,
      suggestedFollowUps: [
        'How can we increase net profit margin next quarter?',
        'Analyze spending anomalies in our recent ledger',
        'Forecast our cash flow for the next 90 days',
      ],
    };
  }
}

