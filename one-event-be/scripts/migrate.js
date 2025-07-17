const { exec } = require('child_process');

console.log('Starting database migration...');

// Run migration using the compiled JavaScript version
exec('npx typeorm migration:run -d dist/data-source.js', (error, stdout, stderr) => {
  if (error) {
    console.error('Migration error:', error);
    console.error('stderr:', stderr);
    process.exit(1);
  }
  
  console.log('Migration output:', stdout);
  console.log('✅ Database migration completed successfully!');
});
