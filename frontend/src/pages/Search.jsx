import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import FeedPost from '../components/FeedPost';

export default function Search() {
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const { data } = await api.get('/threads');
        setThreads(data.data.threads);
      } catch (error) {
        console.error('Failed to fetch threads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return []; // Hanya tampilkan jika ada query pencarian
    
    return threads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(q) || 
        thread.body.toLowerCase().includes(q) ||
        thread.category.toLowerCase().includes(q)
    );
  }, [threads, query]);

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col bg-momentum-dark">
      {/* Header Search */}
      <div className="sticky top-0 z-10 border-b border-slate-800/50 bg-momentum-darker/80 p-4 backdrop-blur-md lg:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari diskusi, pertanyaan, atau kategori..."
              className="w-full rounded-2xl border-2 border-slate-700 bg-slate-800 py-4 pl-14 pr-6 font-medium text-slate-100 placeholder:text-slate-500 focus:border-momentum-purple focus:outline-none focus:ring-4 focus:ring-momentum-purple/20 transition-all"
              autoFocus
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['react', 'javascript', 'backend', 'uiux', 'karir'].map(tag => (
              <button 
                key={tag}
                onClick={() => setQuery(tag)}
                className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-momentum-purple hover:text-white"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hasil Pencarian */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 lg:px-8">
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-momentum-purple border-t-transparent"></div>
           </div>
        ) : query.trim() === '' ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <svg className="mb-4 h-16 w-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="font-display text-xl font-bold text-slate-300">Mulai Mencari</h3>
            <p className="text-slate-500">Ketik kata kunci di atas untuk mencari diskusi spesifik.</p>
          </div>
        ) : filteredThreads.length > 0 ? (
          <div>
            <h3 className="mb-6 font-display text-xl font-bold text-slate-200">
              Hasil untuk "{query}" <span className="text-sm font-normal text-slate-500">({filteredThreads.length} ditemukan)</span>
            </h3>
            <div className="space-y-6">
              {filteredThreads.map(thread => (
                <FeedPost key={thread.id} thread={thread} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
            <h3 className="font-display text-xl font-bold text-slate-300">Tidak Ditemukan</h3>
            <p className="text-slate-500">Kami tidak dapat menemukan diskusi yang cocok dengan "{query}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
