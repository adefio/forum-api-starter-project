import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { username } = useParams();
  const { isAuthenticated, username: authUsername, logout } = useAuth();
  
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = isAuthenticated && authUsername === username;

  useEffect(() => {
    let active = true;
    const fetchUserThreads = async () => {
      try {
        const { data } = await api.get('/threads');
        if (active) {
          const userThreads = data.data.threads.filter(t => t.username === username);
          setThreads(userThreads);
          setError('');
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchUserThreads();
    return () => { active = false; };
  }, [username]);

  // Extract Image from body helper
  const extractImage = (htmlContent) => {
    const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      {/* Profile Header */}
      <header className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-10">
        <div className="shrink-0">
          <div className="rounded-full bg-gradient-to-tr from-momentum-pink to-momentum-purple p-1">
            <img 
              src={`https://ui-avatars.com/api/?name=${username}&background=random&size=150`} 
              alt={username} 
              className="h-24 w-24 rounded-full border-4 border-momentum-darker md:h-36 md:w-36" 
            />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="mb-4 flex flex-col items-center gap-4 md:flex-row md:justify-start">
            <h1 className="text-xl font-bold text-slate-100 md:text-2xl">{username}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Link to="/profile/edit" className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-bold text-slate-200 hover:bg-slate-700">Edit Profil</Link>
                  <button onClick={logout} className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-bold text-red-400 hover:bg-slate-700">Keluar</button>
                </>
              ) : (
                <>
                  <button className="rounded-lg bg-momentum-purple px-6 py-1.5 text-sm font-bold text-white hover:bg-purple-600">Ikuti</button>
                  <button className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-bold text-slate-200 hover:bg-slate-700">Pesan</button>
                </>
              )}
            </div>
          </div>

          <div className="mb-4 flex justify-center gap-6 text-sm md:justify-start">
            <div><span className="font-bold text-slate-200">{threads.length}</span> <span className="text-slate-400">kiriman</span></div>
            <div><span className="font-bold text-slate-200">12.4k</span> <span className="text-slate-400">pengikut</span></div>
            <div><span className="font-bold text-slate-200">321</span> <span className="text-slate-400">diikuti</span></div>
          </div>

          <div>
            <p className="font-bold text-slate-200">{username}</p>
            <p className="text-sm text-slate-400">Seniman digital & Penggemar Informatika 💻✨<br/>Membagikan momen dan kreativitas.</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-t border-slate-800 flex justify-center gap-10">
        <button className="border-t-2 border-slate-200 px-2 py-4 text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Kiriman
        </button>
        <button className="border-t-2 border-transparent px-2 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          Tersimpan
        </button>
      </div>

      {/* Grid Posts */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-momentum-purple border-t-transparent"></div>
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : threads.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-700">
            <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Belum Ada Postingan</h2>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {threads.map((thread) => {
            const imageUrl = extractImage(thread.body);
            return (
              <Link key={thread.id} to={`/threads/${thread.id}`} className="group relative aspect-square bg-slate-800 overflow-hidden cursor-pointer">
                {imageUrl ? (
                  <img src={imageUrl} alt={thread.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-900/40 via-momentum-panel to-momentum-darker p-4 text-center transition-transform group-hover:scale-105">
                    <h3 className="font-display text-sm font-bold text-slate-200 line-clamp-3">{thread.title}</h3>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span>{thread.upVotesBy?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24"><path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    <span>{thread.totalComments || 0}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
