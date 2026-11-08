import type {
  AccountModel,
  AgentMetadata,
  AgentResult,
  ApprovalRequestItem,
  AssistantChatResponse,
  AuditRecord,
  BudgetAnalysis,
  BudgetSummary,
  CashFlowForecast,
  CashFlowPoint,
  FinancialOverviewMetrics,
  FinancialReportPayload,
  InvoiceModel,
  TransactionModel,
} from '../types/finance.types';

/* ---------- helpers ---------- */
const DAY = 86_400_000;
const isoAt = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();
const dateAt = (offsetDays: number) => isoAt(offsetDays).slice(0, 10);
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
let seq = 500;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

/* ---------- seed data ---------- */
type TxSeed = [
  string,
  number,
  string,
  number,
  'INCOME' | 'EXPENSE',
  string,
  string,
  string,
  TransactionModel['status'],
  string?,
];

const txSeeds: TxSeed[] = [
  ['tx-1', -1, 'Client payment: Apex Retail', 48_500, 'INCOME', 'Sales', 'Apex Retail', 'Bank Transfer', 'CLEARED'],
  ['tx-2', -1, 'AWS cloud infrastructure', 12_480, 'EXPENSE', 'Engineering', 'Amazon Web Services', 'Credit Card', 'CLEARED'],
  ['tx-3', -2, 'Meta Ads campaign spend', 18_900, 'EXPENSE', 'Marketing', 'Meta', 'Credit Card', 'CLEARED'],
  ['tx-4', -2, 'Subscription revenue: Pro plans', 36_200, 'INCOME', 'Subscriptions', 'Stripe', 'Stripe', 'RECONCILED'],
  ['tx-5', -3, 'Urgent wire to new vendor', 94_000, 'EXPENSE', 'Operations', 'Nova Logistics Ltd', 'Wire', 'PENDING', 'Amount is 6.2x the vendor average and the vendor was added 2 days ago'],
  ['tx-6', -4, 'Office rent: November', 14_500, 'EXPENSE', 'Operations', 'Prime Properties', 'Bank Transfer', 'RECONCILED'],
  ['tx-7', -5, 'Enterprise license: Orion Corp', 62_000, 'INCOME', 'Sales', 'Orion Corp', 'Bank Transfer', 'CLEARED'],
  ['tx-8', -6, 'Payroll: engineering team', 78_400, 'EXPENSE', 'Engineering', 'Payroll', 'Bank Transfer', 'RECONCILED'],
  ['tx-9', -7, 'Design tool subscription', 2_340, 'EXPENSE', 'Marketing', 'Figma', 'Credit Card', 'PENDING', 'Same amount charged twice within 24 hours'],
  ['tx-10', -8, 'Consulting services', 9_800, 'INCOME', 'Services', 'Bright Minds LLC', 'Bank Transfer', 'CLEARED'],
  ['tx-11', -9, 'Team offsite catering', 3_150, 'EXPENSE', 'HR', 'FreshBite', 'Credit Card', 'CLEARED'],
  ['tx-12', -11, 'Client payment: Zenith Foods', 41_700, 'INCOME', 'Sales', 'Zenith Foods', 'Bank Transfer', 'RECONCILED'],
  ['tx-13', -12, 'Legal retainer', 6_500, 'EXPENSE', 'Operations', 'Hale & Partners', 'Bank Transfer', 'RECONCILED'],
  ['tx-14', -14, 'Sales team commissions', 21_300, 'EXPENSE', 'Sales', 'Payroll', 'Bank Transfer', 'RECONCILED'],
];

const seedTransactions = (): TransactionModel[] =>
  txSeeds.map(([id, off, description, amount, type, category, vendor, paymentMethod, status, reason]) => ({
    id,
    accountId: 'acc-1',
    date: dateAt(off),
    description,
    amount,
    type,
    category,
    vendor,
    paymentMethod,
    status,
    isAnomalous: Boolean(reason),
    anomalyReason: reason,
    isSimulated: true,
    createdAt: isoAt(off),
  }));

