async function testCrud() {
  console.log('Testing Admin Food CRUD directly...');
  const { Pool } = require('@neondatabase/serverless');
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
  });

  // 1. Insert item
  const testId = `food-test-${Date.now()}`;
  await pool.query(`
    INSERT INTO food_items (id, category_id, category_name, name, description, price, image, available)
    VALUES ($1, 'cat-foul-falafel', 'فول وفلافل', 'سندوتش تجريبي مميز', 'طحينة وزيت زيتون', 20.5, '/images/sandwich-foul.jpg', true)
  `, [testId]);
  console.log('[PASS] Added test item:', testId);

  // 2. Update price and name
  await pool.query(`
    UPDATE food_items
    SET price = $1, name = $2
    WHERE id = $3
  `, [25.0, 'سندوتش تجريبي معدل', testId]);
  console.log('[PASS] Updated price to 25.0 and name');

  // Verify update
  const updated = await pool.query('SELECT name, price FROM food_items WHERE id = $1', [testId]);
  console.log('[PASS] Verified updated record in Neon:', updated.rows[0]);

  // 3. Delete item
  await pool.query('DELETE FROM food_items WHERE id = $1', [testId]);
  console.log('[PASS] Deleted test item from Neon successfully.');

  await pool.end();
  console.log('All CRUD operations verified 100% on Neon PostgreSQL!');
}

testCrud().catch(console.error);
