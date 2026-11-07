import { Injectable, Logger } from '@nestjs/common';
import { AgentResult } from '../../agents/interfaces/agent.interface.js';

export interface PostExecutionVerificationResult {
  passed: boolean;
  hookName: string;
  integrityVerified: boolean;
  timestamp: string;
  details: string[];
}

@Injectable()
export class PostExecutionHook {
  private readonly logger = new Logger(PostExecutionHook.name);

  verify(result: AgentResult): PostExecutionVerificationResult {
    const hookName = 'PostExecutionIntegrityHook';
    const details: string[] = [];

    // 1. Verify metrics numerical validity
    if (result.metrics) {
      for (const m of result.metrics) {
        if (typeof m.value === 'number' && isNaN(m.value)) {
          throw new Error(`Mathematical integrity violation: metric '${m.label}' returned NaN`);
        }
      }
      details.push(`Verified ${result.metrics.length} numerical metrics`);
    }

    // 2. Verify financial data mathematical balance if P&L data is present
    if (result.supportingData) {
      const rev = result.supportingData.totalRevenue as number | undefined;
      const exp = result.supportingData.totalExpenses as number | undefined;
      const net = result.supportingData.netIncome as number | undefined;

      if (rev !== undefined && exp !== undefined && net !== undefined) {
        const expectedNet = rev - exp;
        const diff = Math.abs(expectedNet - net);
        if (diff > 0.01) {
          throw new Error(
            `Financial balance inconsistency detected: Revenue ($${rev}) - Expenses ($${exp}) does not equal Net Income ($${net})`,
          );
        }
        details.push('Verified fundamental financial equation: Revenue - Expenses = Net Operating Income');
      }
    }

    // 3. Verify recommendations and findings are non-empty
    if (result.findings.length === 0) {
      details.push('Warning: Agent returned 0 analytical findings');
    }

    this.logger.log(`[${hookName}] Successfully verified output integrity for agent '${result.agentName}'`);

    return {
      passed: true,
      hookName,
      integrityVerified: true,
      timestamp: new Date().toISOString(),
      details,
    };
  }
}

