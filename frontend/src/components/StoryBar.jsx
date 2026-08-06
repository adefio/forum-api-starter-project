export default function StoryBar({ users = [] }) {
  // Jika tidak ada data users dari API, gunakan dummy sementara
  const defaultStories = [
    { username: 'cherrieama' },
    { username: 'geniii_4' },
    { username: 'lisan_29' },
    { username: 'lyshandraa' },
    { username: 'bagasanggri' },
    { username: 'intanalii_' },
  ];

  const stories = users.length > 0 ? users : defaultStories;

  return (
    <div className="mb-8 border-b border-slate-800/50 bg-momentum-darker pb-6 pt-6 sticky top-0 z-20">
      <div className="px-6 flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-300">Cerita</h2>
        
        {/* Alat Cerita */}
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button className="flex shrink-0 items-center gap-1 rounded-full bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            Tambah Teks
          </button>
          <button className="flex shrink-0 items-center gap-1 rounded-full bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Filter
          </button>
          <button className="flex shrink-0 items-center gap-1 rounded-full bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            Musik
          </button>
        </div>
      </div>

      <div className="relative px-6">
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Create Own Story */}
          <div className="flex shrink-0 flex-col items-center gap-2 cursor-pointer">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-600 bg-slate-800 transition hover:border-momentum-purple hover:bg-slate-700">
              <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[11px] text-slate-400">Buat Cerita</span>
          </div>

          {/* User Stories */}
          {stories.map((user, idx) => (
            <div key={idx} className="flex shrink-0 flex-col items-center gap-2 cursor-pointer group">
              <div className="rounded-full bg-gradient-to-tr from-momentum-pink to-momentum-purple p-[2px] transition-transform group-hover:scale-105">
                <div className="rounded-full border-2 border-momentum-darker bg-momentum-darker overflow-hidden">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt={user.username}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="w-16 truncate text-center text-[11px] text-slate-300">{user.username}</span>
            </div>
          ))}
        </div>

        {/* Arrow Navigation */}
        <button className="absolute right-4 top-[40%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-white backdrop-blur hover:bg-slate-700 hidden sm:flex">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