const seedInvoices = (): InvoiceModel[] => [
  { id: 'inv-2041', invoiceNumber: 'INV-2041', type: 'PAYABLE', entityName: 'Amazon Web Services', amount: 12_480, issueDate: dateAt(-10), dueDate: dateAt(5), status: 'PENDING', requiresApproval: false, isSimulated: true },
  { id: 'inv-2042', invoiceNumber: 'INV-2042', type: 'PAYABLE', entityName: 'Nova Logistics Ltd', amount: 94_000, issueDate: dateAt(-3), dueDate: dateAt(10), status: 'AWAITING_APPROVAL', requiresApproval: true, isSimulated: true, notes: 'Exceeds the $50,000 approval threshold' },
  { id: 'inv-2043', invoiceNumber: 'INV-2043', type: 'PAYABLE', entityName: 'Prime Properties', amount: 14_500, issueDate: dateAt(-20), dueDate: dateAt(-3), status: 'OVERDUE', requiresApproval: false, isSimulated: true },
  { id: 'inv-2044', invoiceNumber: 'INV-2044', type: 'PAYABLE', entityName: 'Hale & Partners', amount: 6_500, issueDate: dateAt(-5), dueDate: dateAt(12), status: 'PENDING', requiresApproval: false, isSimulated: true },
  { id: 'inv-3011', invoiceNumber: 'INV-3011', type: 'RECEIVABLE', entityName: 'Orion Corp', amount: 62_000, issueDate: dateAt(-12), dueDate: dateAt(8), status: 'PENDING', requiresApproval: false, isSimulated: true },
  { id: 'inv-3012', invoiceNumber: 'INV-3012', type: 'RECEIVABLE', entityName: 'Apex Retail', amount: 48_500, issueDate: dateAt(-25), dueDate: dateAt(-6), status: 'OVERDUE', requiresApproval: false, isSimulated: true },
  { id: 'inv-3013', invoiceNumber: 'INV-3013', type: 'RECEIVABLE', entityName: 'Bright Minds LLC', amount: 9_800, issueDate: dateAt(-30), dueDate: dateAt(-15), status: 'PAID', requiresApproval: false, isSimulated: true },
];

const seedApprovals = (): ApprovalRequestItem[] => [
  {
    id: 'apr-1',
    title: 'Pay invoice INV-2042 to Nova Logistics Ltd',
    description: 'Invoice exceeds the $50,000 approval threshold and the vendor was onboarded 3 days ago.',
    actionType: 'INVOICE_PAYMENT',
    amount: 94_000,
    requestedByAgent: 'Invoice Processor',
    status: 'PENDING',
    metadata: { invoiceId: 'inv-2042' },
    createdAt: isoAt(-1),
  },
  {
    id: 'apr-2',
    title: 'Reallocate $15,000 from Marketing to Sales',
    description: 'Sales is at 105% of budget while Marketing has surplus capacity this quarter.',
    actionType: 'BUDGET_REALLOCATION',
    amount: 15_000,
    requestedByAgent: 'Budget Optimizer',
    status: 'PENDING',
    createdAt: isoAt(-1),
  },
  {
    id: 'apr-3',
    title: 'Monthly payroll run',
    description: 'Standard payroll disbursement for the engineering team.',
    actionType: 'LARGE_TRANSACTION',
    amount: 78_400,
    requestedByAgent: 'Cash Flow Analyst',
    status: 'APPROVED',
    reviewedBy: 'Finance Director',
    reviewedAt: isoAt(-6),
    createdAt: isoAt(-7),
  },
];

