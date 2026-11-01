export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  frontendUrl: string;
  databaseUrl: string;
}

export default (): { app: AppConfig } => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    apiPrefix: process.env.API_PREFIX ?? 'api',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    databaseUrl:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/autonomous_finance_dev?schema=public',
  },
});

