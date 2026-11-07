export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'Revenue - Client Retainer'
  | 'Revenue - SaaS Subscriptions'
  | 'Revenue - Enterprise Licensing'
  | 'Payroll & Benefits'
  | 'Cloud Infrastructure'
  | 'Software & SaaS Tools'
  | 'Sales & Marketing'
  | 'Office & Facilities'
  | 'Legal & Compliance'
  | 'Consulting & Professional Services'
  | 'Travel & Entertainment'
  | 'Miscellaneous Expense';

export type TransactionStatus = 'PENDING' | 'CLEARED' | 'RECONCILED';

export interface TransactionModel {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  vendor?: string;
  paymentMethod: string;
  status: TransactionStatus;
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

export interface BudgetModel {
  id: string;
  department: 'Engineering' | 'Marketing' | 'Operations' | 'Sales' | 'G&A';
  allocatedAmount: number;
  spentAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OVER_BUDGET';
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
