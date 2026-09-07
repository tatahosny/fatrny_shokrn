const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) databaseUrl = match[1];
  }
}

if (!databaseUrl) {
  databaseUrl = 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';
}

const pool = new Pool({ connectionString: databaseUrl });

async function runMigration() {
  console.log('Running migration for address, location_url, and order status...');
  const client = await pool.connect();
  try {
    // 1. Add address and location_url to orders table
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS location_url TEXT DEFAULT '';
    `);
    console.log('Added address and location_url to orders table');

    // 2. Add address and location_url to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS location_url TEXT DEFAULT '';
    `);
    console.log('Added address and location_url to users table');

    console.log('Migration completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