const seedAudit = (): AuditRecord[] => [
  { id: 'aud-1', agentId: 'anomaly-detector', agentName: 'Anomaly Detector', actionType: 'SCAN_TRANSACTIONS', timestamp: isoAt(-0.1), executionDurationMs: 842, status: 'SUCCESS', hooksTriggered: ['pre-scan', 'risk-score'], isSandboxed: true, summary: 'Flagged 2 suspicious transactions out of 14 scanned.' },
  { id: 'aud-2', agentId: 'invoice-processor', agentName: 'Invoice Processor', actionType: 'REQUEST_APPROVAL', timestamp: isoAt(-0.5), executionDurationMs: 513, status: 'AWAITING_APPROVAL', hooksTriggered: ['approval-threshold'], isSandboxed: true, summary: 'INV-2042 ($94,000) sent for human approval.' },
  { id: 'aud-3', agentId: 'budget-optimizer', agentName: 'Budget Optimizer', actionType: 'BUDGET_REVIEW', timestamp: isoAt(-1), executionDurationMs: 1_204, status: 'SUCCESS', hooksTriggered: ['variance-check'], isSandboxed: true, summary: 'Sales is 5% over budget. Reallocation proposed.' },
  { id: 'aud-4', agentId: 'cash-flow-analyst', agentName: 'Cash Flow Analyst', actionType: 'FORECAST_90_DAY', timestamp: isoAt(-2), executionDurationMs: 1_870, status: 'SUCCESS', hooksTriggered: ['model-refresh'], isSandboxed: true, summary: '90-day forecast refreshed with 88% confidence.' },
  { id: 'aud-5', agentId: 'reporting-agent', agentName: 'Reporting Agent', actionType: 'GENERATE_REPORT', timestamp: isoAt(-3), executionDurationMs: 2_310, status: 'SUCCESS', hooksTriggered: ['report-builder'], isSandboxed: true, summary: 'Monthly executive financial report generated.' },
];

const agents: AgentMetadata[] = [
  { id: 'cash-flow-analyst', name: 'Cash Flow Analyst', role: 'Liquidity & Forecasting', description: 'Projects 90-day cash position and flags liquidity risk.', capabilities: ['Cash forecasting', 'Runway analysis', 'Liquidity stress tests'], status: 'IDLE' },
  { id: 'budget-optimizer', name: 'Budget Optimizer', role: 'Budget Control', description: 'Tracks department spend and proposes reallocations.', capabilities: ['Variance analysis', 'Reallocation proposals', 'Spend alerts'], status: 'IDLE' },
  { id: 'invoice-processor', name: 'Invoice Processor', role: 'Accounts Payable & Receivable', description: 'Processes invoices and routes large payments for approval.', capabilities: ['Invoice matching', 'Approval routing', 'Overdue tracking'], status: 'IDLE' },
  { id: 'anomaly-detector', name: 'Anomaly Detector', role: 'Risk & Fraud', description: 'Scans transactions for duplicates and unusual patterns.', capabilities: ['Duplicate detection', 'Vendor risk scoring', 'Outlier detection'], status: 'IDLE' },
  { id: 'reporting-agent', name: 'Reporting Agent', role: 'Executive Reporting', description: 'Builds executive summaries and strategic recommendations.', capabilities: ['Executive summaries', 'KPI reporting', 'Strategy notes'], status: 'IDLE' },
];

const accounts: AccountModel[] = [
  { id: 'acc-1', name: 'Operating Account', type: 'CHECKING', accountNumber: '****4821', balance: 842_300, currency: 'USD', isSimulated: true },
  { id: 'acc-2', name: 'Reserve Savings', type: 'SAVINGS', accountNumber: '****7710', balance: 560_000, currency: 'USD', isSimulated: true },
  { id: 'acc-3', name: 'Treasury Fund', type: 'TREASURY', accountNumber: '****3095', balance: 296_000, currency: 'USD', isSimulated: true },
];

const deptSeeds: [string, number, number, string?][] = [
  ['Engineering', 120_000, 98_400],
  ['Marketing', 55_000, 39_500],
  ['Sales', 70_000, 73_200, 'Freeze non-essential discretionary spending immediately. Reallocate from surplus departments.'],
  ['Operations', 50_000, 34_500],
  ['HR', 30_000, 18_000],
];

