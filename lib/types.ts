export type Role = 'USER' | 'ADMIN' | 'RESTAURANT' | 'CUSTOMER' | 'STUDENT';

export type OrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';

export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'REJECTED';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  image?: string;
  phone: string;
  description?: string;
  address?: string;
  active: boolean;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  passwordHash?: string;
  role: Role;
  status?: UserStatus;
  studentIdImage?: string;
  restaurantId?: string;
  restaurantName?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  createdAt?: string;
}

export interface FoodItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  restaurantId?: string;
  restaurantName?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  foodItemId: string;
  foodName: string;
  foodImage: string;
  categoryName?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  discountPercent?: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  userName: string;
  userPhone: string;
  userRole?: Role;
  restaurantId?: string;
  restaurantName?: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  deliveredAt?: string | null;
  items: OrderItem[];
  totalItemsCount?: number;
  totalAmount?: number;
  discountAmount?: number;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  metadata?: string;
  createdAt: string;
}

export interface AggregatedFoodTotal {
  foodItemId: string;
  foodName: string;
  categoryName: string;
  image: string;
  totalQuantity: number;
  pendingQuantity: number;
  deliveredQuantity: number;
}

export interface ActiveOrderNote {
  orderNumber: number;
  userName: string;
  notes: string;
}

export interface UserRanking {
  userId: string;
  userName: string;
  userPhone: string;
  totalOrders: number;
  totalItems: number;
  rank: number;
  badge: string;
  badgeColor: string;
  isKingOfBreakfast: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalFoodItemsCount: number;
  popularFoods: { name: string; count: number }[];
  ordersPerDay: { date: string; count: number }[];
  deliveryStatusDistribution: { status: string; count: number; label: string }[];
  topActiveUsers: { name: string; orders: number; items: number }[];
}

export interface StudentDiscount {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  discountPercent: number;
  active: boolean;
  createdAt?: string;
}

export interface ProfitStats {
  totalRevenue: number;
  totalOrders: number;
  totalDelivered: number;
  totalCancelled: number;
  netProfit: number;
  platformFeePercent: number;
  revenueByRestaurant: { restaurantName: string; revenue: number; orders: number }[];
  revenueByDay: { date: string; revenue: number }[];
}

export interface PendingStudent {
  id: string;
  name: string;
  phone: string;
  studentIdImage: string;
  createdAt: string;
}
