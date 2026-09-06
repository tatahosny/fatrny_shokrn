const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env file directly if process.env.DATABASE_URL is not set
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) {
      databaseUrl = match[1];
    }
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment or .env file');
  process.exit(1);
}

console.log('Connecting to Neon PostgreSQL...');
const pool = new Pool({ connectionString: databaseUrl });

async function initNeon() {
  const client = await pool.connect();
  try {
    console.log('Connected successfully. Starting database schema creation...');

    // 1. Create Tables
    await client.query(`
      -- جدول المستخدمين
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'USER',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- جدول التصنيفات
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- جدول أصناف الطعام
      CREATE TABLE IF NOT EXISTS food_items (
        id VARCHAR(255) PRIMARY KEY,
        category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        category_name VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        image TEXT NOT NULL,
        available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- جدول الطلبات
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        order_number INTEGER NOT NULL UNIQUE,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_phone VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        delivered_at TIMESTAMPTZ
      );

      -- جدول تفاصيل أصناف كل طلب
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        food_item_id VARCHAR(255) NOT NULL,
        food_name VARCHAR(255) NOT NULL,
        food_image TEXT,
        category_name VARCHAR(255),
        quantity INTEGER NOT NULL DEFAULT 1,
        price NUMERIC(10, 2) NOT NULL DEFAULT 0
      );

      -- جدول سجل النشاطات
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        user_name VARCHAR(255),
        action TEXT NOT NULL,
        metadata TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- جدول إعدادات النظام وتسلسل الأرقام
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- فهارس للبحث والأداء
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_food_items_category_id ON food_items(category_id);
    `);
    console.log('Tables and indexes verified/created successfully.');

    // 2. Load seed/existing data from data/db.json
    const dbJsonPath = path.join(__dirname, '..', 'data', 'db.json');
    if (!fs.existsSync(dbJsonPath)) {
      console.log('No data/db.json file found, skipping seeding.');
      return;
    }

    const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));
    console.log(`Loading data from db.json... (Users: ${dbData.users?.length}, Categories: ${dbData.categories?.length}, Foods: ${dbData.foodItems?.length}, Orders: ${dbData.orders?.length})`);

    // Insert Users
    if (dbData.users && dbData.users.length > 0) {
      console.log(`Seeding ${dbData.users.length} users...`);
      for (const u of dbData.users) {
        await client.query(
          `INSERT INTO users (id, name, phone, password_hash, role, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role`,
          [u.id, u.name, u.phone.trim(), u.passwordHash || '', u.role || 'USER', u.createdAt || new Date().toISOString()]
        );
      }
    }

    // Insert Categories
    if (dbData.categories && dbData.categories.length > 0) {
      console.log(`Seeding ${dbData.categories.length} categories...`);
      for (const c of dbData.categories) {
        await client.query(
          `INSERT INTO categories (id, name, slug, icon, image, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             slug = EXCLUDED.slug,
             icon = EXCLUDED.icon,
             image = EXCLUDED.image`,
          [c.id, c.name, c.slug, c.icon, c.image, c.createdAt || new Date().toISOString()]
        );
      }
    }

    // Insert Food Items
    if (dbData.foodItems && dbData.foodItems.length > 0) {
      console.log(`Seeding ${dbData.foodItems.length} food items...`);
      for (const f of dbData.foodItems) {
        await client.query(
          `INSERT INTO food_items (id, category_id, category_name, name, description, price, image, available, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             category_id = EXCLUDED.category_id,
             category_name = EXCLUDED.category_name,
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
             image = EXCLUDED.image,
             available = EXCLUDED.available`,
          [
            f.id,
            f.categoryId,
            f.categoryName || '',
            f.name,
            f.description || '',
            f.price || 0,
            f.image,
            f.available !== false,
            f.createdAt || new Date().toISOString()
          ]
        );
      }
    }

    // Insert Orders and Order Items
    if (dbData.orders && dbData.orders.length > 0) {
      console.log(`Seeding ${dbData.orders.length} orders...`);
      for (const o of dbData.orders) {
        await client.query(
          `INSERT INTO orders (id, order_number, user_id, user_name, user_phone, status, notes, created_at, delivered_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             notes = EXCLUDED.notes,
             delivered_at = EXCLUDED.delivered_at`,
          [
            o.id,
            o.orderNumber,
            o.userId,
            o.userName,
            o.userPhone,
            o.status,
            o.notes || '',
            o.createdAt,
            o.deliveredAt || null
          ]
        );

        if (o.items && o.items.length > 0) {
          for (const it of o.items) {
            await client.query(
              `INSERT INTO order_items (id, order_id, food_item_id, food_name, food_image, category_name, quantity, price)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (id) DO NOTHING`,
              [
                it.id,
                o.id,
                it.foodItemId,
                it.foodName,
                it.foodImage || '',
                it.categoryName || '',
                it.quantity || 1,
                it.price || 0
              ]
            );
          }
        }
      }
    }

    // Insert Activity Logs
    if (dbData.activityLogs && dbData.activityLogs.length > 0) {
      console.log(`Seeding ${dbData.activityLogs.length} activity logs...`);
      for (const log of dbData.activityLogs) {
        await client.query(
          `INSERT INTO activity_logs (id, user_id, user_name, action, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [log.id, log.userId || null, log.userName || null, log.action, log.metadata || null, log.createdAt || new Date().toISOString()]
        );
      }
    }

    // Next order number
    const nextOrderNum = dbData.nextOrderNumber || 111;
    await client.query(
      `INSERT INTO system_settings (key, value)
       VALUES ('next_order_number', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [nextOrderNum.toString()]
    );

    // Summary counts verification
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    const foodsCount = await client.query('SELECT COUNT(*) FROM food_items');
    const ordersCount = await client.query('SELECT COUNT(*) FROM orders');
    const orderItemsCount = await client.query('SELECT COUNT(*) FROM order_items');
    const logsCount = await client.query('SELECT COUNT(*) FROM activity_logs');

    console.log('\n--- Neon Database Setup Verification ---');
    console.log(`Users: ${usersCount.rows[0].count}`);
    console.log(`Categories: ${categoriesCount.rows[0].count}`);
    console.log(`Food Items: ${foodsCount.rows[0].count}`);
    console.log(`Orders: ${ordersCount.rows[0].count}`);
    console.log(`Order Items: ${orderItemsCount.rows[0].count}`);
    console.log(`Activity Logs: ${logsCount.rows[0].count}`);
    console.log('----------------------------------------\n');
    console.log('Neon Database initialized successfully!');

  } catch (err) {
    console.error('Error during Neon setup:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initNeon().catch(() => process.exit(1));
