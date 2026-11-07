import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BudgetPlannerAgent } from '../agents/budget-planner.agent.js';
import { CashFlowManagerAgent } from '../agents/cash-flow-manager.agent.js';
import { ExpenseManagerAgent } from '../agents/expense-manager.agent.js';
import { FinanceAssistantAgent } from '../agents/finance-assistant.agent.js';
import { FinancialAnalystAgent } from '../agents/financial-analyst.agent.js';
import { FinancialReportingAgent } from '../agents/financial-reporting.agent.js';
import {
  AgentContext,
  AgentMetadata,
  AgentResult,
  BaseAgent,
} from '../agents/interfaces/agent.interface.js';
import { PostExecutionHook } from './hooks/post-execution.hook.js';
import { PreExecutionHook } from './hooks/pre-execution.hook.js';
import { ExecutionSandbox } from './sandbox/execution-sandbox.js';
import { ApprovalService } from './security/approval.service.js';

export interface AuditRecord {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string;
  timestamp: string;
  executionDurationMs: number;
  status: 'SUCCESS' | 'FAILED' | 'AWAITING_APPROVAL';
  hooksTriggered: string[];
  isSandboxed: boolean;
  summary: string;
}

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private readonly agentRegistry = new Map<string, BaseAgent>();
  private auditHistory: AuditRecord[] = [];

  constructor(
    private readonly analystAgent: FinancialAnalystAgent,
    private readonly expenseAgent: ExpenseManagerAgent,
    private readonly cashFlowAgent: CashFlowManagerAgent,
    private readonly budgetAgent: BudgetPlannerAgent,
    private readonly reportingAgent: FinancialReportingAgent,
    private readonly assistantAgent: FinanceAssistantAgent,
    private readonly sandbox: ExecutionSandbox,
    private readonly preHook: PreExecutionHook,
    private readonly postHook: PostExecutionHook,
    private readonly approvalService: ApprovalService,
  ) {
    this.registerAgent(this.analystAgent);
    this.registerAgent(this.expenseAgent);
    this.registerAgent(this.cashFlowAgent);
    this.registerAgent(this.budgetAgent);
    this.registerAgent(this.reportingAgent);
    this.registerAgent(this.assistantAgent);

    this.logger.log(`Orchestrator initialized with ${this.agentRegistry.size} specialized AI agents`);
  }

  private registerAgent(agent: BaseAgent): void {
    this.agentRegistry.set(agent.metadata.id, agent);
  }

  getAgents(): AgentMetadata[] {
    return Array.from(this.agentRegistry.values()).map((a) => a.metadata);
  }

  getAuditLogs(): AuditRecord[] {
    return [...this.auditHistory];
  }

  /**
   * Orchestrates execution of a specific agent with Pre-Hooks, Sandboxing, and Post-Hooks
   */
  async executeAgent(agentId: string, context: AgentContext = {}): Promise<AgentResult> {
    const agent = this.agentRegistry.get(agentId);
    if (!agent) {
      throw new NotFoundException(`Agent with ID '${agentId}' is not registered`);
    }

    const hooksTriggered: string[] = [];

    // 1. Pre-execution Hook
    const preResult = this.preHook.validate(agent, context);
    hooksTriggered.push(preResult.hookName);

    // 2. Sandboxed Execution
    const result = await this.sandbox.executeInSandbox(agent, preResult.sanitizedContext);

    // 3. Post-execution Verification Hook
    const postResult = this.postHook.verify(result);
    hooksTriggered.push(postResult.hookName);

    // 4. Audit Recording
    const auditRecord: AuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agentId: agent.metadata.id,
      agentName: agent.metadata.name,
      actionType: 'AUTONOMOUS_ANALYSIS',
      timestamp: new Date().toISOString(),
      executionDurationMs: result.executionDurationMs ?? 0,
      status: 'SUCCESS',
      hooksTriggered,
      isSandboxed: true,
      summary: result.summary,
    };
    this.auditHistory.unshift(auditRecord);

    return result;
  }

  /**
   * Conversational gateway routed through AI Finance Assistant
   */
  async handleChatQuery(query: string, userId = 'user-admin') {
    const context: AgentContext = { query, userId };
    const result = await this.executeAgent(this.assistantAgent.metadata.id, context);
    return {
      query,
      answer: result.summary,
      delegatedAgent: result.supportingData?.delegatedAgent,
      metrics: result.metrics,
      findings: result.findings,
      recommendations: result.recommendations,
      suggestedFollowUps: result.supportingData?.suggestedFollowUps,
      executionDurationMs: result.executionDurationMs,
    };
  }

  /**
   * Coordinated Multi-Agent Workflow: Full Financial Health Review
   */
  async runFullFinancialReview() {
    const start = performance.now();
    this.logger.log('Starting Coordinated Multi-Agent Comprehensive Financial Review Workflow');

    // Run agents in orchestrated order
    const analystResult = await this.executeAgent(this.analystAgent.metadata.id);
    const expenseResult = await this.executeAgent(this.expenseAgent.metadata.id);
    const cashFlowResult = await this.executeAgent(this.cashFlowAgent.metadata.id);
    const budgetResult = await this.executeAgent(this.budgetAgent.metadata.id);
    const reportingResult = await this.executeAgent(this.reportingAgent.metadata.id);

    const totalDuration = Math.round(performance.now() - start);

    return {
      workflowName: 'Coordinated Multi-Agent Financial Health Audit',
      executedAt: new Date().toISOString(),
      totalDurationMs: totalDuration,
      agentsParticipating: 5,
      results: {
        financialAnalyst: analystResult,
        expenseManager: expenseResult,
        cashFlowManager: cashFlowResult,
        budgetPlanner: budgetResult,
        financialReporting: reportingResult,
      },
      synthesis: {
        executiveVerdict: 'Financial health is fundamentally sound with viable margins and solid runway. Two action items require leadership attention: Sales budget variance and 2 expense anomalies.',
        consolidatedRecommendations: [
          ...analystResult.recommendations.slice(0, 2),
          ...expenseResult.recommendations.slice(0, 2),
          ...budgetResult.recommendations.slice(0, 2),
        ],
      },
    };
  }
}

