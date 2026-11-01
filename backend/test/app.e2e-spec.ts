import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AppModule } from './../src/app.module.js';

describe('Health Check (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 30000);

  it('/api/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('service', 'autonomous-business-finance-backend');
    expect(response.body).toHaveProperty('version', '0.1.0');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptimeSeconds');
    expect(response.body).toHaveProperty('database');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
