import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module.js';
import { FinanceModule } from '../finance/finance.module.js';
import { PostExecutionHook } from './hooks/post-execution.hook.js';
import { PreExecutionHook } from './hooks/pre-execution.hook.js';
import { OrchestrationController } from './orchestration.controller.js';
import { OrchestratorService } from './orchestrator.service.js';
import { ExecutionSandbox } from './sandbox/execution-sandbox.js';
import { ApprovalService } from './security/approval.service.js';

@Module({
  imports: [AgentsModule, FinanceModule],
  controllers: [OrchestrationController],
  providers: [
    OrchestratorService,
    ExecutionSandbox,
    PreExecutionHook,
    PostExecutionHook,
    ApprovalService,
  ],
  exports: [OrchestratorService, ApprovalService],
})
export class OrchestrationModule {}

