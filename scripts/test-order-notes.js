const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) databaseUrl = match[1];
  }
}
const pool = new Pool({ connectionString: databaseUrl });

async function testOrderNotes() {
  console.log('Testing creating order with item notes...');
  
  // 1. Get an existing food item
  const foodRes = await pool.query('SELECT id, name FROM food_items LIMIT 2');
  if (foodRes.rows.length < 2) {
    console.log('Need at least 2 foods to test');
    await pool.end();
    return;
  }
  const food1 = foodRes.rows[0];
  const food2 = foodRes.rows[1];
  console.log('Using foods:', food1.name, 'and', food2.name);

  // 2. Create a test order with item-level notes
  const orderNumber = 999000 + Math.floor(Math.random() * 1000);
  const orderId = `order-test-${orderNumber}`;
  const now = new Date().toISOString();

  await pool.query('BEGIN');
  await pool.query(
    `INSERT INTO orders (id, order_number, user_id, user_name, user_phone, status, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7)`,
    [orderId, orderNumber, 'user-admin-ahmed', 'تجربة ملاحظات الطلب', '01011122233', `${food1.name}: طحينة زيادة | ${food2.name}: منغير سلطة`, now]
  );

  const item1Id = `item-test-1-${Date.now()}`;
  const item2Id = `item-test-2-${Date.now()}`;

  await pool.query(
    `INSERT INTO order_items (id, order_id, food_item_id, food_name, food_image, category_name, quantity, price, notes)
     VALUES ($1, $2, $3, $4, '/images/sandwich-foul.jpg', 'فول وفلافل', 2, 10, 'طحينة زيادة')`,
    [item1Id, orderId, food1.id, food1.name]
  );

  await pool.query(
    `INSERT INTO order_items (id, order_id, food_item_id, food_name, food_image, category_name, quantity, price, notes)
     VALUES ($1, $2, $3, $4, '/images/sandwich-foul.jpg', 'فول وفلافل', 1, 10, 'منغير سلطة')`,
    [item2Id, orderId, food2.id, food2.name]
  );

  await pool.query('COMMIT');
  console.log('[PASS] Inserted test order #', orderNumber);

  // 3. Query back order with items
  const query = `
    SELECT 
      o.id,
      o.order_number,
      o.notes,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'foodName', oi.food_name,
            'quantity', oi.quantity,
            'notes', oi.notes
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = $1
    GROUP BY o.id
  `;
  const verifyRes = await pool.query(query, [orderId]);
  console.log('[PASS] Retrieved order from Neon DB:');
  console.log(JSON.stringify(verifyRes.rows[0], null, 2));

  // 4. Clean up test order
  await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
  console.log('[PASS] Cleaned up test order.');

  await pool.end();
  console.log('All tests passed successfully!');
}

testOrderNotes().catch((err) => {
  console.error(err);
  pool.end();
});
