import { Module } from '@nestjs/common';
import { AnomalyDetectorEngine } from './anomaly-detector.engine.js';
import { BudgetMonitorEngine } from './budget-monitor.engine.js';
import { CategorizationEngine } from './categorization.engine.js';
import { ForecastingEngine } from './forecasting.engine.js';
import { ReportGeneratorEngine } from './report-generator.engine.js';

@Module({
  providers: [
    CategorizationEngine,
    AnomalyDetectorEngine,
    ForecastingEngine,
    BudgetMonitorEngine,
    ReportGeneratorEngine,
  ],
  exports: [
    CategorizationEngine,
    AnomalyDetectorEngine,
    ForecastingEngine,
    BudgetMonitorEngine,
    ReportGeneratorEngine,
  ],
})
export class EngineModule {}

