import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../config/database.config';

// Migration runner for production deployment
export class MigrationRunner {
  private dataSource: DataSource;

  constructor(private configService: ConfigService) {
    const config = getDatabaseConfig(configService) as any;
    this.dataSource = new DataSource({
      ...config,
      migrationsRun: true,
    });
  }

  async initialize(): Promise<void> {
    console.log('🔄 Connecting to database...');
    await this.dataSource.initialize();
    console.log('✅ Database connection established');
  }

  async runMigrations(): Promise<void> {
    console.log('🔄 Running pending migrations...');
    const migrations = await this.dataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('✅ No pending migrations');
    } else {
      console.log(`✅ Executed ${migrations.length} migrations:`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }
  }

  async createTablesIfNotExist(): Promise<void> {
    console.log('🔄 Checking and creating tables if needed...');
    
    // Only for initial deployment when tables don't exist
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      // Check if tables exist
      const tables = await queryRunner.getTables();
      
      if (tables.length === 0) {
        console.log('📋 No tables found, creating initial schema...');
        await this.dataSource.synchronize();
        console.log('✅ Initial tables created successfully');
      } else {
        console.log(`✅ Found ${tables.length} existing tables`);
        tables.forEach((table) => console.log(`  - ${table.name}`));
      }
    } catch (error) {
      console.error('❌ Error checking/creating tables:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

// CLI script for manual execution
export async function runDatabaseSetup(): Promise<void> {
  const configService = new ConfigService();
  const migrationRunner = new MigrationRunner(configService);

  try {
    await migrationRunner.initialize();
    await migrationRunner.createTablesIfNotExist();
    await migrationRunner.runMigrations();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await migrationRunner.close();
  }
}

// Run if called directly
if (require.main === module) {
  runDatabaseSetup()
    .then(() => {
      console.log('🎉 Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}
