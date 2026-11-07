import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = process.env.PORT ?? 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');

  // Set global route prefix
  app.setGlobalPrefix(apiPrefix);

  // Default allowed origins
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://walleta-finance.vercel.app',
  ];

  // Comma-separated frontend URLs from env variable
  const envOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  // Robust CORS configuration supporting default origins, configured FRONTEND_URL, and curl/health-checks
  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (e.g. mobile apps, curl, health checks)
      if (!requestOrigin) {
        return callback(null, true);
      }

      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(requestOrigin);
      if (allowedOrigins.includes(requestOrigin) || isLocalhost) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Listen on 0.0.0.0
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  logger.log(`Autonomous Business Finance Backend is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health Check available at: http://localhost:${port}/${apiPrefix}/health`);
}

await bootstrap();
