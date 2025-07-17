import { DataSource } from 'typeorm';
import { CreateInitialTables1719456789000 } from '../migrations/1719456789000-CreateInitialTables';
import { AddLandingPageFields1719456789123 } from '../migrations/1719456789123-AddLandingPageFields';

export async function runMigrations(dataSource: DataSource) {
  console.log('🚀 Starting database migration process...');
  
  try {
    // Check if connection is established
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('✅ Database connection established');
    }

    // Run migrations programmatically
    console.log('📋 Running migrations...');
    
    // Check if migrations table exists, if not create it
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      // Check if migration table exists
      const migrationTableExists = await queryRunner.hasTable('migrations');
      
      if (!migrationTableExists) {
        console.log('📋 Creating migrations table...');
        await queryRunner.query(`
          CREATE TABLE migrations (
            id SERIAL PRIMARY KEY,
            timestamp BIGINT NOT NULL,
            name VARCHAR(255) NOT NULL
          )
        `);
      }

      // Check if users table exists
      const usersTableExists = await queryRunner.hasTable('users');
      
      if (!usersTableExists) {
        console.log('👥 Creating users table...');
        
        // Run the initial migration manually
        const migration1 = new CreateInitialTables1719456789000();
        await migration1.up(queryRunner);
        
        // Record migration
        await queryRunner.query(`
          INSERT INTO migrations (timestamp, name) VALUES ($1, $2)
        `, [1719456789000, 'CreateInitialTables1719456789000']);
        
        console.log('✅ Initial tables created');
      }

      // Check if landing page fields exist
      const landingPageColumnExists = await queryRunner.hasColumn('events', 'landingPageContent');
      
      if (!landingPageColumnExists) {
        console.log('🎨 Adding landing page fields...');
        
        const migration2 = new AddLandingPageFields1719456789123();
        await migration2.up(queryRunner);
        
        // Record migration
        await queryRunner.query(`
          INSERT INTO migrations (timestamp, name) VALUES ($1, $2)
        `, [1719456789123, 'AddLandingPageFields1719456789123']);
        
        console.log('✅ Landing page fields added');
      }

      console.log('🎉 All migrations completed successfully!');
      
    } finally {
      await queryRunner.release();
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
