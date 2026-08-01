import { useRef, useState } from 'react'
import { uploadImage, getErrorMessage } from '../lib/api'
import { isVideoUrl } from '../lib/markdown'
import Spinner from './Spinner'

const ACCEPTED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
]

const MAX_IMAGE = 5 * 1024 * 1024
const MAX_VIDEO = 25 * 1024 * 1024

export default function ImageUpload({ onUploaded, onError, label = 'Upload Gambar/Video' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')

    if (!ACCEPTED.includes(file.type)) {
      const message = 'Format tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau MP4/WEBM.'
      setError(message)
      onError?.(message)
      return
    }

    const isVideo = file.type.startsWith('video/')
    const limit = isVideo ? MAX_VIDEO : MAX_IMAGE

    if (file.size > limit) {
      const message = `Ukuran file maksimal ${isVideo ? '25MB' : '5MB'}.`
      setError(message)
      onError?.(message)
      return
    }

    setUploading(true)
    try {
      const url = await uploadImage(file)
      onUploaded?.(url)
    } catch (err) {
      const message = getErrorMessage(err, 'Gagal mengunggah file.')
      setError(message)
      onError?.(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100 active:scale-95 disabled:opacity-60"
      >
        {uploading ? <Spinner size="sm" /> : <span aria-hidden="true">📎</span>}
        {uploading ? 'Mengunggah…' : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
        onChange={handleFile}
        className="hidden"
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}

export { isVideoUrl }
