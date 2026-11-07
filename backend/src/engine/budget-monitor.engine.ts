import { Injectable } from '@nestjs/common';
import { BudgetModel } from '../finance/finance.types.js';

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

@Injectable()
export class BudgetMonitorEngine {
  evaluate(budgets: BudgetModel[]): BudgetSummary {
    let totalAllocated = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;
    let atRiskCount = 0;

    const departments: BudgetAnalysis[] = budgets.map((b) => {
      totalAllocated += b.allocatedAmount;
      totalSpent += b.spentAmount;

      const remaining = b.allocatedAmount - b.spentAmount;
      const utilizationPct = Math.round((b.spentAmount / (b.allocatedAmount || 1)) * 100);
      const variance = b.spentAmount - b.allocatedAmount;

      let status: 'ON_TRACK' | 'AT_RISK' | 'OVER_BUDGET' = 'ON_TRACK';
      let recommendation: string | undefined;

      if (utilizationPct >= 100) {
        status = 'OVER_BUDGET';
        overBudgetCount++;
        recommendation = `Freeze non-essential discretionary spending immediately. Reallocate from surplus departments.`;
      } else if (utilizationPct >= b.alertThreshold * 100) {
        status = 'AT_RISK';
        atRiskCount++;
        recommendation = `Spending velocity indicates projected overrun before quarter close. Require manager sign-off on expenses > $2,500.`;
      } else {
        recommendation = `Department spending pacing is within planned operational parameters.`;
      }

      return {
        department: b.department,
        allocated: b.allocatedAmount,
        spent: b.spentAmount,
        remaining,
        utilizationPct,
        status,
        variance,
        recommendation,
      };
    });

    const totalRemaining = totalAllocated - totalSpent;
    const overallUtilizationPct = Math.round((totalSpent / (totalAllocated || 1)) * 100);

    const optimizationSuggestions: string[] = [];
    if (overBudgetCount > 0) {
      const overDept = departments.find((d) => d.status === 'OVER_BUDGET');
      const underDept = departments.find((d) => d.utilizationPct < 70);
      if (overDept && underDept) {
        optimizationSuggestions.push(
          `Rebalance $${Math.abs(overDept.variance).toLocaleString()} from ${underDept.department} (underutilized at ${underDept.utilizationPct}%) to cover ${overDept.department} deficit.`,
        );
      }
    }

    optimizationSuggestions.push(
      'Automate invoice reconciliation to capture 2% early-pay supplier discounts.',
      'Audit annual recurring SaaS tool seats to eliminate redundant developer and marketing licenses.',
    );

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      overallUtilizationPct,
      overBudgetCount,
      atRiskCount,
      departments,
      optimizationSuggestions,
    };
  }
}

