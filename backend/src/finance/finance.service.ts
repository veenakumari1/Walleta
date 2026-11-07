import { Injectable, NotFoundException } from '@nestjs/common';
import { AnomalyDetectorEngine } from '../engine/anomaly-detector.engine.js';
import { BudgetMonitorEngine } from '../engine/budget-monitor.engine.js';
import { CategorizationEngine } from '../engine/categorization.engine.js';
import { ForecastingEngine } from '../engine/forecasting.engine.js';
import { ReportGeneratorEngine } from '../engine/report-generator.engine.js';
import { FinanceRepository } from './finance.repository.js';
import {
  CashFlowForecast,
  FinancialOverviewMetrics,
  InvoiceModel,
  TransactionModel,
} from './finance.types.js';

@Injectable()
export class FinanceService {
  constructor(
    private readonly repo: FinanceRepository,
    private readonly categorizationEngine: CategorizationEngine,
    private readonly anomalyEngine: AnomalyDetectorEngine,
    private readonly forecastingEngine: ForecastingEngine,
    private readonly budgetEngine: BudgetMonitorEngine,
    private readonly reportEngine: ReportGeneratorEngine,
  ) {}

  getOverview(): FinancialOverviewMetrics {
    const transactions = this.repo.getTransactions();
    const invoices = this.repo.getInvoices();
    const accounts = this.repo.getAccounts();
    const totalCashBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const report = this.reportEngine.generate(transactions, invoices, totalCashBalance);
    return report.metrics;
  }

  getTransactions(filter?: { type?: string; category?: string; anomalousOnly?: boolean }): TransactionModel[] {
    let list = this.repo.getTransactions();
    if (filter?.type) {
      list = list.filter((t) => t.type.toLowerCase() === filter.type!.toLowerCase());
    }
    if (filter?.category) {
      list = list.filter((t) => t.category.toLowerCase().includes(filter.category!.toLowerCase()));
    }
    if (filter?.anomalousOnly) {
      list = list.filter((t) => t.isAnomalous);
    }
    return list;
  }

  createTransaction(dto: {
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category?: string;
    vendor?: string;
    paymentMethod?: string;
    accountId?: string;
  }): TransactionModel {
    const accounts = this.repo.getAccounts();
    const accountId = dto.accountId ?? accounts[0]?.id ?? 'acc-1';

    // 1. Autonomous Categorization Engine
    let finalCategory = dto.category;
    let finalVendor = dto.vendor;

    if (!finalCategory || finalCategory.trim() === '') {
      const catResult = this.categorizationEngine.categorize(dto.description, dto.vendor);
      finalCategory = catResult.category;
      if (!finalVendor && catResult.detectedVendor) {
        finalVendor = catResult.detectedVendor;
      }
    }

    // 2. Autonomous Anomaly Detection Engine
    const history = this.repo.getTransactions();
    const anomalyResult = this.anomalyEngine.analyze(
      {
        amount: dto.amount,
        type: dto.type,
        category: finalCategory,
        vendor: finalVendor,
        description: dto.description,
        date: new Date().toISOString(),
      },
      history,
    );

    // 3. Persist to Central Repository
    return this.repo.addTransaction({
      accountId,
      date: new Date().toISOString(),
      description: dto.description,
      amount: dto.amount,
      type: dto.type,
      category: finalCategory,
      vendor: finalVendor,
      paymentMethod: dto.paymentMethod ?? 'ACH',
      status: 'CLEARED',
      isAnomalous: anomalyResult.isAnomalous,
      anomalyReason: anomalyResult.reason,
      isSimulated: true,
    });
  }

  getBudgets() {
    const rawBudgets = this.repo.getBudgets();
    return this.budgetEngine.evaluate(rawBudgets);
  }

  getInvoices(type?: 'PAYABLE' | 'RECEIVABLE'): InvoiceModel[] {
    const invoices = this.repo.getInvoices();
    if (type) {
      return invoices.filter((i) => i.type === type);
    }
    return invoices;
  }

  payInvoice(id: string): InvoiceModel {
    const invoice = this.repo.getInvoiceById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID '${id}' not found`);
    }
    const updated = this.repo.markInvoicePaid(id);
    return updated!;
  }

  getCashFlowForecast(): CashFlowForecast {
    const accounts = this.repo.getAccounts();
    const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0);
    const history = this.repo.getTransactions();
    const invoices = this.repo.getInvoices();
    return this.forecastingEngine.generateForecast(totalCash, history, invoices);
  }

  getComprehensiveReport() {
    const transactions = this.repo.getTransactions();
    const invoices = this.repo.getInvoices();
    const accounts = this.repo.getAccounts();
    const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0);
    return this.reportEngine.generate(transactions, invoices, totalCash);
  }

  getAccounts() {
    return this.repo.getAccounts();
  }
}

