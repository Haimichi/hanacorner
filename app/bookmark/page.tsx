/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BookmarkPage() {
  // KHỞI TẠO ĐỒNG BỘ: Đọc an toàn từ localStorage ngay lúc khai báo trạng thái (Lazy Initialization)
  const [bookmarks, setBookmarks] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookmarks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Trạng thái mounted chỉ giữ nhiệm vụ xác nhận môi trường Trình duyệt đã sẵn sàng render
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // Đẩy việc setMounted vào frame tiếp theo để triệt tiêu hoàn toàn lỗi set-state-in-effect
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    
    return () => cancelAnimationFrame(handle);
  }, []);

  const removeBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const updated = bookmarks.filter((item) => item.id !== id);
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  // Tránh Hydration Mismatch bằng cách render khung xương Skeleton cho đến khi client sẵn sàng
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse">
          <div className="h-8 bg-zinc-900 rounded-full w-48" />
          <div className="h-6 bg-zinc-900 rounded w-32" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-3/4 bg-zinc-900 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Breadcrumb điều hướng */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-zinc-400 bg-zinc-900/40 border border-zinc-800/60 px-4 py-2.5 rounded-full w-max backdrop-blur-sm">
          <Link href="/" className="hover:text-zinc-100 transition">Trang chủ</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-orange-400 font-bold">Tủ truyện theo dõi</span>
        </nav>

        <div className="border-b border-zinc-900 pb-2">
          <h1 className="text-xl font-black tracking-tight text-zinc-100">📑 Tủ Truyện Yêu Thích ({bookmarks.length})</h1>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Kệ sách của bạn đang trống.</p>
            <Link href="/" className="text-xs text-orange-500 hover:underline mt-2 inline-block font-semibold">Khám phá truyện ngay &rarr;</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {bookmarks.map((manga) => {
              const isOtruyen = manga.id?.startsWith('otruyen-');
              const finalCover = manga.coverUrl || 'https://placehold.co/256x360?text=No+Cover';

              return (
                <div key={manga.id} className="group relative bg-zinc-900 border border-zinc-800/40 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:border-zinc-700 hover:-translate-y-1 flex flex-col justify-between">
                  
                  {/* Nhãn nguồn truyện */}
                  <span className={`absolute top-2.5 left-2.5 z-20 text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md text-white shadow-md ${isOtruyen ? 'bg-blue-600' : 'bg-orange-600'}`}>
                    {isOtruyen ? 'otruyen' : 'mangadex'}
                  </span>

                  {/* Nút xóa nhanh khỏi tủ truyện */}
                  <button 
                    onClick={(e) => removeBookmark(manga.id, e)}
                    className="absolute top-2.5 right-2.5 z-20 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-red-600 rounded-full border border-zinc-800/60 text-zinc-400 hover:text-white text-xs transition duration-200"
                    title="Xóa khỏi tủ truyện"
                  >
                    &times;
                  </button>

                  <Link href={`/manga/${manga.id}`} className="relative aspect-3/4 w-full block overflow-hidden bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={finalCover} alt={manga.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </Link>
                  <div className="p-3 bg-zinc-900">
                    <Link href={`/manga/${manga.id}`} className="font-bold text-xs sm:text-sm line-clamp-1 text-zinc-200 group-hover:text-orange-400 transition duration-150">
                      {manga.title}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}