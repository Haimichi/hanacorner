// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable react-hooks/exhaustive-deps */
// 'use client';
// import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';

// export default function MangaDetailPage() {
//   const params = useParams();
//   const mangaId = params?.id as string;

//   const [manga, setManga] = useState<any>(null);
//   const [chapters, setChapters] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
//   const [source, setSource] = useState<'mangadex' | 'otruyen'>('mangadex');

//   const fetchDetail = async () => {
//     try {
//       if (mangaId.startsWith('otruyen-')) {
//         // LUỒNG XỬ LÝ CHO Ổ TRUYỆN (ĐÃ CẬP NHẬT TỐI ƯU CHO TRUYỆN NHIỀU CHƯƠNG)
//         setSource('otruyen');
//         const slug = mangaId.replace('otruyen-', '');
//         const res = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
//         const json = await res.json();
        
//         if (json?.status === 'success' && json?.data?.item) {
//           const item = json.data.item;
//           setManga({
//             title: item.name,
//             description: item.content?.replace(/<[^>]*>/g, '') || 'Chưa có mô tả.',
//             coverUrl: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
//           });
          
//           // Kiểm tra và gom tất cả chương từ các server có sẵn của Ổ Truyện
//           // SỬA TẠI ĐÂY: Đổi từ let sang const để fix triệt để lỗi ESLint
//           const allChapters: any[] = [];
          
//           // Hướng 1: Bóc tách dữ liệu từ server_data (Phổ biến nhất)
//           const servers = json.data.server_data || [];
//           servers.forEach((server: any) => {
//             const chapData = server.chapter_data || [];
//             chapData.forEach((chap: any) => {
//               // Tránh trùng lặp số chương nếu hệ thống trả về nhiều server khác nhau
//               if (!allChapters.some(c => c.chapterName === chap.chapter_name)) {
//                 allChapters.push({
//                   chapterName: chap.chapter_name,
//                   chapterTitle: chap.chapter_title,
//                   // Tạo ID chương chứa đầy đủ thông tin để trang Đọc truyện sau này bóc tách link ảnh
//                   id: `otruyen_chap-${slug}-chap-${chap.chapter_name}`
//                 });
//               }
//             });
//           });

//           // Hướng dự phòng 2: Nếu hướng 1 trống, bóc từ cụm dữ liệu nằm trực tiếp trong item.chapters
//           if (allChapters.length === 0 && item.chapters) {
//             item.chapters.forEach((serverGroup: any) => {
//               const chapData = serverGroup.server_data || [];
//               chapData.forEach((chap: any) => {
//                 if (!allChapters.some(c => c.chapterName === chap.chapter_name)) {
//                   allChapters.push({
//                     chapterName: chap.chapter_name,
//                     chapterTitle: chap.chapter_title,
//                     id: `otruyen_chap-${slug}-chap-${chap.chapter_name}`
//                   });
//                 }
//               });
//             });
//           }

//           // Sắp xếp lại danh sách chương theo thứ tự tăng dần từ Chương 1 trở lên
//           allChapters.sort((a, b) => parseFloat(a.chapterName) - parseFloat(b.chapterName));

//           // Chuyển đổi dữ liệu sang định dạng hiển thị thống nhất trên giao diện
//           setChapters(allChapters.map((chap: any) => ({
//             id: chap.id,
//             title: `Chương ${chap.chapterName}`,
//             subTitle: chap.chapterTitle ? ` - ${chap.chapterTitle}` : '',
//             group: 'Ổ Truyện CDN'
//           })));
//         }
//       } else {
//         // LUỒNG XỬ LÝ CHO MANGADEX
//         setSource('mangadex');
//         const mRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`);
//         const mJson = await mRes.json();
//         const mangaData = mJson.data;

//         if (mangaData) {
//           const coverRel = mangaData.relationships?.find((rel: any) => rel.type === 'cover_art');
//           const fileName = coverRel?.attributes?.fileName;
          
