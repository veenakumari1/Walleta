import { describe, it, expect, beforeEach } from 'vitest';
import { AnomalyDetectorEngine } from './anomaly-detector.engine.js';
import { TransactionModel } from '../finance/finance.types.js';

describe('AnomalyDetectorEngine', () => {
  let engine: AnomalyDetectorEngine;

  beforeEach(() => {
    engine = new AnomalyDetectorEngine();
  });

  const sampleHistory: TransactionModel[] = [
    {
      id: 'tx-1',
      accountId: 'acc-1',
      date: '2026-10-01T10:00:00Z',
      description: 'Software License',
      amount: 100,
      type: 'EXPENSE',
      category: 'Software & SaaS Tools',
      vendor: 'VendorA',
      paymentMethod: 'CARD',
      status: 'CLEARED',
      isAnomalous: false,
      isSimulated: true,
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'tx-2',
      accountId: 'acc-1',
      date: '2026-10-05T10:00:00Z',
      description: 'Software License',
      amount: 120,
      type: 'EXPENSE',
      category: 'Software & SaaS Tools',
      vendor: 'VendorB',
      paymentMethod: 'CARD',
      status: 'CLEARED',
      isAnomalous: false,
      isSimulated: true,
      createdAt: '2026-10-05T10:00:00Z',
    },
    {
      id: 'tx-3',
      accountId: 'acc-1',
      date: '2026-10-10T10:00:00Z',
      description: 'Software License',
      amount: 110,
      type: 'EXPENSE',
      category: 'Software & SaaS Tools',
      vendor: 'VendorC',
      paymentMethod: 'CARD',
      status: 'CLEARED',
      isAnomalous: false,
      isSimulated: true,
      createdAt: '2026-10-10T10:00:00Z',
    },
  ];

  it('should detect statistical outlier amount', () => {
    const anomalousTx: Partial<TransactionModel> = {
      amount: 1200, // >10x baseline
      type: 'EXPENSE',
      category: 'Software & SaaS Tools',
      vendor: 'VendorZ',
      date: '2026-10-12T10:00:00Z',
    };

    const result = engine.analyze(anomalousTx, sampleHistory);
    expect(result.isAnomalous).toBe(true);
    expect(result.score).toBeGreaterThan(0.7);
    expect(result.reason).toContain('Outlier charge');
  });

  it('should pass normal expenditure without anomaly flag', () => {
    const normalTx: Partial<TransactionModel> = {
      amount: 115,
      type: 'EXPENSE',
      category: 'Software & SaaS Tools',
      vendor: 'VendorD',
      date: '2026-10-15T10:00:00Z',
    };

    const result = engine.analyze(normalTx, sampleHistory);
    expect(result.isAnomalous).toBe(false);
  });

  it('should detect duplicate transaction for same vendor within 48h', () => {
    const duplicateTx: Partial<TransactionModel> = {
      amount: 100,
      type: 'EXPENSE',
      category: 'Software & SaaS Tools',
      vendor: 'VendorA',
      date: '2026-10-02T10:00:00Z', // 24h after tx-1
    };

    const result = engine.analyze(duplicateTx, sampleHistory);
    expect(result.isAnomalous).toBe(true);
    expect(result.reason).toContain('Potential duplicate payment detected');
  });
});

