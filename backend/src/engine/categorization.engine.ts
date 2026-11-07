import { Injectable } from '@nestjs/common';
import { TransactionCategory } from '../finance/finance.types.js';

@Injectable()
export class CategorizationEngine {
  private readonly rules: Array<{ pattern: RegExp; category: TransactionCategory; vendor?: string }> = [
    { pattern: /stripe|subscription|saas\s+billing/i, category: 'Revenue - SaaS Subscriptions', vendor: 'Stripe' },
    { pattern: /retainer|client\s+wire|consulting/i, category: 'Revenue - Client Retainer' },
    { pattern: /enterprise|license|nova\s+dynamics/i, category: 'Revenue - Enterprise Licensing' },
    { pattern: /payroll|gusto|adp|salary|wages/i, category: 'Payroll & Benefits', vendor: 'Gusto' },
    { pattern: /aws|amazon\s+web|gcp|google\s+cloud|azure|cloudscale/i, category: 'Cloud Infrastructure' },
    { pattern: /datadog|github|slack|zoom|jira|atlassian|figma/i, category: 'Software & SaaS Tools' },
    { pattern: /hubspot|google\s+ads|meta\s+ads|linkedin|marketing/i, category: 'Sales & Marketing' },
    { pattern: /rent|lease|wework|facilities|electric/i, category: 'Office & Facilities' },
    { pattern: /legal|attorney|audit|compliance|cooley|deloitte/i, category: 'Legal & Compliance' },
    { pattern: /flight|hotel|airline|marriott|uber|delta|lyft/i, category: 'Travel & Entertainment' },
  ];

  categorize(description: string, vendorInput?: string): { category: TransactionCategory; confidence: number; detectedVendor?: string } {
    const text = `${description} ${vendorInput ?? ''}`.trim();

    for (const rule of this.rules) {
      if (rule.pattern.test(text)) {
        return {
          category: rule.category,
          confidence: 0.92,
          detectedVendor: rule.vendor ?? vendorInput,
        };
      }
    }

    return {
      category: 'Miscellaneous Expense',
      confidence: 0.55,
      detectedVendor: vendorInput,
    };
  }
}

