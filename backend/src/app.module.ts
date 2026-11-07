import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentsModule } from './agents/agents.module.js';
import configuration from './config/configuration.js';
import { EngineModule } from './engine/engine.module.js';
import { FinanceModule } from './finance/finance.module.js';
import { HealthModule } from './health/health.module.js';
import { OrchestrationModule } from './orchestration/orchestration.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    HealthModule,
    EngineModule,
    FinanceModule,
    AgentsModule,
    OrchestrationModule,
  ],
})
export class AppModule {}