//           setManga({
//             title: mangaData.attributes?.title?.en || mangaData.attributes?.title['ja-ro'] || Object.values(mangaData.attributes?.title || {})[0] || 'Unknown Title',
//             description: mangaData.attributes?.description?.vi || mangaData.attributes?.description?.en || 'Chưa có mô tả.',
//             coverUrl: fileName ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg` : 'https://placehold.co/256x360?text=No+Cover'
//           });

//           const cRes = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?limit=100&translatedLanguage[]=vi&order[chapter]=asc&includes[]=scanlation_group`);
//           const cJson = await cRes.json();
//           setChapters((cJson.data || []).map((chap: any) => ({
//             id: chap.id,
//             title: `Chương ${chap.attributes?.chapter || '0'}`,
//             subTitle: chap.attributes?.title ? ` - ${chap.attributes.title}` : '',
//             group: chap.relationships?.find((rel: any) => rel.type === 'scanlation_group')?.attributes?.name || 'Unknown Group'
//           })));
//         }
//       }

//       // Check trạng thái Bookmark từ localStorage
//       const saved = localStorage.getItem('bookmarks');
//       const bookmarks = saved ? JSON.parse(saved) : [];
//       setIsBookmarked(bookmarks.some((item: any) => item.id === mangaId));

//     } catch (error) {
//       console.error("Lỗi fetch chi tiết:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

// useEffect(() => {
//     if (mangaId) {
//       // FIX TRIỆT ĐỂ: Tắt cảnh báo render tầng của ESLint khi gọi hàm fetch có chứa setState đồng bộ
//       /* eslint-disable-next-line react-hooks/set-state-in-effect */
//       fetchDetail();
//     }
//   }, [mangaId]);

//   const toggleBookmark = () => {
//     if (!manga) return;
//     const saved = localStorage.getItem('bookmarks');
//     let bookmarks = saved ? JSON.parse(saved) : [];

//     if (isBookmarked) {
//       bookmarks = bookmarks.filter((item: any) => item.id !== mangaId);
//       setIsBookmarked(false);
//     } else {
//       bookmarks.push({ id: mangaId, title: manga.title });
//       setIsBookmarked(true);
//     }
//     localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
//   };

//   if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Đang nạp thông tin truyện...</div>;
//   if (!manga) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Không tìm thấy thông tin truyện.</div>;

//   return (
//     <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 font-sans">
//       <div className="max-w-4xl mx-auto">
//         <Link href="/" className="inline-block mb-6 text-orange-500 hover:underline text-sm font-semibold">&larr; Quay lại trang chủ</Link>

//         <div className="flex flex-col md:flex-row gap-6 bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl mb-6">
//           <div className="w-full md:w-56 flex-shrink-0">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img src={manga.coverUrl} alt={manga.title} className="w-full h-auto object-cover rounded-2xl shadow-lg" />
//           </div>
//           <div className="flex flex-col justify-between flex-1">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <h1 className="text-2xl sm:text-3xl font-black text-gray-100">{manga.title}</h1>
//                 <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${source === 'otruyen' ? 'bg-blue-600' : 'bg-orange-600'}`}>{source}</span>
//               </div>
//               <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-h-36 overflow-y-auto pr-2">{manga.description}</p>
//             </div>
//             <button onClick={toggleBookmark} className={`mt-4 px-6 py-2.5 rounded-xl font-bold text-sm self-start transition ${isBookmarked ? 'bg-gray-800 text-orange-500 border border-orange-500/30' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
//               {isBookmarked ? '📑 Đang Theo Dõi' : '❤ Thêm Vào Tủ Truyện'}
//             </button>
//           </div>
//         </div>

