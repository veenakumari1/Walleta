import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Plus, Search, X } from 'lucide-react';
import type { TransactionModel } from '../types/finance.types';
import { Item, Stagger } from '../AnimatedTabs';

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

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const shortDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const INPUT =
  'w-full px-4 py-3 text-sm text-white placeholder-white/30';
const FIELD_LABEL = 'block text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-1.5';
const PAGE_SIZE = 10;

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onAddTransaction,
  isAdding,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [anomalousOnly, setAnomalousOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Form states
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ACH');

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return transactions
      .filter((t) => {
        if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
        if (anomalousOnly && !t.isAnomalous) return false;
        if (q) {
          const match =
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            (t.vendor && t.vendor.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, anomalousOnly, searchTerm]);

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

  const typeFilters = [
    { id: 'ALL', label: 'All' },
    { id: 'INCOME', label: 'Income' },
    { id: 'EXPENSE', label: 'Expense' },
  ] as const;

  return (
    <Stagger className="space-y-5">
      {/* Toolbar */}
      <Item>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search transactions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${INPUT} !pl-11`}
              style={{ paddingLeft: 44 }}
            />
          </div>

          <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
            {typeFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                  typeFilter === f.id ? 'bg-[var(--accent)] text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAnomalousOnly(!anomalousOnly)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer transition ${
              anomalousOnly
                ? 'bg-[var(--accent-soft)] text-[var(--accent-2)] border-[var(--accent)]'
                : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Flagged
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn flex items-center gap-2"
            style={{ padding: '10px 18px' }}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </Item>

      {/* List */}
      <Item>
        <div className="card">
          <div className="space-y-2">
            {filtered.slice(0, visible).map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] transition"
              >
                <div
                  className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${
                    t.type === 'INCOME'
                      ? 'bg-white/10 text-white'
                      : 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  }`}
                >
                  {t.type === 'INCOME' ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{t.description}</p>
                    {t.isAnomalous && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent-2)]">
                        Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    {t.category} &bull; {shortDate(t.date)}
                    {t.vendor ? ` • ${t.vendor}` : ''}
                  </p>
                  {t.isAnomalous && t.anomalyReason && (
                    <p className="text-[11px] text-[var(--accent-2)] mt-1 truncate">{t.anomalyReason}</p>
                  )}
                </div>

                <p
                  className={`font-bold text-sm whitespace-nowrap ${
                    t.type === 'INCOME' ? 'text-white' : 'text-[var(--accent)]'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}
                  {money(t.amount)}
                </p>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-white/40 py-10 text-center">No transactions found</p>
            )}
          </div>

          {filtered.length > visible && (
            <div className="text-center mt-4">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="btn btn-ghost"
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                Show more ({filtered.length - visible})
              </button>
            </div>
          )}
        </div>
      </Item>

      {/* Add transaction modal (portal: page transition ke transform se bahar) */}
      {isModalOpen &&
        createPortal(
          <div className="finora">
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
              onClick={() => setIsModalOpen(false)}
            >
              <div className="card w-full max-w-lg" onClick={(e) => e.stopPropagation()} style={{ transform: 'none' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold">New transaction</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white/50 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="inline-flex w-full p-1 rounded-full bg-white/5 border border-white/10">
                    {(['EXPENSE', 'INCOME'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTxType(t)}
                        className={`flex-1 py-2 rounded-full text-xs font-semibold cursor-pointer transition ${
                          txType === t ? 'bg-[var(--accent)] text-white' : 'text-white/60'
                        }`}
                      >
                        {t === 'EXPENSE' ? 'Expense' : 'Income'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className={FIELD_LABEL}>Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monthly server invoice"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className={INPUT}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={FIELD_LABEL}>Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="1500.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={FIELD_LABEL}>Vendor</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={FIELD_LABEL}>Category</label>
                      <input
                        type="text"
                        placeholder="Auto if empty"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={FIELD_LABEL}>Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={INPUT}
                      >
                        <option value="ACH">ACH Transfer</option>
                        <option value="WIRE">Wire</option>
                        <option value="CARD">Card</option>
                        <option value="TRANSFER">Internal Transfer</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-white/40">
                    Category and anomaly check run automatically after you save.
                  </p>

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn btn-ghost"
                      style={{ padding: '10px 20px' }}
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={isAdding} className="btn" style={{ padding: '10px 22px' }}>
                      {isAdding ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </Stagger>
  );
};
