const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) databaseUrl = match[1];
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function migrate() {
  console.log('Starting Restaurants & Roles Migration on Neon PostgreSQL...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create restaurants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image TEXT NOT NULL,
        phone VARCHAR(50) NOT NULL,
        description TEXT DEFAULT '',
        address TEXT DEFAULT '',
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('[PASS] Created restaurants table if not exists.');

    // 2. Alter users table for restaurant_id
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS restaurant_id VARCHAR(255);
    `);
    console.log('[PASS] Added restaurant_id column to users table.');

    // 3. Alter orders table for restaurant_id and restaurant_name
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_name VARCHAR(255);
    `);
    console.log('[PASS] Added restaurant_id & restaurant_name columns to orders table.');

    // 4. Alter food_items table for restaurant_id and restaurant_name
    await client.query(`
      ALTER TABLE food_items ADD COLUMN IF NOT EXISTS restaurant_id VARCHAR(255);
      ALTER TABLE food_items ADD COLUMN IF NOT EXISTS restaurant_name VARCHAR(255);
    `);
    console.log('[PASS] Added restaurant_id & restaurant_name columns to food_items table.');

    // 5. Seed default restaurants if table is empty
    const checkRest = await client.query('SELECT COUNT(*) FROM restaurants');
    const restCount = parseInt(checkRest.rows[0].count, 10);

    const defaultRestaurants = [
      {
        id: 'rest-baraka',
        name: 'مطعم البركة (فول وفلافل)',
        slug: 'baraka',
        image: '/images/sandwich-foul.jpg',
        phone: '01020000001',
        description: 'أشهر وأقدم فطور مصري أصيل - فول بالسمنة البلدي، فلافل سخنة مقرمشة وبطاطس سوري',
        address: 'بوابة الجامعة الرئيسية - مجمع المطاعم',
        active: true,
      },
      {
        id: 'rest-sham',
        name: 'مطعم شاورما الشام',
        slug: 'sham',
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
        phone: '01020000002',
        description: 'شاورما سوري على الفحم، تومية أصلية، كريب وبطاطس سوري بالجبنة الموتزاريلا',
        address: 'شارع الخدمات الطلابي - أمام كلية تكنولوجيا الصناعة',
        active: true,
      },
      {
        id: 'rest-sultan',
        name: 'فطائر وبيتزا السلطان',
        slug: 'sultan',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        phone: '01020000003',
        description: 'فطير مشلتت بالسمن البلدي، بيتزا شرقية وإيطالية طازة، وعسل وقشطة فلاحي',
        address: 'المدينة الجامعية - مبنى الأنشطة الطلابية',
        active: true,
      },
    ];

    if (restCount === 0) {
      for (const r of defaultRestaurants) {
        await client.query(
          `INSERT INTO restaurants (id, name, slug, image, phone, description, address, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING;`,
          [r.id, r.name, r.slug, r.image, r.phone, r.description, r.address, r.active]
        );
      }
      console.log('[PASS] Seeded 3 default partner restaurants.');
    }

    // 6. Create Restaurant Staff Accounts for easy testing
    const passwordHash = bcrypt.hashSync('restaurant123', 8);
    const restaurantAccounts = [
      {
        id: 'user-rest-baraka',
        name: 'إدارة مطعم البركة',
        phone: '01020000001',
        restaurant_id: 'rest-baraka',
      },
      {
        id: 'user-rest-sham',
        name: 'إدارة مطعم الشام',
        phone: '01020000002',
        restaurant_id: 'rest-sham',
      },
      {
        id: 'user-rest-sultan',
        name: 'إدارة فطائر السلطان',
        phone: '01020000003',
        restaurant_id: 'rest-sultan',
      },
    ];

    for (const acc of restaurantAccounts) {
      const existUser = await client.query('SELECT id FROM users WHERE phone = $1', [acc.phone]);
      if (existUser.rows.length === 0) {
        await client.query(
          `INSERT INTO users (id, name, phone, password_hash, role, restaurant_id, created_at)
           VALUES ($1, $2, $3, $4, 'RESTAURANT', $5, NOW())`,
          [acc.id, acc.name, acc.phone, passwordHash, acc.restaurant_id]
        );
        console.log(`[PASS] Created restaurant login: ${acc.phone} (password: restaurant123) for ${acc.name}`);
      } else {
        await client.query(
          `UPDATE users SET role = 'RESTAURANT', restaurant_id = $1 WHERE phone = $2`,
          [acc.restaurant_id, acc.phone]
        );
      }
    }

    // 7. Associate existing food items with restaurants if not already assigned
    await client.query(`
      UPDATE food_items 
      SET restaurant_id = 'rest-baraka', restaurant_name = 'مطعم البركة (فول وفلافل)'
      WHERE restaurant_id IS NULL AND (category_id = 'cat-foul-falafel' OR category_id = 'cat-fries' OR category_id = 'cat-cheese' OR category_id = 'cat-eggs');

      UPDATE food_items 
      SET restaurant_id = 'rest-sham', restaurant_name = 'مطعم شاورما الشام'
      WHERE restaurant_id IS NULL AND (category_id = 'cat-shawarma' OR category_id = 'cat-crepe' OR category_id = 'cat-fish');

      UPDATE food_items 
      SET restaurant_id = 'rest-sultan', restaurant_name = 'فطائر وبيتزا السلطان'
      WHERE restaurant_id IS NULL AND (category_id = 'cat-pizza' OR category_id = 'cat-feteer');

      -- Fallback for any remaining unassigned foods
      UPDATE food_items 
      SET restaurant_id = 'rest-baraka', restaurant_name = 'مطعم البركة (فول وفلافل)'
      WHERE restaurant_id IS NULL;
    `);
    console.log('[PASS] Assigned existing food items to respective partner restaurants.');

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
