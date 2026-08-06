import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import StoryBar from '../components/StoryBar'
import FeedPost from '../components/FeedPost'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Untuk sementara, query disederhanakan atau dikaitkan ke context jika perlu.
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
        thread.title.toLowerCase().includes(q) || thread.username.toLowerCase().includes(q)
    )
  }, [threads, query])

  return (
    <div className="relative min-h-screen">
      {/* Story Bar menampilkan author unik dari threads */}
      <StoryBar users={authors} />

      {/* Area Search di Home (opsional jika RightSidebar tidak terhubung ke state) */}
      <div className="mx-auto max-w-2xl px-4 lg:hidden mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari postingan atau kreator..."
          className="input"
        />
      </div>

      {/* Umpan Utama */}
      <div className="mx-auto max-w-3xl px-4 pb-24 lg:px-8">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-momentum-purple border-t-transparent"></div>
          </div>
        )}
        
        {!loading && error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-center text-sm font-medium text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        {!loading && !error && filteredThreads.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400">Belum ada diskusi yang ditemukan.</p>
          </div>
        )}

        {!loading && !error && filteredThreads.map((thread) => (
          <FeedPost key={thread.id} thread={thread} />
        ))}

        {!loading && !error && filteredThreads.length > 0 && (
          <div className="mx-auto mb-10 flex max-w-2xl items-center justify-center rounded-2xl border border-slate-800 border-dashed bg-momentum-darker py-10 opacity-50">
            <p className="text-slate-500 text-sm font-bold">Anda sudah melihat semuanya 🎉</p>
          </div>
        )}
      </div>
    </div>
  )
}
