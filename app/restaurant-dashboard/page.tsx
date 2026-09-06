'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RestaurantDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/restaurant');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-stone-500 font-bold text-sm">
        جاري الانتقال للوحة تحكم المطعم...
      </div>
    </div>
  );
}
