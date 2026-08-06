import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export default function RightSidebar() {
  const [leaderboards, setLeaderboards] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const { data } = await api.get('/leaderboards');
        setLeaderboards(data.data.leaderboards.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const toggleFollow = (e, userId) => {
    e.preventDefault();
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return newSet;
    });
  };

  return (
    <aside className="hidden w-80 flex-col border-l border-slate-800/50 bg-momentum-darker p-6 lg:flex overflow-y-auto">
      {/* Search / Filter Section */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-slate-100">Jelajahi</h2>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cari diskusi..."
            className="input pl-10 bg-momentum-panel border-transparent focus:border-momentum-purple"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Leaderboard Aktual dari API */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400">Saran Untuk Anda</h3>
          <button className="text-xs font-bold text-momentum-purple hover:text-momentum-pink">Top 5</button>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-slate-800 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-24"></div>
                    <div className="h-2 bg-slate-800 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            leaderboards.map(({ user, score }, idx) => {
              const isFollowing = followedUsers.has(user.id);
              return (
              <Link to={`/users/${user.name}`} key={user.id} className="group flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full ring-2 ring-transparent group-hover:ring-momentum-purple transition-all" />
                    {idx === 0 && <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">#1</span>}
                    {idx === 1 && <span className="absolute -top-1 -right-1 bg-slate-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">#2</span>}
                    {idx === 2 && <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">#3</span>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-momentum-purple transition-colors truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-xs text-momentum-pink font-semibold">{score} Skor</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => toggleFollow(e, user.id)} 
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    isFollowing 
                      ? 'bg-slate-700 text-slate-300' 
                      : 'bg-momentum-purple text-white hover:bg-momentum-pink'
                  }`}
                >
                  {isFollowing ? 'Mengikuti' : 'Ikuti'}
                </button>
              </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Panduan Komunitas */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-momentum-panel p-4">
        <h3 className="mb-2 text-sm font-bold text-slate-200 flex items-center gap-2">
          <svg className="h-4 w-4 text-momentum-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Aturan Komunitas
        </h3>
        <ul className="list-inside list-disc text-xs text-slate-400 space-y-1">
          <li>Bersikap sopan dan membangun</li>
          <li>Gunakan fitur blok kode untuk snippet</li>
          <li>Jangan mengirim spam atau promosi</li>
          <li>Gunakan tagar yang relevan</li>
        </ul>
      </div>
      
      <div className="mt-auto pt-6 border-t border-slate-800/50">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-300">Tentang</a>
          <a href="#" className="hover:text-slate-300">Bantuan</a>
          <a href="#" className="hover:text-slate-300">Privasi</a>
          <a href="#" className="hover:text-slate-300">Ketentuan API</a>
        </div>
        <p className="mt-3 text-xs text-slate-600">© 2026 Momentum from InformatikaTalk</p>
      </div>
    </aside>
  );
}
