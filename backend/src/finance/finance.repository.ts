import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AccountModel,
  BudgetModel,
  InvoiceModel,
  TransactionModel,
} from './finance.types.js';

@Injectable()
export class FinanceRepository {
  private readonly logger = new Logger(FinanceRepository.name);

  // In-memory persistent data store for robust offline / local testing
  private accounts: AccountModel[] = [];
  private transactions: TransactionModel[] = [];
  private budgets: BudgetModel[] = [];
  private invoices: InvoiceModel[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    this.accounts = [
      {
        id: 'acc-1',
        name: 'Operating Checking Account',
        type: 'CHECKING',
        accountNumber: '****-9481',
        balance: 482500,
        currency: 'USD',
        isSimulated: true,
      },
      {
        id: 'acc-2',
        name: 'High-Yield Treasury Reserve',
        type: 'TREASURY',
        accountNumber: '****-3120',
        balance: 1250000,
        currency: 'USD',
        isSimulated: true,
      },
      {
        id: 'acc-3',
        name: 'Corporate Card Facility',
        type: 'CREDIT',
        accountNumber: '****-5529',
        balance: -34200,
        currency: 'USD',
        isSimulated: true,
      },
    ];

    this.budgets = [
      {
        id: 'bgt-1',
        department: 'Engineering',
        allocatedAmount: 120000,
        spentAmount: 98400,
        period: 'Q4-2026',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        alertThreshold: 0.85,
        status: 'AT_RISK',
      },
      {
        id: 'bgt-2',
        department: 'Marketing',
        allocatedAmount: 55000,
        spentAmount: 39500,
        period: 'Q4-2026',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        alertThreshold: 0.85,
        status: 'ON_TRACK',
      },
      {
        id: 'bgt-3',
        department: 'Sales',
        allocatedAmount: 70000,
        spentAmount: 73200,
        period: 'Q4-2026',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        alertThreshold: 0.85,
        status: 'OVER_BUDGET',
      },
      {
        id: 'bgt-4',
        department: 'Operations',
        allocatedAmount: 45000,
        spentAmount: 28400,
        period: 'Q4-2026',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        alertThreshold: 0.85,
        status: 'ON_TRACK',
      },
      {
        id: 'bgt-5',
        department: 'G&A',
        allocatedAmount: 35000,
        spentAmount: 24100,
        period: 'Q4-2026',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        alertThreshold: 0.85,
        status: 'ON_TRACK',
      },
    ];

    this.invoices = [
      {
        id: 'inv-001',
        invoiceNumber: 'INV-2026-881',
        type: 'RECEIVABLE',
        entityName: 'Acme Enterprise Corp',
        amount: 85000,
        issueDate: '2026-10-15',
        dueDate: '2026-11-15',
        status: 'PENDING',
        requiresApproval: false,
        isSimulated: true,
        notes: 'Annual enterprise SaaS licensing installment',
      },
      {
        id: 'inv-002',
        invoiceNumber: 'INV-2026-882',
        type: 'RECEIVABLE',
        entityName: 'Vertex Capital Partners',
        amount: 45000,
        issueDate: '2026-10-20',
        dueDate: '2026-11-20',
        status: 'PENDING',
        requiresApproval: false,
        isSimulated: true,
        notes: 'Autonomous finance implementation retainer',
      },
      {
        id: 'inv-003',
        invoiceNumber: 'BILL-2026-104',
        type: 'PAYABLE',
        entityName: 'CloudScale Infrastructure',
        amount: 14200,
        issueDate: '2026-10-28',
        dueDate: '2026-11-12',
        status: 'PENDING',
        requiresApproval: true,
        isSimulated: true,
        notes: 'GPU cluster compute & cluster hosting fee',
      },
      {
        id: 'inv-004',
        invoiceNumber: 'BILL-2026-105',
        type: 'PAYABLE',
        entityName: 'DevSecOps Global Auditing',
        amount: 8500,
        issueDate: '2026-11-01',
        dueDate: '2026-11-25',
        status: 'AWAITING_APPROVAL',
        requiresApproval: true,
        isSimulated: true,
        notes: 'Mandatory SOC2 Type II compliance audit',
      },
      {
        id: 'inv-005',
        invoiceNumber: 'BILL-2026-106',
        type: 'PAYABLE',
        entityName: 'Modern Office Real Estate',
        amount: 12000,
        issueDate: '2026-11-01',
        dueDate: '2026-11-05',
        status: 'PAID',
        requiresApproval: false,
        isSimulated: true,
        notes: 'Headquarters lease payment November 2026',
      },
    ];

    // Seed realistic 30-day transaction history
    this.transactions = [
      {
        id: 'tx-101',
        accountId: 'acc-1',
        date: '2026-10-05T10:00:00.000Z',
        description: 'Client Wire: Horizon Media Q4 Retainer',
        amount: 65000,
        type: 'INCOME',
        category: 'Revenue - Client Retainer',
        vendor: 'Horizon Media Group',
        paymentMethod: 'WIRE',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-10-05T10:00:00.000Z',
      },
      {
        id: 'tx-102',
        accountId: 'acc-1',
        date: '2026-10-08T14:30:00.000Z',
        description: 'Stripe SaaS Subscription Billing Payout',
        amount: 118400,
        type: 'INCOME',
        category: 'Revenue - SaaS Subscriptions',
        vendor: 'Stripe Payments',
        paymentMethod: 'ACH',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-10-08T14:30:00.000Z',
      },
      {
        id: 'tx-103',
        accountId: 'acc-1',
        date: '2026-10-15T09:00:00.000Z',
        description: 'Semi-Monthly Payroll Batch - Oct 15',
        amount: 88500,
        type: 'EXPENSE',
        category: 'Payroll & Benefits',
        vendor: 'Gusto Payroll Processing',
        paymentMethod: 'ACH',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-10-15T09:00:00.000Z',
      },
      {
        id: 'tx-104',
        accountId: 'acc-1',
        date: '2026-10-18T16:45:00.000Z',
        description: 'Amazon Web Services Production Compute',
        amount: 18450,
        type: 'EXPENSE',
        category: 'Cloud Infrastructure',
        vendor: 'Amazon Web Services',
        paymentMethod: 'ACH',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-10-18T16:45:00.000Z',
      },
      {
        id: 'tx-105',
        accountId: 'acc-3',
        date: '2026-10-21T11:20:00.000Z',
        description: 'Executive Offsite Hotel & Flight Expenses',
        amount: 14800,
        type: 'EXPENSE',
        category: 'Travel & Entertainment',
        vendor: 'Delta Air Lines & Marriott',
        paymentMethod: 'CARD',
        status: 'CLEARED',
        isAnomalous: true,
        anomalyReason: 'Travel expense is 320% above historical monthly average for this category',
        isSimulated: true,
        createdAt: '2026-10-21T11:20:00.000Z',
      },
      {
        id: 'tx-106',
        accountId: 'acc-1',
        date: '2026-10-25T13:10:00.000Z',
        description: 'Google Cloud Platform AI Model Training',
        amount: 12900,
        type: 'EXPENSE',
        category: 'Cloud Infrastructure',
        vendor: 'Google Cloud Platform',
        paymentMethod: 'ACH',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-10-25T13:10:00.000Z',
      },
      {
        id: 'tx-107',
        accountId: 'acc-1',
        date: '2026-10-29T17:00:00.000Z',
        description: 'Enterprise Client License - Nova Dynamics',
        amount: 95000,
        type: 'INCOME',
        category: 'Revenue - Enterprise Licensing',
        vendor: 'Nova Dynamics Inc',
        paymentMethod: 'WIRE',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-10-29T17:00:00.000Z',
      },
      {
        id: 'tx-108',
        accountId: 'acc-1',
        date: '2026-10-31T09:00:00.000Z',
        description: 'Semi-Monthly Payroll Batch - Oct 31',
        amount: 89200,
        type: 'EXPENSE',
        category: 'Payroll & Benefits',
        vendor: 'Gusto Payroll Processing',
        paymentMethod: 'ACH',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-10-31T09:00:00.000Z',
      },
      {
        id: 'tx-109',
        accountId: 'acc-3',
        date: '2026-11-02T15:15:00.000Z',
        description: 'HubSpot Marketing Automation Renewal',
        amount: 8400,
        type: 'EXPENSE',
        category: 'Sales & Marketing',
        vendor: 'HubSpot Inc',
        paymentMethod: 'CARD',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-11-02T15:15:00.000Z',
      },
      {
        id: 'tx-110',
        accountId: 'acc-3',
        date: '2026-11-03T08:40:00.000Z',
        description: 'Datadog APM & Log Management Monthly',
        amount: 4200,
        type: 'EXPENSE',
        category: 'Software & SaaS Tools',
        vendor: 'Datadog Inc',
        paymentMethod: 'CARD',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-11-03T08:40:00.000Z',
      },
      {
        id: 'tx-111',
        accountId: 'acc-1',
        date: '2026-11-04T12:00:00.000Z',
        description: 'Consulting Retainer: Titan Global',
        amount: 42000,
        type: 'INCOME',
        category: 'Revenue - Client Retainer',
        vendor: 'Titan Global Industries',
        paymentMethod: 'WIRE',
        status: 'CLEARED',
        isAnomalous: false,
        isSimulated: true,
        createdAt: '2026-11-04T12:00:00.000Z',
      },
      {
        id: 'tx-112',
        accountId: 'acc-3',
        date: '2026-11-06T18:22:00.000Z',
        description: 'Expedited Server Hardware Procurement',
        amount: 19500,
        type: 'EXPENSE',
        category: 'Miscellaneous Expense',
        vendor: 'FastServer Supply Ltd',
        paymentMethod: 'CARD',
        status: 'CLEARED',
        isAnomalous: true,
        anomalyReason: 'Unregistered vendor with high single-transaction charge ($19,500) exceeding standard discretionary limits',
        isSimulated: true,
        createdAt: '2026-11-06T18:22:00.000Z',
      },
    ];

    this.logger.log('FinanceRepository initialized with 12 realistic business transactions & accounts');
  }

