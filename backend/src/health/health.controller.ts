import { Controller, Get } from '@nestjs/common';
import { HealthCheckResponse, HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<HealthCheckResponse> {
    return this.healthService.check();
  }
}

