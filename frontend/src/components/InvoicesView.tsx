import React, { useState } from 'react';
import { FileText, CreditCard, Check } from 'lucide-react';
import type { InvoiceModel } from '../types/finance.types';

interface InvoicesViewProps {
  invoices: InvoiceModel[];
  onPayInvoice: (id: string) => Promise<void>;
  onNavigateApprovals: () => void;
  isPaying: boolean;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onPayInvoice,
  onNavigateApprovals,
  isPaying,
}) => {
  const [activeType, setActiveType] = useState<'ALL' | 'PAYABLE' | 'RECEIVABLE'>('ALL');

  const filtered = invoices.filter((i) => {
    if (activeType !== 'ALL' && i.type !== activeType) return false;
    return true;
  });

  const payablesTotal = invoices
    .filter((i) => i.type === 'PAYABLE' && i.status !== 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);

  const receivablesTotal = invoices
    .filter((i) => i.type === 'RECEIVABLE' && i.status !== 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Accounts Payable (AP) &amp; Receivable (AR) Invoices
          </h2>
          <p className="text-xs text-slate-400">
            Enterprise settlement pipeline with human authorization governance
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'RECEIVABLE', 'PAYABLE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeType === t
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'ALL'
                ? 'All Invoices'
                : t === 'RECEIVABLE'
                  ? 'Receivables (AR)'
                  : 'Payables (AP)'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Outstanding Accounts Receivable (Inflow)</span>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
              ${receivablesTotal.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Expected collections from enterprise clients
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Outstanding Accounts Payable (Outflow)</span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              ${payablesTotal.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Approved vendor liabilities due for settlement
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                <th className="py-3 px-4 font-medium">Invoice Number</th>
                <th className="py-3 px-4 font-medium">Entity / Client</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Due Date</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4 font-medium">Status &amp; Notes</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">{inv.entityName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        inv.type === 'RECEIVABLE'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {inv.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : inv.status === 'AWAITING_APPROVAL'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {inv.status.replace('_', ' ')}
                      </span>
                      {inv.requiresApproval && inv.status === 'AWAITING_APPROVAL' && (
                        <span className="text-[10px] text-amber-400 font-medium">
                          (Approval Gate)
                        </span>
                      )}
                    </div>
                    {inv.notes && <p className="text-[11px] text-slate-500 mt-0.5">{inv.notes}</p>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.type === 'PAYABLE' && inv.status !== 'PAID' ? (
                      inv.status === 'AWAITING_APPROVAL' ? (
                        <button
                          onClick={onNavigateApprovals}
                          className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-[11px] font-medium border border-amber-500/40 transition cursor-pointer"
                        >
                          Review Approval
                        </button>
                      ) : (
                        <button
                          onClick={() => onPayInvoice(inv.id)}
                          disabled={isPaying}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-medium shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                          Settle &amp; Pay
                        </button>
                      )
                    ) : inv.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        Settled
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Incoming</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
