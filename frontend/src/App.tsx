import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, type TabId } from './components/NavigationTabs';
import { OverviewView } from './components/OverviewView';
import { TransactionsView } from './components/TransactionsView';
import { CashFlowView } from './components/CashFlowView';
import { BudgetsView } from './components/BudgetsView';
import { InvoicesView } from './components/InvoicesView';
import { MultiAgentView } from './components/MultiAgentView';
import { ApprovalsView } from './components/ApprovalsView';
import { AssistantChatView } from './components/AssistantChatView';
import { HealthCard } from './components/HealthCard';
import { ArchitectureOverview } from './components/ArchitectureOverview';

import { getBackendHealth } from './api/health.api';
import {
  getFinancialOverview,
  getTransactions,
  createTransaction,
  getBudgets,
  getInvoices,
  payInvoice,
  getCashFlowForecast,
} from './api/finance.api';
import {
  getAgents,
  sendChatMessage,
  runAgent,
  runFullFinancialReviewWorkflow,
  getAuditLogs,
  getApprovals,
  reviewApproval,
} from './api/orchestration.api';

import type { BackendHealthResponse } from './types/health.types';
import type {
  FinancialOverviewMetrics,
  TransactionModel,
  BudgetSummary,
  InvoiceModel,
  CashFlowForecast,
  AgentMetadata,
  AgentResult,
  AuditRecord,
  ApprovalRequestItem,
  AssistantChatResponse,
} from './types/finance.types';

