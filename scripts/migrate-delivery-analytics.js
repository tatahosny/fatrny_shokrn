// scripts/migrate-delivery-analytics.js
// Migration: Add delivery person columns, daily_order_snapshots table, DELIVERY role support
const { Pool } = require('@neondatabase/serverless');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting migration: delivery + analytics...');

    await client.query('BEGIN');

    // 1. Add delivery_person_id and delivery_person_name to orders
    // users.id is VARCHAR(255), not UUID
    await client.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS delivery_person_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS delivery_person_name TEXT DEFAULT '';
    `);
    console.log('✅ orders: added delivery_person_id, delivery_person_name');

    // 2. Create daily_order_snapshots table for cached analytics
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_order_snapshots (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        restaurant_id VARCHAR(255) REFERENCES restaurants(id) ON DELETE CASCADE,
        snapshot_date DATE NOT NULL,
        total_orders INT DEFAULT 0,
        delivered_orders INT DEFAULT 0,
        cancelled_orders INT DEFAULT 0,
        preparing_orders INT DEFAULT 0,
        out_for_delivery_orders INT DEFAULT 0,
        total_revenue DECIMAL(10,2) DEFAULT 0,
        top_items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(restaurant_id, snapshot_date)
      );
    `);
    console.log('✅ Created table: daily_order_snapshots');

    // 3. Index for fast daily queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_snapshots_restaurant_date
        ON daily_order_snapshots(restaurant_id, snapshot_date DESC);
    `);
    console.log('✅ Created index on daily_order_snapshots');

    // 4. Index on orders.delivery_person_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_delivery_person
        ON orders(delivery_person_id)
        WHERE delivery_person_id IS NOT NULL;
    `);
    console.log('✅ Created index on orders.delivery_person_id');

    await client.query('COMMIT');
    console.log('');
    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
