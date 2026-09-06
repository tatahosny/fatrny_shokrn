const bcrypt = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  console.log('--- Current Admins in DB ---');
  const adminsRes = await pool.query("SELECT id, name, phone, role, status, created_at FROM users WHERE role = 'ADMIN'");
  console.log(adminsRes.rows);

  // We will create/ensure a clean Super Admin account:
  // Phone: 01000000000 (or custom)
  // Password: admin (and also admin123)
  const phone = '01000000000';
  const name = 'الإدارة العليا - فطرني شكراً';
  const password = 'admin';
  const passwordHash = bcrypt.hashSync(password, 10);

  const check = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
  if (check.rows.length > 0) {
    await pool.query(
      "UPDATE users SET name = $1, password_hash = $2, role = 'ADMIN', status = 'ACTIVE' WHERE phone = $3",
      [name, passwordHash, phone]
    );
    console.log(`Updated existing user ${phone} as Super Admin!`);
  } else {
    const id = `user-admin-${Date.now()}`;
    await pool.query(
      "INSERT INTO users (id, name, phone, password_hash, role, status, created_at) VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE', NOW())",
      [id, name, phone, passwordHash]
    );
    console.log(`Created new Super Admin ${phone}!`);
  }

  // Also ensure a backup/secondary admin:
  // Phone: 01111111111, Pass: 123456
  const phone2 = '01111111111';
  const name2 = 'مشرف النظام الرئيسي';
  const pass2 = '123456';
  const hash2 = bcrypt.hashSync(pass2, 10);
  const check2 = await pool.query("SELECT id FROM users WHERE phone = $1", [phone2]);
  if (check2.rows.length > 0) {
    await pool.query(
      "UPDATE users SET name = $1, password_hash = $2, role = 'ADMIN', status = 'ACTIVE' WHERE phone = $3",
      [name2, hash2, phone2]
    );
  } else {
    const id2 = `user-admin-${Date.now() + 1}`;
    await pool.query(
      "INSERT INTO users (id, name, phone, password_hash, role, status, created_at) VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE', NOW())",
      [id2, name2, phone2, hash2]
    );
  }

  console.log('\n--- Final Admin Users Ready for Login ---');
  const finalRes = await pool.query("SELECT id, name, phone, role, status FROM users WHERE role = 'ADMIN'");
  console.log(finalRes.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
