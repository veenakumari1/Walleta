import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: 'connected' | 'disconnected';
    provider: string;
    error?: string;
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<HealthCheckResponse> {
    const dbHealth = await this.prisma.checkHealth();
    const env = this.configService.get<string>('app.nodeEnv', 'development');

    return {
      status: dbHealth.status === 'connected' ? 'ok' : 'degraded',
      service: 'autonomous-business-finance-backend',
      version: '0.1.0',
      environment: env,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbHealth.status,
        provider: 'postgresql',
        ...(dbHealth.error ? { error: dbHealth.error } : {}),
      },
    };
  }
}

