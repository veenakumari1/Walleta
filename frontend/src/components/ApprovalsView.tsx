import React from 'react';
import { Check, ShieldCheck, X } from 'lucide-react';
import type { ApprovalRequestItem } from '../types/finance.types';
import { Item, Stagger } from '../AnimatedTabs';

interface ApprovalsViewProps {
  approvals: ApprovalRequestItem[];
  onReview: (id: string, decision: 'APPROVED' | 'REJECTED') => Promise<void>;
  isReviewing: boolean;
}

const LABEL = 'text-[11px] uppercase tracking-wider text-white/50 font-semibold';

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ approvals, onReview, isReviewing }) => {
  const pending = approvals.filter((a) => a.status === 'PENDING');
  const history = approvals.filter((a) => a.status !== 'PENDING');

  return (
    <Stagger className="space-y-5">
      <Item>
        <p className="text-sm text-white/50">
          {pending.length > 0
            ? `${pending.length} request${pending.length > 1 ? 's' : ''} waiting for your decision`
            : 'Nothing waiting for you'}
        </p>
      </Item>

      {pending.map((item) => (
        <Item key={item.id}>
          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent-2)]">
                  {item.actionType.replace(/_/g, ' ')}
                </span>
                <h3 className="text-lg font-bold mt-3">{item.title}</h3>
                <p className="text-sm text-white/60 mt-1 line-clamp-2">{item.description}</p>
              </div>
              {item.amount && (
                <p className="text-3xl font-extrabold text-[var(--accent)]">
                  ${item.amount.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50">
                {item.requestedByAgent} &bull; {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReview(item.id, 'REJECTED')}
                  disabled={isReviewing}
                  className="btn btn-ghost flex items-center gap-1.5"
                  style={{ padding: '9px 18px', fontSize: 13 }}
                >
                  <X className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => onReview(item.id, 'APPROVED')}
                  disabled={isReviewing}
                  className="btn flex items-center gap-1.5"
                  style={{ padding: '9px 18px', fontSize: 13 }}
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
              </div>
            </div>
          </div>
        </Item>
      ))}

      {pending.length === 0 && (
        <Item>
          <div className="card text-center py-12">
            <ShieldCheck className="h-9 w-9 mx-auto text-[var(--accent)] mb-3" />
            <p className="font-bold">All clear</p>
            <p className="text-sm text-white/50 mt-1">No approvals pending right now.</p>
          </div>
        </Item>
      )}

      {history.length > 0 && (
        <Item>
          <div className="card">
            <p className={`${LABEL} mb-4`}>History</p>
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.04]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{h.title}</p>
                    <p className="text-xs text-white/50">
                      {h.reviewedBy} &bull; {new Date(h.reviewedAt ?? '').toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      h.status === 'APPROVED'
                        ? 'bg-white/10 text-white'
                        : 'bg-[var(--accent-soft)] text-[var(--accent-2)]'
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Item>
      )}
    </Stagger>
  );
};
