import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.getUsers();
    const orders = await db.getOrders();

    // ربط المستخدمين بعدد طلباتهم
    const usersWithStats = users.map((u) => {
      const userOrders = orders.filter((o) => o.userId === u.id);
      return {
        ...u,
        ordersCount: userOrders.length,
        deliveredOrdersCount: userOrders.filter((o) => o.status === 'DELIVERED').length,
        pendingOrdersCount: userOrders.filter((o) => o.status === 'PENDING').length,
      };
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب المستخدمين';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
