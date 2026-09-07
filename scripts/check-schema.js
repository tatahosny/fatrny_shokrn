// check schema
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function check() {
  const res = await pool.query(`
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);
  console.log('=== users table columns ===');
  for (const row of res.rows) {
    console.log(`  ${row.column_name}: ${row.data_type}${row.character_maximum_length ? '(' + row.character_maximum_length + ')' : ''}`);
  }

  const res2 = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'orders'
    ORDER BY ordinal_position
  `);
  console.log('\n=== orders table columns ===');
  for (const row of res2.rows) {
    console.log(`  ${row.column_name}: ${row.data_type}`);
  }

  await pool.end();
}

check().catch(e => { console.error(e.message); process.exit(1); });