/* ---------- in-memory state ---------- */
const BASE_CASH = 1_698_300;
const state = {
  cash: BASE_CASH,
  revenue: 412_800,
  expenses: 348_350,
  transactions: seedTransactions(),
  invoices: seedInvoices(),
  approvals: seedApprovals(),
  audit: seedAudit(),
};

const addAudit = (
  agentId: string,
  agentName: string,
  actionType: string,
  summary: string,
  status: AuditRecord['status'] = 'SUCCESS',
  durationMs = 900,
) => {
  state.audit.unshift({
    id: nextId('aud'),
    agentId,
    agentName,
    actionType,
    timestamp: new Date().toISOString(),
    executionDurationMs: durationMs,
    status,
    hooksTriggered: ['pre-run', 'post-run'],
    isSandboxed: true,
    summary,
  });
};

/* ---------- builders ---------- */
const buildMetrics = (): FinancialOverviewMetrics => {
  const open = (type: InvoiceModel['type']) =>
    sum(state.invoices.filter((i) => i.type === type && i.status !== 'PAID').map((i) => i.amount));
  return {
    totalRevenue: state.revenue,
    totalExpenses: state.expenses,
    netIncome: state.revenue - state.expenses,
    profitMarginPct: Number((((state.revenue - state.expenses) / state.revenue) * 100).toFixed(1)),
    totalCashBalance: state.cash,
    monthlyBurnRate: 514_600,
    runwayMonths: 3.3,
    accountsReceivableTotal: open('RECEIVABLE'),
    accountsPayableTotal: open('PAYABLE'),
    pendingApprovalsCount: state.approvals.filter((a) => a.status === 'PENDING').length,
    activeAnomaliesCount: state.transactions.filter((t) => t.isAnomalous).length,
    isSimulatedData: true,
  };
};

const buildBudgets = (): BudgetSummary => {
  const departments: BudgetAnalysis[] = deptSeeds.map(([department, allocated, spent, rec]) => {
    const ratio = spent / allocated;
    const status: BudgetAnalysis['status'] = ratio > 1 ? 'OVER_BUDGET' : ratio >= 0.9 ? 'AT_RISK' : 'ON_TRACK';
    return {
      department,
      allocated,
      spent,
      remaining: allocated - spent,
      utilizationPct: Math.round(ratio * 100),
      status,
      variance: spent - allocated,
      recommendation: rec ?? 'Department spending pacing is within planned operational parameters.',
    };
  });
  const totalAllocated = sum(deptSeeds.map((d) => d[1]));
  const totalSpent = sum(deptSeeds.map((d) => d[2]));
  return {
    totalAllocated,
    totalSpent,
    totalRemaining: totalAllocated - totalSpent,
    overallUtilizationPct: Math.round((totalSpent / totalAllocated) * 100),
    overBudgetCount: departments.filter((d) => d.status === 'OVER_BUDGET').length,
    atRiskCount: departments.filter((d) => d.status === 'AT_RISK').length,
    departments,
    optimizationSuggestions: [
      'Move $15,000 of unused Marketing budget to Sales to cover the current overrun.',
      'Renegotiate the cloud hosting contract; Engineering spend is trending toward 90%.',
      'Pause non-essential Sales discretionary spend until next quarter.',
    ],
  };
};

const ANCHORS: [number, number][] = [
  [0, BASE_CASH],
  [30, 1_934_500],
  [60, 1_956_100],
  [90, 2_085_000],
];

const balanceAt = (day: number, delta: number): number => {
  for (let i = 1; i < ANCHORS.length; i++) {
    const a = ANCHORS[i - 1];
    const b = ANCHORS[i];
    if (a && b && day <= b[0]) {
      const base = a[1] + (b[1] - a[1]) * ((day - a[0]) / (b[0] - a[0]));
      return Math.round(base + Math.sin((Math.PI * day) / 15) * 7_000 + delta);
    }
  }
  return 2_085_000 + delta;
};

