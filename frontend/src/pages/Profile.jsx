import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { getCoverImage } from '../lib/markdown'
import { Avatar } from '../components/ThreadCard'
import FollowButton from '../components/FollowButton'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'

const TABS = [
  { key: 'posts', label: 'Postingan' },
  { key: 'followers', label: 'Pengikut' },
  { key: 'following', label: 'Mengikuti' },
  { key: 'find', label: 'Cari' },
]

function GridIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={active ? 'text-indigo-600' : 'text-slate-400'}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function FollowersIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={active ? 'text-indigo-600' : 'text-slate-400'}>
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 20c.6-3.2 3-5 6.5-5s5.9 1.8 6.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 11l2.2 2.2L22 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FollowingIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={active ? 'text-indigo-600' : 'text-slate-400'}>
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 20c.6-3.2 3-5 6.5-5s5.9 1.8 6.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 20c0-2.5 1.3-4 3-4M17 17v-1M20 16.5v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={active ? 'text-indigo-600' : 'text-slate-400'}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const TAB_ICONS = {
  posts: GridIcon,
  followers: FollowersIcon,
  following: FollowingIcon,
  find: SearchIcon,
}

function Stat({ value, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-0.5 py-1 transition active:scale-95"
    >
      <p className={`text-base font-extrabold ${active ? 'text-indigo-600' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-[11px] font-medium ${active ? 'text-indigo-500' : 'text-slate-500'}`}>{label}</p>
    </button>
  )
}

