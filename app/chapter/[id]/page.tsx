// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable react-hooks/exhaustive-deps */
// 'use client';
// import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';

// export default function ChapterReaderPage() {
//   const params = useParams();
//   const chapterId = params?.id as string;

//   const [images, setImages] = useState<string[]>([]);
//   const [chapterInfo, setChapterInfo] = useState<any>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   // Khởi tạo trạng thái ban đầu trực tiếp từ LocalStorage (An toàn, không lo lỗi Hydration hay Render tầng)
//   const [readerWidth] = useState<string>(() => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('cfg_width') || 'max-w-2xl';
//     }
//     return 'max-w-2xl';
//   });

//   const [bgColor] = useState<string>(() => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('cfg_bg') || 'bg-black';
//     }
//     return 'bg-black';
//   });

//   const fetchChapterData = async () => {
//     try {
//       const infoRes = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`);
//       const infoJson = await infoRes.json();
//       const currentChapter = infoJson.data;
//       setChapterInfo(currentChapter);

//       if (currentChapter) {
//         const mangaRel = currentChapter.relationships?.find((rel: any) => rel.type === 'manga');
//         const mangaId = mangaRel?.id;
//         const mangaTitle = mangaRel?.attributes?.title?.en || Object.values(mangaRel?.attributes?.title || {})[0] || 'Unknown Manga';
        
//         const historyItem = {
//           mangaId,
//           mangaTitle,
//           chapterId,
//           chapterNum: currentChapter.attributes?.chapter || '0',
//           time: new Date().toLocaleString('vi-VN'),
//         };

//         const rawHistory = localStorage.getItem('read_history');
//         const localHistory = rawHistory ? JSON.parse(rawHistory) : [];
//         const filteredHistory = localHistory.filter((item: any) => item.chapterId !== chapterId);
//         filteredHistory.unshift(historyItem);
//         localStorage.setItem('read_history', JSON.stringify(filteredHistory.slice(0, 20)));
//       }

//       const serverRes = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
//       const serverJson = await serverRes.json();
      
//       const baseUrl = serverJson.baseUrl;
//       const hash = serverJson.chapter?.hash;
//       const fileNames = serverJson.chapter?.dataSaver;

//       if (baseUrl && hash && fileNames) {
//         const imageUrls = fileNames.map((fileName: string) => `${baseUrl}/data-saver/${hash}/${fileName}`);
//         setImages(imageUrls);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải dữ liệu chương truyện:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (chapterId) {
//       // ĐÃ XÓA: Khối lệnh đọc cài đặt gây lỗi set-state-in-effect
      
//       /* eslint-disable-next-line react-hooks/set-state-in-effect */
//       fetchChapterData();
//     }
//   }, [chapterId]);

//   if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Đang nạp trang truyện...</div>;
//   if (images.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
//         <p className="mb-4 text-sm text-gray-400">Không thể tải dữ liệu hình ảnh từ MangaDex.</p>
//         <Link href="/" className="text-orange-500 hover:underline text-sm font-semibold">&larr; Quay lại trang chủ</Link>
//       </div>
//     );
//   }

//   const mangaId = chapterInfo?.relationships?.find((rel: any) => rel.type === 'manga')?.id;

//   return (
//     <div className={`min-h-screen text-white flex flex-col items-center transition-colors duration-300 ${bgColor}`}>
      
//       <div className="w-full bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 sticky top-0 z-50 flex justify-between items-center px-6">
//         <div className="flex flex-col">
//           <Link href={`/manga/${mangaId}`} className="text-xs text-gray-400 hover:text-orange-400 transition mb-0.5">&larr; Chi tiết truyện</Link>
//           <h1 className="text-sm font-bold text-orange-500 truncate max-w-xs sm:max-w-md">Chương {chapterInfo?.attributes?.chapter || '0'}: {chapterInfo?.attributes?.title || 'Không tiêu đề'}</h1>
//         </div>
//         <Link href="/" className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-xl text-xs font-bold transition">Trang chủ</Link>
//       </div>

//       <div className={`w-full flex flex-col py-2 ${readerWidth}`}>
//         {images.map((url, index) => (
//           <div key={index} className="w-full flex justify-center relative">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img src={url} alt={`Trang ${index + 1}`} className="w-full h-auto object-contain select-none" loading={index < 2 ? "eager" : "lazy"} />
//             <span className="absolute bottom-2 right-4 text-[10px] bg-black/70 text-gray-400 px-2 py-0.5 rounded-full font-bold pointer-events-none">{index + 1} / {images.length}</span>
//           </div>
//         ))}
//       </div>

