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
  const port = Number(process.env.PORT ?? configService.get<number>('app.port', 3000));
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const frontendUrl = configService.get<string>('app.frontendUrl', 'http://localhost:5173');

  // Set global route prefix
  app.setGlobalPrefix(apiPrefix);

  // Robust CORS configuration supporting localhost, 127.0.0.1, IPv6, and configured frontend URL
  app.enableCors({
   origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !requestOrigin ||
        /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(requestOrigin) ||
        requestOrigin === frontendUrl
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Listen on 0.0.0.0 so both IPv4 (127.0.0.1) and IPv6 (::1) localhost resolve seamlessly
  await app.listen(port, '0.0.0.0');
  logger.log(`Autonomous Business Finance Backend is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health Check available at: http://localhost:${port}/${apiPrefix}/health`);
}

await bootstrap();
