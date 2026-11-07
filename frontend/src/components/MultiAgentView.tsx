import React, { useState } from 'react';
import {
  Bot,
  Play,
  Sparkles,
  Shield,
  Layers,
  History,
  CheckCircle2,
  Zap,
  Clock,
} from 'lucide-react';
import type { AgentMetadata, AgentResult, AuditRecord } from '../types/finance.types';

interface MultiAgentViewProps {
  agents: AgentMetadata[];
  auditLogs: AuditRecord[];
  onRunAgent: (agentId: string) => Promise<AgentResult>;
  onRunFullReview: () => Promise<void>;
  isWorkflowRunning: boolean;
}

export const MultiAgentView: React.FC<MultiAgentViewProps> = ({
  agents,
  auditLogs,
  onRunAgent,
  onRunFullReview,
  isWorkflowRunning,
}) => {
  const [selectedResult, setSelectedResult] = useState<AgentResult | null>(null);
  const [executingAgentId, setExecutingAgentId] = useState<string | null>(null);

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
    <div className="space-y-8">
      {/* Header & Full Workflow Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-cyan-400" />
            Coordinated Multi-Agent Autonomous Team (Week 7 Architecture)
          </h2>
          <p className="text-xs text-slate-400">
            Specialized autonomous agents operating inside execution sandboxes with pre/post
            verification hooks
          </p>
        </div>

        <button
          onClick={onRunFullReview}
          disabled={isWorkflowRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${isWorkflowRunning ? 'animate-spin' : ''}`} />
          <span>
            {isWorkflowRunning ? 'Orchestrating Agents...' : 'Run Full Multi-Agent Audit'}
          </span>
        </button>
      </div>

      {/* Week 7 Engineering Concepts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Shield className="h-4 w-4" />
            <span>Sandboxed Execution Context</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All agents run inside isolated execution boundaries with strict read-only default
            policies and a 5,000ms hard execution timeout.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Layers className="h-4 w-4" />
            <span>Pre &amp; Post Verification Hooks</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pre-execution hooks validate payloads and authorization. Post-execution hooks verify
            financial balance equations and data integrity.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-1">
            <History className="h-4 w-4" />
            <span>Immutable Execution Audit Trail</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Every agent action, execution duration, and hook trigger is recorded into persistent
            audit telemetry for governance and compliance.
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const isBusy = executingAgentId === agent.id;
          return (
            <div
              key={agent.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{agent.name}</h3>
                      <p className="text-[11px] text-cyan-400 font-medium">{agent.role}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">{agent.description}</p>

                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Core Capabilities:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    {agent.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">ID: {agent.id}</span>
                <button
                  onClick={() => handleExecute(agent.id)}
                  disabled={isBusy || isWorkflowRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700/60 transition cursor-pointer disabled:opacity-50"
                >
                  <Play className={`h-3 w-3 ${isBusy ? 'animate-spin' : ''}`} />
                  <span>{isBusy ? 'Analyzing...' : 'Run Agent'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Output Inspector */}
      {selectedResult && (
        <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Live Output Inspector: {selectedResult.agentName}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{selectedResult.executionDurationMs}ms</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Confidence: {(selectedResult.confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Executive Synthesis:
              </span>
              <p className="leading-relaxed">{selectedResult.summary}</p>
            </div>

            {selectedResult.metrics && selectedResult.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedResult.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">{m.label}</span>
                    <p className="text-base font-bold text-white font-mono mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Key Analytical Findings
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedResult.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">&bull;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Strategic Recommendations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedResult.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execution Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-400" />
          Multi-Agent Execution Audit Trail (Governance Log)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Agent</th>
                <th className="pb-3 font-medium">Action Type</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Hooks Triggered</th>
                <th className="pb-3 font-medium">Sandbox Mode</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/20 transition">
                  <td className="py-2.5 text-slate-400 font-sans">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 font-sans font-medium text-white">{log.agentName}</td>
                  <td className="py-2.5 text-slate-300">{log.actionType}</td>
                  <td className="py-2.5 text-cyan-400">{log.executionDurationMs}ms</td>
                  <td className="py-2.5 font-sans">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60">
                      {log.hooksTriggered.join(', ')}
                    </span>
                  </td>
                  <td className="py-2.5 font-sans">
                    <span className="text-[11px] text-emerald-400">Strict Read-Only</span>
                  </td>
                  <td className="py-2.5 text-right font-sans">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No autonomous agent execution logs recorded yet. Run an agent or the full audit
                    workflow above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
