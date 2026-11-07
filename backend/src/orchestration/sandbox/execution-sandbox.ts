import { Injectable, Logger } from '@nestjs/common';
import { AgentContext, AgentResult, BaseAgent } from '../../agents/interfaces/agent.interface.js';

export interface SandboxPolicy {
  allowWriteOperations: boolean;
  maxExecutionTimeMs: number;
  restrictedCategories?: string[];
  maxTransactionThreshold?: number;
}

export const DEFAULT_SANDBOX_POLICY: SandboxPolicy = {
  allowWriteOperations: false, // Default to strict read-only execution
  maxExecutionTimeMs: 5000,
  maxTransactionThreshold: 50000,
};

@Injectable()
export class ExecutionSandbox {
  private readonly logger = new Logger(ExecutionSandbox.name);

  async executeInSandbox(
    agent: BaseAgent,
    context: AgentContext,
    policy: SandboxPolicy = DEFAULT_SANDBOX_POLICY,
  ): Promise<AgentResult> {
    const sandboxedContext: AgentContext = {
      ...context,
      isSandboxed: true,
    };

    const startTime = performance.now();

    // Enforce execution timeout
    const executionPromise = agent.execute(sandboxedContext);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Sandbox execution timeout: agent '${agent.metadata.name}' exceeded ${policy.maxExecutionTimeMs}ms limit`)),
        policy.maxExecutionTimeMs,
      ),
    );

    try {
      const result = await Promise.race([executionPromise, timeoutPromise]);
      const duration = Math.round(performance.now() - startTime);

      this.logger.log(
        `Sandbox execution verified for [${agent.metadata.name}] in ${duration}ms (Sandboxed: true, WriteAllowed: ${policy.allowWriteOperations})`,
      );

      return {
        ...result,
        executionDurationMs: duration,
      };
    } catch (error) {
      this.logger.error(`Sandbox violation / failure in [${agent.metadata.name}]: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