function UserRow({ user }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur">
      <Link to={`/users/${user.username}`}>
        <Avatar username={user.username} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/users/${user.username}`} className="block truncate text-sm font-bold text-slate-900 hover:text-indigo-600">
          {user.username}
        </Link>
        <p className="truncate text-xs text-slate-500">{user.fullname}</p>
      </div>
      <FollowButton username={user.username} isFollowing={user.isFollowing} size="sm" />
    </div>
  )
}

function ThreadCell({ thread }) {
  const cover = getCoverImage(thread.body)
  const commentCount = thread.comment_count ?? 0

  return (
    <Link
      to={`/threads/${thread.id}`}
      className="group relative block aspect-square overflow-hidden rounded-xl border border-white/60 bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {cover ? (
        <img
          src={cover}
          alt={thread.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center">
          <span className="text-2xl">💬</span>
          <p className="line-clamp-2 text-xs font-bold text-slate-600">{thread.title}</p>
        </div>
      )}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
        <span className="text-lg">💬</span>
        <span className="text-xs font-bold text-white">{commentCount} komentar</span>
      </span>
    </Link>
  )
}

export default function Profile() {
  const { username: profileUsername } = useParams()
  const { username: myUsername } = useAuth()

  const [profile, setProfile] = useState(null)
  const [threads, setThreads] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [listData, setListData] = useState({ type: null, items: [] })
  const [listLoading, setListLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isSelf = myUsername && profileUsername === myUsername

  const fetchProfile = useCallback(async () => {
    setError('')
    const { data } = await api.get(`/users/${profileUsername}`)
    setProfile(data.data.profile)
  }, [profileUsername])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setActiveTab('posts')
      setListData({ type: null, items: [] })
      setSearchQuery('')
      try {
        const [{ data: profileData }, { data: threadsData }] = await Promise.all([
          api.get(`/users/${profileUsername}`),
          api.get('/threads'),
        ])
        if (active) {
          setProfile(profileData.data.profile)
          setThreads(threadsData.data.threads.filter((t) => t.username === profileUsername))
          setError('')
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [profileUsername])

  const loadList = async (type) => {
    setListLoading(true)
    setActiveTab(type)
    try {
      const url = type === 'followers' ? 'followers' : 'following'
      const { data } = await api.get(`/users/${profileUsername}/${url}`)
      setListData({ type, items: data.data[url] })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setListLoading(false)
    }
  }

  const searchUsers = async (e) => {
    e.preventDefault()
    setListLoading(true)
    setActiveTab('find')
    try {
      const { data } = await api.get('/users', { params: { q: searchQuery.trim() } })
      setListData({ type: 'find', items: data.data.users })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setListLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Alert>{error}</Alert>
        <div className="mt-4">
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const ownThreads = threads.filter((t) => t.username === profile.username)

  const renderList = (items, { emptyTitle, emptyDesc }) => (
    <div className="mt-5">
      {listLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="👥" title={emptyTitle} description={emptyDesc} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <section className="animate-fade-in-up rounded-3xl border border-white/60 bg-white/80 px-6 py-6 shadow-lg shadow-slate-200/60 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="shrink-0 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[3px] shadow-md">
            <span className="block rounded-full bg-white p-[3px]">
              <Avatar username={profile.username} size="xl" />
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h1 className="truncate font-display text-xl font-extrabold text-slate-900">
                {profile.username}
              </h1>
              {!isSelf ? (
                <FollowButton
                  username={profile.username}
                  isFollowing={profile.isFollowing}
                  onChanged={fetchProfile}
                  size="sm"
                />
              ) : (
                <Link
                  to="/threads/new"
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  + Posting
                </Link>
              )}
            </div>

            <div className="mt-3 flex divide-x divide-slate-100 border-y border-slate-100">
              <Stat
                value={ownThreads.length}
                label="Postingan"
                active={activeTab === 'posts'}
                onClick={() => setActiveTab('posts')}
              />
              <Stat
                value={profile.follower_count ?? 0}
                label="Pengikut"
                active={activeTab === 'followers'}
                onClick={() => loadList('followers')}
              />
              <Stat
                value={profile.following_count ?? 0}
                label="Mengikuti"
                active={activeTab === 'following'}
                onClick={() => loadList('following')}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-slate-900">{profile.fullname}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            🎓 Mahasiswa Teknik Informatika yang suka ngobrol seputar teknologi, koding, dan kampus.
          </p>
        </div>
      </section>

      <div className="mt-6 flex border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.key]
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                tab.key === 'find'
                  ? setActiveTab('find')
                  : tab.key === 'posts'
                    ? setActiveTab('posts')
                    : loadList(tab.key)
              }
              className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 pb-3 pt-1 text-xs font-bold transition active:scale-95 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon active={isActive} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'posts' &&
        (ownThreads.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon="📭"
              title="Belum ada postingan"
              description={
                isSelf
                  ? 'Yuk buat thread pertamamu!'
                  : `${profile.username} belum punya postingan.`
              }
              action={
                isSelf && (
                  <Link to="/threads/new" className="btn-primary">
                    + Buat Thread
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-2">
            {ownThreads.map((thread) => (
              <ThreadCell key={thread.id} thread={thread} />
            ))}
          </div>
        ))}

      {activeTab === 'find' && (
        <div className="mt-5">
          <form onSubmit={searchUsers} className="mb-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari teman berdasarkan username / nama…"
              className="input rounded-full bg-white/80 pl-4 shadow-sm focus:bg-white"
            />
          </form>
          {listLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : listData.type === 'find' ? (
            listData.items.length === 0 ? (
              <EmptyState
                icon="🔎"
                title="Tidak ditemukan"
                description="Coba kata kunci lain untuk mencari teman."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {listData.items.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon="👋"
              title="Cari teman"
              description="Ketik nama atau username di atas untuk menambah teman."
            />
          )}
        </div>
      )}

      {activeTab === 'followers' &&
        renderList(listData.items, {
          emptyTitle: 'Belum ada pengikut',
          emptyDesc: `Belum ada yang mengikuti @${profile.username}.`,
        })}

      {activeTab === 'following' &&
        renderList(listData.items, {
          emptyTitle: 'Belum mengikuti siapa pun',
          emptyDesc: `@${profile.username} belum mengikuti siapa pun.`,
        })}
    </div>
  )
}