const buildCashFlow = (): CashFlowForecast => {
  const delta = state.cash - BASE_CASH;

  const forecastPoints: CashFlowPoint[] = [];
  let prev = state.cash;
  for (let i = 1; i <= 18; i++) {
    const balance = balanceAt(i * 5, delta);
    const net = balance - prev;
    const inflow = Math.max(21_360, net + 14_000 + ((i * 7_919) % 5_000));
    forecastPoints.push({
      date: dateAt(i * 5),
      inflow,
      outflow: inflow - net,
      netCashFlow: net,
      projectedBalance: balance,
      isProjected: true,
    });
    prev = balance;
  }

  const historicalPoints: CashFlowPoint[] = [];
  for (let i = 6; i >= 1; i--) {
    const bal = state.cash - i * 9_500 + (i % 2) * 6_000;
    const next = state.cash - (i - 1) * 9_500 + ((i - 1) % 2) * 6_000;
    const net = next - bal;
    historicalPoints.push({
      date: dateAt(-i * 5),
      inflow: 38_000 + i * 900,
      outflow: 38_000 + i * 900 - net,
      netCashFlow: net,
      projectedBalance: bal,
      isProjected: false,
    });
  }

  return {
    currentCashBalance: state.cash,
    historicalPoints,
    forecastPoints,
    predicted30DayBalance: 1_934_500 + delta,
    predicted60DayBalance: 1_956_100 + delta,
    predicted90DayBalance: 2_085_000 + delta,
    estimatedMonthlyBurn: 514_600,
    runwayMonths: 3.3,
    confidenceScore: 0.88,
    liquidityRiskLevel: 'HIGH',
  };
};

const buildReport = (): FinancialReportPayload => ({
  title: 'Monthly Executive Financial Report',
  period: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
  generatedAt: new Date().toISOString(),
  metrics: buildMetrics(),
  revenueBreakdown: { Sales: 152_200, Subscriptions: 188_900, Services: 71_700 },
  expenseBreakdown: { Engineering: 98_400, Marketing: 39_500, Sales: 73_200, Operations: 34_500, HR: 18_000, Other: 84_750 },
  executiveSummary:
    'Revenue is healthy and net margin is positive, but liquidity risk is rated HIGH because of the current burn rate. Sales is over budget and one large vendor payment needs approval.',
  strategicRecommendations: [
    'Reduce burn rate or secure additional runway within the next quarter.',
    'Collect overdue receivables to improve short-term liquidity.',
    'Review the new vendor before releasing the $94,000 payment.',
  ],
});

