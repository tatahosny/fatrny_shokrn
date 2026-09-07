import { Pool } from '@neondatabase/serverless';
import {
  User,
  Category,
  FoodItem,
  Order,
  OrderItem,
  Restaurant,
  ActivityLog,
  AggregatedFoodTotal,
  ActiveOrderNote,
  UserRanking,
  DashboardStats,
  OrderStatus,
} from './types';

// الحفاظ على Pool واحد عبر عمليات إعادة التحميل الساخن في Next.js
declare global {
  // eslint-disable-next-line no-var
  var _neonPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_RrzI9m3yhBEd@ep-cold-heart-ae9v4fsm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool =
  global._neonPool ||
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== 'production') {
  global._neonPool = pool;
}

// دالة مساعدة لتنسيق التواريخ
function toIso(dateVal: unknown): string {
  if (!dateVal) return new Date().toISOString();
  if (dateVal instanceof Date) return dateVal.toISOString();
  return new Date(String(dateVal)).toISOString();
}

export const db = {
  // ================= USERS =================
  async getUsers(): Promise<User[]> {
    const res = await pool.query(`
      SELECT u.id, u.name, u.phone, u.role, u.restaurant_id as "restaurantId", r.name as "restaurantName",
             u.status, u.student_id_image as "studentIdImage", u.address, u.location_url as "locationUrl", u.created_at
      FROM users u
      LEFT JOIN restaurants r ON u.restaurant_id = r.id
      ORDER BY u.created_at DESC
    `);

    return res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      role: row.role,
      status: row.status || 'ACTIVE',
      studentIdImage: row.studentIdImage || undefined,
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      address: row.address || undefined,
      locationUrl: row.locationUrl || undefined,
      createdAt: toIso(row.created_at),
    }));
  },

  async getUserById(id: string): Promise<User | null> {
    const res = await pool.query(
      `SELECT u.id, u.name, u.phone, u.password_hash as "passwordHash", u.role, u.restaurant_id as "restaurantId", r.name as "restaurantName",
              u.status, u.student_id_image as "studentIdImage", u.address, u.location_url as "locationUrl", u.created_at
       FROM users u
       LEFT JOIN restaurants r ON u.restaurant_id = r.id
       WHERE u.id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      passwordHash: row.passwordHash,
      role: row.role,
      status: row.status || 'ACTIVE',
      studentIdImage: row.studentIdImage || undefined,
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      address: row.address || undefined,
      locationUrl: row.locationUrl || undefined,
      createdAt: toIso(row.created_at),
    };
  },

  async getUserByPhone(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim();
    const res = await pool.query(
      `SELECT u.id, u.name, u.phone, u.password_hash as "passwordHash", u.role, u.restaurant_id as "restaurantId", r.name as "restaurantName",
              u.status, u.student_id_image as "studentIdImage", u.address, u.location_url as "locationUrl", u.created_at
       FROM users u
       LEFT JOIN restaurants r ON u.restaurant_id = r.id
       WHERE TRIM(u.phone) = $1`,
      [cleanPhone]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      passwordHash: row.passwordHash,
      role: row.role,
      status: row.status || 'ACTIVE',
      studentIdImage: row.studentIdImage || undefined,
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      address: row.address || undefined,
      locationUrl: row.locationUrl || undefined,
      createdAt: toIso(row.created_at),
    };
  },

  async createUser(userData: {
    name: string;
    phone: string;
    passwordHash: string;
    role?: 'USER' | 'ADMIN' | 'RESTAURANT' | 'CUSTOMER' | 'STUDENT';
    restaurantId?: string;
    studentIdImage?: string;
    status?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'REJECTED';
  }): Promise<User> {
    const cleanPhone = userData.phone.trim();
    const cleanName = userData.name.trim();

    // التحقق من تكرار الهاتف
    const checkRes = await pool.query(
      'SELECT id FROM users WHERE TRIM(phone) = $1',
      [cleanPhone]
    );
    if (checkRes.rows.length > 0) {
      throw new Error('رقم الهاتف مسجل بالفعل مسبقاً');
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const role = userData.role || 'CUSTOMER';
    const status = userData.status || 'ACTIVE';
    const createdAt = new Date().toISOString();

    const insertRes = await pool.query(
      `INSERT INTO users (id, name, phone, password_hash, role, restaurant_id, status, student_id_image, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, phone, role, restaurant_id as "restaurantId", status, student_id_image as "studentIdImage", created_at`,
      [id, cleanName, cleanPhone, userData.passwordHash, role, userData.restaurantId || null, status, userData.studentIdImage || null, createdAt]
    );

    const newUser = insertRes.rows[0];

    // تسجيل النشاط
    await this.logActivity(
      `انضمام مستخدم جديد: ${cleanName} (${role})`,
      id,
      cleanName,
      { role, status }
    );

    return {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status || 'ACTIVE',
      studentIdImage: newUser.studentIdImage || undefined,
      restaurantId: newUser.restaurantId || undefined,
      createdAt: toIso(newUser.created_at),
    };
  },

  async updateUser(id: string, updates: Record<string, unknown>): Promise<void> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      setClauses.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }
    if (updates.passwordHash !== undefined) {
      setClauses.push(`password_hash = $${paramIndex++}`);
      values.push(updates.passwordHash);
    }
    if (updates.role !== undefined) {
      setClauses.push(`role = $${paramIndex++}`);
      values.push(updates.role);
    }
    if (updates.restaurantId !== undefined) {
      setClauses.push(`restaurant_id = $${paramIndex++}`);
      values.push(updates.restaurantId);
    }
    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.studentIdImage !== undefined) {
      setClauses.push(`student_id_image = $${paramIndex++}`);
      values.push(updates.studentIdImage);
    }

    if (setClauses.length === 0) return;

    values.push(id);
    await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  },

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) return;

    // إذا كان حساب مطعم، يتم حذف المطعم بالكامل بجميع أصنافه وحساباته
    if (user.restaurantId) {
      await this.deleteRestaurant(user.restaurantId);
      return;
    }

    if (user.role === 'RESTAURANT') {
      const allRests = await this.getRestaurants(false);
      const matchingRest = allRests.find((r) => r.phone === user.phone);
      if (matchingRest) {
        await this.deleteRestaurant(matchingRest.id);
        return;
      }
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  },

  // ================= CATEGORIES =================
  async getCategories(): Promise<Category[]> {
    const res = await pool.query(`
      SELECT id, name, slug, icon, image, created_at
      FROM categories
      ORDER BY name ASC
    `);

    return res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      image: row.image,
      createdAt: toIso(row.created_at),
    }));
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const id = `cat-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const res = await pool.query(
      `INSERT INTO categories (id, name, slug, icon, image, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, slug, icon, image, created_at`,
      [id, cat.name, cat.slug, cat.icon, cat.image, createdAt]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      image: row.image,
      createdAt: toIso(row.created_at),
    };
  },

  // ================= RESTAURANTS =================
  async getRestaurants(activeOnly: boolean = false): Promise<Restaurant[]> {
    const where = activeOnly ? 'WHERE active = TRUE' : '';
    const res = await pool.query(`
      SELECT id, name, slug, image, phone, description, address, active, created_at as "createdAt"
      FROM restaurants
      ${where}
      ORDER BY created_at ASC
    `);
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      image: r.image,
      phone: r.phone,
      description: r.description || '',
      address: r.address || '',
      active: Boolean(r.active),
      createdAt: toIso(r.createdAt),
    }));
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const res = await pool.query(
      `SELECT id, name, slug, image, phone, description, address, active, created_at as "createdAt"
       FROM restaurants
       WHERE id = $1 OR slug = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      image: r.image,
      phone: r.phone,
      description: r.description || '',
      address: r.address || '',
      active: Boolean(r.active),
      createdAt: toIso(r.createdAt),
    };
  },

  async getRestaurantFoodCounts(): Promise<Record<string, number>> {
    const res = await pool.query(`
      SELECT restaurant_id as "restaurantId", count(*)::int as count
      FROM food_items
      WHERE restaurant_id IS NOT NULL
      GROUP BY restaurant_id
    `);
    const counts: Record<string, number> = {};
    for (const row of res.rows) {
      if (row.restaurantId) {
        counts[row.restaurantId] = Number(row.count) || 0;
      }
    }
    return counts;
  },

  async createRestaurant(data: Omit<Restaurant, 'id' | 'createdAt'>): Promise<Restaurant> {
    const id = `rest-${Date.now()}`;
    const slug = data.slug || `rest-${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString();
    const res = await pool.query(
      `INSERT INTO restaurants (id, name, slug, image, phone, description, address, active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, slug, image, phone, description, address, active, created_at as "createdAt"`,
      [id, data.name, slug, data.image || '', data.phone || '', data.description || '', data.address || '', data.active !== false, createdAt]
    );
    const r = res.rows[0];
    await this.logActivity(`إضافة مطعم شريك جديد: ${r.name}`);
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      image: r.image,
      phone: r.phone,
      description: r.description || '',
      address: r.address || '',
      active: Boolean(r.active),
      createdAt: toIso(r.createdAt),
    };
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    const existing = await this.getRestaurantById(id);
    if (!existing) return null;
    const name = updates.name ?? existing.name;
    const slug = updates.slug ?? existing.slug;
    const image = updates.image ?? existing.image;
    const phone = updates.phone ?? existing.phone;
    const description = updates.description ?? existing.description;
    const address = updates.address ?? existing.address;
    const active = updates.active !== undefined ? updates.active : existing.active;

    const res = await pool.query(
      `UPDATE restaurants
       SET name = $1, slug = $2, image = $3, phone = $4, description = $5, address = $6, active = $7
       WHERE id = $8
       RETURNING id, name, slug, image, phone, description, address, active, created_at as "createdAt"`,
      [name, slug, image, phone, description, address, active, existing.id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      image: r.image,
      phone: r.phone,
      description: r.description || '',
      address: r.address || '',
      active: Boolean(r.active),
      createdAt: toIso(r.createdAt),
    };
  },

  async deleteRestaurant(id: string): Promise<boolean> {
    const rest = await this.getRestaurantById(id);
    if (!rest) return false;

    // 1. حذف جميع أصناف الطعام التابعة لهذا المطعم
    await pool.query('DELETE FROM food_items WHERE restaurant_id = $1', [id]);

    // 2. حذف أي خصومات طلابية خاصة بهذا المطعم
    try {
      await pool.query('DELETE FROM student_discounts WHERE restaurant_id = $1', [id]);
    } catch {
      // تجاهل إذا كان الجدول غير موجود
    }

    // 3. حذف حسابات المشرفين/المديرين التابعة لهذا المطعم
    await pool.query('DELETE FROM users WHERE restaurant_id = $1', [id]);

    // 4. فك ارتباط الطلبات السابقة بأمان للحفاظ على سجلات الطلبات دون كسر النظام
    try {
      await pool.query('UPDATE orders SET restaurant_id = NULL WHERE restaurant_id = $1', [id]);
    } catch {
      // تجاهل إذا لم يكن العمود موجوداً
    }

    // 5. حذف المطعم نفسه
    const res = await pool.query('DELETE FROM restaurants WHERE id = $1', [id]);

    await this.logActivity(`تم حذف المطعم بالكامل مع جميع أصنافه وحساباته: ${rest.name}`);

    return (res.rowCount ?? 0) > 0;
  },

  // ================= FOOD ITEMS =================
  async getFoodItems(
    categoryIdOrOptions?: string | { categoryId?: string; restaurantId?: string; search?: string },
    searchParam?: string
  ): Promise<FoodItem[]> {
    let categoryId: string | undefined;
    let restaurantId: string | undefined;
    let search: string | undefined = searchParam;

    if (typeof categoryIdOrOptions === 'object' && categoryIdOrOptions !== null) {
      categoryId = categoryIdOrOptions.categoryId;
      restaurantId = categoryIdOrOptions.restaurantId;
      if (categoryIdOrOptions.search) search = categoryIdOrOptions.search;
    } else {
      categoryId = categoryIdOrOptions;
    }

    let query = `
      SELECT id, category_id as "categoryId", category_name as "categoryName",
             restaurant_id as "restaurantId", restaurant_name as "restaurantName",
             name, description, price::float as price, image, available, variants, created_at
      FROM food_items
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (categoryId && categoryId !== 'all') {
      params.push(categoryId);
      query += ` AND category_id = $${params.length}`;
    }

    if (restaurantId && restaurantId !== 'all') {
      params.push(restaurantId);
      query += ` AND restaurant_id = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      const idx = params.length;
      query += ` AND (LOWER(name) LIKE $${idx} OR LOWER(description) LIKE $${idx} OR LOWER(category_name) LIKE $${idx})`;
    }

    query += ` ORDER BY name ASC`;

    const res = await pool.query(query, params);
    return res.rows.map((row) => ({
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.categoryName || '',
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      name: row.name,
      description: row.description || '',
      price: Number(row.price) || 0,
      image: row.image,
      available: Boolean(row.available),
      variants: Array.isArray(row.variants) ? row.variants : undefined,
      createdAt: toIso(row.created_at),
    }));
  },

  async getFoodItemById(id: string): Promise<FoodItem | null> {
    const res = await pool.query(
      `SELECT id, category_id as "categoryId", category_name as "categoryName",
              restaurant_id as "restaurantId", restaurant_name as "restaurantName",
              name, description, price::float as price, image, available, variants, created_at
       FROM food_items
       WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.categoryName || '',
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      name: row.name,
      description: row.description || '',
      price: Number(row.price) || 0,
      image: row.image,
      available: Boolean(row.available),
      variants: Array.isArray(row.variants) ? row.variants : undefined,
      createdAt: toIso(row.created_at),
    };
  },

  async createFoodItem(item: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    const id = `food-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // جلب اسم التصنيف إذا لم يكن متوفراً
    let categoryName = item.categoryName || '';
    if (!categoryName) {
      const catRes = await pool.query('SELECT name FROM categories WHERE id = $1', [item.categoryId]);
      if (catRes.rows.length > 0) {
        categoryName = catRes.rows[0].name;
      }
    }

    // جلب اسم المطعم إذا تم تمرير معرف المطعم
    let restaurantName = item.restaurantName || '';
    if (item.restaurantId && !restaurantName) {
      const restRes = await pool.query('SELECT name FROM restaurants WHERE id = $1', [item.restaurantId]);
      if (restRes.rows.length > 0) {
        restaurantName = restRes.rows[0].name;
      }
    }

    const res = await pool.query(
      `INSERT INTO food_items (id, category_id, category_name, restaurant_id, restaurant_name, name, description, price, image, available, variants, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, category_id as "categoryId", category_name as "categoryName",
                 restaurant_id as "restaurantId", restaurant_name as "restaurantName",
                 name, description, price::float as price, image, available, variants, created_at`,
      [
        id,
        item.categoryId,
        categoryName,
        item.restaurantId || null,
        restaurantName || null,
        item.name,
        item.description || '',
        item.price || 0,
        item.image,
        item.available !== false,
        item.variants ? JSON.stringify(item.variants) : null,
        createdAt,
      ]
    );

    const row = res.rows[0];

    await this.logActivity(`إضافة صنف طعام جديد: ${row.name}`, undefined, undefined, {
      price: row.price,
    });

    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      image: row.image,
      available: Boolean(row.available),
      variants: Array.isArray(row.variants) ? row.variants : undefined,
      createdAt: toIso(row.created_at),
    };
  },

  async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<FoodItem | null> {
    // التحقق من وجود الصنف
    const existing = await this.getFoodItemById(id);
    if (!existing) return null;

    let newCategoryName = existing.categoryName;
    if (updates.categoryId && updates.categoryId !== existing.categoryId) {
      const catRes = await pool.query('SELECT name FROM categories WHERE id = $1', [updates.categoryId]);
      if (catRes.rows.length > 0) {
        newCategoryName = catRes.rows[0].name;
      }
    } else if (updates.categoryName) {
      newCategoryName = updates.categoryName;
    }

    let newRestaurantName = existing.restaurantName;
    if (updates.restaurantId && updates.restaurantId !== existing.restaurantId) {
      const restRes = await pool.query('SELECT name FROM restaurants WHERE id = $1', [updates.restaurantId]);
      if (restRes.rows.length > 0) {
        newRestaurantName = restRes.rows[0].name;
      }
    } else if (updates.restaurantName) {
      newRestaurantName = updates.restaurantName;
    }

    const updated = {
      categoryId: updates.categoryId !== undefined ? updates.categoryId : existing.categoryId,
      categoryName: newCategoryName,
      restaurantId: updates.restaurantId !== undefined ? updates.restaurantId : existing.restaurantId,
      restaurantName: newRestaurantName,
      name: updates.name !== undefined ? updates.name : existing.name,
      description: updates.description !== undefined ? updates.description : existing.description,
      price: updates.price !== undefined ? updates.price : existing.price,
      image: updates.image !== undefined ? updates.image : existing.image,
      available: updates.available !== undefined ? updates.available : existing.available,
      variants: updates.variants !== undefined ? updates.variants : existing.variants,
    };

    const res = await pool.query(
      `UPDATE food_items
       SET category_id = $1, category_name = $2, restaurant_id = $3, restaurant_name = $4,
           name = $5, description = $6, price = $7, image = $8, available = $9, variants = $10
       WHERE id = $11
       RETURNING id, category_id as "categoryId", category_name as "categoryName",
                 restaurant_id as "restaurantId", restaurant_name as "restaurantName",
                 name, description, price::float as price, image, available, variants, created_at`,
      [
        updated.categoryId,
        updated.categoryName,
        updated.restaurantId || null,
        updated.restaurantName || null,
        updated.name,
        updated.description,
        updated.price,
        updated.image,
        updated.available,
        updated.variants ? JSON.stringify(updated.variants) : null,
        id,
      ]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      image: row.image,
      available: Boolean(row.available),
      variants: Array.isArray(row.variants) ? row.variants : undefined,
      createdAt: toIso(row.created_at),
    };
  },

  async deleteFoodItem(id: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM food_items WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  },

  // ================= ORDERS =================
  async getOrders(options?: {
    status?: OrderStatus | 'ALL';
    search?: string;
    userId?: string;
    restaurantId?: string;
    todayOnly?: boolean;
  }): Promise<Order[]> {
    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (options?.userId) {
      params.push(options.userId);
      whereClause += ` AND o.user_id = $${params.length}`;
    }

    if (options?.restaurantId && options.restaurantId !== 'ALL') {
      params.push(options.restaurantId);
      whereClause += ` AND o.restaurant_id = $${params.length}`;
    }

    if (options?.status && options.status !== 'ALL') {
      params.push(options.status);
      whereClause += ` AND o.status = $${params.length}`;
    }

    if (options?.todayOnly) {
      whereClause += ` AND DATE(o.created_at AT TIME ZONE 'UTC') = CURRENT_DATE`;
    }

    if (options?.search && options.search.trim() !== '') {
      params.push(`%${options.search.trim().toLowerCase()}%`);
      const idx = params.length;
      whereClause += ` AND (LOWER(o.user_name) LIKE $${idx} OR o.user_phone LIKE $${idx} OR CAST(o.order_number AS TEXT) LIKE $${idx} OR LOWER(o.notes) LIKE $${idx} OR LOWER(o.restaurant_name) LIKE $${idx})`;
    }

    const query = `
      SELECT 
        o.id,
        o.order_number as "orderNumber",
        o.user_id as "userId",
        o.user_name as "userName",
        o.user_phone as "userPhone",
        o.user_role as "userRole",
        o.restaurant_id as "restaurantId",
        o.restaurant_name as "restaurantName",
        o.status,
        o.notes,
        o.address,
        o.location_url as "locationUrl",
        o.total_amount::float as "totalAmount",
        o.discount_amount::float as "discountAmount",
        o.created_at as "createdAt",
        o.delivered_at as "deliveredAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'orderId', oi.order_id,
              'foodItemId', oi.food_item_id,
              'foodName', oi.food_name,
              'foodImage', oi.food_image,
              'categoryName', oi.category_name,
              'quantity', oi.quantity,
              'price', oi.price::float,
              'unitPrice', oi.unit_price::float,
              'discountPercent', oi.discount_percent,
              'notes', COALESCE(oi.notes, '')
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const res = await pool.query(query, params);

    return res.rows.map((row) => {
      const items: OrderItem[] = Array.isArray(row.items) ? row.items : [];
      return {
        id: row.id,
        orderNumber: Number(row.orderNumber),
        userId: row.userId,
        userName: row.userName,
        userPhone: row.userPhone,
        userRole: row.userRole || undefined,
        restaurantId: row.restaurantId || undefined,
        restaurantName: row.restaurantName || undefined,
        status: row.status as OrderStatus,
        notes: row.notes || '',
        address: row.address || '',
        locationUrl: row.locationUrl || '',
        totalAmount: row.totalAmount !== null ? Number(row.totalAmount) : undefined,
        discountAmount: row.discountAmount !== null ? Number(row.discountAmount) : 0,
        createdAt: toIso(row.createdAt),
        deliveredAt: row.deliveredAt ? toIso(row.deliveredAt) : null,
        items,
        totalItemsCount: items.reduce((sum: number, it: OrderItem) => sum + (it.quantity || 0), 0),
      };
    });
  },

  async getOrderById(id: string): Promise<Order | null> {
    const res = await pool.query(
      `SELECT 
        o.id,
        o.order_number as "orderNumber",
        o.user_id as "userId",
        o.user_name as "userName",
        o.user_phone as "userPhone",
        o.user_role as "userRole",
        o.restaurant_id as "restaurantId",
        o.restaurant_name as "restaurantName",
        o.status,
        o.notes,
        o.address,
        o.location_url as "locationUrl",
        o.total_amount::float as "totalAmount",
        o.discount_amount::float as "discountAmount",
        o.created_at as "createdAt",
        o.delivered_at as "deliveredAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'orderId', oi.order_id,
              'foodItemId', oi.food_item_id,
              'foodName', oi.food_name,
              'foodImage', oi.food_image,
              'categoryName', oi.category_name,
              'quantity', oi.quantity,
              'price', oi.price::float,
              'unitPrice', oi.unit_price::float,
              'discountPercent', oi.discount_percent,
              'notes', COALESCE(oi.notes, '')
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const items: OrderItem[] = Array.isArray(row.items) ? row.items : [];

    return {
      id: row.id,
      orderNumber: Number(row.orderNumber),
      userId: row.userId,
      userName: row.userName,
      userPhone: row.userPhone,
      userRole: row.userRole || undefined,
      restaurantId: row.restaurantId || undefined,
      restaurantName: row.restaurantName || undefined,
      status: row.status as OrderStatus,
      notes: row.notes || '',
      address: row.address || '',
      locationUrl: row.locationUrl || '',
      totalAmount: row.totalAmount !== null ? Number(row.totalAmount) : undefined,
      discountAmount: row.discountAmount !== null ? Number(row.discountAmount) : 0,
      createdAt: toIso(row.createdAt),
      deliveredAt: row.deliveredAt ? toIso(row.deliveredAt) : null,
      items,
      totalItemsCount: items.reduce((sum: number, it: OrderItem) => sum + (it.quantity || 0), 0),
    };
  },

  async createOrder(params: {
    userId: string;
    userName: string;
    userPhone: string;
    restaurantId?: string;
    restaurantName?: string;
    notes?: string;
    address?: string;
    locationUrl?: string;
    items: { foodItemId: string; quantity: number; notes?: string }[];
  }): Promise<Order> {
    if (!params.items || params.items.length === 0) {
      throw new Error('السلة فارغة، يرجى إضافة أصناف للطلب');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // تحديد رقم الطلب التالي
      const seqRes = await client.query(`
        INSERT INTO system_settings (key, value)
        VALUES ('next_order_number', '112')
        ON CONFLICT (key) DO UPDATE
        SET value = (system_settings.value::int + 1)::text
        RETURNING value::int as next_num
      `);
      const orderNumber: number = seqRes.rows[0]?.next_num || Date.now() % 100000;
      const orderId = `order-${orderNumber}`;
      const createdAt = new Date().toISOString();

      // جلب معلومات الأطعمة المطلوبة لإنشاء order_items والدمج الذكي للملاحظات
      const foodItemIds = params.items.map((it) => it.foodItemId);
      const foodsRes = await client.query(
        'SELECT id, name, image, category_name, restaurant_id, restaurant_name, price::float as price FROM food_items WHERE id = ANY($1)',
        [foodItemIds]
      );
      const foodMap = new Map(foodsRes.rows.map((f) => [f.id, f]));

      // تحديد المطعم المرتبط بالطلب
      let restaurantId = params.restaurantId;
      let restaurantName = params.restaurantName;

      if (!restaurantId && foodsRes.rows.length > 0) {
        const firstWithRest = foodsRes.rows.find((f) => f.restaurant_id);
        if (firstWithRest) {
          restaurantId = firstWithRest.restaurant_id;
          restaurantName = firstWithRest.restaurant_name;
        }
      }

      if (restaurantId && !restaurantName) {
        const restRes = await client.query('SELECT name FROM restaurants WHERE id = $1', [restaurantId]);
        if (restRes.rows.length > 0) {
          restaurantName = restRes.rows[0].name;
        }
      }

      // تجميع ملاحظات الوجبات الخاصة لظهورها في ملخص الطلب والتحضير
      const itemNotesList = params.items
        .filter((it) => it.notes && it.notes.trim())
        .map((it) => {
          const food = foodMap.get(it.foodItemId);
          return `${food ? food.name : 'صنف'}: ${it.notes!.trim()}`;
        });

      let finalOrderNotes = params.notes?.trim() || '';
      if (itemNotesList.length > 0) {
        const itemNotesStr = itemNotesList.join(' | ');
        if (finalOrderNotes) {
          finalOrderNotes = `${finalOrderNotes} — [ملاحظات الوجبات: ${itemNotesStr}]`;
        } else {
          finalOrderNotes = itemNotesStr;
        }
      }

      // Check user role and status
      const userRes = await client.query('SELECT role, status FROM users WHERE id = $1', [params.userId]);
      const userRole = userRes.rows[0]?.role || 'CUSTOMER';
      const userStatus = userRes.rows[0]?.status || 'ACTIVE';
      const isEligibleStudent = userRole === 'STUDENT' && userStatus === 'ACTIVE';

      // Check if restaurant has active student discount
      let discountPercent = 0;
      if (isEligibleStudent && restaurantId) {
        const discRes = await client.query(
          'SELECT discount_percent FROM student_discounts WHERE restaurant_id = $1 AND active = TRUE LIMIT 1',
          [restaurantId]
        );
        if (discRes.rows.length > 0) {
          discountPercent = Number(discRes.rows[0].discount_percent) || 0;
        }
      }

      const createdOrderItems: OrderItem[] = [];
      const preparedDbItems: {
        id: string;
        foodItemId: string;
        foodName: string;
        foodImage: string;
        categoryName: string;
        quantity: number;
        price: number;
        unitPrice: number;
        discountPercent: number;
        notes: string;
      }[] = [];

      let totalAmount = 0;
      let totalDiscount = 0;

      for (const item of params.items) {
        const food = foodMap.get(item.foodItemId);
        if (food) {
          const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
          const quantity = item.quantity || 1;
          const unitPrice = Number(food.price) || 0;
          const itemDiscountPercent = discountPercent;
          const discountedPrice = itemDiscountPercent > 0 
            ? Math.round(unitPrice * (1 - itemDiscountPercent / 100) * 100) / 100
            : unitPrice;
          const itemTotal = discountedPrice * quantity;
          const itemDiscountAmount = (unitPrice - discountedPrice) * quantity;
          totalAmount += itemTotal;
          totalDiscount += itemDiscountAmount;
          const itemNote = item.notes?.trim() || '';

          preparedDbItems.push({
            id: itemId,
            foodItemId: food.id,
            foodName: food.name,
            foodImage: food.image || '',
            categoryName: food.category_name || '',
            quantity,
            price: discountedPrice,
            unitPrice,
            discountPercent: itemDiscountPercent,
            notes: itemNote,
          });

          createdOrderItems.push({
            id: itemId,
            orderId,
            foodItemId: food.id,
            foodName: food.name,
            foodImage: food.image,
            categoryName: food.category_name,
            quantity,
            price: discountedPrice,
            unitPrice,
            discountPercent: itemDiscountPercent,
            notes: itemNote,
          });
        }
      }

      if (preparedDbItems.length === 0) {
        throw new Error('لم يتم العثور على وجبات صالحة في السلة');
      }

      const orderAddress = params.address?.trim() || '';
      const orderLocationUrl = params.locationUrl?.trim() || '';

      // 1. إنشاء الطلب أولاً في جدول orders (الأب) حتى يتوفر orderId للمفتاح الخارجي
      await client.query(
        `INSERT INTO orders (id, order_number, user_id, user_name, user_phone, restaurant_id, restaurant_name, status, notes, address, location_url, total_amount, discount_amount, user_role, created_at, delivered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9, $10, $11, $12, $13, $14, NULL)`,
        [orderId, orderNumber, params.userId, params.userName, params.userPhone, restaurantId || null, restaurantName || null, finalOrderNotes, orderAddress, orderLocationUrl, totalAmount, totalDiscount, userRole, createdAt]
      );

      // 2. إدراج عناصر الطلب في جدول order_items (الابن) بعد إتمام وجود الطلب في جدول orders
      for (const item of preparedDbItems) {
        await client.query(
          `INSERT INTO order_items (id, order_id, food_item_id, food_name, food_image, category_name, quantity, price, unit_price, discount_percent, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            item.id,
            orderId,
            item.foodItemId,
            item.foodName,
            item.foodImage,
            item.categoryName,
            item.quantity,
            item.price,
            item.unitPrice,
            item.discountPercent,
            item.notes,
          ]
        );
      }

      const totalItemsCount = createdOrderItems.reduce((sum, it) => sum + it.quantity, 0);

      // تسجيل في سجل النشاطات
      const logId = `log-${Date.now()}`;
      await client.query(
        `INSERT INTO activity_logs (id, user_id, user_name, action, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          logId,
          params.userId,
          params.userName,
          `طلب إفطار جديد #${orderNumber} من ${params.userName}${restaurantName ? ` لمطعم ${restaurantName}` : ''}${totalDiscount > 0 ? ` (خصم طلاب ${discountPercent}%)` : ''}`,
          JSON.stringify({ itemsCount: totalItemsCount, orderNumber, restaurantId, restaurantName, totalAmount, totalDiscount, address: orderAddress, locationUrl: orderLocationUrl }),
          createdAt,
        ]
      );

      await client.query('COMMIT');

      return {
        id: orderId,
        orderNumber,
        userId: params.userId,
        userName: params.userName,
        userPhone: params.userPhone,
        userRole,
        restaurantId: restaurantId || undefined,
        restaurantName: restaurantName || undefined,
        status: 'PENDING',
        notes: finalOrderNotes,
        address: orderAddress,
        locationUrl: orderLocationUrl,
        totalAmount,
        discountAmount: totalDiscount,
        createdAt,
        deliveredAt: null,
        items: createdOrderItems,
        totalItemsCount,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    adminName?: string
  ): Promise<Order | null> {
    let deliveredAt: string | null = null;
    if (status === 'DELIVERED') {
      deliveredAt = new Date().toISOString();
    }

    const res = await pool.query(
      `UPDATE orders
       SET status = $1, delivered_at = $2
       WHERE id = $3
       RETURNING id, order_number as "orderNumber", user_name as "userName"`,
      [status, deliveredAt, orderId]
    );

    if (res.rows.length === 0) return null;
    const updatedRow = res.rows[0];

    const statusArabic =
      status === 'DELIVERED'
        ? 'تم التسليم بنجاح'
        : status === 'PREPARING'
        ? 'قيد التجهيز والتحضير بالمطعم'
        : status === 'OUT_FOR_DELIVERY'
        ? 'الطلب في الطريق مع المندوب'
        : status === 'CANCELLED'
        ? 'تم الإلغاء'
        : 'قيد الانتظار';

    await this.logActivity(
      `تحديث حالة الطلب #${updatedRow.orderNumber} لـ ${updatedRow.userName}: [${statusArabic}]`,
      undefined,
      adminName || 'الإدارة',
      { status, deliveredAt, adminName: adminName || 'الإدارة' }
    );

    return this.getOrderById(orderId);
  },

  // ================= AGGREGATED FOOD TOTALS =================
  async getAggregatedFoodTotals(): Promise<{
    pendingTotals: AggregatedFoodTotal[];
    allTotals: AggregatedFoodTotal[];
    totalActiveItemsCount: number;
    totalActiveOrdersCount: number;
    activeNotes: ActiveOrderNote[];
  }> {
    const query = `
      SELECT 
        f.id as "foodItemId",
        f.name as "foodName",
        f.category_name as "categoryName",
        f.image,
        COALESCE(SUM(CASE WHEN o.status != 'CANCELLED' THEN oi.quantity ELSE 0 END), 0)::int as "totalQuantity",
        COALESCE(SUM(CASE WHEN o.status = 'PENDING' THEN oi.quantity ELSE 0 END), 0)::int as "pendingQuantity",
        COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN oi.quantity ELSE 0 END), 0)::int as "deliveredQuantity"
      FROM food_items f
      LEFT JOIN order_items oi ON f.id = oi.food_item_id
      LEFT JOIN orders o ON oi.order_id = o.id
      GROUP BY f.id, f.name, f.category_name, f.image
      ORDER BY "totalQuantity" DESC
    `;

    const res = await pool.query(query);

    const allTotals: AggregatedFoodTotal[] = [];
    const pendingTotals: AggregatedFoodTotal[] = [];
    let totalActiveItemsCount = 0;

    for (const row of res.rows) {
      const item: AggregatedFoodTotal = {
        foodItemId: row.foodItemId,
        foodName: row.foodName,
        categoryName: row.categoryName || '',
        image: row.image,
        totalQuantity: row.totalQuantity,
        pendingQuantity: row.pendingQuantity,
        deliveredQuantity: row.deliveredQuantity,
      };

      if (item.totalQuantity > 0) {
        allTotals.push(item);
      }
      if (item.pendingQuantity > 0) {
        pendingTotals.push(item);
        totalActiveItemsCount += item.pendingQuantity;
      }
    }

    pendingTotals.sort((a, b) => b.pendingQuantity - a.pendingQuantity);

    const pendingOrdersRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM orders WHERE status = 'PENDING'`
    );
    const totalActiveOrdersCount = pendingOrdersRes.rows[0]?.count || 0;

    const activeNotesRes = await pool.query(
      `SELECT order_number as "orderNumber", user_name as "userName", notes 
       FROM orders 
       WHERE status = 'PENDING' AND notes IS NOT NULL AND TRIM(notes) != ''
       ORDER BY order_number ASC`
    );
    const activeNotes: ActiveOrderNote[] = activeNotesRes.rows;

    return {
      pendingTotals,
      allTotals,
      totalActiveItemsCount,
      totalActiveOrdersCount,
      activeNotes,
    };
  },

  // ================= DELIVERY TRACKING =================
  async getDeliveryTracking(): Promise<{
    delivered: Order[];
    pending: Order[];
  }> {
    const orders = await this.getOrders();
    const delivered = orders.filter((o) => o.status === 'DELIVERED');
    const pending = orders.filter((o) => o.status === 'PENDING');
    return { delivered, pending };
  },

  // ================= LEADERBOARD =================
  async getLeaderboard(): Promise<{
    rankings: UserRanking[];
    kingOfBreakfast: UserRanking | null;
    totalOrdersInSystem: number;
    totalItemsInSystem: number;
  }> {
    const users = await this.getUsers();
    const orders = await this.getOrders();

    const userStatsMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        userPhone: string;
        totalOrders: number;
        totalItems: number;
        pizzaCount: number;
        foulCount: number;
      }
    >();

    for (const user of users) {
      // استبعاد كل المشرفين وإدارة المطاعم من القائمة — التنافس للطلاب والعملاء فقط
      const role = String(user.role || '').toUpperCase();
      if (role === 'ADMIN' || role === 'RESTAURANT' || Boolean(user.restaurantId)) continue;
      userStatsMap.set(user.id, {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        totalOrders: 0,
        totalItems: 0,
        pizzaCount: 0,
        foulCount: 0,
      });
    }

    for (const order of orders) {
      if (order.status === 'CANCELLED') continue;

      const stats = userStatsMap.get(order.userId);
      // لو المستخدم مش في الـ map (أدمن أو مطعم) نتخطى طلبه
      if (!stats) continue;

      stats.totalOrders += 1;

      for (const item of order.items) {
        stats.totalItems += item.quantity;
        if (item.foodName.includes('بيتزا') || item.categoryName?.includes('بيتزا')) {
          stats.pizzaCount += item.quantity;
        }
        if (item.foodName.includes('فول') || item.foodName.includes('طعمية')) {
          stats.foulCount += item.quantity;
        }
      }
    }

    // ترتيب وتضمين فقط من لديهم طلب واحد على الأقل
    const sortedList = Array.from(userStatsMap.values())
      .filter((item) => item.totalOrders > 0)
      .sort((a, b) => {
        if (b.totalOrders !== a.totalOrders) {
          return b.totalOrders - a.totalOrders;
        }
        return b.totalItems - a.totalItems;
      });

    const rankings: UserRanking[] = sortedList.map((item, index) => {
      const rank = index + 1;
      let badge = 'عضو نشيط';
      let badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      let isKing = false;

      if (rank === 1 && item.totalOrders > 0) {
        badge = 'ملك الفطار';
        badgeColor = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300';
        isKing = true;
      } else if (item.pizzaCount >= 2) {
        badge = 'عاشق البيتزا';
        badgeColor = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      } else if (item.foulCount >= 4) {
        badge = 'ملك الفول';
        badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      } else if (item.totalOrders >= 2) {
        badge = 'نشيط جداً';
        badgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
      }

      return {
        userId: item.userId,
        userName: item.userName,
        userPhone: item.userPhone,
        totalOrders: item.totalOrders,
        totalItems: item.totalItems,
        rank,
        badge,
        badgeColor,
        isKingOfBreakfast: isKing,
      };
    });

    const nonCancelled = orders.filter((o) => o.status !== 'CANCELLED');
    const totalOrdersInSystem = nonCancelled.length;
    const totalItemsInSystem = nonCancelled.reduce((sum, o) => sum + (o.totalItemsCount || 0), 0);

    return {
      rankings,
      kingOfBreakfast: rankings.length > 0 && rankings[0].totalOrders > 0 ? rankings[0] : null,
      totalOrdersInSystem,
      totalItemsInSystem,
    };
  },

  // ================= ANALYTICS DASHBOARD =================
  async getDashboardStats(): Promise<DashboardStats> {
    const orders = await this.getOrders();
    const users = await this.getUsers();

    const nonCancelledOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalUsers = users.length;
    const totalOrders = nonCancelledOrders.length;
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;

    const totalFoodItemsCount = nonCancelledOrders.reduce(
      (sum, o) => sum + (o.totalItemsCount || 0),
      0
    );

    const foodCounts = new Map<string, number>();
    for (const o of nonCancelledOrders) {
      for (const item of o.items) {
        const curr = foodCounts.get(item.foodName) || 0;
        foodCounts.set(item.foodName, curr + item.quantity);
      }
    }
    const popularFoods = Array.from(foodCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    const deliveryStatusDistribution = [
      { status: 'DELIVERED', count: deliveredOrders, label: 'تم التسليم' },
      { status: 'PENDING', count: pendingOrders, label: 'قيد الانتظار' },
      { status: 'CANCELLED', count: cancelledOrders, label: 'ملغي' },
    ];

    const daysMap = new Map<string, number>();
    for (const o of nonCancelledOrders) {
      const datePart = o.createdAt.split('T')[0];
      daysMap.set(datePart, (daysMap.get(datePart) || 0) + 1);
    }
    const ordersPerDay = Array.from(daysMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const userMap = new Map<string, { name: string; orders: number; items: number }>();
    for (const o of nonCancelledOrders) {
      const curr = userMap.get(o.userName) || { name: o.userName, orders: 0, items: 0 };
      curr.orders += 1;
      curr.items += o.totalItemsCount || 0;
      userMap.set(o.userName, curr);
    }
    const topActiveUsers = Array.from(userMap.values())
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 6);

    return {
      totalUsers,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalFoodItemsCount,
      popularFoods,
      ordersPerDay,
      deliveryStatusDistribution,
      topActiveUsers,
    };
  },

  // ================= ACTIVITY LOGS =================
  async getActivityLogs(limit = 20): Promise<ActivityLog[]> {
    const res = await pool.query(
      `SELECT id, user_id as "userId", user_name as "userName", action, metadata, created_at as "createdAt"
       FROM activity_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return res.rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      userName: row.userName,
      action: row.action,
      metadata: row.metadata,
      createdAt: toIso(row.createdAt),
    }));
  },

  async logActivity(
    action: string,
    userId?: string,
    userName?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const id = `log-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const metadataStr = metadata ? JSON.stringify(metadata) : null;

    try {
      await pool.query(
        `INSERT INTO activity_logs (id, user_id, user_name, action, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, userId || null, userName || null, action, metadataStr, createdAt]
      );
    } catch (err) {
      console.error('Error logging activity to Neon:', err);
    }
  },

  // ================= STUDENT DISCOUNTS =================
  async getStudentDiscounts(restaurantId?: string): Promise<import('./types').StudentDiscount[]> {
    let query = `
      SELECT sd.id, sd.restaurant_id as "restaurantId", r.name as "restaurantName",
             sd.discount_percent as "discountPercent", sd.active, sd.created_at as "createdAt"
      FROM student_discounts sd
      LEFT JOIN restaurants r ON sd.restaurant_id = r.id
    `;
    const params: unknown[] = [];
    if (restaurantId) {
      query += ` WHERE sd.restaurant_id = $1`;
      params.push(restaurantId);
    }
    query += ` ORDER BY sd.created_at DESC`;
    const res = await pool.query(query, params);
    return res.rows.map((row) => ({
      id: row.id,
      restaurantId: row.restaurantId,
      restaurantName: row.restaurantName || '',
      discountPercent: row.discountPercent,
      active: Boolean(row.active),
      createdAt: toIso(row.createdAt),
    }));
  },

  async getActiveStudentDiscount(restaurantId: string): Promise<import('./types').StudentDiscount | null> {
    const res = await pool.query(
      `SELECT sd.id, sd.restaurant_id as "restaurantId", r.name as "restaurantName",
              sd.discount_percent as "discountPercent", sd.active, sd.created_at as "createdAt"
       FROM student_discounts sd
       LEFT JOIN restaurants r ON sd.restaurant_id = r.id
       WHERE sd.restaurant_id = $1 AND sd.active = TRUE
       LIMIT 1`,
      [restaurantId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      restaurantName: row.restaurantName || '',
      discountPercent: row.discountPercent,
      active: Boolean(row.active),
      createdAt: toIso(row.createdAt),
    };
  },

  async upsertStudentDiscount(restaurantId: string, discountPercent: number, active: boolean): Promise<import('./types').StudentDiscount> {
    // Check if exists
    const existing = await pool.query(
      `SELECT id FROM student_discounts WHERE restaurant_id = $1`,
      [restaurantId]
    );

    let res;
    if (existing.rows.length > 0) {
      res = await pool.query(
        `UPDATE student_discounts SET discount_percent = $1, active = $2 WHERE restaurant_id = $3
         RETURNING id, restaurant_id as "restaurantId", discount_percent as "discountPercent", active, created_at as "createdAt"`,
        [discountPercent, active, restaurantId]
      );
    } else {
      const id = `disc-${Date.now()}`;
      res = await pool.query(
        `INSERT INTO student_discounts (id, restaurant_id, discount_percent, active)
         VALUES ($1, $2, $3, $4)
         RETURNING id, restaurant_id as "restaurantId", discount_percent as "discountPercent", active, created_at as "createdAt"`,
        [id, restaurantId, discountPercent, active]
      );
    }

    const row = res.rows[0];
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      discountPercent: row.discountPercent,
      active: Boolean(row.active),
      createdAt: toIso(row.createdAt),
    };
  },

  // ================= PENDING STUDENTS =================
  async getPendingStudents(): Promise<import('./types').PendingStudent[]> {
    const res = await pool.query(
      `SELECT id, name, phone, student_id_image as "studentIdImage", created_at as "createdAt"
       FROM users
       WHERE role = 'STUDENT' AND status = 'PENDING_VERIFICATION'
       ORDER BY created_at ASC`
    );
    return res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      studentIdImage: row.studentIdImage || '',
      createdAt: toIso(row.createdAt),
    }));
  },

  async approveStudent(userId: string): Promise<void> {
    await pool.query(
      `UPDATE users SET status = 'ACTIVE' WHERE id = $1 AND role = 'STUDENT'`,
      [userId]
    );
    await this.logActivity(`تم قبول حساب طالب`, undefined, 'الإدارة', { userId });
  },

  async rejectStudent(userId: string): Promise<void> {
    await pool.query(
      `UPDATE users SET status = 'REJECTED' WHERE id = $1 AND role = 'STUDENT'`,
      [userId]
    );
    await this.logActivity(`تم رفض حساب طالب`, undefined, 'الإدارة', { userId });
  },

  // ================= PROFIT STATS =================
  async getProfitStats(): Promise<import('./types').ProfitStats> {
    const PLATFORM_FEE_PERCENT = 10; // 10% صافي ربح المنصة

    // Total revenue from delivered orders
    const revenueRes = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'DELIVERED') as delivered,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'DELIVERED'), 0) as total_revenue
       FROM orders`
    );
    const stats = revenueRes.rows[0];
    const totalRevenue = parseFloat(stats.total_revenue) || 0;
    const netProfit = totalRevenue * (PLATFORM_FEE_PERCENT / 100);

    // Revenue by restaurant
    const byRestaurantRes = await pool.query(
      `SELECT 
        COALESCE(restaurant_name, 'غير محدد') as name,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM orders
       WHERE status = 'DELIVERED'
       GROUP BY restaurant_name
       ORDER BY revenue DESC`
    );

    // Revenue by day (last 30 days)
    const byDayRes = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM orders
       WHERE status = 'DELIVERED' AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    return {
      totalRevenue,
      totalOrders: parseInt(stats.total_orders) || 0,
      totalDelivered: parseInt(stats.delivered) || 0,
      totalCancelled: parseInt(stats.cancelled) || 0,
      netProfit,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      revenueByRestaurant: byRestaurantRes.rows.map((r) => ({
        restaurantName: r.name,
        revenue: parseFloat(r.revenue) || 0,
        orders: parseInt(r.orders) || 0,
      })),
      revenueByDay: byDayRes.rows.map((r) => ({
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
        revenue: parseFloat(r.revenue) || 0,
      })),
    };
  },

  // ================= USER STATUS UPDATE =================
  async updateUserStatus(id: string, status: import('./types').UserStatus): Promise<void> {
    await pool.query(`UPDATE users SET status = $1 WHERE id = $2`, [status, id]);
  },
};

