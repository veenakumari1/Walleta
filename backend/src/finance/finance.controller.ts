import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service.js';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  getOverview() {
    return this.financeService.getOverview();
  }

  @Get('transactions')
  getTransactions(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('anomalousOnly') anomalousOnly?: string,
  ) {
    return this.financeService.getTransactions({
      type,
      category,
      anomalousOnly: anomalousOnly === 'true',
    });
  }

  @Post('transactions')
  createTransaction(
    @Body()
    dto: {
      description: string;
      amount: number;
      type: 'INCOME' | 'EXPENSE';
      category?: string;
      vendor?: string;
      paymentMethod?: string;
      accountId?: string;
    },
  ) {
    return this.financeService.createTransaction(dto);
  }

  @Get('budgets')
  getBudgets() {
    return this.financeService.getBudgets();
  }

  @Get('invoices')
  getInvoices(@Query('type') type?: 'PAYABLE' | 'RECEIVABLE') {
    return this.financeService.getInvoices(type);
  }

  @Post('invoices/:id/pay')
  payInvoice(@Param('id') id: string) {
    return this.financeService.payInvoice(id);
  }

  @Get('cash-flow')
  getCashFlowForecast() {
    return this.financeService.getCashFlowForecast();
  }

  @Get('reports')
  getComprehensiveReport() {
    return this.financeService.getComprehensiveReport();
  }

  @Get('accounts')
  getAccounts() {
    return this.financeService.getAccounts();
  }
}

