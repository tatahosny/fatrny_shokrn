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
  databaseUrl =
    'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';
}

const pool = new Pool({ connectionString: databaseUrl });

const RESTAURANT_ID = 'rest-gareemat-akl';
const RESTAURANT_NAME = 'جريمة أكل';
const RESTAURANT_SLUG = 'gareemat-akl';
const RESTAURANT_PHONE = '01050005000';
const RESTAURANT_PASSWORD = 'restaurant123';

// 1. تعريف الأقسام الخمسة المستخرجة من المنيو
const CATEGORIES = [
  {
    id: 'cat-crime-sandwiches',
    name: 'السندوتشات',
    slug: 'crime-sandwiches',
    icon: 'sandwich',
    image: '/images/sandwich-falafel.jpg',
  },
  {
    id: 'cat-crime-basmat',
    name: 'البصمات',
    slug: 'crime-basmat',
    icon: 'fingerprint',
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'cat-crime-drinks',
    name: 'مشروبات',
    slug: 'crime-drinks',
    icon: 'coffee',
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'cat-crime-kilo',
    name: 'اصناف بالكيلو',
    slug: 'crime-kilo',
    icon: 'scale',
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'cat-crime-boxes',
    name: 'بوكسات',
    slug: 'crime-boxes',
    icon: 'package',
    image: '/images/gareemat-akl.jpg',
  },
];