  getAccounts(): AccountModel[] {
    return [...this.accounts];
  }

  getTransactions(): TransactionModel[] {
    return [...this.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  addTransaction(tx: Omit<TransactionModel, 'id' | 'createdAt'>): TransactionModel {
    const newTx: TransactionModel = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.transactions.unshift(newTx);

    // Update account balance
    const account = this.accounts.find((a) => a.id === tx.accountId) ?? this.accounts[0];
    if (account) {
      if (tx.type === 'INCOME') {
        account.balance += tx.amount;
      } else {
        account.balance -= tx.amount;
      }
    }

    // Update department budget if matching category
    this.updateBudgetOnExpense(newTx);

    return newTx;
  }

  getBudgets(): BudgetModel[] {
    return [...this.budgets];
  }

  updateBudget(id: string, updates: Partial<BudgetModel>): BudgetModel | null {
    const bgt = this.budgets.find((b) => b.id === id);
    if (!bgt) return null;
    Object.assign(bgt, updates);
    const ratio = bgt.spentAmount / bgt.allocatedAmount;
    if (ratio >= 1.0) {
      bgt.status = 'OVER_BUDGET';
    } else if (ratio >= bgt.alertThreshold) {
      bgt.status = 'AT_RISK';
    } else {
      bgt.status = 'ON_TRACK';
    }
    return bgt;
  }

  getInvoices(): InvoiceModel[] {
    return [...this.invoices];
  }

  getInvoiceById(id: string): InvoiceModel | null {
    return this.invoices.find((i) => i.id === id) ?? null;
  }

  markInvoicePaid(id: string): InvoiceModel | null {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) return null;
    inv.status = 'PAID';

    // Record corresponding transaction
    this.addTransaction({
      accountId: this.accounts[0].id,
      date: new Date().toISOString(),
      description: `Invoice Payment: ${inv.invoiceNumber} - ${inv.entityName}`,
      amount: inv.amount,
      type: inv.type === 'PAYABLE' ? 'EXPENSE' : 'INCOME',
      category: inv.type === 'PAYABLE' ? 'Software & SaaS Tools' : 'Revenue - Enterprise Licensing',
      vendor: inv.entityName,
      paymentMethod: 'ACH',
      status: 'CLEARED',
      isAnomalous: false,
      isSimulated: true,
    });

    return inv;
  }

  private updateBudgetOnExpense(tx: TransactionModel): void {
    if (tx.type !== 'EXPENSE') return;
    let targetDept: BudgetModel['department'] = 'Operations';
    if (tx.category.includes('Cloud') || tx.category.includes('Software')) {
      targetDept = 'Engineering';
    } else if (tx.category.includes('Marketing') || tx.category.includes('Sales')) {
      targetDept = 'Marketing';
    } else if (tx.category.includes('Legal') || tx.category.includes('G&A')) {
      targetDept = 'G&A';
    }
    const bgt = this.budgets.find((b) => b.department === targetDept);
    if (bgt) {
      bgt.spentAmount += tx.amount;
      const ratio = bgt.spentAmount / bgt.allocatedAmount;
      if (ratio >= 1.0) bgt.status = 'OVER_BUDGET';
      else if (ratio >= bgt.alertThreshold) bgt.status = 'AT_RISK';
    }
  }
}

