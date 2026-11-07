import { Module } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module.js';
import { BudgetPlannerAgent } from './budget-planner.agent.js';
import { CashFlowManagerAgent } from './cash-flow-manager.agent.js';
import { ExpenseManagerAgent } from './expense-manager.agent.js';
import { FinanceAssistantAgent } from './finance-assistant.agent.js';
import { FinancialAnalystAgent } from './financial-analyst.agent.js';
import { FinancialReportingAgent } from './financial-reporting.agent.js';

@Module({
  imports: [FinanceModule],
  providers: [
    FinancialAnalystAgent,
    ExpenseManagerAgent,
    CashFlowManagerAgent,
    BudgetPlannerAgent,
    FinancialReportingAgent,
    FinanceAssistantAgent,
  ],
  exports: [
    FinancialAnalystAgent,
    ExpenseManagerAgent,
    CashFlowManagerAgent,
    BudgetPlannerAgent,
    FinancialReportingAgent,
    FinanceAssistantAgent,
  ],
})
export class AgentsModule {}

