import { useState } from 'react'
import { getErrorMessage } from '../lib/api'
import { toImageMarkdown } from '../lib/markdown'
import Alert from './Alert'
import Spinner from './Spinner'
import ImageUpload from './ImageUpload'

export default function CommentForm({
  onSubmit,
  submitLabel = 'Kirim',
  placeholder = 'Tulis sesuatu...',
  autoFocus = false,
  compact = false,
  onDone,
}) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError('')

    try {
      await onSubmit(content.trim())
      setContent('')
      onDone?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleUploaded = (url) => {
    setContent((prev) => (prev ? `${prev}\n${toImageMarkdown(url)}` : toImageMarkdown(url)))
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={compact ? 2 : 3}
        required
        className={`input resize-y ${compact ? 'text-sm' : ''}`}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading || !content.trim()} className="btn-primary">
          {loading && <Spinner size="sm" />}
          {loading ? 'Mengirim…' : submitLabel}
        </button>
        <ImageUpload onUploaded={handleUploaded} label="🖼️ Gambar" />
      </div>
    </form>
  )
}
