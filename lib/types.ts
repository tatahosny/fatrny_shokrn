export type Role = 'USER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  phone: string;
  passwordHash?: string;
  role: Role;
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
}

export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  userName: string;
  userPhone: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  deliveredAt?: string | null;
  items: OrderItem[];
  totalItemsCount?: number;
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
