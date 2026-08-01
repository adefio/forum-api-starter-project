import { useState } from 'react'
import { api, getErrorMessage } from '../lib/api'

export default function FollowButton({
  username,
  isFollowing = false,
  onChanged,
  size = 'md',
}) {
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = async () => {
    setLoading(true)
    setError('')

    try {
      await api({ method: following ? 'DELETE' : 'POST', url: `/users/${username}/follow` })
      setFollowing((prev) => {
        const next = !prev
        onChanged?.(next)
        return next
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mengubah status pertemanan.'))
    } finally {
      setLoading(false)
    }
  }

  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2 text-sm'

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition active:scale-95 disabled:opacity-60 ${sizeClass} ${
          following
            ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/25 hover:brightness-110'
        }`}
      >
        {following ? '✓ Mengikuti' : '+ Ikuti'}
      </button>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}