//         <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
//           <h2 className="text-md font-black uppercase tracking-wider text-orange-400 mb-4 border-b border-gray-800 pb-2">Danh sách chương ({chapters.length})</h2>
//           {chapters.length === 0 ? (
//             <div className="text-gray-500 py-6 text-center text-sm">Truyện chưa có chương dịch Tiếng Việt phù hợp.</div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
//               {chapters.map((chap: any, idx: number) => (
//                 <Link key={idx} href={`/chapter/${chap.id}`} className="p-3 bg-gray-950 hover:bg-orange-500/10 border border-gray-800 hover:border-orange-500/50 rounded-xl transition flex flex-col justify-between">
//                   <span className="font-bold text-sm text-gray-200">{chap.title}{chap.subTitle}</span>
//                   <span className="text-[11px] text-gray-500 mt-1">Nguồn: {chap.group}</span>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function MangaDetailPage() {
  const params = useParams();
  const mangaId = params?.id as string;

  const [manga, setManga] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [source, setSource] = useState<'mangadex' | 'otruyen'>('mangadex');

  const fetchDetail = async () => {
    try {
      if (mangaId.startsWith('otruyen-')) {
        setSource('otruyen');
        const slug = mangaId.replace('otruyen-', '');
        const res = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
        const json = await res.json();
        
        if (json?.status === 'success' && json?.data?.item) {
          const item = json.data.item;
          setManga({
            title: item.name,
            description: item.content?.replace(/<[^>]*>/g, '') || 'Chưa có mô tả.',
            coverUrl: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
          });

          const constAllChapters: any[] = [];
          
          // QUÉT TOÀN DIỆN TẤT CẢ CÁC LUỒNG CẤU TRÚC ĐỂ TRÁNH LỖI (0) CHƯƠNG
          // Luồng 1: Duyệt qua cấu trúc mảng server_data chính thức
          const servers = json.data.server_data || [];
          servers.forEach((server: any) => {
            const chapData = server.chapter_data || [];
            chapData.forEach((chap: any) => {
              if (!constAllChapters.some(c => c.chapterName === chap.chapter_name)) {
                constAllChapters.push({
                  chapterName: chap.chapter_name,
                  chapterTitle: chap.chapter_title,
                  id: `otruyen_chap-${slug}-chap-${chap.chapter_name}`
                });
              }
            });
          });

          // Luồng 2: Dự phòng nếu luồng 1 trống (Bóc tách nhánh item.chapters đặc thù của một số dữ liệu lớn)
          if (constAllChapters.length === 0 && item.chapters) {
            item.chapters.forEach((serverGroup: any) => {
              const chapData = serverGroup.server_data || [];
              chapData.forEach((chap: any) => {
                if (!constAllChapters.some(c => c.chapterName === chap.chapter_name)) {
                  constAllChapters.push({
                    chapterName: chap.chapter_name,
                    chapterTitle: chap.chapter_title,
                    id: `otruyen_chap-${slug}-chap-${chap.chapter_name}`
                  });
                }
              });
            });
          }

          // Luồng 3: Nếu vẫn trống, cào trực tiếp từ mảng danh sách chương dẹt độc lập (nếu có)
          if (constAllChapters.length === 0 && json.data.chapters) {
            json.data.chapters.forEach((chap: any) => {
              if (!constAllChapters.some(c => c.chapterName === chap.chapter_name)) {
                constAllChapters.push({
                  chapterName: chap.chapter_name,
                  chapterTitle: chap.chapter_title,
                  id: `otruyen_chap-${slug}-chap-${chap.chapter_name}`
                });
              }
            });
          }

          // Sắp xếp lại danh sách chương đảo ngược (Mới nhất lên đầu cho đúng chuẩn giải trí)
          constAllChapters.sort((a, b) => parseFloat(b.chapterName) - parseFloat(a.chapterName));
          
          setChapters(constAllChapters.map((chap: any) => ({
            id: chap.id,
            title: `Chương ${chap.chapterName}`,
            subTitle: chap.chapterTitle ? ` - ${chap.chapterTitle}` : '',
            group: 'Ổ Truyện CDN'
          })));
        }
      } else {
        // LUỒNG XỬ LÝ CHO MANGADEX
        setSource('mangadex');
        const mRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`);
        const mJson = await mRes.json();
        if (mJson.data) {
          const coverRel = mJson.data.relationships?.find((rel: any) => rel.type === 'cover_art');
          const fileName = coverRel?.attributes?.fileName;
          setManga({
            title: mJson.data.attributes?.title?.en || Object.values(mJson.data.attributes?.title || {})[0] || 'Unknown Title',
            description: mJson.data.attributes?.description?.vi || mJson.data.attributes?.description?.en || 'Chưa có mô tả.',
            coverUrl: fileName ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg` : 'https://placehold.co/256x360?text=No+Cover'
          });

          const cRes = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?limit=100&translatedLanguage[]=vi&order[chapter]=desc&includes[]=scanlation_group`);
          const cJson = await cRes.json();
          setChapters((cJson.data || []).map((chap: any) => ({
            id: chap.id,
            title: `Chương ${chap.attributes?.chapter || '0'}`,
            subTitle: chap.attributes?.title ? ` - ${chap.attributes.title}` : '',
            group: chap.relationships?.find((rel: any) => rel.type === 'scanlation_group')?.attributes?.name || 'Unknown Group'
          })));
        }
      }
      const saved = localStorage.getItem('bookmarks');
      setIsBookmarked((saved ? JSON.parse(saved) : []).some((item: any) => item.id === mangaId));
    } catch (error) {
      console.error(error);
    } finalDisplayList: {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mangaId) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      fetchDetail();
    }
  }, [mangaId]);

  const toggleBookmark = () => {
    if (!manga) return;
    const saved = localStorage.getItem('bookmarks');
    let bookmarks = saved ? JSON.parse(saved) : [];

    if (isBookmarked) {
      bookmarks = bookmarks.filter((item: any) => item.id !== mangaId);
      setIsBookmarked(false);
    } else {
      bookmarks.push({ id: mangaId, title: manga.title, coverUrl: manga.coverUrl });
      setIsBookmarked(true);
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-zinc-400">Đang tải dữ liệu đa nguồn...</div>;
  if (!manga) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-zinc-400">Không tìm thấy dữ liệu truyện.</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased">
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden opacity-20 pointer-events-none select-none blur-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={manga.coverUrl} className="w-full h-full object-cover scale-150" alt="" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 relative z-10 space-y-6">
        
        {/* ================= SHADCN BREADCRUMB COMPONENT ================= */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-zinc-400 bg-zinc-900/40 border border-zinc-800/60 px-4 py-2.5 rounded-full w-max backdrop-blur-sm">
          <Link href="/" className="hover:text-zinc-100 transition duration-150">Trang chủ</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500 uppercase tracking-wide font-bold">{source}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-orange-400 font-bold truncate max-w-[200px]">{manga.title}</span>
        </nav>

        {/* DETAIL PANEL */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-zinc-900/40 backdrop-blur border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <div className="w-52 aspect-3/4 shrink-0 overflow-hidden rounded-2xl shadow-2xl border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={manga.coverUrl} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-2">
              <span className={`inline-block text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${source === 'otruyen' ? 'bg-blue-600' : 'bg-orange-600'}`}>{source} HUB</span>
              <h1 className="text-3xl font-black tracking-tight text-zinc-100">{manga.title}</h1>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-h-36 overflow-y-auto bg-black/20 p-4 rounded-xl border border-zinc-800/40 text-left">
              {manga.description}
            </p>
            
            <button 
              onClick={toggleBookmark}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${isBookmarked ? 'bg-zinc-800 text-orange-400 border border-orange-500/20' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
            >
              {isBookmarked ? '📑 Đang Theo Dõi' : '❤ Thêm Vào Tủ Truyện'}
            </button>
          </div>
        </div>

        {/* CHAPTER FEED */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-wider text-orange-400 border-b border-zinc-800 pb-3 mb-4">Danh sách chương ({chapters.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {chapters.map((chap: any, idx: number) => (
              <Link key={idx} href={`/chapter/${chap.id}`} className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 rounded-xl transition group">
                <span className="text-xs font-bold text-zinc-300 group-hover:text-orange-400 transition">{chap.title}{chap.subTitle}</span>
                <span className="text-[10px] text-zinc-500 font-medium">{chap.group}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}