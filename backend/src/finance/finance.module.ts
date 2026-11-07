import { Module } from '@nestjs/common';
import { EngineModule } from '../engine/engine.module.js';
import { FinanceController } from './finance.controller.js';
import { FinanceRepository } from './finance.repository.js';
import { FinanceService } from './finance.service.js';

@Module({
  imports: [EngineModule],
  controllers: [FinanceController],
  providers: [FinanceRepository, FinanceService],
  exports: [FinanceRepository, FinanceService],
})
export class FinanceModule {}

