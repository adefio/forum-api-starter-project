import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getErrorMessage } from '../lib/api'
import { extractImages, toImageMarkdown, stripImages } from '../lib/markdown'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import ImageUpload from '../components/ImageUpload'

export default function CreateThread() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ title: '', body: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const images = extractImages(form.body)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUploaded = (url) => {
    setForm((prev) => ({
      ...prev,
      body: prev.body ? `${prev.body}\n${toImageMarkdown(url)}` : toImageMarkdown(url),
    }))
  }

  const handleRemoveImage = (url) => {
    setForm((prev) => ({
      ...prev,
      body: stripImages(prev.body.replace(`![](${url})`, '').replace(`![gambar](${url})`, '')),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/threads', form)
      navigate(`/threads/${data.data.addedThread.id}`)
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal membuat thread, silakan coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-indigo-200/50 backdrop-blur">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
        />
        <div className="border-b border-white/50 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-6 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-xl shadow-sm backdrop-blur">
              ✍️
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold sm:text-2xl">Buat Thread Diskusi</h1>
              <p className="text-sm text-indigo-100">Mulai diskusi baru untuk mahasiswa Teknik Informatika</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6">
              <Alert>{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="label">
                Judul Diskusi
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={120}
                value={form.title}
                onChange={handleChange}
                className="input"
                placeholder="Contoh: Gimana cara ngoding Python buat tugas besar?"
              />
            </div>

            <div>
              <label htmlFor="body" className="label">
                Isi Diskusi
              </label>
              <textarea
                id="body"
                name="body"
                required
                rows={8}
                value={form.body}
                onChange={handleChange}
                className="input resize-y"
                placeholder="Ceritakan topik, pertanyaan, atau pemikiranmu di sini..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-4">
              <span className="text-sm font-semibold text-slate-700">Lampirkan gambar:</span>
              <ImageUpload onUploaded={handleUploaded} label="Upload Gambar" />
              <p className="w-full text-xs text-slate-500">
                Gambar otomatis disisipkan ke isi diskusi. Maksimal 5MB (JPG, PNG, WEBP, GIF).
              </p>
            </div>

            {images.length > 0 && (
              <div>
                <p className="label">Gambar terpasang ({images.length})</p>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <img src={img.url} alt={img.alt || `gambar ${i + 1}`} className="h-24 w-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.url)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow transition hover:bg-rose-700"
                        aria-label="Hapus gambar"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading && <Spinner size="sm" />}
                {loading ? 'Membuat…' : 'Publish Thread'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
                disabled={loading}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
