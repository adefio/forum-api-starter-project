import { Link } from 'react-router-dom'
import { formatRelative } from '../lib/format'
import { getCoverImage, stripImages } from '../lib/markdown'

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
]

function hashString(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function Avatar({ username, size = 'md', ring = false, className = '' }) {
  const color = AVATAR_COLORS[hashString(username) % AVATAR_COLORS.length]
  const sizeClass =
    size === 'xs'
      ? 'h-6 w-6 text-[10px]'
      : size === 'sm'
        ? 'h-8 w-8 text-xs'
        : size === 'lg'
          ? 'h-11 w-11 text-base'
          : size === 'xl'
            ? 'h-16 w-16 text-xl'
            : 'h-10 w-10 text-sm'

  const avatar = (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm ${color} ${sizeClass} ${className}`}
    >
      {(username || 'U').charAt(0).toUpperCase()}
    </span>
  )

  if (ring) {
    return (
      <span className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
        <span className="block rounded-full bg-white p-[2px]">{avatar}</span>
      </span>
    )
  }

  return avatar
}

export { AVATAR_COLORS, hashString }

function PostActions({ thread }) {
  const commentCount = thread.comment_count ?? 0

  return (
    <div className="flex items-center justify-between px-4 pb-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-fuchsia-50 px-3 py-1 text-sm font-bold text-slate-700 ring-1 ring-inset ring-indigo-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-indigo-500">
            <path
              d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          <span>{commentCount} komentar</span>
        </span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {formatRelative(thread.date)}
      </span>
    </div>
  )
}

export default function ThreadCard({ thread }) {
  const cover = getCoverImage(thread.body)
  const snippet = stripImages(thread.body || '').slice(0, 160)

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-200/60">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-70 transition group-hover:opacity-100"
      />
      <header className="flex items-center gap-3 px-4 pt-4">
        <Link to={`/users/${thread.username}`}>
          <Avatar username={thread.username} size="sm" ring />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/users/${thread.username}`}
            className="block truncate text-sm font-bold text-slate-900 hover:text-indigo-600"
          >
            {thread.username}
          </Link>
          <p className="text-xs text-slate-400">{formatRelative(thread.date)}</p>
        </div>
        <span className="text-lg font-bold text-slate-400" aria-hidden="true">
          •••
        </span>
      </header>

      <Link to={`/threads/${thread.id}`} className="block">
        {cover ? (
          <div className="mt-3 max-h-[26rem] overflow-hidden bg-slate-100">
            <img
              src={cover}
              alt={thread.title}
              loading="lazy"
              className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 px-4 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              💬 Diskusi seru
            </p>
          </div>
        )}

        <div className="px-4 pt-3">
          <p className="text-sm leading-relaxed text-slate-800">
            <span className="font-bold text-slate-900">{thread.title}</span>
          </p>
          {snippet && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{snippet}</p>}
        </div>
      </Link>

      <PostActions thread={thread} />
    </article>
  )
}
