import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  PieChart,
  FileText,
  Bot,
  ShieldAlert,
  MessageSquare,
  Activity,
} from 'lucide-react';

export type TabId =
  | 'overview'
  | 'transactions'
  | 'cash-flow'
  | 'budgets'
  | 'invoices'
  | 'agents'
  | 'approvals'
  | 'assistant'
  | 'system-health';

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingApprovalsCount: number;
  anomaliesCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  anomaliesCount,
}) => {
  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'transactions' as TabId,
      label: 'Transactions',
      icon: Receipt,
      badge: anomaliesCount > 0 ? `${anomaliesCount} alert` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    { id: 'cash-flow' as TabId, label: 'Cash Flow & Forecast', icon: TrendingUp },
    { id: 'budgets' as TabId, label: 'Budgets', icon: PieChart },
    { id: 'invoices' as TabId, label: 'Invoices (AP/AR)', icon: FileText },
    { id: 'agents' as TabId, label: 'Autonomous Agents', icon: Bot },
    {
      id: 'approvals' as TabId,
      label: 'Human Approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    { id: 'assistant' as TabId, label: 'AI Finance Assistant', icon: MessageSquare },
    { id: 'system-health' as TabId, label: 'System Health', icon: Activity },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-950/60 sticky top-16 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full border font-mono ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
