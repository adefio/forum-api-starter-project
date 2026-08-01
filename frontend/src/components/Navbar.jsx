import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ThreadCard'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="animate-float flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-base text-white shadow-lg shadow-fuchsia-500/30">
        💻
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
        Informatika<span className="gradient-text">Talk</span>
      </span>
    </Link>
  )
}

function HomeIcon({ isActive }) {
  return isActive ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-slate-900">
      <path d="M3 10.75L12 3l9 7.75v9.5a1 1 0 01-1 1h-5.5v-6h-5v6H4a1 1 0 01-1-1v-9.5z" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-800">
      <path
        d="M3 10.75L12 3l9 7.75M4.5 9.5V20a1 1 0 001 1H10v-6h4v6h4.5a1 1 0 001-1V9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className="p-2" aria-label="Beranda">
            {({ isActive }) => <HomeIcon isActive={isActive} />}
          </NavLink>

          {isAuthenticated ? (
            <>
              <Link to="/threads/new" className="p-2" aria-label="Buat thread">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-800">
                  <path
                    d="M12 8v8m4-4H8M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
              <Link to={`/users/${username}`} className="p-2" aria-label="Profil" title={username}>
                <Avatar username={username} size="sm" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-rose-600"
              >
                Keluar
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
                Masuk
              </Link>
              <Link to="/register" className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
                Daftar
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