//       <div className="w-full bg-gray-900 border-t border-gray-800 p-8 text-center mt-6">
//         <p className="text-gray-400 text-xs font-medium mb-3">Bạn đã đọc hết chương này rồi!</p>
//         <Link href={`/manga/${mangaId}`} className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-xl text-sm font-bold transition inline-block shadow-lg">Quay lại danh sách chương</Link>
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

export default function ChapterReaderPage() {
  const params = useParams();
  const chapterId = params?.id as string;

  const [images, setImages] = useState<string[]>([]);
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [mangaId, setMangaId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [readerWidth] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('cfg_width') || 'max-w-2xl' : 'max-w-2xl'));
  const [bgColor] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('cfg_bg') || 'bg-black' : 'bg-black'));

  const fetchChapter = async () => {
    try {
      if (chapterId.startsWith('otruyen_chap-')) {
        const slug = chapterId.split('-chap-')[0].replace('otruyen_chap-', '');
        const cNumber = chapterId.split('-chap-')[1];
        setMangaId(`otruyen-${slug}`);

        const res = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
        const json = await res.json();
        
        if (json?.status === 'success') {
          setChapterTitle(`Chương ${cNumber}`);
          const serverData = json.data.server_data?.[0];
          const currentChapData = serverData?.chapter_data?.find((c: any) => c.chapter_name === cNumber);
          
          if (serverData && currentChapData) {
            const cdnUrl = serverData.domain_cdn;
            const chapterPath = currentChapData.chapter_path;
            const urls = currentChapData.chapter_image.map((img: any) => `${cdnUrl}/${chapterPath}/${img.image_file}`);
            setImages(urls);
          }
        }
      } else {
        const infoRes = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`);
        const infoJson = await infoRes.json();
        const currentChapter = infoJson.data;
        if (currentChapter) {
          setChapterTitle(`Chương ${currentChapter.attributes?.chapter || '0'}`);
          const mId = currentChapter.relationships?.find((rel: any) => rel.type === 'manga')?.id;
          setMangaId(mId || '');
        }

        const serverRes = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
        const serverJson = await serverRes.json();
        const baseUrl = serverJson.baseUrl;
        const hash = serverJson.chapter?.hash;
        const fileNames = serverJson.chapter?.dataSaver;

        if (baseUrl && hash && fileNames) {
          const urls = fileNames.map((fileName: string) => `${baseUrl}/data-saver/${hash}/${fileName}`);
          setImages(urls);
        }
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (chapterId) {
      // Đặt comment xuống dòng để ESLint nhận diện chuẩn chỉ thị tắt rule
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      fetchChapter();
    }
  }, [chapterId]);

  if (loading) return <div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center text-xs">Đang đồng bộ phân giải ảnh...</div>;

  return (
    <div className={`min-h-screen text-zinc-100 flex flex-col items-center transition-colors duration-300 ${bgColor}`}>
      <div className="w-full h-14 bg-zinc-950/90 border-b border-zinc-900 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">
        <Link href={`/manga/${mangaId}`} className="text-xs text-zinc-400 hover:text-orange-500 font-bold transition">&larr; Thoát trình đọc</Link>
        <span className="text-xs font-black text-orange-500 tracking-wide uppercase">{chapterTitle}</span>
        <Link href="/" className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-1.5 rounded-full font-bold transition">Trang chủ</Link>
      </div>

      <div className={`w-full flex flex-col py-1 ${readerWidth}`}>
        {images.map((url, index) => (
          <div key={index} className="w-full relative flex justify-center bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-auto object-contain select-none opacity-0 animate-fadeIn" onLoad={(e) => (e.currentTarget.className = "w-full h-auto object-contain select-none opacity-100 transition-opacity duration-300")} loading={index < 2 ? "eager" : "lazy"} />
            <span className="absolute bottom-3 right-4 text-[9px] bg-black/80 font-mono text-zinc-500 border border-zinc-800/50 px-2 py-0.5 rounded-full">{index + 1} / {images.length}</span>
          </div>
        ))}
      </div>

      <div className="w-full bg-zinc-950 border-t border-zinc-900 p-12 text-center">
        <Link href={`/manga/${mangaId}`} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full shadow-lg transition inline-block">Quay lại danh sách chương</Link>
      </div>
    </div>
  );
}