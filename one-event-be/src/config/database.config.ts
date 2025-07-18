import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  // If DATABASE_URL is provided, use it
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: !isProduction, // Never synchronize in production
      logging: !isProduction ? ['query', 'error'] : ['error'], // Only log errors in production
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: false, // Disable auto-migrations, run manually
      ssl: isProduction ? { rejectUnauthorized: false } : false, // Enable SSL for production
      extra: isProduction
        ? {
            max: 10, // Maximum number of connections
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          }
        : {},
    };
  }

  // Otherwise, use individual connection parameters
  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USERNAME'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: !isProduction, // Never synchronize in production
    logging: !isProduction ? ['query', 'error'] : ['error'], // Only log errors in production
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false, // Disable auto-migrations, run manually
    ssl: isProduction ? { rejectUnauthorized: false } : false, // Enable SSL for production
    extra: isProduction
      ? {
          max: 10, // Maximum number of connections
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        }
      : {},
  };
};
