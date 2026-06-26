/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('read_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const clearAllHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký đọc không?')) {
      localStorage.removeItem('read_history');
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Breadcrumb điều hướng */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-zinc-400 bg-zinc-900/40 border border-zinc-800/60 px-4 py-2.5 rounded-full w-max backdrop-blur-sm">
          <Link href="/" className="hover:text-zinc-100 transition">Trang chủ</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-orange-400 font-bold">Nhật ký đọc truyện</span>
        </nav>

        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <h1 className="text-xl font-black tracking-tight text-zinc-100">⏱️ Lịch Sử Đọc Gần Đây</h1>
          {history.length > 0 && (
            <button 
              onClick={clearAllHistory} 
              className="text-xs font-bold text-zinc-400 hover:text-red-400 transition"
            >
              Xóa lịch sử
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Bạn chưa đọc chương truyện nào.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition">
                <div className="space-y-0.5 truncate">
                  <Link href={`/manga/${item.mangaId}`} className="font-bold text-sm text-zinc-200 hover:text-orange-400 block truncate">
                    {item.mangaTitle}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                    <span className="text-orange-500 font-bold">Chương {item.chapterNum}</span>
                    <span>•</span>
                    <span>Đọc lúc: {item.time}</span>
                  </div>
                </div>
                <Link 
                  href={`/chapter/${item.chapterId}`} 
                  className="bg-zinc-100 hover:bg-orange-500 hover:text-white text-zinc-950 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition text-center sm:w-auto shrink-0"
                >
                  Đọc tiếp
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}