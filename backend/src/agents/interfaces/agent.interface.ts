export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: 'IDLE' | 'ACTIVE' | 'EXECUTING' | 'ERROR';
}

export interface AgentContext {
  userId?: string;
  query?: string;
  parameters?: Record<string, unknown>;
  isSandboxed?: boolean;
}

export interface AgentMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  summary: string;
  findings: string[];
  recommendations: string[];
  metrics?: AgentMetric[];
  supportingData?: Record<string, unknown>;
  confidenceScore: number;
  requiresHumanApproval?: boolean;
  approvalPayload?: {
    action: string;
    amount?: number;
    description: string;
  };
  executionDurationMs?: number;
}

export interface BaseAgent {
  metadata: AgentMetadata;
  execute(context: AgentContext): Promise<AgentResult>;
}

