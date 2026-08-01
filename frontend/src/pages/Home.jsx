import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import ThreadCard, { Avatar } from '../components/ThreadCard'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'

const QUICK_CHIPS = [
  { label: '🎓 Kuliah', keyword: 'kuliah' },
  { label: '📚 Tugas', keyword: 'tugas' },
  { label: '🚀 Proyek', keyword: 'proyek' },
  { label: '💼 Karier', keyword: 'magang' },
  { label: '🎮 Random', keyword: 'game' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    const fetchThreads = async () => {
      try {
        const { data } = await api.get('/threads')
        if (active) {
          setThreads(data.data.threads)
          setError('')
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchThreads()
    return () => {
      active = false
    }
  }, [])

  const authors = useMemo(() => {
    const seen = new Set()
    return threads.filter((t) => {
      if (seen.has(t.username)) return false
      seen.add(t.username)
      return true
    })
  }, [threads])

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return threads
    return threads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(q) || thread.username.toLowerCase().includes(q),
    )
  }, [threads, query])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <section className="animate-fade-in-up relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-8 text-white shadow-xl shadow-indigo-500/25 sm:px-8">
        <span className="animate-float pointer-events-none absolute -right-4 top-4 text-6xl opacity-30">🤖</span>
        <span className="animate-float pointer-events-none absolute right-16 bottom-2 text-4xl opacity-20" style={{ animationDelay: '-2s' }}>⚡</span>
        <span className="animate-float pointer-events-none absolute left-8 bottom-4 text-5xl opacity-20" style={{ animationDelay: '-4s' }}>💡</span>

        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
          🚀 Anak Informatika
        </p>
        <h1 className="font-display mt-3 max-w-lg text-3xl font-extrabold leading-tight text-shadow-soft sm:text-4xl">
          Ngobrol, tanya, &amp; sharing seputar <span className="text-yellow-300">Teknik Informatika!</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-indigo-100">
          Dari tugas kuliah sampai proyek side-hustle — semua dibahas di sini, seru bareng-bareng.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Link to="/threads/new" className="btn bg-white text-indigo-700 shadow-lg hover:bg-indigo-50">
              ✨ Mulai Diskusi
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn bg-white text-indigo-700 shadow-lg hover:bg-indigo-50">
                ✨ Gabung Sekarang
              </Link>
              <Link to="/login" className="btn border border-white/40 bg-white/10 text-white hover:bg-white/20">
                Masuk
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="relative mb-6">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari diskusi seru…"
          className="input rounded-full bg-white/80 pl-11 shadow-sm focus:bg-white"
        />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_CHIPS.map((chip) => {
          const isActive = query.toLowerCase() === chip.keyword
          return (
            <button
              key={chip.keyword}
              type="button"
              onClick={() => setQuery(isActive ? '' : chip.keyword)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md'
                  : 'glass text-slate-600 hover:text-slate-900'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {!loading && !error && authors.length > 0 && (
        <div className="animate-fade-in mb-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {authors.map((author) => (
            <Link
              key={author.username}
              to={`/users/${author.username}`}
              className="flex shrink-0 flex-col items-center gap-1 transition hover:opacity-90"
            >
              <span className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
                <span className="block rounded-full bg-white p-[2px]">
                  <Avatar username={author.username} size="lg" />
                </span>
              </span>
              <span className="max-w-16 truncate text-xs font-semibold text-slate-500">
                {author.username}
              </span>
            </Link>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && <Alert>{error}</Alert>}

      {!loading && !error && threads.length === 0 && (
        <EmptyState
          icon="💡"
          title="Belum ada diskusi"
          description="Ajak teman-temanmu buat thread pertama seputar Teknik Informatika!"
          action={
            <Link to={isAuthenticated ? '/threads/new' : '/register'} className="btn-primary">
              {isAuthenticated ? 'Buat thread baru' : 'Mulai berdiskusi'}
            </Link>
          }
        />
      )}

      {!loading && !error && threads.length > 0 && filteredThreads.length === 0 && (
        <EmptyState
          icon="🔎"
          title="Tidak ditemukan"
          description={`Tidak ada hasil untuk "${query}".`}
        />
      )}

      {!loading && !error && filteredThreads.length > 0 && (
        <div className="space-y-6">
          {filteredThreads.map((thread, i) => (
            <div
              key={thread.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <ThreadCard thread={thread} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
