const bcrypt = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function testAuth() {
  const res = await pool.query("SELECT id, name, phone, password_hash, role FROM users WHERE phone = '01000000000'");
  const user = res.rows[0];
  const match = bcrypt.compareSync('admin', user.password_hash);
  console.log('Login Test for 01000000000 with pass "admin":', match ? 'SUCCESS ✓' : 'FAILED ✗');

  const res2 = await pool.query("SELECT id, name, phone, password_hash, role FROM users WHERE phone = '01111111111'");
  const user2 = res2.rows[0];
  const match2 = bcrypt.compareSync('123456', user2.password_hash);
  console.log('Login Test for 01111111111 with pass "123456":', match2 ? 'SUCCESS ✓' : 'FAILED ✗');

  await pool.end();
}

testAuth();