const CURRENT_YEAR = new Date().getFullYear();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Backend Health Telemetry
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Financial Data State
  const [metrics, setMetrics] = useState<FinancialOverviewMetrics | null>(null);
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [budgets, setBudgets] = useState<BudgetSummary | null>(null);
  const [invoices, setInvoices] = useState<InvoiceModel[]>([]);
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null);

  // Multi-Agent & Orchestration State
  const [agents, setAgents] = useState<AgentMetadata[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);

  // Action Loading States
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [isPayingInvoice, setIsPayingInvoice] = useState(false);
  const [isReviewingApproval, setIsReviewingApproval] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Load all financial and agent telemetry
  const loadAllData = useCallback(async () => {
    try {
      const [
        metricsData,
        txData,
        budgetData,
        invData,
        forecastData,
        agentData,
        auditData,
        approvalData,
      ] = await Promise.all([
        getFinancialOverview(),
        getTransactions(),
        getBudgets(),
        getInvoices(),
        getCashFlowForecast(),
        getAgents(),
        getAuditLogs(),
        getApprovals(),
      ]);

      setMetrics(metricsData);
      setTransactions(txData);
      setBudgets(budgetData);
      setInvoices(invData);
      setForecast(forecastData);
      setAgents(agentData);
      setAuditLogs(auditData);
      setApprovals(approvalData);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  }, []);

  // Ping backend health
  const checkHealth = useCallback(async () => {
    setIsHealthLoading(true);
    setHealthError(null);
    const start = performance.now();

    try {
      const data = await getBackendHealth();
      setHealth(data);
      setLatencyMs(Math.round(performance.now() - start));
      await loadAllData();
    } catch (err) {
      setHealth(null);
      setLatencyMs(Math.round(performance.now() - start));
      setHealthError(err instanceof Error ? err.message : 'Failed to connect to backend service');
    } finally {
      setIsHealthLoading(false);
    }
  }, [loadAllData]);

  useEffect(() => {
    let isMounted = true;
    const initialLoad = async () => {
      const start = performance.now();
      try {
        const data = await getBackendHealth();
        if (isMounted) {
          setHealth(data);
          setLatencyMs(Math.round(performance.now() - start));
          setHealthError(null);
          setIsHealthLoading(false);
          await loadAllData();
        }
      } catch (err) {
        if (isMounted) {
          setHealth(null);
          setLatencyMs(Math.round(performance.now() - start));
          setHealthError(
            err instanceof Error ? err.message : 'Failed to connect to backend service',
          );
          setIsHealthLoading(false);
        }
      }
    };

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, [loadAllData]);

  // Action: Add Transaction
  const handleAddTransaction = async (dto: {
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category?: string;
    vendor?: string;
    paymentMethod?: string;
  }) => {
    setIsAddingTx(true);
    try {
      await createTransaction(dto);
      await loadAllData();
    } catch (err) {
      alert(`Failed to add transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAddingTx(false);
    }
  };

  // Action: Pay Invoice
  const handlePayInvoice = async (id: string) => {
    setIsPayingInvoice(true);
    try {
      await payInvoice(id);
      await loadAllData();
    } catch (err) {
      alert(`Failed to pay invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsPayingInvoice(false);
    }
  };

  // Action: Run Individual Agent
  const handleRunAgent = async (agentId: string): Promise<AgentResult> => {
    const result = await runAgent(agentId);
    const updatedLogs = await getAuditLogs();
    setAuditLogs(updatedLogs);
    return result;
  };

  // Action: Run Coordinated Full Financial Review
  const handleRunFullReview = async () => {
    setIsWorkflowRunning(true);
    try {
      await runFullFinancialReviewWorkflow();
      await loadAllData();
      setActiveTab('agents');
    } catch (err) {
      alert(
        `Failed to run multi-agent review: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    } finally {
      setIsWorkflowRunning(false);
    }
  };

  // Action: Review Approval
  const handleReviewApproval = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setIsReviewingApproval(true);
    try {
      await reviewApproval(id, decision);
      await loadAllData();
    } catch (err) {
      alert(`Failed to review approval: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsReviewingApproval(false);
    }
  };

  // Action: Assistant Chat Query
  const handleSendMessage = async (query: string): Promise<AssistantChatResponse> => {
    setIsSendingChat(true);
    try {
      const response = await sendChatMessage(query);
      const updatedLogs = await getAuditLogs();
      setAuditLogs(updatedLogs);
      return response;
    } finally {
      setIsSendingChat(false);
    }
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const anomaliesCount = transactions.filter((t) => t.isAnomalous).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        isBackendConnected={Boolean(health)}
        isLoading={isHealthLoading}
        liquidCash={metrics?.totalCashBalance}
        activeAgentsCount={agents.length || 6}
      />

      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        anomaliesCount={anomaliesCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewView
            metrics={metrics}
            transactions={transactions}
            budgets={budgets}
            onNavigate={setActiveTab}
            onRunAudit={handleRunFullReview}
            isAuditRunning={isWorkflowRunning}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            isAdding={isAddingTx}
          />
        )}

        {activeTab === 'cash-flow' && <CashFlowView forecast={forecast} />}

        {activeTab === 'budgets' && <BudgetsView budgets={budgets} />}

        {activeTab === 'invoices' && (
          <InvoicesView
            invoices={invoices}
            onPayInvoice={handlePayInvoice}
            onNavigateApprovals={() => setActiveTab('approvals')}
            isPaying={isPayingInvoice}
          />
        )}

        {activeTab === 'agents' && (
          <MultiAgentView
            agents={agents}
            auditLogs={auditLogs}
            onRunAgent={handleRunAgent}
            onRunFullReview={handleRunFullReview}
            isWorkflowRunning={isWorkflowRunning}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsView
            approvals={approvals}
            onReview={handleReviewApproval}
            isReviewing={isReviewingApproval}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantChatView onSendMessage={handleSendMessage} isSending={isSendingChat} />
        )}

        {activeTab === 'system-health' && (
          <div className="space-y-8">
            <HealthCard
              health={health}
              error={healthError}
              isLoading={isHealthLoading}
              latencyMs={latencyMs}
              onRefresh={checkHealth}
            />
            <ArchitectureOverview />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {CURRENT_YEAR} Autonomous Business Finance Platform &bull; Capstone Autonomous AI
            Finance Department
          </p>
          <p className="font-mono text-slate-600">
            6 AI Agents &bull; Sandboxed Execution &bull; Verification Hooks &bull; NestJS &bull;
            React &bull; Prisma
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
