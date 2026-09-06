const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function runTests() {
  console.log('Testing Neon queries...');

  // 1. Users
  const usersRes = await pool.query('SELECT id, name, phone, role FROM users LIMIT 5');
  console.log('Users sample:', usersRes.rows);

  // 2. Categories
  const catRes = await pool.query('SELECT id, name, slug FROM categories');
  console.log('Categories count:', catRes.rowCount);

  // 3. Orders with json_agg items
  const ordersRes = await pool.query(`
    SELECT 
      o.id,
      o.order_number as "orderNumber",
      o.user_name as "userName",
      o.status,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'foodName', oi.food_name,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    LIMIT 3
  `);
  console.log('Orders with items sample:', JSON.stringify(ordersRes.rows, null, 2));

  // 4. Aggregated food totals
  const totalsRes = await pool.query(`
    SELECT 
      f.id as "foodItemId",
      f.name as "foodName",
      COALESCE(SUM(CASE WHEN o.status != 'CANCELLED' THEN oi.quantity ELSE 0 END), 0)::int as "totalQuantity",
      COALESCE(SUM(CASE WHEN o.status = 'PENDING' THEN oi.quantity ELSE 0 END), 0)::int as "pendingQuantity",
      COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN oi.quantity ELSE 0 END), 0)::int as "deliveredQuantity"
    FROM food_items f
    LEFT JOIN order_items oi ON f.id = oi.food_item_id
    LEFT JOIN orders o ON oi.order_id = o.id
    GROUP BY f.id, f.name
    ORDER BY "totalQuantity" DESC
    LIMIT 5
  `);
  console.log('Top aggregated food totals:', totalsRes.rows);

  await pool.end();
  console.log('All test queries passed successfully!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
