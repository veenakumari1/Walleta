import { Injectable } from '@nestjs/common';
import { TransactionModel } from '../finance/finance.types.js';

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  score: number; // 0 to 1
  reason?: string;
  categoryMean?: number;
  zScore?: number;
}

@Injectable()
export class AnomalyDetectorEngine {
  analyze(tx: Partial<TransactionModel>, history: TransactionModel[]): AnomalyDetectionResult {
    if (!tx.amount || tx.type !== 'EXPENSE') {
      return { isAnomalous: false, score: 0 };
    }

    const categoryTxs = history.filter(
      (h) => h.type === 'EXPENSE' && h.category === tx.category && h.id !== tx.id,
    );

    // 1. Duplicate check (same vendor and exact same amount within 48h)
    if (tx.vendor) {
      const recentDuplicates = categoryTxs.filter((h) => {
        const timeDiffHours = Math.abs(
          (new Date(tx.date ?? Date.now()).getTime() - new Date(h.date).getTime()) / (1000 * 3600),
        );
        return h.vendor === tx.vendor && Math.abs(h.amount - tx.amount!) < 0.01 && timeDiffHours <= 48;
      });

      if (recentDuplicates.length > 0) {
        return {
          isAnomalous: true,
          score: 0.95,
          reason: `Potential duplicate payment detected: identical charge of $${tx.amount.toLocaleString()} for vendor '${tx.vendor}' within 48 hours.`,
        };
      }
    }

    // 2. Statistical Z-Score Outlier Analysis
    if (categoryTxs.length >= 3) {
      const amounts = categoryTxs.map((t) => t.amount);
      const mean = amounts.reduce((acc, val) => acc + val, 0) / amounts.length;
      const variance =
        amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance) || 1;

      const zScore = (tx.amount - mean) / stdDev;

      if (zScore >= 2.5 || tx.amount >= mean * 3.0) {
        return {
          isAnomalous: true,
          score: Math.min(0.99, 0.6 + (zScore / 10)),
          reason: `Outlier charge: $${tx.amount.toLocaleString()} is ${zScore.toFixed(1)} standard deviations above the ${tx.category} category average of $${Math.round(mean).toLocaleString()}.`,
          categoryMean: Math.round(mean),
          zScore: parseFloat(zScore.toFixed(2)),
        };
      }
    }

    // 3. Absolute Discretionary Threshold (> $15,000 for Non-Payroll)
    if (tx.amount >= 15000 && !tx.category?.includes('Payroll')) {
      return {
        isAnomalous: true,
        score: 0.85,
        reason: `High single expenditure ($${tx.amount.toLocaleString()}) exceeds standard autonomous discretionary limits.`,
      };
    }

    return { isAnomalous: false, score: 0.05 };
  }
}

