import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ThreadCard'

function Item({ to, label, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
          isActive ? 'text-indigo-600' : 'text-slate-500'
        }`
      }
    >
      {children}
      <span>{label}</span>
    </NavLink>
  )
}

export default function BottomNav() {
  const { isAuthenticated, username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-white/80 backdrop-blur-xl sm:hidden">
      <div className="mx-auto flex max-w-md items-center">
        <Item to="/" label="Beranda">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-slate-800">
            <path
              d="M3 10.75L12 3l9 7.75M4.5 9.5V20a1 1 0 001 1H10v-6h4v6h4.5a1 1 0 001-1V9.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Item>

        {isAuthenticated ? (
          <>
            <Link
              to="/threads/new"
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-500"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl border-2 border-slate-800">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-800">
                  <path
                    d="M12 8v8m4-4H8M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>Buat</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-500"
            >
              <Avatar username={username} size="xs" />
              <span>Keluar</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-500"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-slate-800">
                <path
                  d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM17 11h4m-2-2v4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span>Masuk</span>
            </Link>
            <Link
              to="/register"
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-500"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-slate-800">
                <path
                  d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6m3-3h-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span>Daftar</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
