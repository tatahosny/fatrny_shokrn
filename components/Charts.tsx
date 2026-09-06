'use client';

import React from 'react';

// ================= 1. BAR CHART =================
interface BarChartProps {
  data: { name: string; count: number }[];
  barColor?: string;
}

export function BarChart({ data, barColor = 'from-orange-500 to-amber-400' }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-stone-400">لا توجد بيانات كافية لعرض الرسم البياني</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3 pt-2">
      {data.map((item, idx) => {
        const percent = Math.round((item.count / maxVal) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
              <span className="truncate max-w-[200px]">{item.name}</span>
              <span className="text-orange-600 dark:text-orange-400 font-extrabold">{item.count} طلب</span>
            </div>
            <div className="w-full h-3.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                style={{ width: `${Math.max(percent, 5)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ================= 2. LINE / TREND CHART =================
interface LineChartProps {
  data: { date: string; count: number }[];
}

export function LineChart({ data }: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-stone-400">لا توجد بيانات للأيام</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const height = 140;
  const width = 450;
  const padding = 25;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (d.count / maxVal) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />

        {/* Filled Area */}
        <path d={areaD} fill="url(#lineGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ea580c">
              {p.count}
            </text>
            <text x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {p.date.split('-').slice(1).join('/')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ================= 3. DONUT / PIE CHART =================
interface DonutChartProps {
  data: { label: string; count: number; color?: string }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  if (total === 0) {
    return <div className="text-center py-8 text-xs text-stone-400">لا توجد طلبات مسجلة بعد</div>;
  }

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
      {/* Donut SVG */}
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {data.map((slice, i) => {
            if (slice.count === 0) return null;
            const percent = (slice.count / total) * 100;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = -accumulatedPercent;
            accumulatedPercent += percent;

            return (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke={slice.color || colors[i % colors.length]}
                strokeWidth="4.5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-stone-900 dark:text-white">{total}</span>
          <span className="text-[10px] text-stone-500 font-bold">إجمالي الطلبات</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color || colors[i % colors.length] }}
            />
            <span className="font-bold text-stone-700 dark:text-stone-300">{item.label}:</span>
            <span className="font-extrabold text-stone-900 dark:text-white">{item.count}</span>
            <span className="text-[11px] text-stone-400">
              ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