// 2. تعريف جميع الأصناف المستخرجة من المنيو
const FOOD_ITEMS = [
  // ==================== 1. السندوتشات ====================
  {
    id: 'food-ga-zenzana',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'زنزانه (كبده ردة)',
    description: 'كبدة ردة بلدي مقلية على أصولها بالخلطة والبهارات مع الطحينة والسلطة',
    price: 30,
    image: '/images/gareemat-akl.jpg',
    variants: [
      { name: 'عيش فينو', price: 30, isDefault: true },
      { name: 'عيش بلدي', price: 35 },
    ],
  },
  {
    id: 'food-ga-zenzana-eskandarani',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'زنزانه اسكندراني (كبده اسكندراني)',
    description: 'كبدة اسكندراني طازجة بالفلفل الحار ودقة الثوم والليمون والكمون',
    price: 25,
    image: '/images/gareemat-akl.jpg',
    variants: [
      { name: 'عيش فينو', price: 25, isDefault: true },
      { name: 'عيش بلدي', price: 30 },
    ],
  },
  {
    id: 'food-ga-konbola',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'قنبلة (سجق اسكندراني)',
    description: 'سجق بلدي اسكندراني متبل ومحمر مع خلطة جريمة أكل الخاصة',
    price: 25,
    image: '/images/gareemat-akl.jpg',
    variants: [
      { name: 'عيش فينو', price: 25, isDefault: true },
      { name: 'عيش بلدي', price: 30 },
    ],
  },
  {
    id: 'food-ga-klesh',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'كليش (بانيه)',
    description: 'قطع بانيه مقرمشة ذهبية مع صوص التتبيلة المميزة والمخلل',
    price: 55,
    image: '/images/batates-souri.jpg',
    variants: [
      { name: 'عيش فينو', price: 55, isDefault: true },
      { name: 'عيش بلدي', price: 60 },
    ],
  },
  {
    id: 'food-ga-tabanga',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'طبنجة (شاورما)',
    description: 'شاورما لحم/دجاج شهية غنية بالصوصات والتوابل الخاصة في عيش طازج',
    price: 55,
    image: '/images/gareemat-akl.jpg',
    variants: [
      { name: 'عيش فينو', price: 55, isDefault: true },
      { name: 'عيش بلدي', price: 60 },
    ],
  },
  {
    id: 'food-ga-zakhira',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'ذخيرة (مخ)',
    description: 'مخ بانيه طازج مقرمش بالبقسماط والتتبيلة السرية مع سلطة الطحينة',
    price: 60,
    image: '/images/sandwich-falafel.jpg',
    variants: [
      { name: 'عيش فينو', price: 60, isDefault: true },
      { name: 'عيش بلدي', price: 70 },
    ],
  },
  {
    id: 'food-ga-zakhira-haya',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'ذخيرة حية (مشكل مخ + كبدة)',
    description: 'ميكس جبار يجمع قطع المخ البانيه مع الكبدة المحمرة الشهية',
    price: 55,
    image: '/images/gareemat-akl.jpg',
    variants: [
      { name: 'عيش فينو', price: 55, isDefault: true },
      { name: 'عيش بلدي', price: 60 },
    ],
  },
  {
    id: 'food-ga-grenov',
    categoryId: 'cat-crime-sandwiches',
    categoryName: 'السندوتشات',
    name: 'جرينوف (جمبري)',
    description: 'جمبري مقلي ذهبي مقرمش مع صوص التارتار والبهارات البحرية الإسكندراني',
    price: 60,
    image: '/images/batates-souri.jpg',
    variants: [
      { name: 'عيش فينو', price: 60, isDefault: true },
      { name: 'عيش بلدي', price: 70 },
    ],
  },

  // ==================== 2. البصمات (سلطات ومقبلات) ====================
  {
    id: 'food-ga-salata-khadra',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'سلطة خضراء',
    description: 'سلطة بلدي طازجة (طماطم، خيار، بقدونس، جرجير) بتتبيلة الدقة والليمون والخل',
    price: 15,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-ga-salata-tahina',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'سلطة طحينه',
    description: 'طحينة بيضاء خام متبلة بالثوم وعصير الليمون والخل والكمون',
    price: 15,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-ga-salata-kebda',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'سلطة كبدة',
    description: 'سلطة طماطم بالدقة مع صوص وقطع كبدة متبلة ومحمرة',
    price: 15,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-ga-batates-mokhalel',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'بطاطس مخلل',
    description: 'أصابع بطاطس مسلوقة ومخللة بالدقة الحارة والكمون والثوم',
    price: 15,
    image: '/images/batates-souri.jpg',
  },
  {
    id: 'food-ga-tomatem-mokhalel',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'طماطم مخلل',
    description: 'طماطم بلدي مشرحة ومتبلة بدقة الثوم والشطة والليمون والكمون',
    price: 15,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-ga-batenjan-mokhalel',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'باذنجان مخلل',
    description: 'باذنجان مخلل محشو بدقة الثوم والخلطة السرية والخل والليمون',
    price: 15,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-ga-kheyar-mokhalel',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'خيار مخلل',
    description: 'خيار مقرمش مخلل بالثوم والتوابل الأصلية',
    price: 15,
    image: '/images/gebna-tomatem.jpg',
  },
  {
    id: 'food-ga-packet-batates',
    categoryId: 'cat-crime-basmat',
    categoryName: 'البصمات',
    name: 'باكت بطاطس مقلية',
    description: 'باكت بطاطس فارم فريتس مقلية مقرمشة ببهارات جريمة أكل الخاصة',
    price: 20,
    image: '/images/batates-souri.jpg',
  },

  // ==================== 3. مشروبات ====================
  {
    id: 'food-ga-maya',
    categoryId: 'cat-crime-drinks',
    categoryName: 'مشروبات',
    name: 'مياة معدنية',
    description: 'زجاجة مياه معدنية طبيعية نقية ومثلجة',
    price: 10,
    image: '/images/sandwich-foul.jpg',
  },
  {
    id: 'food-ga-vcola',
    categoryId: 'cat-crime-drinks',
    categoryName: 'مشروبات',
    name: 'كانز V كولا',
    description: 'مشروب غازي كانز في كولا مثلج ومنعش',
    price: 25,
    image: '/images/sandwich-foul.jpg',
  },

  // ==================== 4. أصناف بالكيلو ====================
  {
    id: 'food-ga-kilo-zenzana',
    categoryId: 'cat-crime-kilo',
    categoryName: 'اصناف بالكيلو',
    name: 'زنزانة (كبدة)',
    description: 'كبدة بلدي طازجة مقلية بالردة أو اسكندراني بالدقة مع العيش والطحينة والسلطة',
    price: 70,
    image: '/images/gareemat-akl.jpg',
    variants: [
      { name: '1/8 كيلو', price: 70, isDefault: true },
      { name: '1/4 كيلو', price: 140 },
      { name: '1/2 كيلو', price: 280 },
      { name: '3/4 كيلو', price: 420 },
      { name: '1 كيلو', price: 560 },
    ],
  },
  {
    id: 'food-ga-kilo-zakhira',
    categoryId: 'cat-crime-kilo',
    categoryName: 'اصناف بالكيلو',
    name: 'ذخيرة (مخ)',
    description: 'مخ طازج مقرمش بالبقسماط والتتبيلة الخاصة مع العيش والسلطات والطحينة',
    price: 150,
    image: '/images/sandwich-falafel.jpg',
    variants: [
      { name: '1/8 كيلو', price: 150, isDefault: true },
      { name: '1/4 كيلو', price: 290 },
      { name: '1/2 كيلو', price: 560 },
      { name: '3/4 كيلو', price: 870 },
      { name: '1 كيلو', price: 1150 },
    ],
  },
  {
    id: 'food-ga-kilo-grenov',
    categoryId: 'cat-crime-kilo',
    categoryName: 'اصناف بالكيلو',
    name: 'جرينوف (جمبري)',
    description: 'جمبري مقلي ذهبي مقرمش متبل بتتبيلة إسكندراني خاصة مع العيش والصوص',
    price: 150,
    image: '/images/batates-souri.jpg',
    variants: [
      { name: '1/8 كيلو', price: 150, isDefault: true },
      { name: '1/4 كيلو', price: 290 },
      { name: '1/2 كيلو', price: 560 },
      { name: '3/4 كيلو', price: 810 },
      { name: '1 كيلو', price: 1150 },
    ],
  },
  {
    id: 'food-ga-kilo-zakhira-haya',
    categoryId: 'cat-crime-kilo',
    categoryName: 'اصناف بالكيلو',
    name: 'ذخيرة حية (كبدة + مخ)',
    description: 'مشكل كبدة بانيه ومخ مقرمش متبل ومحمر على أصوله مع العيش والطحينة',
    price: 100,
    image: '/images/gareemat-akl.jpg',
    variants: [
      { name: '1/8 كيلو', price: 100, isDefault: true },
      { name: '1/4 كيلو', price: 180 },
      { name: '1/2 كيلو', price: 360 },
      { name: '3/4 كيلو', price: 570 },
      { name: '1 كيلو', price: 710 },
    ],
  },

  // ==================== 5. بوكسات ====================
  {
    id: 'food-ga-box-nagda',
    categoryId: 'cat-crime-boxes',
    categoryName: 'بوكسات',
    name: 'بوكس النجدة',
    description: '4 ساندويتش ( كبده ، سجق ، شاورما ، بانيه ) + بطاطس صغير + 1 كانز',
    price: 199,
    image: '/images/gareemat-akl.jpg',
  },
  {
    id: 'food-ga-combo-gareema',
    categoryId: 'cat-crime-boxes',
    categoryName: 'بوكسات',
    name: 'كومبو الجريمة الكاملة',
    description: '8 ساندويتش ( كبدة ردة ، كبدة اسكندراني ، سجق اسكندراني ، بانيه ، شاورما ، مخ ، مشكل مخ + كبدة ، جمبري )',
    price: 459,
    image: '/images/gareemat-akl.jpg',
  },
];

