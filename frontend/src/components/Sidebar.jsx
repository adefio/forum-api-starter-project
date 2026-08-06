import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Badge = ({ count }) => (
  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-momentum-pink text-[10px] font-bold text-white shadow-sm ring-2 ring-momentum-darker">
    {count}
  </span>
);

export default function Sidebar() {
  const { isAuthenticated, username, logout } = useAuth();
  
  return (
    <aside className="hidden w-20 flex-col items-center border-r border-slate-800/50 bg-momentum-darker py-6 lg:flex xl:w-64 xl:items-start xl:px-6">
      {/* Logo */}
      <Link to="/" className="mb-10 flex items-center justify-center xl:justify-start">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-momentum-purple to-momentum-blue shadow-lg shadow-momentum-purple/20">
          <span className="text-2xl font-black text-white">M</span>
        </div>
        <span className="ml-4 hidden font-display text-xl font-bold tracking-wide text-slate-100 xl:block">
          Momentum
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-6 w-full items-center xl:items-start">
        <Link to="/" className="group flex w-full items-center justify-center xl:justify-start relative">
          <div className="relative">
            {/* Home Icon */}
            <svg className="h-7 w-7 text-slate-200 transition-colors group-hover:text-momentum-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <Badge count="1" />
          </div>
          <span className="ml-4 hidden text-base font-medium text-slate-200 group-hover:text-momentum-purple xl:block">Beranda</span>
        </Link>

        <Link to="/video" className="group flex w-full items-center justify-center xl:justify-start">
          <div className="relative">
            {/* Video Icon */}
            <svg className="h-7 w-7 text-slate-400 transition-colors group-hover:text-momentum-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <Badge count="5" />
          </div>
          <span className="ml-4 hidden text-base font-medium text-slate-400 group-hover:text-momentum-purple xl:block">Video</span>
        </Link>

        <Link to="/search" className="group flex w-full items-center justify-center xl:justify-start">
          <div className="relative">
            {/* Explore Icon */}
            <svg className="h-7 w-7 text-slate-400 transition-colors group-hover:text-momentum-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Badge count="3" />
          </div>
          <span className="ml-4 hidden text-base font-medium text-slate-400 group-hover:text-momentum-purple xl:block">Pencarian</span>
        </Link>

        <Link to="/messages" className="group flex w-full items-center justify-center xl:justify-start">
          <div className="relative">
            {/* Messages Icon */}
            <svg className="h-7 w-7 text-slate-400 transition-colors group-hover:text-momentum-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <Badge count="12" />
          </div>
          <span className="ml-4 hidden text-base font-medium text-slate-400 group-hover:text-momentum-purple xl:block">Pesan</span>
        </Link>

        <Link to="/notifications" className="group flex w-full items-center justify-center xl:justify-start relative">
          <div className="relative">
            {/* Notifications Icon */}
            <svg className="h-7 w-7 text-slate-400 transition-colors group-hover:text-momentum-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-2 flex h-5 w-7 items-center justify-center rounded-full bg-momentum-pink text-[9px] font-bold text-white shadow-sm ring-2 ring-momentum-darker">
              15+
            </span>
          </div>
          <span className="ml-4 hidden text-base font-medium text-slate-400 group-hover:text-momentum-purple xl:block">Notifikasi</span>
        </Link>

        <Link to="/threads/new" className="group flex w-full items-center justify-center xl:justify-start mt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 transition-all group-hover:bg-momentum-purple group-hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="ml-4 hidden text-base font-bold text-slate-300 group-hover:text-white xl:block">Buat</span>
        </Link>
      </nav>

      {/* Profil Atas (Navigasi) */}
      <div className="mt-auto flex w-full flex-col gap-4 items-center xl:items-start pt-8 border-t border-slate-800/50">
        {isAuthenticated ? (
          <Link to={`/users/${username}`} className="group flex w-full items-center justify-center xl:justify-start cursor-pointer">
            <div className="relative">
              <img src={`https://ui-avatars.com/api/?name=${username}&background=334155&color=fff`} alt="Profile" className="h-10 w-10 rounded-full ring-2 ring-transparent transition-all group-hover:ring-momentum-purple" />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-momentum-darker bg-green-500"></div>
            </div>
            <div className="ml-3 hidden flex-1 xl:block">
              <p className="text-sm font-bold text-slate-200">{username}</p>
              <p className="text-xs text-slate-500">Online</p>
            </div>
            <button onClick={(e) => { e.preventDefault(); logout(); }} className="hidden xl:block ml-2 text-xs font-bold text-red-500 hover:text-red-400">
              Keluar
            </button>
          </Link>
        ) : (
          <Link to="/login" className="group flex w-full items-center justify-center xl:justify-start cursor-pointer text-momentum-purple hover:text-white">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            <span className="ml-4 hidden text-base font-bold xl:block">Masuk</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
