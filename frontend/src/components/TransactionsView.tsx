import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle2, X, Sparkles } from 'lucide-react';
import type { TransactionModel } from '../types/finance.types';

interface TransactionsViewProps {
  transactions: TransactionModel[];
  onAddTransaction: (dto: {
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category?: string;
    vendor?: string;
    paymentMethod?: string;
  }) => Promise<void>;
  isAdding: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onAddTransaction,
  isAdding,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [anomalousOnly, setAnomalousOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ACH');

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (anomalousOnly && !t.isAnomalous) return false;
    if (searchTerm) {
      const match =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.vendor && t.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    await onAddTransaction({
      description: desc,
      amount: parseFloat(amount),
      type: txType,
      vendor: vendor || undefined,
      category: category || undefined,
      paymentMethod,
    });

    setIsModalOpen(false);
    setDesc('');
    setAmount('');
    setVendor('');
    setCategory('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Financial Transactions &amp; Audit Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Real-time categorized ledger with statistical Z-score anomaly detection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search descriptions, vendors, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
                  typeFilter === t
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAnomalousOnly(!anomalousOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              anomalousOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>Flagged Outliers Only</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Description &amp; Anomaly Details</th>
                <th className="py-3 px-4 font-medium">Vendor</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Method</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-slate-800/30 transition ${
                    t.isAnomalous ? 'bg-rose-950/15' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{t.description}</p>
                    {t.isAnomalous && t.anomalyReason && (
                      <div className="mt-1 flex items-start gap-1.5 text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded-lg border border-rose-800/50">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{t.anomalyReason}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{t.vendor || '—'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px]">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{t.paymentMethod}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold ${
                      t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Record New Transaction</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    txType === 'EXPENSE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  Expense / Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    txType === 'INCOME'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  Revenue / Inflow
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production compute monthly invoice"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Amount ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vendor / Counterparty
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category (Optional - Auto-inferred)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank for Auto-Categorize"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ACH">ACH Transfer</option>
                    <option value="WIRE">Fedwire</option>
                    <option value="CARD">Corporate Card</option>
                    <option value="TRANSFER">Internal Transfer</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-cyan-400">Autonomous Processing Pipeline:</span>{' '}
                Upon submission, the transaction will automatically run through the{' '}
                <strong>Categorization Engine</strong> and the <strong>Anomaly Detector</strong>{' '}
                (Z-score analysis &amp; duplicate check).
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isAdding ? 'Processing...' : 'Process & Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
