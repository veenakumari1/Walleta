export interface FinancialOverviewMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMarginPct: number;
  totalCashBalance: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  accountsReceivableTotal: number;
  accountsPayableTotal: number;
  pendingApprovalsCount: number;
  activeAnomaliesCount: number;
  isSimulatedData: boolean;
}

export interface TransactionModel {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  vendor?: string;
  paymentMethod: string;
  status: 'PENDING' | 'CLEARED' | 'RECONCILED';
  isAnomalous: boolean;
  anomalyReason?: string;
  isSimulated: boolean;
  createdAt: string;
}

export interface AccountModel {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'TREASURY';
  accountNumber: string;
  balance: number;
  currency: string;
  isSimulated: boolean;
}

export interface BudgetAnalysis {
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationPct: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OVER_BUDGET';
  variance: number;
  recommendation?: string;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overallUtilizationPct: number;
  overBudgetCount: number;
  atRiskCount: number;
  departments: BudgetAnalysis[];
  optimizationSuggestions: string[];
}

export interface InvoiceModel {
  id: string;
  invoiceNumber: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  entityName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'AWAITING_APPROVAL';
  requiresApproval: boolean;
  isSimulated: boolean;
  notes?: string;
}

export interface CashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
  netCashFlow: number;
  projectedBalance: number;
  isProjected: boolean;
}

export interface CashFlowForecast {
  currentCashBalance: number;
  historicalPoints: CashFlowPoint[];
  forecastPoints: CashFlowPoint[];
  predicted30DayBalance: number;
  predicted60DayBalance: number;
  predicted90DayBalance: number;
  estimatedMonthlyBurn: number;
  runwayMonths: number;
  confidenceScore: number;
  liquidityRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

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

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: 'IDLE' | 'ACTIVE' | 'EXECUTING' | 'ERROR';
}

export interface AgentMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  summary: string;
  findings: string[];
  recommendations: string[];
  metrics?: AgentMetric[];
  supportingData?: Record<string, unknown>;
  confidenceScore: number;
  requiresHumanApproval?: boolean;
  executionDurationMs?: number;
}

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

export interface ApprovalRequestItem {
  id: string;
  title: string;
  description: string;
  actionType: 'INVOICE_PAYMENT' | 'LARGE_TRANSACTION' | 'BUDGET_REALLOCATION' | 'POLICY_OVERRIDE';
  amount?: number;
  requestedByAgent: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AssistantChatResponse {
  query: string;
  answer: string;
  delegatedAgent?: string;
  metrics?: AgentMetric[];
  findings?: string[];
  recommendations?: string[];
  suggestedFollowUps?: string[];
  executionDurationMs?: number;
}