const agentResult = (agentId: string): AgentResult => {
  const agent = agents.find((a) => a.id === agentId);
  const base = { agentId, agentName: agent?.name ?? 'Finance Agent', confidenceScore: 0.9 };
  switch (agentId) {
    case 'cash-flow-analyst':
      return {
        ...base,
        summary: 'Cash position is strong today but runway is short at the current burn rate.',
        findings: ['Current cash is $' + state.cash.toLocaleString(), 'Monthly burn is about $514,600', 'Runway is approximately 3.3 months'],
        recommendations: ['Collect overdue receivables ($48,500 from Apex Retail)', 'Delay non-critical vendor payments by 10 days'],
        metrics: [{ label: 'Runway', value: '3.3 mo', trend: 'down' }, { label: '90-day balance', value: '$2.09M', trend: 'up' }],
        confidenceScore: 0.88,
        executionDurationMs: 1_870,
      };
    case 'budget-optimizer':
      return {
        ...base,
        summary: 'Sales is 5% over budget; every other department is within plan.',
        findings: ['Sales: $73,200 of $70,000 (105%)', 'Marketing has $15,500 unused budget'],
        recommendations: ['Reallocate $15,000 from Marketing to Sales', 'Freeze discretionary Sales spend'],
        metrics: [{ label: 'Utilization', value: '81%', trend: 'neutral' }, { label: 'Over budget', value: 1, trend: 'up' }],
        requiresHumanApproval: true,
        executionDurationMs: 1_204,
      };
    case 'invoice-processor':
      return {
        ...base,
        summary: 'Two invoices are overdue and one large payable awaits approval.',
        findings: ['INV-2043 (Prime Properties) is overdue by 3 days', 'INV-3012 (Apex Retail, receivable) is overdue by 6 days', 'INV-2042 ($94,000) needs approval'],
        recommendations: ['Pay INV-2043 immediately to avoid late fees', 'Send a payment reminder to Apex Retail'],
        metrics: [{ label: 'Overdue', value: 2, trend: 'up' }, { label: 'Awaiting approval', value: 1, trend: 'neutral' }],
        requiresHumanApproval: true,
        executionDurationMs: 513,
      };
    case 'anomaly-detector':
      return {
        ...base,
        summary: 'Two transactions look suspicious and need review.',
        findings: ['$94,000 wire to Nova Logistics Ltd is 6.2x the vendor average', 'Duplicate $2,340 design tool charge within 24 hours'],
        recommendations: ['Verify the new vendor before payment', 'Request a refund for the duplicate charge'],
        metrics: [{ label: 'Flagged', value: state.transactions.filter((t) => t.isAnomalous).length, trend: 'up' }],
        confidenceScore: 0.93,
        executionDurationMs: 842,
      };
    default:
      return {
        ...base,
        summary: 'Executive report generated: positive margin, high liquidity risk, one budget overrun.',
        findings: ['Net income is $' + (state.revenue - state.expenses).toLocaleString(), 'Profit margin is about 15.6%'],
        recommendations: ['Extend runway', 'Resolve pending approvals', 'Correct the Sales budget overrun'],
        executionDurationMs: 2_310,
      };
  }
};

const chatReply = (query: string): AssistantChatResponse => {
  const q = query.toLowerCase();
  const reply = (answer: string, delegatedAgent: string, findings: string[], recommendations: string[]): AssistantChatResponse => ({
    query,
    answer,
    delegatedAgent,
    findings,
    recommendations,
    metrics: [{ label: 'Cash balance', value: '$' + state.cash.toLocaleString(), trend: 'up' }],
    suggestedFollowUps: ['Which invoices are overdue?', 'Are there any suspicious transactions?', 'How is our budget doing?'],
    executionDurationMs: 700,
  });

  if (/(cash|runway|forecast|liquidity|balance)/.test(q)) {
    return reply(
      `Your cash balance is $${state.cash.toLocaleString()} with about 3.3 months of runway. Liquidity risk is HIGH because of the monthly burn.`,
      'Cash Flow Analyst',
      ['Monthly burn is about $514,600', '90-day projected balance is $2,085,000'],
      ['Collect overdue receivables', 'Delay non-critical payments'],
    );
  }
  if (/(budget|department|spend)/.test(q)) {
    return reply(
      'Four departments are within budget. Sales is at 105% of its allocation.',
      'Budget Optimizer',
      ['Sales: $73,200 of $70,000', 'Marketing has about $15,500 unused'],
      ['Reallocate $15,000 from Marketing to Sales'],
    );
  }
  if (/(invoice|overdue|payable|receivable)/.test(q)) {
    return reply(
      'Two invoices are overdue and INV-2042 ($94,000) is waiting for approval.',
      'Invoice Processor',
      ['INV-2043 (Prime Properties) is overdue', 'INV-3012 (Apex Retail) is overdue'],
      ['Pay INV-2043 now', 'Remind Apex Retail about INV-3012'],
    );
  }
  if (/(anomal|fraud|suspicious|duplicate|risk)/.test(q)) {
    return reply(
      'I found 2 flagged transactions: a $94,000 wire to a new vendor and a duplicate $2,340 charge.',
      'Anomaly Detector',
      ['Wire is 6.2x the vendor average', 'Duplicate charge within 24 hours'],
      ['Verify the vendor', 'Request a refund for the duplicate'],
    );
  }
  return reply(
    `Here is a quick snapshot: net income is $${(state.revenue - state.expenses).toLocaleString()}, cash is $${state.cash.toLocaleString()}, and ${state.approvals.filter((a) => a.status === 'PENDING').length} approvals are pending.`,
    'Reporting Agent',
    ['Profit margin is about 15.6%', 'Liquidity risk is HIGH'],
    ['Review pending approvals', 'Address the Sales budget overrun'],
  );
};

