import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Splash, { APP_NAME } from './Splash';
import { AnimatedTabs, TabContent } from './AnimatedTabs';
import type { TabId } from './components/NavigationTabs';
import { WalletaLogo } from './components/WalletaLogo';
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

// Fail fast when the backend is unreachable instead of spinning for many seconds
const HEALTH_TIMEOUT_MS = 2500;

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Backend took too long to respond')), ms),
    ),
  ]);

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
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
      const data = await withTimeout(getBackendHealth(), HEALTH_TIMEOUT_MS);
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
        const data = await withTimeout(getBackendHealth(), HEALTH_TIMEOUT_MS);
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

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions', badge: anomaliesCount || undefined },
    { id: 'cash-flow', label: 'Cash Flow' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'agents', label: 'Agents' },
    { id: 'approvals', label: 'Approvals', badge: pendingApprovalsCount || undefined },
    { id: 'assistant', label: 'Assistant' },
    { id: 'system-health', label: 'System' },
  ];

  const renderTab = () => {
    // Backend unreachable: show a clear message instead of an endless spinner
    if (!isHealthLoading && !health && activeTab !== 'system-health') {
      return (
        <div className="card text-center" style={{ padding: '56px 24px' }}>
          <h2 className="text-lg font-bold text-white">Backend is offline</h2>
          <p className="text-sm text-white/50 mt-2 max-w-md mx-auto">
            The Walleta API is not reachable right now. Please try again in a moment.
          </p>
          <button
            onClick={checkHealth}
            className="btn mt-6"
            style={{ padding: '10px 22px', fontSize: 13 }}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewView
            metrics={metrics}
            transactions={transactions}
            budgets={budgets}
            onNavigate={setActiveTab}
            onRunAudit={handleRunFullReview}
            isAuditRunning={isWorkflowRunning}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            isAdding={isAddingTx}
          />
        );
      case 'cash-flow':
        return <CashFlowView forecast={forecast} />;
      case 'budgets':
        return <BudgetsView budgets={budgets} />;
      case 'invoices':
        return (
          <InvoicesView
            invoices={invoices}
            onPayInvoice={handlePayInvoice}
            onNavigateApprovals={() => setActiveTab('approvals')}
            isPaying={isPayingInvoice}
          />
        );
      case 'agents':
        return (
          <MultiAgentView
            agents={agents}
            auditLogs={auditLogs}
            onRunAgent={handleRunAgent}
            onRunFullReview={handleRunFullReview}
            isWorkflowRunning={isWorkflowRunning}
          />
        );
      case 'approvals':
        return (
          <ApprovalsView
            approvals={approvals}
            onReview={handleReviewApproval}
            isReviewing={isReviewingApproval}
          />
        );
      case 'assistant':
        return <AssistantChatView onSendMessage={handleSendMessage} isSending={isSendingChat} />;
      case 'system-health':
        return (
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
        );
      default:
        return null;
    }
  };

  const statusClass = isHealthLoading ? 'loading' : health ? 'online' : '';
  const statusText = isHealthLoading ? 'Connecting' : health ? 'Online' : 'Offline';

  return (
    <div className="finora min-h-screen flex flex-col">
      <AnimatePresence>
        {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <>
          <header className="topbar">
            <div className="brand">
              <WalletaLogo size={34} />
            </div>
            <div className={`status-pill ${statusClass}`}>
              <span className="status-dot" /> {statusText}
            </div>
          </header>

          <div className="tabs-wrap">
            <AnimatedTabs
              tabs={tabs}
              active={activeTab}
              onChange={(id) => setActiveTab(id as TabId)}
            />
          </div>

          <main className="page flex-1 w-full">
            <TabContent tabKey={activeTab}>{renderTab()}</TabContent>
          </main>

          <footer className="finora-footer">
            &copy; {CURRENT_YEAR} {APP_NAME} &bull; Autonomous AI Finance Department
          </footer>
        </>
      )}
    </div>
  );
};

export default App;