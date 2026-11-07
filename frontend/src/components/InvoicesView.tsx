import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { InvoiceModel } from '../types/finance.types';
import { Item, Stagger } from '../AnimatedTabs';

interface InvoicesViewProps {
  invoices: InvoiceModel[];
  onPayInvoice: (id: string) => Promise<void>;
  onNavigateApprovals: () => void;
  isPaying: boolean;
}

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const LABEL = 'text-[11px] uppercase tracking-wider text-white/50 font-semibold';

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onPayInvoice,
  onNavigateApprovals,
  isPaying,
}) => {
  const [activeType, setActiveType] = useState<'ALL' | 'PAYABLE' | 'RECEIVABLE'>('ALL');

  const filtered = invoices.filter((i) => activeType === 'ALL' || i.type === activeType);

  const payablesTotal = invoices
    .filter((i) => i.type === 'PAYABLE' && i.status !== 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);

  const receivablesTotal = invoices
    .filter((i) => i.type === 'RECEIVABLE' && i.status !== 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);

  const filters = [
    { id: 'ALL', label: 'All' },
    { id: 'RECEIVABLE', label: 'Receivable' },
    { id: 'PAYABLE', label: 'Payable' },
  ] as const;

  return (
    <Stagger className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Item>
          <div className="card">
            <p className={LABEL}>To receive</p>
            <p className="card-value mt-2">{money(receivablesTotal)}</p>
            <p className="text-xs text-white/50 mt-1">Outstanding from clients</p>
          </div>
        </Item>
        <Item>
          <div className="card">
            <p className={LABEL}>To pay</p>
            <p className="card-value mt-2 text-[var(--accent)]">{money(payablesTotal)}</p>
            <p className="text-xs text-white/50 mt-1">Due to vendors</p>
          </div>
        </Item>
      </div>

      <Item>
        <div className="card">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <p className={LABEL}>Invoices</p>
            <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveType(f.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                    activeType === f.id ? 'bg-[var(--accent)] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] transition"
              >
                <div className="min-w-[160px]">
                  <p className="font-semibold text-sm">{inv.entityName}</p>
                  <p className="text-xs text-white/50">
                    {inv.invoiceNumber} &bull; Due {inv.dueDate}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white">
                  {inv.type === 'RECEIVABLE' ? 'Receive' : 'Pay'}
                </span>

                <p className="font-bold">{money(inv.amount)}</p>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    inv.status === 'AWAITING_APPROVAL'
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-2)]'
                      : 'bg-white/10 text-white/80'
                  }`}
                >
                  {inv.status.replace(/_/g, ' ')}
                </span>

                <div className="min-w-[96px] text-right">
                  {inv.type === 'PAYABLE' && inv.status !== 'PAID' ? (
                    inv.status === 'AWAITING_APPROVAL' ? (
                      <button
                        onClick={onNavigateApprovals}
                        className="btn btn-ghost"
                        style={{ padding: '8px 16px', fontSize: 12 }}
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        onClick={() => onPayInvoice(inv.id)}
                        disabled={isPaying}
                        className="btn"
                        style={{ padding: '8px 16px', fontSize: 12 }}
                      >
                        Pay
                      </button>
                    )
                  ) : inv.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-white/60">
                      <Check className="h-3.5 w-3.5" /> Settled
                    </span>
                  ) : (
                    <span className="text-xs text-white/40">Incoming</span>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-white/40 py-8 text-center">No invoices</p>}
          </div>
        </div>
      </Item>
    </Stagger>
  );
};
