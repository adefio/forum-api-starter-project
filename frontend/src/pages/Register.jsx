import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getErrorMessage } from '../lib/api'
import Alert from '../components/Alert'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullname: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/users', form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mendaftar, silakan coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-momentum-panel shadow-2xl">
        <div className="bg-gradient-to-r from-momentum-pink/20 to-momentum-purple/20 p-8 text-center border-b border-slate-800/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
            <svg className="h-8 w-8 text-momentum-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h1 className="font-display mt-4 text-2xl font-bold text-slate-100">Buat Akun Baru</h1>
          <p className="mt-2 text-sm text-slate-400">Bergabung dengan komunitas Momentum.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullname" className="label">Nama Lengkap</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                autoComplete="name"
                required
                value={form.fullname}
                onChange={handleChange}
                className="input"
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={handleChange}
                className="input"
                placeholder="Misal: satria_baja"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Mendaftar…' : 'Daftar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-momentum-pink hover:text-pink-400 transition">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
