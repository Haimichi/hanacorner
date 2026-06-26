'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  // 1. Cấu hình độ rộng khung ảnh truyện
  const [readerWidth, setReaderWidth] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('cfg_width') || 'max-w-2xl' : 'max-w-2xl'));
  
  // 2. Cấu hình màu nền
  const [bgColor, setBgColor] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('cfg_bg') || 'bg-black' : 'bg-black'));

  // NEW 3. Cấu hình chế độ đọc (Cuộn dài Webtoon hoặc click lật từng trang giống Manga gốc)
  const [readMode, setReadMode] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('cfg_mode') || 'scroll' : 'scroll'));

  // NEW 4. Cấu hình cỡ chữ tiêu đề (Nhỏ - Vừa - Lớn)
  const [fontSize, setFontSize] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('cfg_font') || 'text-sm' : 'text-sm'));

  // NEW 5. Ẩn/Hiện nhãn nguồn truyện (MangaDex/Ổ truyện) ngoài trang chủ
  const [showSourceTag, setShowSourceTag] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('cfg_tag') || 'show' : 'show'));

  const saveSettings = (key: string, value: string, setter: (v: string) => void) => {
    setter(value);
    localStorage.setItem(key, value);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Breadcrumb điều hướng */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-zinc-400 bg-zinc-900/40 border border-zinc-800/60 px-4 py-2.5 rounded-full w-max backdrop-blur-sm">
          <Link href="/" className="hover:text-zinc-100 transition">Trang chủ</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-orange-400 font-bold">Cấu hình hệ thống nâng cao</span>
        </nav>

        <div className="border-b border-zinc-900 pb-2">
          <h1 className="text-xl font-black tracking-tight text-zinc-100">⚙️ Trung Tâm Điều Chỉnh Website</h1>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl space-y-6 shadow-xl backdrop-blur divide-y divide-zinc-800/50">
          
          {/* PHẦN 1: GIAO DIỆN TRÌNH ĐỌC */}
          <div className="space-y-4 pt-0">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">🖼️ Tùy Chỉnh Khung Ảnh Đọc</h3>
            
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">Độ rộng khung ảnh truyện</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => saveSettings('cfg_width', 'max-w-2xl', setReaderWidth)}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all ${readerWidth === 'max-w-2xl' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'}`}
                >
                  Tiêu chuẩn (Gọn gàng)
                </button>
                <button 
                  onClick={() => saveSettings('cfg_width', 'max-w-5xl', setReaderWidth)}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all ${readerWidth === 'max-w-5xl' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'}`}
                >
                  Toàn màn hình (Lớn)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">Màu sắc không gian nền</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Xám Tối', class: 'bg-zinc-950' },
                  { name: 'Đen Tuyền (Tiết kiệm pin)', class: 'bg-black' },
                  { name: 'Sepia (Chống mỏi mắt)', class: 'bg-amber-950/30' }
                ].map((bg) => (
                  <button
                    key={bg.class}
                    onClick={() => saveSettings('cfg_bg', bg.class, setBgColor)}
                    className={`h-10 rounded-xl border text-xs font-bold transition-all ${bgColor === bg.class ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PHẦN 2: CHẾ ĐỘ ĐỌC NÂNG CAO (NEW) */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">📖 Chế Độ Lướt Truyện</h3>
            
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">Phương thức chuyển trang</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => saveSettings('cfg_mode', 'scroll', setReadMode)}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all ${readMode === 'scroll' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'}`}
                >
                  Cuộn dọc dài (Webtoon Style)
                </button>
                <button 
                  onClick={() => saveSettings('cfg_mode', 'paged', setReadMode)}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all ${readMode === 'paged' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'}`}
                >
                  Bấm lật từng trang (Manga Style)
                </button>
              </div>
            </div>
          </div>

          {/* PHẦN 3: HIỂN THỊ HỆ THỐNG VÀ TYPOGRAPHY (NEW) */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">🎛️ Tùy Chỉnh Hiển Thị Website</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">Kích cỡ chữ tiêu đề chương</label>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {[
                    { label: 'Nhỏ', value: 'text-xs' },
                    { label: 'Vừa', value: 'text-sm' },
                    { label: 'Lớn', value: 'text-base' }
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => saveSettings('cfg_font', f.value, setFontSize)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${fontSize === f.value ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">Nhãn nguồn truyện ở trang chủ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => saveSettings('cfg_tag', 'show', setShowSourceTag)}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all ${showSourceTag === 'show' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}
                  >
                    Hiện (MangaDex/OT)
                  </button>
                  <button 
                    onClick={() => saveSettings('cfg_tag', 'hide', setShowSourceTag)}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all ${showSourceTag === 'hide' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}
                  >
                    Ẩn nhãn nguồn
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 text-center text-[10px] font-mono text-zinc-600">
            Hệ thống tự động đồng bộ cấu hình qua LocalStorage an toàn.
          </div>
        </div>
      </div>
    </div>
  );
}