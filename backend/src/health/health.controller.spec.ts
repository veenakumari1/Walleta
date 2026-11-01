import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeAll(async () => {
    const mockPrismaService = {
      checkHealth: vi.fn().mockResolvedValue({ status: 'connected' }),
    };

    const mockConfigService = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === 'app.nodeEnv') return 'test';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  }, 30000);

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return health status response', async () => {
    const result = await controller.getHealth();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('service', 'autonomous-business-finance-backend');
    expect(result).toHaveProperty('version', '0.1.0');
    expect(result).toHaveProperty('environment', 'test');
    expect(result).toHaveProperty('database');
    expect(result.database.status).toBe('connected');
    expect(result.database.provider).toBe('postgresql');
  });
});
