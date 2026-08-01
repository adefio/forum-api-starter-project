import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, getErrorMessage } from '../lib/api'
import { formatRelative } from '../lib/format'
import { getCoverImage } from '../lib/markdown'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import CommentForm from '../components/CommentForm'
import RichText from '../components/RichText'
import { Avatar } from '../components/ThreadCard'

function isDeleted(content) {
  return content && content.startsWith('**') && content.endsWith('**')
}

function HeartIcon({ filled = false }) {
  return filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#e11d48" className="shrink-0">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ThreadDetail() {
  const { threadId } = useParams()
  const { isAuthenticated, username } = useAuth()

  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [likedIds, setLikedIds] = useState(() => new Set())
  const [busyIds, setBusyIds] = useState(() => new Set())

  const fetchThread = useCallback(async () => {
    try {
      const { data } = await api.get(`/threads/${threadId}`)
      setThread(data.data.thread)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [threadId])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const { data } = await api.get(`/threads/${threadId}`)
        if (active) {
          setThread(data.data.thread)
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
  }, [threadId])

  const toggleBusy = (id, isBusy) => {
    setBusyIds((prev) => {
      const next = new Set(prev)
      if (isBusy) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleAddComment = async (content) => {
    setActionError('')
    await api.post(`/threads/${threadId}/comments`, { content })
    await fetchThread()
  }

  const handleAddReply = async (commentId, content) => {
    setActionError('')
    await api.post(`/threads/${threadId}/comments/${commentId}/replies`, { content })
    setReplyingTo(null)
    await fetchThread()
  }

  const handleToggleLike = async (comment) => {
    setActionError('')
    toggleBusy(comment.id, true)

    const wasLiked = likedIds.has(comment.id)
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (wasLiked) next.delete(comment.id)
      else next.add(comment.id)
      return next
    })

    try {
      await api.put(`/threads/${threadId}/comments/${comment.id}/likes`)
      await fetchThread()
    } catch (err) {
      setLikedIds((prev) => {
        const next = new Set(prev)
        if (wasLiked) next.add(comment.id)
        else next.delete(comment.id)
        return next
      })
      setActionError(getErrorMessage(err))
    } finally {
      toggleBusy(comment.id, false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Hapus komentar ini?')) return
    setActionError('')
    toggleBusy(commentId, true)

    try {
      await api.delete(`/threads/${threadId}/comments/${commentId}`)
      await fetchThread()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      toggleBusy(commentId, false)
    }
  }

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Hapus balasan ini?')) return
    setActionError('')
    toggleBusy(replyId, true)

    try {
      await api.delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      await fetchThread()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      toggleBusy(replyId, false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
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

  if (!thread) return null

  const commentCount = thread.comments?.length ?? 0
  const cover = getCoverImage(thread.body)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        ← Beranda
      </Link>

      <article className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
        />
        <header className="flex items-center gap-3 px-4 py-4">
          <Link to={`/users/${thread.username}`}>
            <Avatar username={thread.username} size="sm" ring />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to={`/users/${thread.username}`}
              className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600"
            >
              {thread.username}
            </Link>
            <p className="text-xs text-slate-400">{formatRelative(thread.date)}</p>
          </div>
        </header>

        {cover && (
          <div className="max-h-[30rem] overflow-hidden bg-slate-100">
            <img
              src={cover}
              alt={thread.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        <div className="px-4 py-4">
          <h1 className="font-display text-lg font-extrabold leading-snug text-slate-900 sm:text-xl">
            {thread.title}
          </h1>
          <RichText
            content={thread.body}
            className="mt-2 text-sm leading-relaxed text-slate-700"
          />
        </div>
      </article>

      <section className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <span aria-hidden="true">💬</span>
          Komentar ({commentCount})
        </h2>

        {actionError && (
          <div className="mb-4">
            <Alert>{actionError}</Alert>
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
          {isAuthenticated ? (
            <CommentForm
              onSubmit={handleAddComment}
              placeholder="Tambahkan komentar…"
              submitLabel="Kirim Komentar"
            />
          ) : (
            <p className="text-center text-sm text-slate-500">
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
                Masuk
              </Link>{' '}
              atau{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
                daftar
              </Link>{' '}
              untuk ikut berkomentar.
            </p>
          )}
        </div>

        {commentCount === 0 ? (
          <EmptyState
            icon="💬"
            title="Belum ada komentar"
            description="Jadilah orang pertama yang berkomentar di diskusi ini."
          />
        ) : (
          <ul className="space-y-4">
            {thread.comments.map((comment) => {
              const commentDeleted = isDeleted(comment.content)
              const isOwner = username && comment.username === username
              const isLiked = likedIds.has(comment.id)
              const isBusy = busyIds.has(comment.id)

              return (
                <li
                  key={comment.id}
                  className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <Avatar username={comment.username} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <Link
                          to={`/users/${comment.username}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600"
                        >
                          {comment.username}
                        </Link>{' '}
                        {isOwner && (
                          <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                            kamu
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">{formatRelative(comment.date)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {isAuthenticated && !commentDeleted && (
                        <button
                          type="button"
                          onClick={() => handleToggleLike(comment)}
                          disabled={isBusy}
                          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-rose-50 disabled:opacity-50"
                          aria-label={isLiked ? 'Batal suka' : 'Suka komentar'}
                        >
                          <HeartIcon filled={isLiked} />
                          {comment.likeCount ?? 0}
                        </button>
                      )}
                    </div>
                  </div>

                  {commentDeleted ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm italic leading-relaxed text-slate-400">
                      {comment.content}
                    </p>
                  ) : (
                    <RichText content={comment.content} className="mt-3 text-sm leading-relaxed text-slate-700" />
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                    {isAuthenticated && !commentDeleted && (
                      <button
                        type="button"
                        onClick={() =>
                          setReplyingTo((prev) => (prev === comment.id ? null : comment.id))
                        }
                        className="text-slate-500 transition hover:text-slate-800"
                      >
                        Balas
                      </button>
                    )}
                    {isOwner && !commentDeleted && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isBusy}
                        className="text-rose-500 transition hover:text-rose-700 disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {replyingTo === comment.id && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <CommentForm
                        compact
                        autoFocus
                        onSubmit={(content) => handleAddReply(comment.id, content)}
                        placeholder="Tulis balasanmu…"
                        submitLabel="Kirim Balasan"
                        onDone={() => setReplyingTo(null)}
                      />
                    </div>
                  )}

                  {comment.replies?.length > 0 && (
                    <ul className="mt-4 space-y-3 border-l-2 border-indigo-100 pl-4">
                      {comment.replies.map((reply) => {
                        const replyDeleted = isDeleted(reply.content)
                        const replyIsOwner = username && reply.username === username
                        const replyIsBusy = busyIds.has(reply.id)

                        return (
                          <li key={reply.id}>
                            <div className="flex items-center gap-2">
                              <Avatar username={reply.username} size="xs" />
                              <p className="text-xs">
                                <Link
                                  to={`/users/${reply.username}`}
                                  className="font-semibold text-slate-700 hover:text-indigo-600"
                                >
                                  {reply.username}
                                </Link>{' '}
                                <span className="text-slate-400">
                                  {formatRelative(reply.date)}
                                </span>
                                {replyIsOwner && (
                                  <span className="ml-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                                    kamu
                                  </span>
                                )}
                              </p>
                              {replyIsOwner && !replyDeleted && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReply(comment.id, reply.id)}
                                  disabled={replyIsBusy}
                                  className="ml-auto text-[11px] font-semibold text-rose-500 transition hover:text-rose-700 disabled:opacity-50"
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                            {replyDeleted ? (
                              <p className="mt-1 whitespace-pre-wrap text-sm italic leading-relaxed text-slate-400">
                                {reply.content}
                              </p>
                            ) : (
                              <RichText content={reply.content} className="mt-1 text-sm leading-relaxed text-slate-600" />
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
