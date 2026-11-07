import { fetchApi } from './client';
import type {
  AgentMetadata,
  AgentResult,
  ApprovalRequestItem,
  AssistantChatResponse,
  AuditRecord,
} from '../types/finance.types';

export async function getAgents(): Promise<AgentMetadata[]> {
  return fetchApi<AgentMetadata[]>('/orchestration/agents');
}

export async function sendChatMessage(query: string): Promise<AssistantChatResponse> {
  return fetchApi<AssistantChatResponse>('/orchestration/chat', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export async function runAgent(agentId: string, query?: string): Promise<AgentResult> {
  return fetchApi<AgentResult>('/orchestration/run-agent', {
    method: 'POST',
    body: JSON.stringify({ agentId, query }),
  });
}

export async function runFullFinancialReviewWorkflow(): Promise<{
  workflowName: string;
  executedAt: string;
  totalDurationMs: number;
  agentsParticipating: number;
  results: Record<string, AgentResult>;
  synthesis: {
    executiveVerdict: string;
    consolidatedRecommendations: string[];
  };
}> {
  return fetchApi('/orchestration/run-workflow', {
    method: 'POST',
  });
}

export async function getAuditLogs(): Promise<AuditRecord[]> {
  return fetchApi<AuditRecord[]>('/orchestration/audit-logs');
}

export async function getApprovals(
  status?: 'PENDING' | 'APPROVED' | 'REJECTED',
): Promise<ApprovalRequestItem[]> {
  const query = status ? `?status=${status}` : '';
  return fetchApi<ApprovalRequestItem[]>(`/orchestration/approvals${query}`);
}

export async function reviewApproval(
  id: string,
  decision: 'APPROVED' | 'REJECTED',
  reviewer = 'Finance Director',
): Promise<ApprovalRequestItem> {
  return fetchApi<ApprovalRequestItem>(`/orchestration/approvals/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ decision, reviewer }),
  });
}
