/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Quản lý trạng thái Tab danh mục
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'completed'>('latest');
  
  // Lưu trữ dữ liệu gốc phản hồi từ API
  const [rawMangaDex, setRawMangaDex] = useState<any[]>([]);
  const [rawOTruyen, setRawOTruyen] = useState<any[]>([]);

  // State điều khiển vòng lặp Hero Carousel Banner
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [bannerSlides, setBannerSlides] = useState<any[]>([]);

  // Tìm kiếm & Hộp gợi ý tự động (Autocomplete)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Bộ lọc nâng cao phụ trợ (Dành cho nguồn MangaDex)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderFilter, setOrderFilter] = useState<string>('latestUploadedChapter');

  // Hàm chuẩn hóa loại bỏ dấu tiếng Việt và ký tự đặc biệt để so khớp lọc trùng chính xác
  const cleanTitleToSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  // HÀM FETCH GỘP DỮ LIỆU ĐA NGUỒN BAN ĐẦU
  const fetchAllSources = async () => {
    setLoading(true);
    try {
      // Gọi song song hai cổng API để tối ưu hóa băng thông mạng
      const [mdRes, otRes] = await Promise.allSettled([
        fetch(`https://api.mangadex.org/manga?limit=30&availableTranslatedLanguage[]=vi&includes[]=cover_art&order[latestUploadedChapter]=desc`).then(res => res.json()),
        fetch(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi?limit=30`).then(res => res.json())
      ]);

      // Chuẩn hóa cấu trúc dữ liệu MangaDex
      const mdNormalized = mdRes.status === 'fulfilled' ? (mdRes.value.data || []).map((manga: any) => {
        const coverRel = manga.relationships?.find((r: any) => r.type === 'cover_art');
        const fileName = coverRel?.attributes?.fileName;
        return {
          id: manga.id,
          source: 'mangadex',
          status: manga.attributes?.status,
          title: manga.attributes?.title?.en || manga.attributes?.title['ja-ro'] || Object.values(manga.attributes?.title || {})[0] || 'Unknown Title',
          description: manga.attributes?.description?.vi || manga.attributes?.description?.en || 'Khám phá cốt truyện kịch tính hấp dẫn phối hợp đa nền tảng...',
          coverUrl: fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.512.jpg` : 'https://placehold.co/256x360?text=No+Cover'
        };
      }) : [];

      // Chuẩn hóa cấu trúc dữ liệu Ổ Truyện
      let otNormalized: any[] = [];
      if (otRes.status === 'fulfilled' && otRes.value?.data?.items) {
        otNormalized = otRes.value.data.items.map((item: any) => ({
          id: `otruyen-${item.slug}`,
          source: 'otruyen',
          status: item.status === 'Hoàn thành' ? 'completed' : 'ongoing',
          title: item.name,
          description: 'Kho đầu truyện dịch đa dạng, cập nhật liên tục với chất lượng hình ảnh sắc nét cao...',
          coverUrl: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
        }));
      }

      setRawMangaDex(mdNormalized);
      setRawOTruyen(otNormalized);

      // Trích xuất 6 truyện đầu tiên xen kẽ giữa hai nguồn để làm Slide Banner sống động
      const slides = [];
      for (let i = 0; i < 3; i++) {
        if (mdNormalized[i]) slides.push(mdNormalized[i]);
        if (otNormalized[i]) slides.push(otNormalized[i]);
      }
      setBannerSlides(slides);

    } catch (error) {
      console.error("Lỗi đồng bộ hệ thống nguồn:", error);
    } finally {
      setLoading(false);
    }
  };

  // GIẢI PHÁP ĐỘC QUYỀN SỬA LỖI TRƯỢT STATE: Tính toán danh mục trực tiếp khi Render thay vì dùng useEffect
  const displayList = (() => {
    const otSlugs = rawOTruyen.map(item => cleanTitleToSlug(item.title));
    const filteredMd = rawMangaDex.filter((mdItem: any) => !otSlugs.includes(cleanTitleToSlug(mdItem.title)));
    const totalGop = [...filteredMd, ...rawOTruyen];

    if (activeTab === 'latest') {
      return totalGop.slice(0, 20);
    } 
    
    if (activeTab === 'popular') {
      const populars = [];
      const maxLength = Math.max(rawOTruyen.length, filteredMd.length);
      for (let i = 0; i < maxLength; i++) {
        if (filteredMd[i]) populars.push(filteredMd[i]);
        if (rawOTruyen[i]) populars.push(rawOTruyen[i]);
      }
      return populars.slice(0, 20);
    } 
    
    if (activeTab === 'completed') {
      const completedList = totalGop.filter((manga: any) => manga.status === 'completed');
      return completedList.length > 0 ? completedList : totalGop.slice(12, 27);
    }

    return totalGop;
  })();

  const finalDisplayList = displayList || [];

  // Vòng lặp thời gian tự động trượt chuyển đổi Hero Slide
  useEffect(() => {
    if (bannerSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [bannerSlides]);

  // Luồng nạp khởi động cấu hình nền tảng ban đầu
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setMounted(true);
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    fetchAllSources();

    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gọi API lấy hộp dữ liệu gợi ý Autocomplete khi gõ chữ
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await fetch(`https://api.mangadex.org/manga?limit=5&title=${encodeURIComponent(searchQuery)}&availableTranslatedLanguage[]=vi`);
          const json = await res.json();
          setSuggestions(json.data || []);
          setShowSuggestions(true);
        } catch (err) { console.error(err); }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Xử lý tìm kiếm toàn diện khi nhấn Enter hoặc submit form
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(searchQuery)}&limit=25`);
      const json = await res.json();
      if (json?.data?.items) {
        const searched = json.data.items.map((item: any) => ({
          id: `otruyen-${item.slug}`,
          source: 'otruyen',
          title: item.name,
          coverUrl: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
        }));
        setRawOTruyen(searched);
        setRawMangaDex([]); // Làm trống nguồn phụ để hiển thị tập trung kết quả tìm kiếm sạch
        setActiveTab('latest');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-orange-500 antialiased">
      
      {/* ================= STICKY HEADER NAVBAR ================= */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => { setSearchQuery(''); fetchAllSources(); }} className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              MANGADEX × OT
            </button>
            <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Link href="/bookmark" className="hover:text-zinc-100 transition">Tủ Truyện</Link>
              <Link href="/history" className="hover:text-zinc-100 transition">Nhật Ký</Link>
              <Link href="/settings" className="hover:text-zinc-100 transition">Cài Đặt</Link>
            </nav>
          </div>

          {/* Ô TÌM KIẾM SMART AUTOCOMPLETE */}
          <div className="relative w-full max-w-sm" ref={suggestionRef}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Tìm tên truyện hoặc từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full h-9 px-4 bg-zinc-900 border border-zinc-800 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-zinc-200"
              />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-11 bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-900 animate-fadeIn">
                {suggestions.map((manga: any) => {
                  const mTitle = manga.attributes?.title?.en || Object.values(manga.attributes?.title || {})[0] || 'Unknown';
                  return (
                    <button
                      key={manga.id}
                      onClick={() => { setSearchQuery(mTitle); handleSearchSubmit({ preventDefault: () => {} } as any); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 transition flex items-center justify-between text-xs text-zinc-300 font-medium gap-3"
                    >
                      <span className="truncate flex-1">{mTitle}</span>
                      <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded uppercase font-black shrink-0">MangaDex</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* ================= CINEMATIC HERO SLIDER BANNER ================= */}
        {mounted && bannerSlides.length > 0 && !searchQuery && (
          <div className="relative rounded-3xl overflow-hidden aspect-[21/9] w-full bg-zinc-950 border border-zinc-800 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
            
            {/* Ảnh nền làm mờ tạo chiều sâu không gian */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={bannerSlides[currentSlide]?.coverUrl} 
              className="absolute inset-0 w-full h-full object-cover opacity-30 transform scale-102 blur-md pointer-events-none" 
              alt=""
            />
            {/* Ảnh bìa chính sắc nét nổi bật phía cánh phải */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={bannerSlides[currentSlide]?.coverUrl} 
              className="absolute right-12 top-0 bottom-0 my-auto h-[85%] rounded-2xl object-cover aspect-3/4 z-20 shadow-2xl hidden md:block border border-zinc-800 animate-fadeIn" 
              alt=""
            />
            
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 z-20 max-w-xl space-y-3 animate-fadeIn">
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
                {bannerSlides[currentSlide]?.source === 'otruyen' ? '🔥 Nổi Bật Tuần' : '✨ Hot Update'}
              </span>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-zinc-100 line-clamp-1">
                {bannerSlides[currentSlide]?.title}
              </h2>
              <p className="text-zinc-400 text-xs line-clamp-2 max-w-sm leading-relaxed font-medium">
                {bannerSlides[currentSlide]?.description}
              </p>
              <Link href={`/manga/${bannerSlides[currentSlide]?.id}`} className="inline-block text-xs bg-zinc-100 text-zinc-950 font-black uppercase tracking-wider px-5 py-2 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-200">
                Đọc Ngay
              </Link>
            </div>

            {/* Hệ thống chấm tròn điều hướng Slide */}
            <div className="absolute bottom-4 right-6 z-30 flex gap-1.5">
              {bannerSlides.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-4 bg-orange-500' : 'bg-zinc-700'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= CONTENT CONTAINER WITH SHADCN TABS ================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-2">
            
            {/* Cụm nút Tab Điều hướng cấu trúc Bento */}
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 p-1 text-zinc-400 border border-zinc-800/40">
              <button 
                onClick={() => setActiveTab('latest')} 
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'latest' ? 'bg-zinc-800 text-zinc-100 shadow' : 'hover:text-zinc-200'}`}
              >
                Mới cập nhật
              </button>
              <button 
                onClick={() => setActiveTab('popular')} 
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'popular' ? 'bg-zinc-800 text-zinc-100 shadow' : 'hover:text-zinc-200'}`}
              >
                Truyện nổi bật
              </button>
              <button 
                onClick={() => setActiveTab('completed')} 
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'completed' ? 'bg-zinc-800 text-zinc-100 shadow' : 'hover:text-zinc-200'}`}
              >
                Đã hoàn thành
              </button>
            </div>
          </div>

          {/* ================= BENTO GRID DISPLAY MANAGER ================= */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-3/4 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {finalDisplayList.map((manga: any) => (
                <div key={manga.id} className="group relative bg-zinc-900 border border-zinc-800/40 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:border-zinc-700 hover:-translate-y-1 flex flex-col justify-between">
                  
                  {/* Tag nhận diện nguồn truyện */}
                  <span className={`absolute top-2.5 left-2.5 z-20 text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md text-white shadow-md ${manga.source === 'otruyen' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                    {manga.source}
                  </span>

                  <Link href={`/manga/${manga.id}`} className="relative aspect-3/4 w-full block overflow-hidden bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </Link>
                  <div className="p-3 bg-zinc-900">
                    <Link href={`/manga/${manga.id}`} className="font-bold text-xs sm:text-sm line-clamp-1 text-zinc-200 group-hover:text-orange-400 transition duration-150">
                      {manga.title}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && finalDisplayList.length === 0 && (
            <div className="text-center text-zinc-500 py-20 text-xs font-bold uppercase tracking-widest">Không có dữ liệu truyện tranh phù hợp.</div>
          )}
        </div>
      </main>
    </div>
  );
}