import { describe, it, expect, beforeEach } from 'vitest';
import { ForecastingEngine } from './forecasting.engine.js';
import { InvoiceModel, TransactionModel } from '../finance/finance.types.js';

describe('ForecastingEngine', () => {
  let engine: ForecastingEngine;

  beforeEach(() => {
    engine = new ForecastingEngine();
  });

  const sampleTransactions: TransactionModel[] = [
    {
      id: 'tx-1',
      accountId: 'acc-1',
      date: '2026-10-01T00:00:00Z',
      description: 'Client Retainer',
      amount: 50000,
      type: 'INCOME',
      category: 'Revenue - Client Retainer',
      paymentMethod: 'WIRE',
      status: 'CLEARED',
      isAnomalous: false,
      isSimulated: true,
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'tx-2',
      accountId: 'acc-1',
      date: '2026-10-05T00:00:00Z',
      description: 'Payroll',
      amount: 30000,
      type: 'EXPENSE',
      category: 'Payroll & Benefits',
      paymentMethod: 'ACH',
      status: 'CLEARED',
      isAnomalous: false,
      isSimulated: true,
      createdAt: '2026-10-05T00:00:00Z',
    },
  ];

  const sampleInvoices: InvoiceModel[] = [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-101',
      type: 'RECEIVABLE',
      entityName: 'Client X',
      amount: 25000,
      issueDate: '2026-10-01',
      dueDate: '2026-11-20',
      status: 'PENDING',
      requiresApproval: false,
      isSimulated: true,
    },
  ];

  it('should compute cash balance, runway, and projections correctly', () => {
    const currentCash = 500000;
    const result = engine.generateForecast(currentCash, sampleTransactions, sampleInvoices);

    expect(result.currentCashBalance).toBe(500000);
    expect(result.runwayMonths).toBeGreaterThan(0);
    expect(result.predicted30DayBalance).toBeDefined();
    expect(result.predicted60DayBalance).toBeDefined();
    expect(result.predicted90DayBalance).toBeDefined();
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.liquidityRiskLevel);
    expect(result.forecastPoints.length).toBeGreaterThan(0);
  });
});

