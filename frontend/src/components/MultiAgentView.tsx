import React, { useState } from 'react';
import { Bot, ChevronDown, Play, Sparkles } from 'lucide-react';
import type { AgentMetadata, AgentResult, AuditRecord } from '../types/finance.types';
import { Item, Stagger } from '../AnimatedTabs';

interface MultiAgentViewProps {
  agents: AgentMetadata[];
  auditLogs: AuditRecord[];
  onRunAgent: (agentId: string) => Promise<AgentResult>;
  onRunFullReview: () => Promise<void>;
  isWorkflowRunning: boolean;
}

const LABEL = 'text-[11px] uppercase tracking-wider text-white/50 font-semibold';

export const MultiAgentView: React.FC<MultiAgentViewProps> = ({
  agents,
  auditLogs,
  onRunAgent,
  onRunFullReview,
  isWorkflowRunning,
}) => {
  const [selectedResult, setSelectedResult] = useState<AgentResult | null>(null);
  const [executingAgentId, setExecutingAgentId] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  const handleExecute = async (agentId: string) => {
    setExecutingAgentId(agentId);
    try {
      const result = await onRunAgent(agentId);
      setSelectedResult(result);
    } finally {
      setExecutingAgentId(null);
    }
  };

  return (
    <Stagger className="space-y-5">
      <Item>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-white/50">{agents.length} specialist agents, sandboxed and audited</p>
          <button
            onClick={onRunFullReview}
            disabled={isWorkflowRunning}
            className="btn flex items-center gap-2"
          >
            <Sparkles className={`h-4 w-4 ${isWorkflowRunning ? 'animate-spin' : ''}`} />
            {isWorkflowRunning ? 'Running...' : 'Run full audit'}
          </button>
        </div>
      </Item>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const isBusy = executingAgentId === agent.id;
          return (
            <Item key={agent.id}>
              <div className="card h-full flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl grid place-items-center bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold leading-tight truncate">{agent.name}</h3>
                      <p className="text-xs text-[var(--accent-2)]">{agent.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 mt-4 line-clamp-2">{agent.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{agent.capabilities.length} capabilities</span>
                  <button
                    onClick={() => handleExecute(agent.id)}
                    disabled={isBusy || isWorkflowRunning}
                    className="btn btn-ghost flex items-center gap-1.5"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    <Play className={`h-3.5 w-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                    {isBusy ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>
            </Item>
          );
        })}
      </div>

      {selectedResult && (
        <Item>
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-lg">{selectedResult.agentName}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-white/10">{selectedResult.executionDurationMs}ms</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-2)] font-semibold">
                  {(selectedResult.confidenceScore * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>

            <p className="text-sm text-white/70 mt-4 leading-relaxed">{selectedResult.summary}</p>

            {selectedResult.metrics && selectedResult.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {selectedResult.metrics.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/[0.05]">
                    <p className="text-[11px] text-white/50">{m.label}</p>
                    <p className="text-lg font-bold mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 mt-5">
              <div>
                <p className={`${LABEL} mb-2`}>Findings</p>
                <ul className="space-y-2 text-sm text-white/70">
                  {selectedResult.findings.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={`${LABEL} mb-2`}>Recommendations</p>
                <ul className="space-y-2 text-sm text-white/70">
                  {selectedResult.recommendations.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Item>
      )}

      <Item>
        <div className="card">
          <button
            onClick={() => setShowLog((s) => !s)}
            className="w-full flex items-center justify-between cursor-pointer"
          >
            <span className={LABEL}>Audit trail ({auditLogs.length})</span>
            <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${showLog ? 'rotate-180' : ''}`} />
          </button>

          {showLog && (
            <div className="space-y-2 mt-4">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.04] text-sm"
                >
                  <div>
                    <p className="font-semibold">{log.agentName}</p>
                    <p className="text-xs text-white/50">
                      {log.actionType} &bull; {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-xs text-white/60">
                    {log.executionDurationMs}ms &bull; {log.status}
                  </span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-sm text-white/40 py-4 text-center">No agent runs yet</p>
              )}
            </div>
          )}
        </div>
      </Item>
    </Stagger>
  );
};
