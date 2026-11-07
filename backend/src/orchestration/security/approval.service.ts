import { Injectable, NotFoundException } from '@nestjs/common';

export interface ApprovalRequestItem {
  id: string;
  title: string;
  description: string;
  actionType: 'INVOICE_PAYMENT' | 'LARGE_TRANSACTION' | 'BUDGET_REALLOCATION' | 'POLICY_OVERRIDE';
  amount?: number;
  requestedByAgent: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

@Injectable()
export class ApprovalService {
  private approvals: ApprovalRequestItem[] = [];

  constructor() {
    // Seed initial pending approval
    this.approvals = [
      {
        id: 'appr-001',
        title: 'Approve Payment: DevSecOps Global Auditing',
        description: 'Mandatory annual SOC2 Type II compliance audit billing invoice (BILL-2026-105). Exceeds $5,000 threshold.',
        actionType: 'INVOICE_PAYMENT',
        amount: 8500,
        requestedByAgent: 'Expense Management Agent',
        status: 'PENDING',
        createdAt: '2026-11-01T10:00:00.000Z',
        metadata: { invoiceId: 'inv-004', vendor: 'DevSecOps Global Auditing' },
      },
      {
        id: 'appr-002',
        title: 'Approve Investigation: FastServer Supply Hardware Order',
        description: 'Single discretionary hardware charge of $19,500 flagged by Anomaly Detection Engine as statistical outlier.',
        actionType: 'POLICY_OVERRIDE',
        amount: 19500,
        requestedByAgent: 'Expense Management Agent',
        status: 'PENDING',
        createdAt: '2026-11-06T18:30:00.000Z',
        metadata: { transactionId: 'tx-112', vendor: 'FastServer Supply Ltd' },
      },
    ];
  }

  getApprovals(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): ApprovalRequestItem[] {
    if (status) {
      return this.approvals.filter((a) => a.status === status);
    }
    return [...this.approvals];
  }

  createApproval(item: Omit<ApprovalRequestItem, 'id' | 'status' | 'createdAt'>): ApprovalRequestItem {
    const newApproval: ApprovalRequestItem = {
      ...item,
      id: `appr-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.approvals.unshift(newApproval);
    return newApproval;
  }

  reviewApproval(id: string, decision: 'APPROVED' | 'REJECTED', reviewer = 'Finance Director'): ApprovalRequestItem {
    const item = this.approvals.find((a) => a.id === id);
    if (!item) {
      throw new NotFoundException(`Approval request with ID '${id}' not found`);
    }
    item.status = decision;
    item.reviewedBy = reviewer;
    item.reviewedAt = new Date().toISOString();
    return item;
  }
}

