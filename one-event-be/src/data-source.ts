import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/one_event_development',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // Enable temporarily to create tables
  logging: true,
  migrationsRun: false, // Disable for now
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