/* ---------- router ---------- */
export async function mockFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await sleep(220);

  const url = new URL(endpoint, 'http://demo.local');
  const path = url.pathname.replace(/\/+$/, '');
  const method = (options.method ?? 'GET').toUpperCase();
  const body = (options.body ? JSON.parse(String(options.body)) : {}) as Record<string, unknown>;
  const out = (data: unknown) => clone(data) as T;

  if (method === 'GET' && path === '/health') {
    return out({
      status: 'ok',
      service: 'walleta-api (demo mode)',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 3_600 + Math.floor((Date.now() / 1000) % 3_000),
      environment: 'demo',
      database: { status: 'connected' },
    });
  }

  /* finance */
  if (method === 'GET' && path === '/finance/overview') return out(buildMetrics());
  if (method === 'GET' && path === '/finance/budgets') return out(buildBudgets());
  if (method === 'GET' && path === '/finance/cash-flow') return out(buildCashFlow());
  if (method === 'GET' && path === '/finance/reports') return out(buildReport());
  if (method === 'GET' && path === '/finance/accounts') return out(accounts);

  if (method === 'GET' && path === '/finance/transactions') {
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const anomalousOnly = url.searchParams.get('anomalousOnly') === 'true';
    return out(
      state.transactions.filter(
        (t) => (!type || t.type === type) && (!category || t.category === category) && (!anomalousOnly || t.isAnomalous),
      ),
    );
  }

  if (method === 'POST' && path === '/finance/transactions') {
    const amount = Number(body.amount) || 0;
    const type = body.type === 'INCOME' ? 'INCOME' : 'EXPENSE';
    const tx: TransactionModel = {
      id: nextId('tx'),
      accountId: String(body.accountId ?? 'acc-1'),
      date: dateAt(0),
      description: String(body.description ?? 'New transaction'),
      amount,
      type,
      category: String(body.category ?? 'General'),
      vendor: body.vendor ? String(body.vendor) : undefined,
      paymentMethod: String(body.paymentMethod ?? 'Bank Transfer'),
      status: 'CLEARED',
      isAnomalous: amount >= 50_000,
      anomalyReason: amount >= 50_000 ? 'Large transaction exceeds the $50,000 review threshold' : undefined,
      isSimulated: true,
      createdAt: new Date().toISOString(),
    };
    state.transactions.unshift(tx);
    if (type === 'INCOME') {
      state.cash += amount;
      state.revenue += amount;
    } else {
      state.cash -= amount;
      state.expenses += amount;
    }
    addAudit('anomaly-detector', 'Anomaly Detector', 'SCAN_TRANSACTIONS', `Scanned new transaction "${tx.description}".`);
    return out(tx);
  }

  if (method === 'GET' && path === '/finance/invoices') {
    const type = url.searchParams.get('type');
    return out(state.invoices.filter((i) => !type || i.type === type));
  }

  const payMatch = path.match(/^\/finance\/invoices\/([^/]+)\/pay$/);
  if (method === 'POST' && payMatch) {
    const invoice = state.invoices.find((i) => i.id === payMatch[1]);
    if (!invoice) throw new Error('Invoice not found');

    if (invoice.requiresApproval && invoice.status !== 'PAID') {
      invoice.status = 'AWAITING_APPROVAL';
      const exists = state.approvals.some(
        (a) => a.status === 'PENDING' && a.metadata && a.metadata.invoiceId === invoice.id,
      );
      if (!exists) {
        state.approvals.unshift({
          id: nextId('apr'),
          title: `Pay invoice ${invoice.invoiceNumber} to ${invoice.entityName}`,
          description: 'Payment exceeds the approval threshold and needs human review.',
          actionType: 'INVOICE_PAYMENT',
          amount: invoice.amount,
          requestedByAgent: 'Invoice Processor',
          status: 'PENDING',
          metadata: { invoiceId: invoice.id },
          createdAt: new Date().toISOString(),
        });
      }
      return out(invoice);
    }

    if (invoice.status !== 'PAID') {
      invoice.status = 'PAID';
      if (invoice.type === 'PAYABLE') state.cash -= invoice.amount;
      else state.cash += invoice.amount;
      addAudit('invoice-processor', 'Invoice Processor', 'PROCESS_PAYMENT', `Invoice ${invoice.invoiceNumber} marked as paid.`);
    }
    return out(invoice);
  }

  /* orchestration */
  if (method === 'GET' && path === '/orchestration/agents') return out(agents);
  if (method === 'GET' && path === '/orchestration/audit-logs') return out(state.audit);

  if (method === 'GET' && path === '/orchestration/approvals') {
    const status = url.searchParams.get('status');
    return out(state.approvals.filter((a) => !status || a.status === status));
  }

  if (method === 'POST' && path === '/orchestration/chat') {
    await sleep(500);
    const query = String(body.query ?? '');
    const response = chatReply(query);
    addAudit('reporting-agent', response.delegatedAgent ?? 'Assistant', 'ASSISTANT_QUERY', `Answered: "${query.slice(0, 60)}"`);
    return out(response);
  }

  if (method === 'POST' && path === '/orchestration/run-agent') {
    await sleep(600);
    const agentId = String(body.agentId ?? '');
    const result = agentResult(agentId);
    addAudit(agentId, result.agentName, 'RUN_AGENT', result.summary, 'SUCCESS', result.executionDurationMs ?? 900);
    return out(result);
  }

  if (method === 'POST' && path === '/orchestration/run-workflow') {
    await sleep(1_200);
    const results: Record<string, AgentResult> = {};
    agents.forEach((a) => {
      results[a.id] = agentResult(a.id);
    });
    addAudit('orchestrator', 'Orchestrator', 'FULL_FINANCIAL_REVIEW', 'Full multi-agent financial review completed.', 'SUCCESS', 3_400);
    return out({
      workflowName: 'Full Financial Review',
      executedAt: new Date().toISOString(),
      totalDurationMs: 3_400,
      agentsParticipating: agents.length,
      results,
      synthesis: {
        executiveVerdict:
          'Healthy revenue and margin, but liquidity risk is HIGH. Resolve the pending $94,000 approval and the Sales budget overrun.',
        consolidatedRecommendations: [
          'Collect overdue receivables to extend runway',
          'Verify Nova Logistics before releasing payment',
          'Reallocate $15,000 from Marketing to Sales',
        ],
      },
    });
  }

  const reviewMatch = path.match(/^\/orchestration\/approvals\/([^/]+)\/review$/);
  if (method === 'POST' && reviewMatch) {
    const approval = state.approvals.find((a) => a.id === reviewMatch[1]);
    if (!approval) throw new Error('Approval request not found');

    const decision = body.decision === 'REJECTED' ? 'REJECTED' : 'APPROVED';
    approval.status = decision;
    approval.reviewedBy = String(body.reviewer ?? 'Finance Director');
    approval.reviewedAt = new Date().toISOString();

    const invoiceId = approval.metadata ? String(approval.metadata.invoiceId ?? '') : '';
    const invoice = state.invoices.find((i) => i.id === invoiceId);
    if (invoice) {
      if (decision === 'APPROVED') {
        invoice.status = 'PAID';
        state.cash -= invoice.amount;
      } else {
        invoice.status = 'PENDING';
      }
    }
    addAudit('approval-workflow', 'Approval Workflow', 'REVIEW_APPROVAL', `"${approval.title}" was ${decision.toLowerCase()}.`);
    return out(approval);
  }

  throw new Error(`Demo API has no handler for ${method} ${path}`);
}