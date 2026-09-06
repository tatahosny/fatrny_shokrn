const bcrypt = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  const adminHash = bcrypt.hashSync('admin', 10);
  const admin123Hash = bcrypt.hashSync('admin123', 10);
  const defaultHash = bcrypt.hashSync('123456', 10);

  // 1. Super Admin
  await pool.query('UPDATE users SET password_hash = $1, role = $2 WHERE phone = $3', [
    adminHash,
    'ADMIN',
    '01000000000'
  ]);

  // 2. Admin Mostafa
  await pool.query('UPDATE users SET password_hash = $1, role = $2 WHERE phone = $3', [
    admin123Hash,
    'ADMIN',
    '01011112222'
  ]);

  // 3. Admin Ahmed
  await pool.query('UPDATE users SET password_hash = $1, role = $2 WHERE phone = $3', [
    admin123Hash,
    'ADMIN',
    '01033334444'
  ]);

  // Ensure all other users have 123456
  await pool.query('UPDATE users SET password_hash = $1 WHERE role != $2', [
    defaultHash,
    'ADMIN'
  ]);

  // Verification test
  const adminUser = await pool.query('SELECT name, phone, password_hash, role FROM users WHERE phone = $1', ['01000000000']);
  const isValid = bcrypt.compareSync('admin', adminUser.rows[0].password_hash);

  console.log('Admin password update result:', {
    name: adminUser.rows[0].name,
    phone: adminUser.rows[0].phone,
    role: adminUser.rows[0].role,
    passwordMatchesAdmin: isValid
  });

  await pool.end();
}

run().catch(console.error);
