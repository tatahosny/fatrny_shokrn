'use client';

import React from 'react';
import { Download, Database } from 'lucide-react';

export default function AdminExportBackupButton({ data }: { data: any }) {
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fatrny-full-platform-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition-all active:scale-95 shrink-0"
    >
      <Download className="w-4 h-4" />
      <span>تنزيل نسخة احتياطية للمنصة (Backup JSON)</span>
    </button>
  );
}
