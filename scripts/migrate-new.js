const { Pool } = require("@neondatabase/serverless");

const DATABASE_URL = "postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({ connectionString: DATABASE_URL });

async function migrate() {
  console.log("Running migrations...");

  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE', ADD COLUMN IF NOT EXISTS student_id_image TEXT");
  console.log("OK: Updated users table");

  await pool.query("CREATE TABLE IF NOT EXISTS student_discounts (id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100), active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW())");
  console.log("OK: Created student_discounts table");

  const updated = await pool.query("UPDATE users SET role = 'CUSTOMER' WHERE role = 'USER'");
  console.log("OK: Updated USER roles to CUSTOMER - rows:", updated.rowCount);

  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2), ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS user_role VARCHAR(20)");
  console.log("OK: Updated orders table");

  await pool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2), ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0");
  console.log("OK: Updated order_items table");

  console.log("All migrations completed!");
  await pool.end();
}

migrate().catch(function(e) { console.error("Migration error:", e.message); process.exit(1); });
