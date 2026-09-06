import React from 'react';
import { db } from '@/lib/db';
import { History, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const logs = await db.getActivityLogs(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
          <History className="w-7 h-7 text-orange-500" />
          <span>سجل النشاطات والأحداث 📝</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">كافة العمليات والتحديثات التي جرت على المنظومة بالتفصيل</p>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm divide-y divide-stone-100 dark:divide-stone-800">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-stone-400 space-y-3">
            <div className="text-4xl">📝</div>
            <p className="font-bold">لا توجد نشاطات مسجلة بعد</p>
          </div>
        ) : (
          logs.map((log, i) => {
            const date = new Date(log.createdAt).toLocaleString('ar-EG', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });
            return (
              <div key={log.id} className={`flex items-start gap-4 p-4 ${i % 2 === 0 ? 'bg-stone-50/40 dark:bg-stone-900' : 'bg-white dark:bg-stone-900'}`}>
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-relaxed">{log.action}</p>
                  {log.userName && (
                    <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">{log.userName}</span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400 shrink-0 whitespace-nowrap">{date}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
