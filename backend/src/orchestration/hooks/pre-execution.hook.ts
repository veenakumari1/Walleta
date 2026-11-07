import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AgentContext, BaseAgent } from '../../agents/interfaces/agent.interface.js';

export interface PreExecutionValidationResult {
  passed: boolean;
  hookName: string;
  timestamp: string;
  sanitizedContext: AgentContext;
}

@Injectable()
export class PreExecutionHook {
  private readonly logger = new Logger(PreExecutionHook.name);

  validate(agent: BaseAgent, context: AgentContext): PreExecutionValidationResult {
    const hookName = 'PreExecutionValidationHook';

    // 1. Validate query length & format if query exists
    if (context.query && context.query.length > 2000) {
      throw new BadRequestException('Query exceeds maximum permitted length of 2000 characters');
    }

    // 2. Validate agent operational status
    if (agent.metadata.status === 'ERROR') {
      throw new BadRequestException(`Agent '${agent.metadata.name}' is currently in ERROR state and cannot accept tasks`);
    }

    // 3. Sanitize inputs
    const sanitizedQuery = context.query?.trim();

    this.logger.log(`[${hookName}] Passed for agent '${agent.metadata.name}'`);

    return {
      passed: true,
      hookName,
      timestamp: new Date().toISOString(),
      sanitizedContext: {
        ...context,
        query: sanitizedQuery,
      },
    };
  }
}