async function seed() {
  console.log('--- بدء إدخال مطعم جريمة أكل ومنيوه الكامل في قاعدة بيانات Neon ---');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. إنشاء أو تحديث مطعم جريمة أكل
    const checkRest = await client.query('SELECT id, name FROM restaurants WHERE id = $1', [RESTAURANT_ID]);
    if (checkRest.rows.length === 0) {
      console.log('إنشاء سجل مطعم جريمة أكل...');
      await client.query(
        `INSERT INTO restaurants (id, name, slug, image, phone, description, address, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          RESTAURANT_ID,
          RESTAURANT_NAME,
          RESTAURANT_SLUG,
          '/images/gareemat-akl.jpg',
          RESTAURANT_PHONE,
          'أشهى سندوتشات الكبدة، السجق الإسكندراني، الشاورما، المخ والجمبري، بوكسات الجريمة وأصناف بالكيلو',
          'مجمع مطاعم الجامعة والخدمات الطلابية',
          true,
        ]
      );
      console.log('[نجاح] تم إنشاء مطعم جريمة أكل.');
    } else {
      console.log(`مطعم ${RESTAURANT_NAME} مسجل مسبقاً، جاري تحديث بياناته...`);
      await client.query(
        `UPDATE restaurants 
         SET name = $2, slug = $3, image = $4, phone = $5, description = $6, address = $7, active = $8
         WHERE id = $1`,
        [
          RESTAURANT_ID,
          RESTAURANT_NAME,
          RESTAURANT_SLUG,
          '/images/gareemat-akl.jpg',
          RESTAURANT_PHONE,
          'أشهى سندوتشات الكبدة، السجق الإسكندراني، الشاورما، المخ والجمبري، بوكسات الجريمة وأصناف بالكيلو',
          'مجمع مطاعم الجامعة والخدمات الطلابية',
          true,
        ]
      );
    }

    // 2. إنشاء حساب إدارة مطعم جريمة أكل
    const passwordHash = bcrypt.hashSync(RESTAURANT_PASSWORD, 8);
    const checkUser = await client.query('SELECT id FROM users WHERE phone = $1', [RESTAURANT_PHONE]);
    if (checkUser.rows.length === 0) {
      await client.query(
        `INSERT INTO users (id, name, phone, password_hash, role, restaurant_id, status, created_at)
         VALUES ($1, $2, $3, $4, 'RESTAURANT', $5, 'ACTIVE', NOW())`,
        ['user-rest-gareemat-akl', 'إدارة مطعم جريمة أكل', RESTAURANT_PHONE, passwordHash, RESTAURANT_ID]
      );
      console.log(`[نجاح] تم إنشاء حساب إدارة المطعم بنجاح: الهاتف: ${RESTAURANT_PHONE} وكلمة المرور: ${RESTAURANT_PASSWORD}`);
    } else {
      await client.query(
        `UPDATE users 
         SET name = 'إدارة مطعم جريمة أكل', password_hash = $1, role = 'RESTAURANT', restaurant_id = $2, status = 'ACTIVE'
         WHERE phone = $3`,
        [passwordHash, RESTAURANT_ID, RESTAURANT_PHONE]
      );
      console.log(`[نجاح] تم تحديث حساب إدارة المطعم للهاتف ${RESTAURANT_PHONE}`);
    }

    // 3. إدخال الأقسام وتحديثها
    console.log('إدخال الأقسام الخمسة...');
    for (const cat of CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, slug, icon, image)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           icon = EXCLUDED.icon,
           image = EXCLUDED.image`,
        [cat.id, cat.name, cat.slug, cat.icon, cat.image]
      );
    }
    console.log(`[نجاح] تم التأكد من وجود ${CATEGORIES.length} أقسام.`);

    // 4. حذف الأصناف السابقة لمطعم جريمة أكل لضمان عدم التكرار
    await client.query('DELETE FROM food_items WHERE restaurant_id = $1', [RESTAURANT_ID]);
    console.log('تم تنظيف أي أصناف سابقة لمطعم جريمة أكل.');

    // 5. إدخال كافة الأصناف مع الخيارات (Variants)
    console.log(`جاري إدخال ${FOOD_ITEMS.length} صنفاً لمطعم جريمة أكل...`);
    for (const item of FOOD_ITEMS) {
      await client.query(
        `INSERT INTO food_items (id, name, description, price, image, available, restaurant_id, restaurant_name, category_id, category_name, variants)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          item.id,
          item.name,
          item.description,
          item.price,
          item.image,
          true,
          RESTAURANT_ID,
          RESTAURANT_NAME,
          item.categoryId,
          item.categoryName,
          item.variants ? JSON.stringify(item.variants) : null,
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`[نجاح كامل] تم بنجاح إدخال جميع الأصناف (${FOOD_ITEMS.length} صنف) لمطعم جريمة أكل!`);

    // 6. التحقق وقراءة عدد الأصناف
    const countRes = await client.query(
      'SELECT category_name, COUNT(*) as count FROM food_items WHERE restaurant_id = $1 GROUP BY category_name ORDER BY count DESC',
      [RESTAURANT_ID]
    );
    console.log('\nملخص الأصناف المدخلة حسب القسم لمطعم جريمة أكل:');
    console.table(countRes.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('فشل في إدخال بيانات منيو جريمة أكل:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
