import { fetchApi } from './client';
import type {
  AccountModel,
  BudgetSummary,
  CashFlowForecast,
  FinancialOverviewMetrics,
  FinancialReportPayload,
  InvoiceModel,
  TransactionModel,
} from '../types/finance.types';

export async function getFinancialOverview(): Promise<FinancialOverviewMetrics> {
  return fetchApi<FinancialOverviewMetrics>('/finance/overview');
}

export async function getTransactions(params?: {
  type?: string;
  category?: string;
  anomalousOnly?: boolean;
}): Promise<TransactionModel[]> {
  const query = new URLSearchParams();
  if (params?.type) query.append('type', params.type);
  if (params?.category) query.append('category', params.category);
  if (params?.anomalousOnly) query.append('anomalousOnly', 'true');

  const endpoint = `/finance/transactions${query.toString() ? `?${query.toString()}` : ''}`;
  return fetchApi<TransactionModel[]>(endpoint);
}

export async function createTransaction(dto: {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  vendor?: string;
  paymentMethod?: string;
  accountId?: string;
}): Promise<TransactionModel> {
  return fetchApi<TransactionModel>('/finance/transactions', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getBudgets(): Promise<BudgetSummary> {
  return fetchApi<BudgetSummary>('/finance/budgets');
}

export async function getInvoices(type?: 'PAYABLE' | 'RECEIVABLE'): Promise<InvoiceModel[]> {
  const query = type ? `?type=${type}` : '';
  return fetchApi<InvoiceModel[]>(`/finance/invoices${query}`);
}

export async function payInvoice(id: string): Promise<InvoiceModel> {
  return fetchApi<InvoiceModel>(`/finance/invoices/${id}/pay`, {
    method: 'POST',
  });
}

export async function getCashFlowForecast(): Promise<CashFlowForecast> {
  return fetchApi<CashFlowForecast>('/finance/cash-flow');
}

export async function getFinancialReports(): Promise<FinancialReportPayload> {
  return fetchApi<FinancialReportPayload>('/finance/reports');
}

export async function getAccounts(): Promise<AccountModel[]> {
  return fetchApi<AccountModel[]>('/finance/accounts');
}
