import { Pool } from '@neondatabase/serverless';
import {
  User,
  Category,
  FoodItem,
  Order,
  OrderItem,
  ActivityLog,
  AggregatedFoodTotal,
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
      SELECT id, name, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      role: row.role,
      createdAt: toIso(row.created_at),
    }));
  },

  async getUserById(id: string): Promise<User | null> {
    const res = await pool.query(
      `SELECT id, name, phone, password_hash as "passwordHash", role, created_at
       FROM users
       WHERE id = $1`,
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
      createdAt: toIso(row.created_at),
    };
  },

  async getUserByPhone(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim();
    const res = await pool.query(
      `SELECT id, name, phone, password_hash as "passwordHash", role, created_at
       FROM users
       WHERE TRIM(phone) = $1`,
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
      createdAt: toIso(row.created_at),
    };
  },

  async createUser(userData: {
    name: string;
    phone: string;
    passwordHash: string;
    role?: 'USER' | 'ADMIN';
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
    const role = userData.role || 'USER';
    const createdAt = new Date().toISOString();

    const insertRes = await pool.query(
      `INSERT INTO users (id, name, phone, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, phone, role, created_at`,
      [id, cleanName, cleanPhone, userData.passwordHash, role, createdAt]
    );

    const newUser = insertRes.rows[0];

    // تسجيل النشاط
    await this.logActivity(
      `انضمام مستخدم جديد: ${cleanName}`,
      id,
      cleanName,
      { role }
    );

    return {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
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

    if (setClauses.length === 0) return;

    values.push(id);
    await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  },

  async deleteUser(id: string): Promise<void> {
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

  // ================= FOOD ITEMS =================
  async getFoodItems(categoryId?: string, search?: string): Promise<FoodItem[]> {
    let query = `
      SELECT id, category_id as "categoryId", category_name as "categoryName",
             name, description, price::float as price, image, available, created_at
      FROM food_items
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (categoryId && categoryId !== 'all') {
      params.push(categoryId);
      query += ` AND category_id = $${params.length}`;
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
      name: row.name,
      description: row.description || '',
      price: Number(row.price) || 0,
      image: row.image,
      available: Boolean(row.available),
      createdAt: toIso(row.created_at),
    }));
  },

  async getFoodItemById(id: string): Promise<FoodItem | null> {
    const res = await pool.query(
      `SELECT id, category_id as "categoryId", category_name as "categoryName",
              name, description, price::float as price, image, available, created_at
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
      name: row.name,
      description: row.description || '',
      price: Number(row.price) || 0,
      image: row.image,
      available: Boolean(row.available),
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

    const res = await pool.query(
      `INSERT INTO food_items (id, category_id, category_name, name, description, price, image, available, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, category_id as "categoryId", category_name as "categoryName",
                 name, description, price::float as price, image, available, created_at`,
      [
        id,
        item.categoryId,
        categoryName,
        item.name,
        item.description || '',
        item.price || 0,
        item.image,
        item.available !== false,
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
      name: row.name,
      description: row.description,
      price: Number(row.price),
      image: row.image,
      available: Boolean(row.available),
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

    const updated = {
      categoryId: updates.categoryId !== undefined ? updates.categoryId : existing.categoryId,
      categoryName: newCategoryName,
      name: updates.name !== undefined ? updates.name : existing.name,
      description: updates.description !== undefined ? updates.description : existing.description,
      price: updates.price !== undefined ? updates.price : existing.price,
      image: updates.image !== undefined ? updates.image : existing.image,
      available: updates.available !== undefined ? updates.available : existing.available,
    };

    const res = await pool.query(
      `UPDATE food_items
       SET category_id = $1, category_name = $2, name = $3, description = $4,
           price = $5, image = $6, available = $7
       WHERE id = $8
       RETURNING id, category_id as "categoryId", category_name as "categoryName",
                 name, description, price::float as price, image, available, created_at`,
      [
        updated.categoryId,
        updated.categoryName,
        updated.name,
        updated.description,
        updated.price,
        updated.image,
        updated.available,
        id,
      ]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      image: row.image,
      available: Boolean(row.available),
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
    todayOnly?: boolean;
  }): Promise<Order[]> {
    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (options?.userId) {
      params.push(options.userId);
      whereClause += ` AND o.user_id = $${params.length}`;
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
      whereClause += ` AND (LOWER(o.user_name) LIKE $${idx} OR o.user_phone LIKE $${idx} OR CAST(o.order_number AS TEXT) LIKE $${idx} OR LOWER(o.notes) LIKE $${idx})`;
    }

    const query = `
      SELECT 
        o.id,
        o.order_number as "orderNumber",
        o.user_id as "userId",
        o.user_name as "userName",
        o.user_phone as "userPhone",
        o.status,
        o.notes,
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
              'price', oi.price::float
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
        status: row.status as OrderStatus,
        notes: row.notes || '',
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
        o.status,
        o.notes,
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
              'price', oi.price::float
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
      status: row.status as OrderStatus,
      notes: row.notes || '',
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
    notes?: string;
    items: { foodItemId: string; quantity: number }[];
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

      // إنشاء الطلب في جدول orders
      await client.query(
        `INSERT INTO orders (id, order_number, user_id, user_name, user_phone, status, notes, created_at, delivered_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7, NULL)`,
        [orderId, orderNumber, params.userId, params.userName, params.userPhone, params.notes || '', createdAt]
      );

      // جلب معلومات الأطعمة المطلوبة لإنشاء order_items
      const foodItemIds = params.items.map((it) => it.foodItemId);
      const foodsRes = await client.query(
        'SELECT id, name, image, category_name, price::float as price FROM food_items WHERE id = ANY($1)',
        [foodItemIds]
      );
      const foodMap = new Map(foodsRes.rows.map((f) => [f.id, f]));

      const createdOrderItems: OrderItem[] = [];

      for (const item of params.items) {
        const food = foodMap.get(item.foodItemId);
        if (food) {
          const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
          const quantity = item.quantity || 1;
          const price = Number(food.price) || 0;

          await client.query(
            `INSERT INTO order_items (id, order_id, food_item_id, food_name, food_image, category_name, quantity, price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              itemId,
              orderId,
              food.id,
              food.name,
              food.image || '',
              food.category_name || '',
              quantity,
              price,
            ]
          );

          createdOrderItems.push({
            id: itemId,
            orderId,
            foodItemId: food.id,
            foodName: food.name,
            foodImage: food.image,
            categoryName: food.category_name,
            quantity,
            price,
          });
        }
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
          `طلب إفطار جديد #${orderNumber} من ${params.userName}`,
          JSON.stringify({ itemsCount: totalItemsCount, orderNumber }),
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
        status: 'PENDING',
        notes: params.notes || '',
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

    return {
      pendingTotals,
      allTotals,
      totalActiveItemsCount,
      totalActiveOrdersCount,
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
      if (user.role === 'ADMIN' && user.id === 'user-admin-ahmed') continue;
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

      let stats = userStatsMap.get(order.userId);
      if (!stats) {
        stats = {
          userId: order.userId,
          userName: order.userName,
          userPhone: order.userPhone,
          totalOrders: 0,
          totalItems: 0,
          pizzaCount: 0,
          foulCount: 0,
        };
        userStatsMap.set(order.userId, stats);
      }

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

    const sortedList = Array.from(userStatsMap.values()).sort((a, b) => {
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
};
