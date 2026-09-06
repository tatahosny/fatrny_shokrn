const { Pool } = require('@neondatabase/serverless');

// Run a complete check of the database tables and data
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function verifyAll() {
  console.log('--- Starting Complete Neon Database Verification ---');

  // Check Users
  const users = await pool.query('SELECT id, name, phone, role, created_at FROM users ORDER BY created_at DESC');
  console.log(`[PASS] Users count: ${users.rows.length}`);
  console.log('Sample user:', users.rows[0]);

  // Check Categories
  const categories = await pool.query('SELECT id, name, slug FROM categories');
  console.log(`[PASS] Categories count: ${categories.rows.length}`);

  // Check Food Items
  const foods = await pool.query('SELECT id, name, price, available FROM food_items');
  console.log(`[PASS] Food items count: ${foods.rows.length}`);

  // Check Orders
  const orders = await pool.query(`
    SELECT o.id, o.order_number, o.user_name, o.status, COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id, o.order_number, o.user_name, o.status
    ORDER BY o.order_number DESC
  `);
  console.log(`[PASS] Orders count: ${orders.rows.length}`);
  console.log('Sample order:', orders.rows[0]);

  // Check Activity Logs
  const logs = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5');
  console.log(`[PASS] Recent activity logs count: ${logs.rows.length}`);

  // Test inserting a test user and reading it back
  const testPhone = '01099998888';
  await pool.query('DELETE FROM users WHERE phone = $1', [testPhone]);
  const insertUser = await pool.query(`
    INSERT INTO users (id, name, phone, password_hash, role)
    VALUES ('test-user-neon', 'مستخدم تجريبي نيون', $1, 'hash123', 'USER')
    RETURNING id, name, phone, role
  `, [testPhone]);
  console.log('[PASS] Test user created in Neon:', insertUser.rows[0]);

  // Clean up test user
  await pool.query('DELETE FROM users WHERE phone = $1', [testPhone]);
  console.log('[PASS] Test user cleaned up.');

  await pool.end();
  console.log('--- All Neon Database Verifications Successfully Completed! ---');
}

verifyAll().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
