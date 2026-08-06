import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'
import Alert from '../components/Alert'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'
  const justRegistered = Boolean(location.state?.registered)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal masuk, silakan coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-momentum-panel shadow-2xl">
        <div className="bg-gradient-to-r from-momentum-purple/20 to-momentum-pink/20 p-8 text-center border-b border-slate-800/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
            <svg className="h-8 w-8 text-momentum-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <h1 className="font-display mt-4 text-2xl font-bold text-slate-100">Selamat Datang Kembali</h1>
          <p className="mt-2 text-sm text-slate-400">Masuk untuk melanjutkan ke Momentum.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          {justRegistered && (
            <div className="mb-6 rounded-xl bg-momentum-purple/10 p-3 text-sm text-momentum-purple border border-momentum-purple/20">
              Pendaftaran berhasil! Silakan masuk dengan akun barumu.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses…' : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-momentum-purple hover:text-purple-400 transition">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
