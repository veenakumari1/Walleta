import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isDbConnected = false;

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.isDbConnected = true;
      this.logger.log('Successfully connected to PostgreSQL database via Prisma');
    } catch (error: unknown) {
      this.isDbConnected = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Database connection deferred (PostgreSQL may not be started yet): ${message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isDbConnected) {
      await this.$disconnect();
      this.logger.log('Disconnected from PostgreSQL database');
    }
  }

  async checkHealth(): Promise<{ status: 'connected' | 'disconnected'; error?: string }> {
    try {
      await this.$queryRaw`SELECT 1`;
      this.isDbConnected = true;
      return { status: 'connected' };
    } catch (error: unknown) {
      this.isDbConnected = false;
      return {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unable to query database',
      };
    }
  }
}

