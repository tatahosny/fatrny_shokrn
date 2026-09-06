const { Pool } = require('@neondatabase/serverless');
const path = require('path');
const fs = require('fs');
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) databaseUrl = match[1];
  }
}
const connectionString = databaseUrl || 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString });

async function migrate() {
  console.log('Migrating order_items table to include notes...');
  await pool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';");
  console.log('Done! Column "notes" added or already present.');

  // Check columns of order_items
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'order_items';
  `);
  console.log('Columns in order_items:', res.rows.map(r => r.column_name));
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  pool.end();
});
