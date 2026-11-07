import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { ApprovalRequestItem } from '../types/finance.types';

interface ApprovalsViewProps {
  approvals: ApprovalRequestItem[];
  onReview: (id: string, decision: 'APPROVED' | 'REJECTED') => Promise<void>;
  isReviewing: boolean;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onReview,
  isReviewing,
}) => {
  const pending = approvals.filter((a) => a.status === 'PENDING');
  const history = approvals.filter((a) => a.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          Human-in-the-Loop (HITL) Security &amp; Authorization Queue
        </h2>
        <p className="text-xs text-slate-400">
          Enforces mandatory human governance before executing sensitive financial operations or
          disbursements &gt; $5,000
        </p>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          Pending Approvals Awaiting Review ({pending.length})
        </h3>

        {pending.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-amber-500/40 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {item.actionType.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">{item.title}</h4>
              </div>

              {item.amount && (
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Commitment Amount</span>
                  <p className="text-lg font-bold text-amber-400 font-mono">
                    ${item.amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 my-3 leading-relaxed">{item.description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-800/80 gap-3">
              <div className="text-[11px] text-slate-400">
                <span>Requested by: </span>
                <strong className="text-slate-200">{item.requestedByAgent}</strong> &bull;{' '}
                <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReview(item.id, 'REJECTED')}
                  disabled={isReviewing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-medium border border-rose-800/60 transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => onReview(item.id, 'APPROVED')}
                  disabled={isReviewing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Authorize &amp; Execute</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {pending.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center text-slate-400">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">All Clear — Zero Pending Approvals</p>
            <p className="text-xs text-slate-500 mt-1">
              Autonomous operations are executing within standard baseline authorization parameters.
            </p>
          </div>
        )}
      </div>

      {/* Historical Approvals */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 mt-8">
          <h3 className="text-sm font-semibold text-white mb-4">Historical Governance Decisions</h3>
          <div className="space-y-3">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div>
                  <p className="font-medium text-white">{h.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reviewed by {h.reviewedBy} on{' '}
                    {new Date(h.reviewedAt ?? '').toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                    h.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
