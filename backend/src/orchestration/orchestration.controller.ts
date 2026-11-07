import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service.js';
import { ApprovalService } from './security/approval.service.js';

@Controller('orchestration')
export class OrchestrationController {
  constructor(
    private readonly orchestratorService: OrchestratorService,
    private readonly approvalService: ApprovalService,
  ) {}

  @Get('agents')
  getAgents() {
    return this.orchestratorService.getAgents();
  }

  @Post('chat')
  handleChatQuery(@Body() dto: { query: string; userId?: string }) {
    return this.orchestratorService.handleChatQuery(dto.query, dto.userId);
  }

  @Post('run-agent')
  runAgent(@Body() dto: { agentId: string; query?: string; parameters?: Record<string, unknown> }) {
    return this.orchestratorService.executeAgent(dto.agentId, {
      query: dto.query,
      parameters: dto.parameters,
    });
  }

  @Post('run-workflow')
  runFullReview() {
    return this.orchestratorService.runFullFinancialReview();
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.orchestratorService.getAuditLogs();
  }

  @Get('approvals')
  getApprovals(@Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.approvalService.getApprovals(status);
  }

  @Post('approvals/:id/review')
  reviewApproval(
    @Param('id') id: string,
    @Body() dto: { decision: 'APPROVED' | 'REJECTED'; reviewer?: string },
  ) {
    return this.approvalService.reviewApproval(id, dto.decision, dto.reviewer);
  }
}

